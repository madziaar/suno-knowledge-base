"""Append-only turn ledger.

Every turn writes exactly one JSON line. The ledger is the audit trail that
makes a 500+ turn run inspectable: which subgoal was chosen, which skills were
loaded, what tool ran, whether verification passed, and how long it took.

Design notes
------------
* Append-only, one JSON object per line, ``fsync`` on write (cheap: ~500 lines).
* Rotation keeps the active file under ``max_bytes`` (default 4 MB) so a long
  cron history never balloons the git diff.
* :meth:`Ledger.digest` produces a compact, token-budgeted summary that the loop
  feeds back to itself instead of the raw history.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable

from .fsutil import read_json

REQUIRED_KEYS = ("turn", "ts", "phase", "outcome")


def _now() -> float:
    return round(time.time(), 3)


@dataclass
class Entry:
    """One turn's record."""

    turn: int
    phase: str
    outcome: str
    ts: float = field(default_factory=_now)
    subgoal_id: str = ""
    subgoal_title: str = ""
    skills: list[str] = field(default_factory=list)
    action: str = ""
    tool: str = ""
    ok: bool = True
    evidence: str = ""
    notes: str = ""
    duration_ms: int = 0
    metrics: dict[str, float] = field(default_factory=dict)
    goal_version: int = 0
    goal_progress: float = 0.0
    provider: str = "heuristic"
    delegations: int = 0
    research: int = 0
    proposals: int = 0

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class Ledger:
    """Reads and writes ``.suno-helper/ledger.jsonl``."""

    def __init__(self, root: Path, *, max_bytes: int = 4 * 1024 * 1024) -> None:
        self.root = Path(root)
        self.dir = self.root / ".suno-helper"
        self.dir.mkdir(parents=True, exist_ok=True)
        self.path = self.dir / "ledger.jsonl"
        self.max_bytes = max_bytes
        self._cache: list[dict[str, Any]] | None = None

    # ------------------------------------------------------------------ write
    def append(self, entry: Entry | dict[str, Any]) -> None:
        payload = entry.to_dict() if isinstance(entry, Entry) else dict(entry)
        for key in REQUIRED_KEYS:
            if key not in payload:
                raise ValueError(f"ledger entry missing required key: {key}")
        payload.setdefault("ts", _now())
        line = json.dumps(payload, ensure_ascii=False, sort_keys=False)
        self._rotate_if_needed(len(line) + 1)
        with open(self.path, "a", encoding="utf-8", newline="\n") as handle:
            handle.write(line + "\n")
            handle.flush()
            os.fsync(handle.fileno())
        self._cache = None

    def _rotate_if_needed(self, incoming: int) -> None:
        if not self.path.exists():
            return
        size = self.path.stat().st_size
        if size + incoming <= self.max_bytes:
            return
        archive_dir = self.dir / "ledger-archive"
        archive_dir.mkdir(parents=True, exist_ok=True)
        index = len(list(archive_dir.glob("ledger-*.jsonl"))) + 1
        self.path.replace(archive_dir / f"ledger-{index:04d}.jsonl")

    # ------------------------------------------------------------------- read
    def entries(self, *, refresh: bool = False) -> list[dict[str, Any]]:
        if self._cache is not None and not refresh:
            return self._cache
        rows: list[dict[str, Any]] = []
        for path in sorted(self._all_paths()):
            rows.extend(self._read_file(path))
        rows.sort(key=lambda row: (row.get("turn", 0), row.get("ts", 0)))
        self._cache = rows
        return rows

    def _all_paths(self) -> list[Path]:
        paths = [self.path] if self.path.exists() else []
        archive = self.dir / "ledger-archive"
        if archive.exists():
            paths.extend(sorted(archive.glob("ledger-*.jsonl")))
        return paths

    @staticmethod
    def _read_file(path: Path) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        try:
            with open(path, "r", encoding="utf-8") as handle:
                for line in handle:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        rows.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
        except OSError:
            pass
        return rows

    def last_turn(self) -> int:
        rows = self.entries()
        return int(rows[-1].get("turn", 0)) if rows else 0

    def tail(self, n: int = 10) -> list[dict[str, Any]]:
        rows = self.entries()
        return rows[-n:] if n > 0 else []

    # ------------------------------------------------------------------ stats
    def stats(self, window: int = 50) -> dict[str, Any]:
        rows = self.entries()
        recent = rows[-window:] if window > 0 else rows
        if not recent:
            return {
                "turns": 0,
                "success_rate": 0.0,
                "avg_ms": 0.0,
                "tools": {},
                "skills": {},
                "outcomes": {},
                "subgoals": {},
            }
        ok = sum(1 for row in recent if row.get("ok"))
        tools: dict[str, int] = {}
        skills: dict[str, int] = {}
        outcomes: dict[str, int] = {}
        subgoals: dict[str, int] = {}
        for row in recent:
            tool = row.get("tool") or ""
            if tool:
                tools[tool] = tools.get(tool, 0) + 1
            for skill in row.get("skills", []) or []:
                skills[skill] = skills.get(skill, 0) + 1
            outcome = row.get("outcome", "")
            outcomes[outcome] = outcomes.get(outcome, 0) + 1
            sid = row.get("subgoal_id") or ""
            if sid:
                subgoals[sid] = subgoals.get(sid, 0) + 1
        durations = [float(row.get("duration_ms", 0) or 0) for row in recent]
        return {
            "turns": len(recent),
            "success_rate": round(ok / len(recent), 4),
            "avg_ms": round(sum(durations) / len(durations), 2),
            "tools": tools,
            "skills": skills,
            "outcomes": outcomes,
            "subgoals": subgoals,
        }

    def streak(self, pattern: str = "fail") -> int:
        """Length of the current trailing streak of matching outcomes."""
        count = 0
        for row in reversed(self.entries()):
            if row.get("outcome") == pattern or (pattern == "fail" and not row.get("ok")):
                count += 1
            else:
                break
        return count

    def digest(self, turns: int = 12, max_chars: int = 2400) -> str:
        """Compact human/agent readable summary of the most recent turns."""
        rows = self.tail(turns)
        if not rows:
            return "(ledger empty)"
        stats = self.stats()
        lines = [
            f"turns={stats['turns']} success={stats['success_rate']:.0%} "
            f"avg={stats['avg_ms']:.0f}ms top_tools={_top(stats['tools'])} "
            f"top_skills={_top(stats['skills'])}",
            "recent:",
        ]
        for row in rows:
            line = (
                f"  #{row.get('turn')} {row.get('phase')}/{row.get('outcome')} "
                f"sg={row.get('subgoal_id') or '-'} tool={row.get('tool') or '-'} "
                f"{'OK' if row.get('ok') else 'FAIL'}"
            )
            notes = (row.get("notes") or "").strip()
            if notes:
                line += f" :: {notes[:120]}"
            lines.append(line)
        text = "\n".join(lines)
        if len(text) > max_chars:
            text = text[: max_chars - 20] + "\n  …(truncated)"
        return text

    # ----------------------------------------------------------------- verify
    def verify(self) -> dict[str, Any]:
        """Check ledger integrity: parseable lines, monotonic turns, required keys.

        Reads the raw append order rather than the sorted view, so a turn that
        went backwards is actually caught.
        """
        problems: list[str] = []
        rows: list[dict[str, Any]] = []
        for path in self._all_paths():
            rows.extend(self._read_file(path))
        last_turn = -1
        for index, row in enumerate(rows):
            for key in REQUIRED_KEYS:
                if key not in row:
                    problems.append(f"line {index + 1}: missing {key}")
            turn = int(row.get("turn", -1))
            if turn < last_turn:
                problems.append(f"line {index + 1}: turn went backwards ({turn} < {last_turn})")
            last_turn = turn
        return {
            "ok": not problems,
            "entries": len(rows),
            "turns": last_turn,
            "problems": problems[:20],
        }

    # ---------------------------------------------------------------- summary
    def summary_markdown(self, *, limit: int = 20) -> str:
        rows = self.tail(limit)
        stats = self.stats()
        out = [
            "# Loop ledger summary",
            "",
            f"- Turns recorded: **{stats['turns']}** (window)",
            f"- Success rate: **{stats['success_rate']:.0%}**",
            f"- Average cycle: **{stats['avg_ms']:.0f} ms**",
            f"- Tools: {_top(stats['tools']) or '—'}",
            f"- Skills: {_top(stats['skills'], 5) or '—'}",
            "",
            "| turn | phase | outcome | subgoal | tool | ok |",
            "|------|-------|---------|---------|------|----|",
        ]
        for row in rows:
            out.append(
                "| {turn} | {phase} | {outcome} | {sg} | {tool} | {ok} |".format(
                    turn=row.get("turn", ""),
                    phase=row.get("phase", ""),
                    outcome=row.get("outcome", ""),
                    sg=row.get("subgoal_id", "") or "—",
                    tool=row.get("tool", "") or "—",
                    ok="✅" if row.get("ok") else "❌",
                )
            )
        return "\n".join(out) + "\n"

    def export_jsonl(self, path: Path) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            for row in self.entries():
                handle.write(json.dumps(row, ensure_ascii=False) + "\n")
        return path

    def meta(self) -> dict[str, Any]:
        return read_json(self.dir / "meta.json", {}) or {}


def _top(mapping: dict[str, int], n: int = 3) -> str:
    if not mapping:
        return ""
    top = sorted(mapping.items(), key=lambda kv: (-kv[1], kv[0]))[:n]
    return ",".join(f"{key}:{value}" for key, value in top)


def summarize_rows(rows: Iterable[dict[str, Any]]) -> dict[str, Any]:
    """Aggregate arbitrary ledger rows (used by the CLI exporter)."""
    rows = list(rows)
    if not rows:
        return {"turns": 0}
    return {
        "turns": len(rows),
        "first_turn": rows[0].get("turn"),
        "last_turn": rows[-1].get("turn"),
        "ok": sum(1 for row in rows if row.get("ok")),
        "failed": sum(1 for row in rows if not row.get("ok")),
    }
