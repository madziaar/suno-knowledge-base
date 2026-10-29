"""Research desk: question queue, source corpus, and an honest network fetcher.

Rules the desk enforces (they come from ``cli-skillset/AGENTS.md``):

* primary sources before community posts;
* never invent a URL — every source row carries ``retrieved_at`` and a
  ``retrieved_by`` field;
* no scraping of Suno itself. The one network fetcher only talks to the public
  GitHub REST API, and it is disabled unless ``allow_network`` is set.

A run therefore produces *reproducible* research: the same cached corpus is
re-read on a plane as on a cron box.
"""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from .fsutil import atomic_write_json, atomic_write_text, read_json
from .providers import Provider


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _slug(text: str) -> str:
    lowered = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (lowered or "note")[:56]


@dataclass
class Source:
    """One cited source in the local corpus."""

    id: str
    title: str
    url: str
    kind: str = "primary"  # primary | docs | repo | community
    trust: float = 0.8
    retrieved_at: str = field(default_factory=_now_iso)
    retrieved_by: str = "agent"
    notes: str = ""
    snippet: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Source":
        known = {f for f in cls.__dataclass_fields__}  # type: ignore[attr-defined]
        return cls(**{k: v for k, v in (data or {}).items() if k in known})


@dataclass
class ResearchQuestion:
    """An open question attached to a subgoal."""

    question: str
    subgoal_id: str = ""
    priority: int = 3
    status: str = "open"  # open | answered | parked
    answer: str = ""
    sources: list[str] = field(default_factory=list)
    asked_turn: int = 0
    answered_turn: int = 0

    @property
    def id(self) -> str:
        return _slug(f"{self.subgoal_id}-{self.question}")

    def to_dict(self) -> dict:
        return asdict(self) | {"id": self.id}


class ResearchDesk:
    """Tracks questions, answers them from corpus + notes, writes research docs."""

    MAX_AGE_DAYS = 180

    def __init__(self, root: Path, *, allow_network: bool = False) -> None:
        self.root = Path(root)
        self.dir = self.root / "docs" / "research"
        self.dir.mkdir(parents=True, exist_ok=True)
        self.sources_path = self.dir / "sources.json"
        self.questions_path = self.root / ".suno-helper" / "research-questions.json"
        self.allow_network = allow_network
        self.sources: dict[str, Source] = {}
        self.questions: list[ResearchQuestion] = []
        self.load()

    # ------------------------------------------------------------------- load
    def load(self) -> "ResearchDesk":
        payload = read_json(self.sources_path, {}) or {}
        rows = payload.get("sources", []) if isinstance(payload, dict) else payload
        self.sources = {}
        for row in rows or []:
            source = Source.from_dict(row)
            self.sources[source.id] = source
        raw_questions = read_json(self.questions_path, []) or []
        self.questions = [ResearchQuestion(**{k: v for k, v in row.items() if k != "id"}) for row in raw_questions if isinstance(row, dict)]
        return self

    def save(self) -> None:
        atomic_write_json(
            self.sources_path,
            {
                "schema": "suno-helper/research-sources@1",
                "updated_at": _now_iso(),
                "sources": [source.to_dict() for source in sorted(self.sources.values(), key=lambda s: s.id)],
            },
        )
        atomic_write_json(self.questions_path, [question.to_dict() for question in self.questions])

    # --------------------------------------------------------------- sources
    def add_source(self, source: Source) -> Source:
        existing = self.sources.get(source.id)
        if existing is not None and existing.url == source.url:
            existing.notes = source.notes or existing.notes
            existing.snippet = source.snippet or existing.snippet
            return existing
        self.sources[source.id] = source
        return source

    def stale_sources(self, *, max_age_days: int | None = None) -> list[Source]:
        limit = max_age_days or self.MAX_AGE_DAYS
        now = datetime.now(timezone.utc)
        stale: list[Source] = []
        for source in self.sources.values():
            try:
                stamp = datetime.strptime(source.retrieved_at, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
            except (ValueError, TypeError):
                stale.append(source)
                continue
            if (now - stamp).days > limit:
                stale.append(source)
        return stale

    # ------------------------------------------------------------- questions
    def ask(self, question: str, *, subgoal_id: str = "", priority: int = 3, turn: int = 0) -> ResearchQuestion:
        for existing in self.questions:
            if existing.question.strip().lower() == question.strip().lower():
                existing.priority = max(existing.priority, priority)
                return existing
        item = ResearchQuestion(question=question.strip(), subgoal_id=subgoal_id, priority=priority, asked_turn=turn)
        self.questions.append(item)
        return item

    def open_questions(self, limit: int = 5) -> list[ResearchQuestion]:
        items = [q for q in self.questions if q.status == "open"]
        items.sort(key=lambda q: (-q.priority, q.asked_turn))
        return items[:limit]

    def answer(self, question_id: str, answer: str, *, sources: Iterable[str] = (), turn: int = 0) -> ResearchQuestion | None:
        for item in self.questions:
            if item.id == question_id:
                item.answer = answer
                item.status = "answered"
                item.sources = list(sources)
                item.answered_turn = turn
                return item
        return None

    # ---------------------------------------------------------------- corpus
    def corpus(self) -> list[dict]:
        """Flattened, budget-friendly view of the source corpus."""
        rows = []
        for source in sorted(self.sources.values(), key=lambda s: (-s.trust, s.id)):
            rows.append(
                {
                    "id": source.id,
                    "title": source.title,
                    "url": source.url,
                    "kind": source.kind,
                    "trust": source.trust,
                    "retrieved_at": source.retrieved_at,
                    "snippet": source.snippet[:400],
                }
            )
        return rows

    def search(self, query: str, *, limit: int = 5) -> list[Source]:
        tokens = {token for token in re.findall(r"[a-z0-9]+", query.lower()) if len(token) > 2}
        scored: list[tuple[float, Source]] = []
        for source in self.sources.values():
            haystack = f"{source.title} {source.notes} {source.snippet} {source.url}".lower()
            hits = sum(1 for token in tokens if token in haystack)
            if hits:
                scored.append((hits * source.trust, source))
        scored.sort(key=lambda pair: (-pair[0], pair[1].id))
        return [source for _, source in scored[:limit]]

    # ------------------------------------------------------------------ run
    def run(self, provider: Provider, *, subgoal_id: str = "", turn: int = 0, max_questions: int = 3) -> dict:
        """Triage open questions against the corpus and write the research note."""
        pending = [q for q in self.open_questions(max_questions) if not subgoal_id or q.subgoal_id in {"", subgoal_id}]
        answered: list[dict] = []
        for item in pending:
            local = self.search(item.question, limit=3)
            if local and max(source.trust for source in local) >= 0.8:
                answer = _summarise(item.question, local)
                self.answer(item.id, answer, sources=[s.id for s in local], turn=turn)
                answered.append({"question": item.question, "answer": answer, "sources": [s.id for s in local]})
                continue
            remote = self.fetch_github(item.question) if self.allow_network else []
            for source in remote:
                self.add_source(source)
            if remote:
                answer = _summarise(item.question, remote)
                self.answer(item.id, answer, sources=[s.id for s in remote], turn=turn)
                answered.append({"question": item.question, "answer": answer, "sources": [s.id for s in remote]})
                continue
            # Provider triage keeps the question honest instead of hallucinating.
            completion = provider.complete(
                f"TASK: RESEARCH\nSUBJECT: {item.question}\nQUESTIONS:\n- {item.question}\n",
                json_mode=True,
            )
            payload = completion.as_json() or {}
            item.answer = str(payload.get("notes") or "no primary source found in the local corpus")
            item.status = "parked" if not local else "answered"
            answered.append({"question": item.question, "answer": item.answer, "sources": []})
        self.save()
        return {
            "asked": len(pending),
            "answered": len(answered),
            "corpus": len(self.sources),
            "stale": len(self.stale_sources()),
            "details": answered,
        }

    # -------------------------------------------------------------- fetchers
    def fetch_github(self, query: str, *, limit: int = 3) -> list[Source]:
        """Search public GitHub repositories for *query* (read-only, no auth needed)."""
        if not self.allow_network:
            return []
        url = "https://api.github.com/search/repositories?" + urllib.parse.urlencode(
            {"q": query, "sort": "stars", "order": "desc", "per_page": limit}
        )
        request = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "suno-helper-agent"})
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
            return []
        out: list[Source] = []
        for item in (payload.get("items") or [])[:limit]:
            name = str(item.get("full_name", "unknown"))
            out.append(
                Source(
                    id=_slug(f"gh-{name}"),
                    title=name,
                    url=str(item.get("html_url", "")),
                    kind="repo",
                    trust=0.55,
                    retrieved_at=_now_iso(),
                    notes=str(item.get("description") or "")[:300],
                    snippet=f"stars={item.get('stargazers_count')} pushed={item.get('pushed_at')}",
                )
            )
        return out

    # ----------------------------------------------------------------- write
    def write_note(self, *, title: str, body: str) -> Path:
        path = self.dir / f"{_slug(title)}.md"
        atomic_write_text(path, body if body.endswith("\n") else body + "\n")
        return path

    def render_index(self) -> str:
        rows = ["# Research corpus", "", f"_{len(self.sources)} sources · updated {_now_iso()}_", ""]
        rows.append("| id | source | kind | trust | retrieved |")
        rows.append("|----|--------|------|-------|-----------|")
        prefix = "docs/research/"
        for source in sorted(self.sources.values(), key=lambda s: (-s.trust, s.id)):
            url = source.url
            if "://" not in url and url.startswith(prefix):
                # keep the link relative to this file, not to the repo root
                url = "./" + url[len(prefix) :]
            rows.append(
                f"| `{source.id}` | [{source.title}]({url}) | {source.kind} | {source.trust:.2f} | {source.retrieved_at[:10]} |"
            )
        open_q = [q for q in self.questions if q.status != "answered"]
        if open_q:
            rows += ["", "## Open questions", ""]
            rows += [f"- [ ] {q.question} _(subgoal: {q.subgoal_id or '—'})_" for q in open_q]
        answered = [q for q in self.questions if q.status == "answered"]
        if answered:
            rows += ["", "## Answered questions", ""]
            for q in answered[-20:]:
                rows.append(f"- **{q.question}** → {q.answer[:300]}")
        return "\n".join(rows) + "\n"


def _summarise(question: str, sources: list[Source]) -> str:
    parts = [f"Q: {question}"]
    for source in sources:
        snippet = (source.snippet or source.notes or "").strip().replace("\n", " ")
        parts.append(f"- {source.title} ({source.url}): {snippet[:280]}")
    return "\n".join(parts)


def utc_stamp() -> str:
    return _now_iso()


def age_days(stamp: str) -> float:
    try:
        then = datetime.strptime(stamp, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        return 1e9
    return (time.time() - then.timestamp()) / 86400.0
