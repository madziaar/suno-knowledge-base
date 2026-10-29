"""Pluggable text providers.

The loop must work with zero credentials, so the default provider is a
deterministic local heuristic. Remote providers are opt-in:

    SUNO_HELPER_PROVIDER=openai     OPENAI_API_KEY=...      OPENAI_MODEL=gpt-4.1-mini
    SUNO_HELPER_PROVIDER=ollama     OLLAMA_HOST=http://localhost:11434  OLLAMA_MODEL=qwen3
    SUNO_HELPER_PROVIDER=anthropic  ANTHROPIC_API_KEY=...   ANTHROPIC_MODEL=...

Any remote failure degrades to the heuristic rather than breaking a cron run —
a scheduled loop that dies because an API hiccuped is worse than a loop that
keeps making verified, if simpler, progress.
"""

from __future__ import annotations

import json
import os
import random
import re
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class Completion:
    """Result of a single completion call."""

    text: str
    provider: str = "heuristic"
    ok: bool = True
    error: str = ""
    latency_ms: int = 0
    meta: dict[str, object] = field(default_factory=dict)

    def as_json(self) -> dict:
        """Best-effort JSON extraction (handles fenced blocks and prose wrappers)."""
        return extract_json(self.text) or {}


def extract_json(text: str) -> dict | list | None:
    """Pull the first JSON object/array out of a model response."""
    if not text:
        return None
    cleaned = text.strip()
    fence = re.search(r"```(?:json)?\s*(.+?)```", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1).strip()
    for candidate in (cleaned, _first_balanced(cleaned, "{", "}"), _first_balanced(cleaned, "[", "]")):
        if not candidate:
            continue
        try:
            parsed = json.loads(candidate)
        except (json.JSONDecodeError, TypeError):
            continue
        if isinstance(parsed, (dict, list)):
            return parsed
    return None


def _first_balanced(text: str, open_ch: str, close_ch: str) -> str:
    start = text.find(open_ch)
    if start < 0:
        return ""
    depth = 0
    for index in range(start, len(text)):
        char = text[index]
        if char == open_ch:
            depth += 1
        elif char == close_ch:
            depth -= 1
            if depth == 0:
                return text[start : index + 1]
    return ""


class Provider(Protocol):
    """Minimal provider surface used by the engine."""

    name: str

    def complete(
        self,
        prompt: str,
        *,
        system: str = "",
        max_tokens: int = 900,
        json_mode: bool = False,
    ) -> Completion:  # pragma: no cover - protocol
        ...


# --------------------------------------------------------------------------- #
# Heuristic (default, offline, deterministic)
# --------------------------------------------------------------------------- #
class HeuristicProvider:
    """Rule-based planner/reflector used when no model is configured.

    It is deliberately honest: it does not pretend to be an LLM. It classifies
    the prompt by its ``TASK:`` header and returns a structured answer derived
    from the facts embedded in the prompt (subgoal title, acceptance gates,
    research questions, failure streak). That is enough to drive planning,
    research triage and reflection deterministically, which also makes the
    500-turn soak test reproducible.
    """

    name = "heuristic"

    def complete(
        self,
        prompt: str,
        *,
        system: str = "",
        max_tokens: int = 900,
        json_mode: bool = False,
    ) -> Completion:
        start = time.perf_counter()
        task = _field(prompt, "TASK") or "PLAN"
        subject = _field(prompt, "SUBGOAL") or _field(prompt, "SUBJECT") or ""
        gates = _list_field(prompt, "GATES")
        questions = _list_field(prompt, "QUESTIONS")
        failures = _int_field(prompt, "FAILURES")
        rng = random.Random(_seed(prompt))

        if task.upper() == "RESEARCH":
            payload = {
                "questions": questions[:5] or [f"What is the current documented state of {subject}?"],
                "sources": ["docs/suno-limits.json", "docs/research/", "github.com/topics/suno"],
                "confidence": 0.55,
                "notes": "heuristic triage: prefer primary docs, then changelog, then community",
            }
        elif task.upper() == "REVIEW":
            payload = {
                "verdict": "needs-evidence" if gates else "accept",
                "risks": [f"gate not yet evidenced: {gate}" for gate in gates] or [],
                "next": "run the acceptance tools before marking done",
            }
        elif task.upper() == "REFLECT":
            payload = {
                "diagnosis": (
                    "repeated failures — split the subgoal and add a research step"
                    if failures >= 2
                    else "progress is steady"
                ),
                "actions": (
                    ["split_subgoal", "add_research_step", "raise_priority_of_blocker"]
                    if failures >= 2
                    else ["continue"]
                ),
                "confidence": 0.6,
            }
        else:  # PLAN
            base = [
                f"Read the current artifacts for {subject or 'the subgoal'}",
                "Apply the smallest change that satisfies the declared gates",
            ]
            base.extend(f"Satisfy gate: {gate}" for gate in gates)
            base.append("Record evidence in the goal state and ledger")
            payload = {
                "steps": [{"n": index + 1, "step": step} for index, step in enumerate(base)],
                "risk": "low" if failures == 0 else "medium",
                "skills": [],
            }
        latency = int((time.perf_counter() - start) * 1000)
        text = json.dumps(payload, ensure_ascii=False)
        return Completion(text=text, provider=self.name, ok=True, latency_ms=latency, meta={"rng": rng.random()})


def _field(prompt: str, key: str) -> str:
    match = re.search(rf"^{key}:\s*(.+)$", prompt, re.MULTILINE)
    return match.group(1).strip() if match else ""


def _list_field(prompt: str, key: str) -> list[str]:
    match = re.search(rf"^{key}:\s*\n((?:\s*-\s*.+\n?)*)", prompt, re.MULTILINE)
    if not match:
        return []
    return [line.strip()[2:].strip() for line in match.group(1).splitlines() if line.strip().startswith("-")]


def _int_field(prompt: str, key: str) -> int:
    value = _field(prompt, key)
    try:
        return int(value)
    except ValueError:
        return 0


def _seed(text: str) -> int:
    return abs(hash(text)) % (2**31)


# --------------------------------------------------------------------------- #
# Remote providers
# --------------------------------------------------------------------------- #
class _HttpProvider:
    """Shared retry/error-handling for HTTP providers."""

    name = "http"
    timeout: float = 45.0
    retries: int = 2

    def _post(self, url: str, payload: dict, headers: dict[str, str]) -> dict:
        body = json.dumps(payload).encode("utf-8")
        last_error = ""
        for attempt in range(self.retries + 1):
            request = urllib.request.Request(url, data=body, method="POST")
            request.add_header("Content-Type", "application/json")
            for key, value in headers.items():
                request.add_header(key, value)
            try:
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    return json.loads(response.read().decode("utf-8"))
            except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as exc:
                last_error = f"{type(exc).__name__}: {exc}"
                time.sleep(min(8.0, 1.5 * (attempt + 1)))
        raise RuntimeError(last_error or "request failed")

    def complete(
        self,
        prompt: str,
        *,
        system: str = "",
        max_tokens: int = 900,
        json_mode: bool = False,
    ) -> Completion:  # pragma: no cover - network
        raise NotImplementedError

    @staticmethod
    def _fallback(prompt: str, error: str) -> Completion:
        local = HeuristicProvider().complete(prompt)
        local.provider = f"{local.provider}(fallback)"
        local.error = error
        return local


class OpenAICompatibleProvider(_HttpProvider):
    """Any server exposing ``POST /v1/chat/completions`` (OpenAI, Groq, LM Studio, vLLM)."""

    name = "openai"

    def __init__(
        self,
        *,
        base_url: str | None = None,
        model: str | None = None,
        api_key: str | None = None,
        timeout: float = 45.0,
    ) -> None:
        self.base_url = (base_url or os.environ.get("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
        self.model = model or os.environ.get("OPENAI_MODEL") or "gpt-4.1-mini"
        self.api_key = api_key if api_key is not None else os.environ.get("OPENAI_API_KEY", "")
        self.timeout = timeout

    def complete(self, prompt: str, *, system: str = "", max_tokens: int = 900, json_mode: bool = False) -> Completion:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        payload: dict = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.2,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        start = time.perf_counter()
        try:
            data = self._post(f"{self.base_url}/chat/completions", payload, headers)
        except RuntimeError as exc:
            return self._fallback(prompt, str(exc))
        text = ""
        choices = data.get("choices") or []
        if choices:
            text = (choices[0].get("message") or {}).get("content") or ""
        latency = int((time.perf_counter() - start) * 1000)
        return Completion(text=text, provider=self.name, ok=bool(text), latency_ms=latency)


class OllamaProvider(_HttpProvider):
    """Local Ollama server — the privacy-preserving option."""

    name = "ollama"

    def __init__(self, *, host: str | None = None, model: str | None = None, timeout: float = 120.0) -> None:
        self.base_url = (host or os.environ.get("OLLAMA_HOST") or "http://localhost:11434").rstrip("/")
        if not self.base_url.startswith("http"):
            self.base_url = f"http://{self.base_url}"
        self.model = model or os.environ.get("OLLAMA_MODEL") or "qwen3"
        self.timeout = timeout

    def complete(self, prompt: str, *, system: str = "", max_tokens: int = 900, json_mode: bool = False) -> Completion:
        payload: dict = {
            "model": self.model,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {"temperature": 0.2, "num_predict": max_tokens},
        }
        if json_mode:
            payload["format"] = "json"
        start = time.perf_counter()
        try:
            data = self._post(f"{self.base_url}/api/generate", payload, {})
        except RuntimeError as exc:
            return self._fallback(prompt, str(exc))
        text = data.get("response") or ""
        latency = int((time.perf_counter() - start) * 1000)
        return Completion(text=text, provider=self.name, ok=bool(text), latency_ms=latency)


class AnthropicProvider(_HttpProvider):
    """Anthropic Messages API."""

    name = "anthropic"

    def __init__(
        self,
        *,
        base_url: str | None = None,
        model: str | None = None,
        api_key: str | None = None,
        timeout: float = 60.0,
    ) -> None:
        self.base_url = (base_url or os.environ.get("ANTHROPIC_BASE_URL") or "https://api.anthropic.com").rstrip("/")
        self.model = model or os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-5"
        self.api_key = api_key if api_key is not None else os.environ.get("ANTHROPIC_API_KEY", "")
        self.timeout = timeout

    def complete(self, prompt: str, *, system: str = "", max_tokens: int = 900, json_mode: bool = False) -> Completion:
        payload = {
            "model": self.model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
        }
        if system:
            payload["system"] = system
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
        }
        start = time.perf_counter()
        try:
            data = self._post(f"{self.base_url}/v1/messages", payload, headers)
        except RuntimeError as exc:
            return self._fallback(prompt, str(exc))
        blocks = data.get("content") or []
        text = "".join(block.get("text", "") for block in blocks if isinstance(block, dict))
        latency = int((time.perf_counter() - start) * 1000)
        return Completion(text=text, provider=self.name, ok=bool(text), latency_ms=latency)


class EchoProvider:
    """Deterministic provider for tests: returns the prompt's ``ECHO:`` field."""

    name = "echo"

    def complete(self, prompt: str, *, system: str = "", max_tokens: int = 900, json_mode: bool = False) -> Completion:
        return Completion(text=_field(prompt, "ECHO") or "{}", provider=self.name)


def build_provider(name: str | None = None) -> Provider:
    """Factory honouring ``SUNO_HELPER_PROVIDER`` and always degrading safely."""
    choice = (name or os.environ.get("SUNO_HELPER_PROVIDER") or "heuristic").lower().strip()
    if choice in {"heuristic", "local", "offline", "none"}:
        return HeuristicProvider()
    if choice in {"openai", "openai-compatible", "compatible", "groq", "lmstudio", "vllm"}:
        return OpenAICompatibleProvider()
    if choice == "ollama":
        return OllamaProvider()
    if choice == "anthropic":
        return AnthropicProvider()
    if choice == "echo":
        return EchoProvider()
    return HeuristicProvider()
