"""Skill discovery: a tiny, dependency-free SKILL.md registry + search engine.

The registry understands the Superpowers skill format::

    ---
    name: writing-plans
    description: Use when you have a spec and need an implementation plan
    tags: [planning, tdd]
    stages: [ultraplan]
    ---

    # Writing Plans
    ...

Only a YAML *subset* is supported (scalars, inline lists, block lists, nested
dicts one level deep) because the whole point is that this package installs
with nothing but the standard library.

``find_skills`` is a local, deterministic retrieval function — no embeddings,
no network. It scores:

* exact/prefix name match ................ 6.0 / 4.0
* tag match .............................. 3.0
* ``when_to_use`` phrase match ........... 2.5
* description token overlap .............. 2.0
* body token overlap ..................... 0.6 (capped)
* stage match ............................ 1.5
* synonym expansion ...................... inherits the weight of the trigger

so "clean up my style prompt" finds ``suno-prompt-engineering`` even though the
word "clean" never appears in the skill.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

from .fsutil import atomic_write_json

FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n?(.*)\Z", re.DOTALL)
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9+#.*-]{1,}")
STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "from", "into", "when", "use", "used",
    "using", "are", "was", "were", "will", "would", "can", "could", "should", "must",
    "need", "needs", "want", "make", "makes", "get", "got", "our", "your", "their",
    "its", "it", "a", "an", "of", "to", "in", "on", "at", "as", "is", "be", "by",
    "or", "if", "so", "we", "you", "i", "me", "my", "them", "then", "than", "too",
    "just", "not", "no", "do", "does", "did", "done", "have", "has", "had", "all",
    "any", "some", "more", "most", "also", "but", "how", "what", "which", "who",
}

# Domain synonyms so a plain-English request reaches the right skill.
SYNONYMS: dict[str, set[str]] = {
    "clean": {"cleaner", "normalize", "tidy", "dedupe", "duplicate", "hype"},
    "prompt": {"style", "styles", "prompting", "tag", "tags", "suno"},
    "style": {"styles", "prompt", "genre", "production"},
    "lyric": {"lyrics", "verse", "chorus", "hook", "song"},
    "lyrics": {"lyric", "verse", "chorus", "structure", "section", "tag"},
    "extension": {"chrome", "manifest", "mv3", "wxt", "browser", "popup", "content"},
    "chrome": {"extension", "manifest", "mv3", "browser", "service", "worker"},
    "privacy": {"local", "local-first", "offline", "client", "side", "zero", "trust"},
    "local": {"first", "offline", "privacy", "client", "browser", "on-device"},
    "research": {"search", "internet", "web", "docs", "sources", "verify", "evidence"},
    "plan": {"planning", "decompose", "breakdown", "milestone", "task", "ultraplan"},
    "goal": {"subgoal", "objective", "metric", "loop", "progress"},
    "loop": {"cron", "schedule", "turn", "cycle", "autonomous", "agent"},
    "delegate": {"subagent", "agents", "parallel", "dispatch", "isolated"},
    "improve": {"improvement", "self", "reflect", "retrospective", "optimise", "optimize"},
    "test": {"verify", "verification", "gate", "pytest", "vitest", "check", "evidence"},
    "diff": {"compare", "compare-versions", "version", "revision"},
    "duration": {"timing", "length", "seconds", "syllables", "estimate"},
    "download": {"batch", "bulk", "csv", "metadata", "parser", "profile"},
    "tags": {"structure", "section", "normalizer", "metatags", "meta"},
}

SKILL_ROOTS_DEFAULT = (
    "projects/suno-helper/skills",
    "skills",
    "cli-skillset/skills",
    ".agents/skills",
    ".claude/skills",
)


@dataclass
class Skill:
    """A parsed SKILL.md."""

    name: str
    description: str = ""
    path: Path | None = None
    tags: list[str] = field(default_factory=list)
    stages: list[str] = field(default_factory=list)
    when_to_use: str = ""
    body: str = ""
    meta: dict[str, Any] = field(default_factory=dict)
    root: str = ""

    @property
    def sha(self) -> str:
        digest = hashlib.sha256()
        digest.update(self.name.encode())
        digest.update(self.description.encode())
        digest.update(self.body.encode())
        return digest.hexdigest()[:16]

    def to_dict(self, *, include_body: bool = False) -> dict[str, Any]:
        data = {
            "name": self.name,
            "description": self.description,
            "tags": list(self.tags),
            "stages": list(self.stages),
            "when_to_use": self.when_to_use,
            "path": str(self.path) if self.path else "",
            "root": self.root,
            "sha": self.sha,
            "lines": len(self.body.splitlines()),
        }
        if include_body:
            data["body"] = self.body
        return data

    def load_text(self) -> str:
        """Full skill text for injection into a subagent context."""
        if self.path and self.path.exists():
            return self.path.read_text(encoding="utf-8")
        return self.body


# --------------------------------------------------------------------------- io
def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    """Split a SKILL.md into (frontmatter dict, body)."""
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    header, body = match.group(1), match.group(2)
    return parse_yaml_subset(header), body


def parse_yaml_subset(text: str) -> dict[str, Any]:
    """Parse the frontmatter subset used by skills (no external YAML dep)."""
    data: dict[str, Any] = {}
    current_key: str | None = None
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.lstrip().startswith("- ") and current_key:
            value = line.lstrip()[2:].strip()
            bucket = data.setdefault(current_key, [])
            if isinstance(bucket, list):
                bucket.append(_scalar(value))
            continue
        if ":" in line and not line.startswith(" "):
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip()
            current_key = key
            if not value:
                data[key] = []
                continue
            if value.startswith("[") and value.endswith("]"):
                inner = value[1:-1].strip()
                data[key] = [_scalar(part) for part in inner.split(",") if part.strip()] if inner else []
            elif value in (">", "|"):
                data[key] = ""
            else:
                data[key] = _scalar(value)
            continue
        if line.startswith("  ") and current_key and isinstance(data.get(current_key), str):
            data[current_key] = f"{data[current_key]} {line.strip()}".strip()
    return data


def _scalar(value: str) -> Any:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    lowered = value.lower()
    if lowered in {"true", "false"}:
        return lowered == "true"
    if re.fullmatch(r"-?\d+", value):
        return int(value)
    if re.fullmatch(r"-?\d+\.\d+", value):
        return float(value)
    return value


def load_skill(path: Path, *, root_label: str = "") -> Skill | None:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None
    meta, body = parse_frontmatter(text)
    if not meta and path.name != "SKILL.md":
        return None
    name = str(meta.get("name") or path.parent.name)
    description = str(meta.get("description") or "")
    tags = _as_list(meta.get("tags")) or _as_list(meta.get("keywords"))
    stages = _as_list(meta.get("stages"))
    when_to_use = str(meta.get("when_to_use") or meta.get("when-to-use") or "")
    if not when_to_use:
        when_to_use = description
    return Skill(
        name=name,
        description=description,
        path=path,
        tags=[str(t).lower() for t in tags],
        stages=[str(s).lower() for s in stages],
        when_to_use=when_to_use,
        body=body,
        meta=meta,
        root=root_label,
    )


def _strip_code_spans(text: str) -> str:
    """Remove fenced blocks and inline code so linters do not flag examples."""
    without_fences = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    return re.sub(r"`[^`\n]*`", "", without_fences)


def _as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        if not value.strip():
            return []
        if "," in value:
            return [part.strip() for part in value.split(",") if part.strip()]
        return [value.strip()]
    return [value]


def tokenize(text: str) -> list[str]:
    return [tok for tok in TOKEN_RE.findall(text.lower()) if tok not in STOPWORDS]


# --------------------------------------------------------------------- registry
class SkillRegistry:
    """Discovers skills on disk, indexes them and answers ``find-skills``."""

    def __init__(self, root: Path, *, roots: Iterable[str] | None = None) -> None:
        self.root = Path(root)
        self.roots = list(roots or SKILL_ROOTS_DEFAULT)
        self.skills: dict[str, Skill] = {}
        self._idf: dict[str, float] = {}

    # ------------------------------------------------------------- discovery
    def discover(self) -> "SkillRegistry":
        self.skills.clear()
        seen: set[str] = set()
        for rel in self.roots:
            root_dir = self.root / rel
            if not root_dir.exists():
                continue
            for path in sorted(root_dir.rglob("SKILL.md")):
                if any(part.startswith(".") and part not in {".agents", ".claude"} for part in path.parts):
                    continue
                skill = load_skill(path, root_label=rel)
                if skill is None:
                    continue
                key = skill.name.lower()
                if key in seen:
                    continue
                seen.add(key)
                self.skills[key] = skill
        self._build_idf()
        return self

    def _build_idf(self) -> None:
        docs = list(self.skills.values())
        counts: dict[str, int] = {}
        for skill in docs:
            for token in set(tokenize(f"{skill.description} {skill.when_to_use} {skill.body[:4000]}")):
                counts[token] = counts.get(token, 0) + 1
        total = max(1, len(docs))
        self._idf = {tok: math.log(1 + total / (1 + cnt)) for tok, cnt in counts.items()}

    # ---------------------------------------------------------------- access
    def __len__(self) -> int:
        return len(self.skills)

    def get(self, name: str) -> Skill | None:
        return self.skills.get(name.lower().strip())

    def names(self) -> list[str]:
        return sorted(self.skills)

    def by_stage(self, stage: str) -> list[Skill]:
        stage = stage.lower()
        return [s for s in self.skills.values() if stage in s.stages]

    # ---------------------------------------------------------------- search
    def find(self, query: str, *, stage: str | None = None, limit: int = 5) -> list[tuple[float, Skill, list[str]]]:
        """Return ``[(score, skill, reasons)]`` sorted best-first."""
        query_tokens = tokenize(query)
        expanded: dict[str, float] = {}
        for token in query_tokens:
            expanded[token] = max(expanded.get(token, 0.0), 1.0)
            for syn in SYNONYMS.get(token, ()):
                expanded[syn] = max(expanded.get(syn, 0.0), 0.55)
        phrase = query.lower().strip()
        results: list[tuple[float, Skill, list[str]]] = []
        for skill in self.skills.values():
            score = 0.0
            reasons: list[str] = []
            name = skill.name.lower()
            if phrase and (phrase == name or phrase in name):
                score += 6.0
                reasons.append("name")
            elif query_tokens and name.startswith(query_tokens[0]):
                score += 4.0
                reasons.append("name-prefix")
            tag_hits = expanded.keys() & {t.lower() for t in skill.tags}
            if tag_hits:
                score += 3.0 * min(2, len(tag_hits))
                reasons.append("tags:" + ",".join(sorted(tag_hits)[:4]))
            when_tokens = set(tokenize(skill.when_to_use))
            desc_tokens = set(tokenize(skill.description)) | set(tokenize(skill.name))
            when_hits = when_tokens & expanded.keys()
            desc_hits = desc_tokens & expanded.keys()
            if when_hits:
                score += 2.5 * min(2.0, sum(expanded[t] for t in when_hits))
                reasons.append("when:" + ",".join(sorted(when_hits)[:4]))
            if desc_hits:
                score += 2.0 * min(2.0, sum(expanded[t] for t in desc_hits))
                reasons.append("desc:" + ",".join(sorted(desc_hits)[:4]))
            if stage and stage.lower() in [s.lower() for s in skill.stages]:
                score += 1.5
                reasons.append(f"stage:{stage}")
            body_tokens = set(tokenize(skill.body[:6000]))
            body_hits = body_tokens & expanded.keys()
            if body_hits:
                weighted = sum(expanded[t] * self._idf.get(t, 0.4) for t in body_hits)
                score += min(2.0, 0.6 * weighted)
                reasons.append("body")
            if score > 0:
                results.append((round(score, 3), skill, reasons))
        results.sort(key=lambda triple: (-triple[0], triple[1].name))
        return results[:limit]

    def find_or_raise(self, query: str, *, stage: str | None = None) -> Skill:
        found = self.find(query, stage=stage, limit=1)
        if not found:
            raise LookupError(f"no skill matched query: {query!r}")
        return found[0][1]

    # -------------------------------------------------------------- indexing
    def index(self) -> dict[str, Any]:
        payload = {
            "schema": "suno-helper/skills@1",
            "count": len(self.skills),
            "roots": self.roots,
            "stages": sorted({stage for s in self.skills.values() for stage in s.stages}),
            "skills": [s.to_dict() for s in sorted(self.skills.values(), key=lambda s: s.name)],
        }
        return payload

    def write_index(self, path: Path) -> Path:
        payload = self.index()
        atomic_write_json(path, payload)
        return path

    def to_json(self) -> str:
        return json.dumps(self.index(), indent=2, ensure_ascii=False)

    # ------------------------------------------------------------------ lint
    def lint(self, *, include_external: bool = False) -> dict[str, Any]:
        """Validate skills against the Superpowers authoring contract.

        Skills under ``cli-skillset/`` predate this contract and belong to another
        part of the repository; they are reported as advisory rather than
        blocking, so the gate measures what this project actually owns.
        """
        problems: list[str] = []
        advisory: list[str] = []
        for skill in self.skills.values():
            external = skill.root.startswith("cli-skillset")
            bucket = advisory if (external and not include_external) else problems
            self._lint_one(skill, bucket)
        return {
            "ok": not problems,
            "count": len(self.skills),
            "problems": problems,
            "advisory": advisory,
            "local": sum(1 for s in self.skills.values() if not s.root.startswith("cli-skillset")),
        }

    def _lint_one(self, skill: "Skill", problems: list[str]) -> None:
        if True:
            if not skill.name:
                problems.append(f"{skill.path}: missing name")
            if not skill.description:
                problems.append(f"{skill.name}: missing description")
            elif not skill.description.lower().startswith("use when"):
                problems.append(f"{skill.name}: description should start with 'Use when'")
            if len(skill.description) > 500:
                problems.append(f"{skill.name}: description longer than 500 chars")
            prose = _strip_code_spans(skill.body)
            if re.search(r"\b(TODO|TBD|FIXME)\b\s*[:\-]", prose):
                problems.append(f"{skill.name}: contains TODO/TBD placeholder")
            if not skill.stages:
                problems.append(f"{skill.name}: no stages declared")
            if skill.body.strip() and not skill.body.lstrip().startswith("#"):
                problems.append(f"{skill.name}: body should start with a heading")

    def require(self, names: Iterable[str]) -> dict[str, Skill]:
        """Resolve skill hints declared on a subgoal (missing ones are skipped)."""
        out: dict[str, Skill] = {}
        for name in names:
            skill = self.get(name)
            if skill is not None:
                out[name] = skill
            else:
                fuzzy = self.find(name, limit=1)
                if fuzzy and fuzzy[0][0] >= 3.0:
                    out[name] = fuzzy[0][1]
        return out
