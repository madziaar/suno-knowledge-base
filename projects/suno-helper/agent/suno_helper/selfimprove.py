"""Self-improvement: reflect, propose, gate, apply, roll back.

The recursion is deliberately *bounded*. A loop that rewrites itself every turn
oscillates; a loop that never rewrites itself plateaus. The rule used here:

    observe  ->  diagnose  ->  propose (cheap)  ->  gate  ->  apply (rare)  ->  measure

* Proposals are always recorded, even when rejected — that is the audit trail
  that makes "recursive self-improvement" falsifiable instead of a vibe.
* Only a small, bounded parameter set is auto-applied, only after a real
  failure streak, at most one change per cycle, with a rollback snapshot.
* Structural proposals (split a stuck subgoal, add a research step, prune a dead
  one) are applied by the engine because they change the plan, not the tuner.
"""

from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable

from .fsutil import atomic_write_json, read_json
from .ledger import Ledger
from .providers import Provider

# name -> (min, max, default)
PARAM_BOUNDS: dict[str, tuple[float, float, float]] = {
    "research_every": (1.0, 20.0, 3.0),
    "delegate_every": (1.0, 10.0, 2.0),
    "debate_every": (1.0, 25.0, 9.0),
    "reflect_every": (1.0, 30.0, 5.0),
    "research_budget": (0.0, 1.0, 0.5),
    "staleness_bonus": (0.0, 1.0, 0.35),
    "retry_limit": (1.0, 5.0, 2.0),
}

PROCESS_KINDS = ("tune", "split", "research", "prune", "promote", "doc")


@dataclass
class Proposal:
    """A concrete, reversible process change."""

    id: str
    kind: str
    title: str
    rationale: str
    created_turn: int = 0
    status: str = "pending"  # pending | applied | rejected | rolled_back
    payload: dict[str, Any] = field(default_factory=dict)
    evidence: list[str] = field(default_factory=list)
    before: dict[str, Any] = field(default_factory=dict)
    after: dict[str, Any] = field(default_factory=dict)
    confidence: float = 0.0
    applied_turn: int = 0

    def to_dict(self) -> dict:
        return asdict(self)


class Improver:
    """Owns loop parameters, proposals, gating and rollback."""

    COOLDOWN = 10  # turns between auto-applied tuning changes

    def __init__(self, root: Path, ledger: Ledger, *, provider: Provider | None = None) -> None:
        self.root = Path(root)
        self.dir = self.root / ".suno-helper"
        self.dir.mkdir(parents=True, exist_ok=True)
        self.ledger = ledger
        self.provider = provider
        self.params_path = self.dir / "params.json"
        self.proposals_path = self.dir / "proposals.json"
        self.params: dict[str, float] = {name: bounds[2] for name, bounds in PARAM_BOUNDS.items()}
        self.proposals: list[Proposal] = []
        self.load()

    # ------------------------------------------------------------------- io
    def load(self) -> "Improver":
        stored = read_json(self.params_path, {}) or {}
        for name, (low, high, _default) in PARAM_BOUNDS.items():
            value = stored.get(name)
            if isinstance(value, (int, float)):
                self.params[name] = float(max(low, min(high, value)))
        raw = read_json(self.proposals_path, []) or []
        loaded = [Proposal(**{k: v for k, v in row.items() if k in Proposal.__dataclass_fields__}) for row in raw]
        # Collapse duplicates left behind by older versions: one pending
        # proposal per (kind, title), evidence merged. History stays as-is.
        deduped: list[Proposal] = []
        pending_index: dict[tuple[str, str], Proposal] = {}
        for proposal in loaded:
            key = (proposal.kind, proposal.title)
            if proposal.status == "pending" and key in pending_index:
                first = pending_index[key]
                first.evidence = sorted(set(first.evidence) | set(proposal.evidence))
                continue
            if proposal.status == "pending":
                pending_index[key] = proposal
            deduped.append(proposal)
        self.proposals = deduped
        return self

    MAX_HISTORY = 120

    def save(self) -> None:
        atomic_write_json(self.params_path, self.params)
        kept = [p for p in self.proposals if p.status == "pending"][-40:]
        decided = [p for p in self.proposals if p.status != "pending"][-self.MAX_HISTORY :]
        self.proposals = sorted(kept + decided, key=lambda p: p.created_turn)
        atomic_write_json(self.proposals_path, [proposal.to_dict() for proposal in self.proposals])

    # -------------------------------------------------------------- proposals
    def _next_id(self, kind: str) -> str:
        return f"{kind}-{len(self.proposals) + 1:04d}"

    def propose(self, kind: str, title: str, rationale: str, *, turn: int = 0, payload: dict | None = None,
                evidence: Iterable[str] = (), confidence: float = 0.5) -> Proposal:
        # Dedupe: one pending proposal per (kind, title). Without this a failure
        # streak generates the same advice every turn and the file becomes noise.
        for existing in self.proposals:
            if existing.status == "pending" and existing.kind == kind and existing.title == title:
                existing.evidence = sorted(set(existing.evidence) | set(evidence))
                return existing
        proposal = Proposal(
            id=self._next_id(kind),
            kind=kind if kind in PROCESS_KINDS else "doc",
            title=title,
            rationale=rationale,
            created_turn=turn,
            payload=payload or {},
            evidence=list(evidence),
            confidence=max(0.0, min(1.0, confidence)),
        )
        self.proposals.append(proposal)
        return proposal

    def open_proposals(self) -> list[Proposal]:
        return [p for p in self.proposals if p.status == "pending"]

    def get(self, proposal_id: str) -> Proposal | None:
        for proposal in self.proposals:
            if proposal.id == proposal_id:
                return proposal
        return None

    # --------------------------------------------------------------- reflect
    def reflect(self, *, turn: int, state_summary: dict, recent_failures: int, consecutive_failures: int) -> list[Proposal]:
        """Diagnose the loop and emit proposals. Never mutates parameters."""
        made: list[Proposal] = []
        stats = self.ledger.stats(window=40)
        success = float(stats.get("success_rate", 1.0) or 0.0)
        avg_ms = float(stats.get("avg_ms", 0.0) or 0.0)

        if consecutive_failures >= 2:
            made.append(
                self.propose(
                    "tune",
                    "Raise retry limit and slow the cycle",
                    f"{consecutive_failures} consecutive failed turns — the loop is retrying too fast "
                    "instead of changing approach.",
                    turn=turn,
                    payload={"retry_limit": min(PARAM_BOUNDS['retry_limit'][1], self.params['retry_limit'] + 1),
                             "reflect_every": max(PARAM_BOUNDS['reflect_every'][0], self.params['reflect_every'] - 2)},
                    evidence=[f"streak={consecutive_failures}", f"success={success:.2f}"],
                    confidence=0.7,
                )
            )
        if recent_failures >= 3:
            made.append(
                self.propose(
                    "split",
                    "Split the most-failed subgoal",
                    "A subgoal with 3+ failed attempts is too coarse; smaller units give verifiable progress.",
                    turn=turn,
                    evidence=[f"recent_failures={recent_failures}"],
                    confidence=0.65,
                )
            )
        if avg_ms > 8000:
            made.append(
                self.propose(
                    "tune",
                    "Cut per-cycle work",
                    f"Average cycle is {avg_ms:.0f} ms — above budget for a cron job.",
                    turn=turn,
                    payload={"delegate_every": min(PARAM_BOUNDS['delegate_every'][1], self.params['delegate_every'] + 2),
                             "research_budget": max(PARAM_BOUNDS['research_budget'][0], self.params['research_budget'] - 0.1)},
                    evidence=[f"avg_ms={avg_ms:.0f}"],
                    confidence=0.6,
                )
            )
        open_count = len(state_summary.get("open", []) or [])
        if open_count > 12:
            made.append(
                self.propose(
                    "prune",
                    "Prune low-value open subgoals",
                    f"{open_count} open subgoals is above the workable ceiling of 12.",
                    turn=turn,
                    evidence=[f"open={open_count}"],
                    confidence=0.55,
                )
            )
        if self.provider is not None and consecutive_failures >= 3:
            completion = self.provider.complete(
                f"TASK: REFLECT\nSUBJECT: autonomous loop\nFAILURES: {consecutive_failures}\n",
                json_mode=True,
            )
            payload = completion.as_json() or {}
            for action in payload.get("actions", []) or []:
                if isinstance(action, str) and action in {"split_subgoal", "add_research_step", "raise_priority_of_blocker"}:
                    made.append(
                        self.propose(
                            {"split_subgoal": "split", "add_research_step": "research", "raise_priority_of_blocker": "promote"}[action],
                            f"Provider reflection: {action}",
                            str(payload.get("diagnosis", "provider reflection"))[:300],
                            turn=turn,
                            confidence=0.5,
                        )
                    )
        self.save()
        return made

    # ------------------------------------------------------------------ gate
    def gate(self, proposal: Proposal, *, turn: int, consecutive_failures: int) -> tuple[bool, str]:
        """Decide whether *proposal* may be auto-applied right now."""
        if proposal.status != "pending":
            return False, "already decided"
        if proposal.kind != "tune":
            return False, f"{proposal.kind} proposals are applied by the engine, not the tuner"
        last_applied = max((p.applied_turn for p in self.proposals if p.status == "applied"), default=-999)
        if turn - last_applied < self.COOLDOWN:
            return False, f"cooldown ({turn - last_applied} < {self.COOLDOWN} turns)"
        if consecutive_failures < 2 and float(self.ledger.stats(window=40).get("success_rate", 1)) > 0.75:
            return False, "loop is healthy; no tuning needed"
        for key, value in proposal.payload.items():
            if key not in PARAM_BOUNDS:
                return False, f"unknown parameter {key}"
            low, high, _ = PARAM_BOUNDS[key]
            if not (low <= float(value) <= high):
                return False, f"{key}={value} outside bounds [{low}, {high}]"
        return True, "ok"

    # ----------------------------------------------------------------- apply
    def apply(self, proposal: Proposal, *, turn: int) -> bool:
        changed = False
        before: dict[str, Any] = {}
        after: dict[str, Any] = {}
        for key, value in proposal.payload.items():
            if key not in PARAM_BOUNDS:
                continue
            before[key] = self.params.get(key)
            low, high, _ = PARAM_BOUNDS[key]
            self.params[key] = float(max(low, min(high, float(value))))
            after[key] = self.params[key]
            changed = changed or before[key] != after[key]
        proposal.before = before
        proposal.after = after
        proposal.applied_turn = turn
        proposal.status = "applied" if changed else "rejected"
        if not changed:
            proposal.rationale += " (no-op: values already at target)"
        self.save()
        return changed

    def rollback(self, proposal_id: str) -> bool:
        proposal = self.get(proposal_id)
        if proposal is None or proposal.status != "applied":
            return False
        for key, value in proposal.before.items():
            if key in PARAM_BOUNDS and isinstance(value, (int, float)):
                self.params[key] = float(value)
        proposal.status = "rolled_back"
        self.save()
        return True

    def auto_apply(self, *, turn: int, consecutive_failures: int) -> list[tuple[Proposal, str]]:
        """Apply at most one gated tuning proposal per call."""
        applied: list[tuple[Proposal, str]] = []
        for proposal in list(self.open_proposals()):
            allowed, reason = self.gate(proposal, turn=turn, consecutive_failures=consecutive_failures)
            if allowed:
                self.apply(proposal, turn=turn)
                applied.append((proposal, reason))
                break
            if proposal.kind == "tune" and reason.startswith(("unknown", "outside")):
                proposal.status = "rejected"
                proposal.rationale += f" [rejected: {reason}]"
        self.save()
        return applied

    # ------------------------------------------------------------------ stats
    def report(self) -> dict[str, Any]:
        counts: dict[str, int] = {}
        for proposal in self.proposals:
            counts[proposal.status] = counts.get(proposal.status, 0) + 1
        return {
            "params": dict(self.params),
            "proposals": counts,
            "open": [p.id for p in self.open_proposals()],
            "last_applied": max((p.applied_turn for p in self.proposals if p.status == "applied"), default=0),
        }

    def to_markdown(self) -> str:
        lines = ["## Tunable parameters", "", "| parameter | value | bounds |", "|-----------|-------|--------|"]
        for name, value in sorted(self.params.items()):
            low, high, _ = PARAM_BOUNDS[name]
            lines.append(f"| `{name}` | {value:g} | {low:g} – {high:g} |")
        lines += ["", "## Recent proposals", "", "| id | kind | status | title |", "|----|------|--------|-------|"]
        for proposal in self.proposals[-15:]:
            lines.append(f"| `{proposal.id}` | {proposal.kind} | {proposal.status} | {proposal.title} |")
        return "\n".join(lines) + "\n"

    def to_json(self) -> str:
        return json.dumps(self.report(), indent=2)
