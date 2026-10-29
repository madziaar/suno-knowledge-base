"""Goal and subgoal state: the persistent memory of the `/loop`.

Files written under ``<root>/.suno-helper/``:

    goal.json                 current goal (single object)
    subgoals.json             ordered subgoal collection
    goal-history/000N.json    immutable snapshots, one per N turns
    proposals.jsonl           self-improvement proposals + decisions

Every mutation goes through :class:`StateStore`, which keeps the files
consistent, appends a snapshot on request and never leaves a half-written file
behind (see :mod:`suno_helper.fsutil`).
"""

from __future__ import annotations

import json
import random
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable, Literal

from .fsutil import atomic_write_json, read_json, resolve_inside

SubgoalStatus = Literal["pending", "active", "blocked", "done", "dropped"]
ACTIVE_STATUSES: tuple[str, ...] = ("pending", "active", "blocked")

DEFAULT_GOAL_TITLE = "Ship Suno Helper, a local-first AI music companion"
DEFAULT_GOAL_STATEMENT = (
    "Build and maintain a working, private-by-default Suno companion: prompt "
    "engineering tools that run entirely on the user's machine, an autonomous "
    "agent loop that keeps improving it, and documentation good enough that a "
    "stranger can pick it up and ship a song."
)


def _now() -> float:
    return round(time.time(), 3)


def _slug(text: str) -> str:
    keep = [c.lower() if c.isalnum() else "-" for c in text]
    out = "".join(keep)
    while "--" in out:
        out = out.replace("--", "-")
    return out.strip("-")[:48] or "item"


@dataclass
class Goal:
    """The single north-star objective the loop is optimising for."""

    id: str = "goal-main"
    title: str = DEFAULT_GOAL_TITLE
    statement: str = DEFAULT_GOAL_STATEMENT
    metric: str = "weighted subgoal completion (0-100)"
    target: float = 100.0
    current: float = 0.0
    status: str = "active"
    horizon: str = "ongoing"
    version: int = 1
    created_at: float = field(default_factory=_now)
    updated_at: float = field(default_factory=_now)
    notes: list[str] = field(default_factory=list)

    def progress(self) -> float:
        """Fraction of the target achieved, clamped to ``[0, 1]``."""
        if self.target <= 0:
            return 0.0
        return max(0.0, min(1.0, self.current / self.target))

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Goal":
        known = {f for f in cls.__dataclass_fields__}  # type: ignore[attr-defined]
        return cls(**{k: v for k, v in (data or {}).items() if k in known})


@dataclass
class Subgoal:
    """One atomic, verifiable unit of work under the goal.

    ``action`` describes the deterministic work a turn performs, so a cycle can
    always do something real without an LLM:

        {"tool": "limits_audit", "args": {...}}

    ``acceptance`` lists verification gates that must pass before the subgoal
    may be marked done.
    """

    id: str
    title: str
    description: str = ""
    status: SubgoalStatus = "pending"
    priority: int = 3
    weight: float = 1.0
    depends_on: list[str] = field(default_factory=list)
    skill_hints: list[str] = field(default_factory=list)
    stages: list[str] = field(default_factory=list)
    acceptance: list[dict[str, Any]] = field(default_factory=list)
    action: dict[str, Any] | None = None
    evidence: list[str] = field(default_factory=list)
    artifacts: list[str] = field(default_factory=list)
    attempts: int = 0
    failures: int = 0
    last_turn: int = 0
    created_turn: int = 0
    split_depth: int = 0
    created_at: float = field(default_factory=_now)
    updated_at: float = field(default_factory=_now)
    note: str = ""

    # ---------------------------------------------------------------- helpers
    def is_done(self) -> bool:
        return self.status == "done"

    def is_open(self) -> bool:
        return self.status in ACTIVE_STATUSES

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Subgoal":
        known = {f for f in cls.__dataclass_fields__}  # type: ignore[attr-defined]
        return cls(**{k: v for k, v in (data or {}).items() if k in known})

    def mark(self, status: SubgoalStatus, *, reason: str = "") -> None:
        self.status = status
        self.updated_at = _now()
        if reason:
            self.note = reason


class StateStore:
    """Loads, mutates and persists the goal + subgoal state."""

    SNAPSHOT_EVERY = 25
    STARVATION_TURNS = 20
    RETRY_LIMIT = 3

    def __init__(self, root: Path) -> None:
        self.root = Path(root)
        self.dir = self.root / ".suno-helper"
        self.dir.mkdir(parents=True, exist_ok=True)
        self.history_dir = self.dir / "goal-history"
        self.history_dir.mkdir(parents=True, exist_ok=True)
        self.goal_path = self.dir / "goal.json"
        self.subgoals_path = self.dir / "subgoals.json"
        self.goal: Goal = Goal()
        self.subgoals: list[Subgoal] = []
        self.turn: int = 0
        self.dirty = False

    # ------------------------------------------------------------------- load
    def load(self) -> "StateStore":
        goal_raw = read_json(self.goal_path)
        if isinstance(goal_raw, dict) and goal_raw:
            self.goal = Goal.from_dict(goal_raw)
        subs_raw = read_json(self.subgoals_path, []) or []
        self.subgoals = [Subgoal.from_dict(item) for item in subs_raw if isinstance(item, dict)]
        meta = read_json(self.dir / "meta.json", {}) or {}
        self.turn = int(meta.get("turn", 0) or 0)
        return self

    # ------------------------------------------------------------------- save
    def save(self, *, snapshot: bool = False) -> None:
        self.goal.updated_at = _now()
        atomic_write_json(self.goal_path, self.goal.to_dict())
        atomic_write_json(self.subgoals_path, [s.to_dict() for s in self.subgoals])
        atomic_write_json(self.dir / "meta.json", {"turn": self.turn, "updated_at": _now()})
        self.dirty = False
        if snapshot or (self.turn and self.turn % self.SNAPSHOT_EVERY == 0):
            self.snapshot()

    def snapshot(self, label: str = "") -> Path:
        stamp = f"{self.turn:05d}"
        name = f"{stamp}-{_slug(label)}.json" if label else f"{stamp}.json"
        path = resolve_inside(self.root, self.history_dir / name)
        atomic_write_json(
            path,
            {
                "turn": self.turn,
                "saved_at": _now(),
                "goal": self.goal.to_dict(),
                "subgoals": [s.to_dict() for s in self.subgoals],
            },
        )
        return path

    # ------------------------------------------------------------------- goal
    def set_goal(self, **fields: Any) -> Goal:
        changed = False
        for key, value in fields.items():
            if value is None:
                continue
            if hasattr(self.goal, key) and getattr(self.goal, key) != value:
                setattr(self.goal, key, value)
                changed = True
        if changed:
            self.goal.version += 1
            self.goal.updated_at = _now()
            self.dirty = True
        return self.goal

    def note(self, message: str) -> None:
        self.goal.notes.append(f"[turn {self.turn}] {message}")
        self.goal.notes = self.goal.notes[-40:]
        self.dirty = True

    def recompute_progress(self) -> float:
        """Recompute the goal metric from weighted subgoal completion."""
        total = sum(s.weight for s in self.subgoals if s.status != "dropped")
        if total <= 0:
            self.goal.current = 0.0
        else:
            done = sum(s.weight for s in self.subgoals if s.status == "done")
            self.goal.current = round(100.0 * done / total, 2)
        return self.goal.current

    # --------------------------------------------------------------- subgoals
    def get(self, subgoal_id: str) -> Subgoal | None:
        for sub in self.subgoals:
            if sub.id == subgoal_id:
                return sub
        return None

    def add_subgoal(
        self,
        title: str,
        *,
        description: str = "",
        priority: int = 3,
        weight: float = 1.0,
        depends_on: Iterable[str] = (),
        skill_hints: Iterable[str] = (),
        stages: Iterable[str] = (),
        acceptance: Iterable[dict[str, Any]] = (),
        action: dict[str, Any] | None = None,
        status: SubgoalStatus = "pending",
        subgoal_id: str | None = None,
    ) -> Subgoal:
        # Idempotency: an existing subgoal with the same title or id is returned
        # untouched, so seeding and roadmap waves can be re-run safely.
        for candidate in self.subgoals:
            if candidate.title.strip().lower() == title.strip().lower():
                return candidate
        sid = subgoal_id or self._unique_id(title)
        existing = self.get(sid)
        if existing is not None:
            return existing
        sub = Subgoal(
            id=sid,
            title=title,
            description=description,
            priority=int(priority),
            weight=float(weight),
            depends_on=list(depends_on),
            skill_hints=list(skill_hints),
            stages=list(stages),
            acceptance=list(acceptance),
            action=dict(action) if action else None,
            status=status,
            created_turn=self.turn,
        )
        self.subgoals.append(sub)
        self.dirty = True
        self.recompute_progress()
        return sub

    def _unique_id(self, title: str) -> str:
        base = _slug(title)
        taken = {s.id for s in self.subgoals}
        if base not in taken:
            return base
        index = 2
        while f"{base}-{index}" in taken:
            index += 1
        return f"{base}-{index}"

    def update_subgoal(self, subgoal_id: str, **fields: Any) -> Subgoal:
        sub = self.get(subgoal_id)
        if sub is None:
            raise KeyError(f"unknown subgoal: {subgoal_id}")
        for key, value in fields.items():
            if value is None:
                continue
            if hasattr(sub, key):
                setattr(sub, key, value)
        sub.updated_at = _now()
        self.dirty = True
        self.recompute_progress()
        return sub

    def resolve(self, ref: str) -> Subgoal:
        """Resolve a subgoal by id or by unique title prefix."""
        sub = self.get(ref)
        if sub is not None:
            return sub
        matches = [s for s in self.subgoals if s.title.lower().startswith(ref.lower())]
        if len(matches) == 1:
            return matches[0]
        raise KeyError(f"cannot resolve subgoal: {ref}")

    def complete(self, subgoal_id: str, evidence: str = "") -> Subgoal:
        sub = self.update_subgoal(subgoal_id, status="done")
        if evidence:
            sub.evidence.append(evidence)
        self.recompute_progress()
        return sub

    def record_attempt(self, subgoal_id: str, *, ok: bool, evidence: str = "", artifact: str = "") -> Subgoal:
        sub = self.get(subgoal_id)
        if sub is None:
            raise KeyError(f"unknown subgoal: {subgoal_id}")
        sub.attempts += 1
        sub.last_turn = self.turn
        if ok:
            if evidence:
                sub.evidence.append(evidence)
            if artifact and artifact not in sub.artifacts:
                sub.artifacts.append(artifact)
        else:
            sub.failures += 1
        sub.updated_at = _now()
        self.dirty = True
        return sub

    def blocked_by(self, sub: Subgoal) -> list[str]:
        """Return unmet dependency ids for *sub*."""
        unmet: list[str] = []
        for dep in sub.depends_on:
            target = self.get(dep)
            if target is None or target.status != "done":
                unmet.append(dep)
        return unmet

    def select_next(self, *, turn: int | None = None, seed: int | None = None) -> Subgoal | None:
        """Pick the next subgoal to work on.

        Policy (deterministic given the seed):

        * skip ``done``/``dropped`` and subgoals with unmet dependencies;
        * re-activate ``blocked`` subgoals when their dependencies are done;
        * score = priority + staleness + failure-recovery bonus;
        * staleness grows with turns since last attempt so nothing starves.
        """
        turn = self.turn if turn is None else turn
        rng = random.Random(seed if seed is not None else turn)
        candidates: list[tuple[float, Subgoal]] = []
        for sub in self.subgoals:
            if not sub.is_open():
                continue
            if self.blocked_by(sub):
                if sub.status != "blocked":
                    sub.mark("blocked")
                continue
            # Thrash guard, absolute: after three failures the loop stops trying.
            # Splitting (which adds dependencies) resets the counter on the
            # children, but a subgoal that keeps failing — even with children —
            # must never be selected again. It needs a human decision.
            if sub.failures >= self.RETRY_LIMIT:
                if sub.status != "blocked":
                    sub.mark("blocked", reason=f"{sub.failures} failed attempts — needs a human decision")
                continue
            if sub.status == "blocked":
                sub.mark("pending")
            staleness = 0.0 if sub.last_turn == 0 else min(6.0, (turn - sub.last_turn) * 0.35)
            fresh_bonus = 1.5 if sub.attempts == 0 else 0.0
            recovery = 0.8 * sub.failures if sub.failures and sub.failures < 3 else 0.0
            jitter = rng.random() * 0.25
            score = sub.priority + staleness + fresh_bonus + recovery + jitter
            candidates.append((score, sub))
        if not candidates:
            return None
        # Starvation floor: anything untouched for STARVATION_TURNS goes to the
        # front, oldest first, regardless of priority. This is the difference
        # between "priority order" and "priority order that eventually finishes".
        starved = [
            sub
            for _, sub in candidates
            if turn - (sub.last_turn or sub.created_turn or 0) >= self.STARVATION_TURNS
        ]
        if starved:
            starved.sort(key=lambda sub: (sub.last_turn or sub.created_turn or 0, -sub.priority, sub.id))
            return starved[0]
        candidates.sort(key=lambda pair: (-pair[0], pair[1].id))
        return candidates[0][1]

    # ------------------------------------------------------------------ views
    def progress_table(self) -> list[dict[str, Any]]:
        return [
            {
                "id": s.id,
                "status": s.status,
                "priority": s.priority,
                "weight": s.weight,
                "attempts": s.attempts,
                "failures": s.failures,
                "last_turn": s.last_turn,
                "depends_on": list(s.depends_on),
                "title": s.title,
            }
            for s in self.subgoals
        ]

    def summary(self) -> dict[str, Any]:
        counts: dict[str, int] = {}
        for sub in self.subgoals:
            counts[sub.status] = counts.get(sub.status, 0) + 1
        return {
            "turn": self.turn,
            "goal": {
                "title": self.goal.title,
                "status": self.goal.status,
                "current": self.goal.current,
                "target": self.goal.target,
                "version": self.goal.version,
            },
            "subgoals": counts,
            "open": [s.id for s in self.subgoals if s.is_open()],
        }

    def unresolved_questions(self) -> list[str]:
        """Open questions captured on subgoals — the research queue seed."""
        out: list[str] = []
        for sub in self.subgoals:
            if not sub.is_open():
                continue
            for item in sub.acceptance:
                question = item.get("research")
                if question:
                    out.append(question)
        return out

    # --------------------------------------------------------------- seeding
    def seed_default(self) -> None:
        """Seed the roadmap the project actually needs (idempotent)."""
        self.set_goal(
            title=DEFAULT_GOAL_TITLE,
            statement=DEFAULT_GOAL_STATEMENT,
            metric="weighted subgoal completion (0-100)",
            target=100.0,
        )
        specs: list[dict[str, Any]] = [
            {
                "title": "Canonical Suno limits table",
                "description": (
                    "One machine-readable source of truth for per-model character limits "
                    "(v4: style 200 / lyrics 3000; v4.5-v5.5: style 1000 / lyrics 5000; simple "
                    "prompt 500; title 100) so every tool and doc reads the same numbers."
                ),
                "priority": 5,
                "weight": 2.0,
                "stages": ["ultraresearch", "ultrawork", "verify"],
                "skill_hints": ["suno-prompt-engineering", "verify-before-done"],
                "action": {"tool": "limits_audit", "args": {}},
                "acceptance": [
                    {"tool": "limits_audit", "expect": "pass"},
                    {"check": "docs/suno-limits.json parses", "tool": "json_validate"},
                ],
            },
            {
                "title": "Docs cite the canonical limits",
                "description": "All prompt guides reference docs/suno-limits.json numbers, no drift.",
                "priority": 4,
                "weight": 1.5,
                "depends_on": ["canonical-suno-limits-table"],
                "stages": ["ultrawork", "verify"],
                "skill_hints": ["suno-prompt-engineering"],
                "action": {"tool": "md_audit", "args": {"paths": ["docs", "projects/suno-helper/docs"]}},
                "acceptance": [{"tool": "md_audit", "expect": "pass"}],
            },
            {
                "title": "Extension core library",
                "description": (
                    "Pure TypeScript modules for style cleaning, five-pillar building, tag "
                    "normalisation, lyric diffing, duration estimation, exclude lists, CSV and "
                    "storage — all client-side, all unit tested."
                ),
                "priority": 5,
                "weight": 2.5,
                "stages": ["ultraplan", "ultrawork", "verify"],
                "skill_hints": ["local-first-extension", "ultrawork"],
                "action": {"tool": "extension_check", "args": {}},
                "acceptance": [{"tool": "extension_check", "expect": "pass"}],
            },
            {
                "title": "Skill library for the loop",
                "description": "Superpowers-format SKILL.md files that the loop can find and load.",
                "priority": 4,
                "weight": 1.5,
                "stages": ["ultraplan", "ultrawork", "verify"],
                "skill_hints": ["writing-skills", "find-skills"],
                "action": {"tool": "skills_lint", "args": {}},
                "acceptance": [{"tool": "skills_lint", "expect": "pass"}],
            },
            {
                "title": "Research digest maintained",
                "description": (
                    "Keep docs/research/ current: Suno limits, usesuno tool inventory, "
                    "HookGenius and competitor patterns, extension security notes."
                ),
                "priority": 3,
                "weight": 1.0,
                "stages": ["ultraresearch"],
                "skill_hints": ["ultraresearch"],
                "action": {"tool": "research_digest", "args": {}},
                "acceptance": [{"tool": "research_digest", "expect": "pass"}],
            },
            {
                "title": "Loop self-improvement ledger",
                "description": (
                    "Every turn scores itself; bad stretches produce gated process "
                    "proposals with rollback snapshots."
                ),
                "priority": 3,
                "weight": 1.0,
                "stages": ["reflect", "improve"],
                "skill_hints": ["self-improvement-recursive"],
                "action": {"tool": "improve_report", "args": {}},
                "acceptance": [{"tool": "improve_report", "expect": "pass"}],
            },
        ]
        for spec in specs:
            self.add_subgoal(**spec)
        self.recompute_progress()
        self.dirty = True

    # --------------------------------------------------------------- exports
    def export_bundle(self) -> dict[str, Any]:
        return {
            "schema": "suno-helper/state@1",
            "exported_at": _now(),
            "turn": self.turn,
            "goal": self.goal.to_dict(),
            "subgoals": [s.to_dict() for s in self.subgoals],
        }

    def dump_json(self) -> str:
        return json.dumps(self.export_bundle(), indent=2, ensure_ascii=False)
