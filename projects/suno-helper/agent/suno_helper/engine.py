"""The `/loop` engine: one cycle = skills → research → delegate → act → verify → improve.

Turn anatomy (all steps are recorded in the ledger):

    1. LOAD      read goal.json / subgoals.json / params / ledger
    2. SKILLS    find the process skill for the current stage (local retrieval)
    3. SELECT    pick the next subgoal (priority + staleness + recovery)
    4. RESEARCH  triage open questions every `research_every` turns
    5. DELEGATE  dispatch a small agent crew with isolated context
    6. ACT       run the subgoal's deterministic tool
    7. VERIFY    run every acceptance gate; nothing is "done" without evidence
    8. IMPROVE   reflect, propose, gate, occasionally apply + roll back
    9. PERSIST   update /goal and /subgoals, snapshot, append the ledger line

The engine is import-safe, dependency-free, and deterministic under the default
heuristic provider, which is what makes a 500-turn soak test meaningful.
"""

from __future__ import annotations

import random
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable, Sequence

from .crew import Crew, RefusedTask
from .fsutil import atomic_write_text
from .ledger import Entry, Ledger
from .providers import Provider, build_provider
from .research import ResearchDesk
from .selfimprove import Improver
from .skills import SkillRegistry
from .state import StateStore, Subgoal
from .tools import ToolBox, ToolResult

STAGE_ORDER = ("ultraplan", "ultraresearch", "ultrawork", "verify", "reflect", "improve")
STAGE_SKILLS = {
    "ultraplan": ("using-superpowers", "ultraplan"),
    "ultraresearch": ("ultraresearch", "find-skills"),
    "ultrawork": ("ultrawork", "local-first-extension"),
    "verify": ("verify-before-done",),
    "reflect": ("goal-subgoal-loop",),
    "improve": ("self-improvement-recursive",),
}


@dataclass
class CycleResult:
    """What happened in one turn."""

    turn: int
    phase: str
    outcome: str
    ok: bool
    subgoal_id: str = ""
    subgoal_title: str = ""
    skills: list[str] = field(default_factory=list)
    tool: str = ""
    evidence: str = ""
    notes: str = ""
    duration_ms: int = 0
    delegations: int = 0
    research: int = 0
    proposals: int = 0
    goal_progress: float = 0.0

    def to_entry(self, *, goal_version: int, provider: str) -> Entry:
        return Entry(
            turn=self.turn,
            phase=self.phase,
            outcome=self.outcome,
            subgoal_id=self.subgoal_id,
            subgoal_title=self.subgoal_title,
            skills=list(self.skills),
            tool=self.tool,
            ok=self.ok,
            evidence=self.evidence[:600],
            notes=self.notes[:400],
            duration_ms=self.duration_ms,
            goal_version=goal_version,
            goal_progress=self.goal_progress,
            provider=provider,
            delegations=self.delegations,
            research=self.research,
            proposals=self.proposals,
        )


class Engine:
    """Drives the goal/subgoal loop."""

    def __init__(
        self,
        root: Path,
        *,
        project_dir: Path | None = None,
        provider: Provider | None = None,
        allow_network: bool = False,
        parallel: bool = True,
        run_checks: bool = True,
        seed: int | None = None,
        auto_improve: bool = True,
    ) -> None:
        self.root = Path(root).resolve()
        # `root` is the repository root; `project` is where the deliverables live.
        # Keeping both explicit means tools can scan "docs/" and
        # "projects/suno-helper/docs" with the same relative paths in tests, CI
        # and a real cron run.
        self.project = Path(project_dir).resolve() if project_dir else self.root / "projects" / "suno-helper"
        self.provider = provider or build_provider()
        self.allow_network = allow_network
        self.parallel = parallel
        self.run_checks = run_checks
        self.seed = seed
        self.auto_improve = auto_improve

        self.state = StateStore(self.root).load()
        self.ledger = Ledger(self.root)
        self.skills = SkillRegistry(self.root).discover()
        self.crew = Crew(self.provider, self.skills)
        self.research = ResearchDesk(self.root, allow_network=allow_network)
        self.improver = Improver(self.root, self.ledger, provider=self.provider)
        self.tools = ToolBox(self.root, extension_dir=str(self._rel(self.project / "extension")), run_checks=run_checks)

        self._turn = self.state.turn or self.ledger.last_turn()

    def _rel(self, path: Path) -> str:
        try:
            return str(path.relative_to(self.root))
        except ValueError:
            return str(path)

    # ------------------------------------------------------------- bootstrap
    def bootstrap(self) -> StateStore:
        """Seed goal, subgoals, research questions and the source corpus."""
        if not self.state.goal.notes and self.state.turn == 0:
            self.state.seed_default()
        if not self.state.subgoals:
            self.state.seed_default()
        for sub in self.state.subgoals:
            for gate in sub.acceptance:
                question = gate.get("research")
                if question:
                    self.research.ask(question, subgoal_id=sub.id, priority=sub.priority, turn=self._turn)
        self.research.save()
        self.state.save(snapshot=True)
        return self.state

    # ------------------------------------------------------------------ cycle
    def cycle(self) -> CycleResult:
        started = time.perf_counter()
        self._turn += 1
        turn = self._turn
        self.state.turn = turn
        state = self.state
        state.recompute_progress()

        # 1. SELECT ---------------------------------------------------------
        sub = state.select_next(turn=turn, seed=self.seed)
        if sub is None:
            return self._idle_cycle(turn, started)

        stage = self._stage_for(sub, turn)
        skills = self._find_skills(sub, stage)
        notes: list[str] = [f"stage={stage}"]

        # 2. RESEARCH -------------------------------------------------------
        research_count = 0
        if self._should_research(turn, sub):
            report = self.research.run(self.provider, subgoal_id=sub.id, turn=turn)
            research_count = int(report.get("answered", 0))
            if report.get("asked"):
                notes.append(f"research: {report['answered']}/{report['asked']} answered")

        # 3. DELEGATE -------------------------------------------------------
        delegations = 0
        crew_notes: list[str] = []
        if self._should_delegate(turn) and stage in {"ultraplan", "ultraresearch", "ultrawork", "verify"}:
            try:
                tasks = self.crew.plan(
                    {"title": sub.title, "description": sub.description, "acceptance": sub.acceptance},
                    stages=[stage],
                )
                results = self.crew.dispatch_many(tasks, parallel=self.parallel)
                delegations = len(results)
                for res in results:
                    if res.risks:
                        crew_notes.append(f"{res.agent}: risk={res.risks[0][:80]}")
                    elif res.summary:
                        crew_notes.append(f"{res.agent}: {res.summary[:80]}")
            except RefusedTask as exc:
                crew_notes.append(f"refused: {exc}")
        if crew_notes:
            notes.append("; ".join(crew_notes[:3]))

        # 4. ACT ------------------------------------------------------------
        tool_name = ""
        result = ToolResult(ok=True, summary="no action declared")
        action = sub.action or {}
        if action.get("tool") and action["tool"] != "noop":
            tool_name = str(action["tool"])
            args = dict(action.get("args") or {})
            result = self.tools.call(tool_name, **args)

        # 5. VERIFY ---------------------------------------------------------
        gates = self._run_gates(sub)
        gates_ok = all(passed for _name, (passed, _detail) in gates)
        ok = bool(result.ok and gates_ok)
        evidence = "; ".join(
            [f"{tool_name or 'action'}: {result.summary}"]
            + [f"gate {name}: {'pass' if passed else 'fail'} {detail}".strip() for name, (passed, detail) in gates]
        )

        # 6. RECORD ---------------------------------------------------------
        state.record_attempt(sub.id, ok=ok, evidence=evidence[:500], artifact=(result.artifacts or [""])[0])
        if ok and self._all_gates_passed(sub):
            state.complete(sub.id, evidence=f"turn {turn}: {evidence[:240]}")
            outcome, phase = "done", "verify"
        elif ok:
            sub.mark("active")
            outcome, phase = "progress", "work"
        else:
            if sub.failures >= StateStore.RETRY_LIMIT:
                # Out of attempts. Stop burning turns and leave a written
                # question instead — that is escalation, not another retry.
                sub.mark("blocked", reason=f"{sub.failures} failures — escalated for a human decision")
                self.research.ask(
                    f"Subgoal '{sub.title}' failed {sub.failures}x and cannot be split further: {evidence[:200]}",
                    subgoal_id=sub.id,
                    priority=5,
                    turn=turn,
                )
                # An escalation that is not persisted is just a log line: the
                # question has to survive into the next run, otherwise a cron
                # loop re-asks the same thing forever.
                self.research.save()
                self.state.note(f"escalated {sub.id} after {sub.failures} failures")
            elif sub.failures >= 2 and sub.split_depth == 0:
                # Two failures means the unit is wrong, not the attempt.
                self._split_stuck(sub, turn)
            outcome, phase = "fail", "work"
        self.state.note(f"{sub.id}: {outcome} ({result.summary[:120]})")

        # 7. IMPROVE --------------------------------------------------------
        proposals = self._improve(turn, sub, ok)

        # 8. PERSIST --------------------------------------------------------
        self._ensure_backlog(turn)
        state.recompute_progress()
        state.save(snapshot=True)

        duration_ms = int((time.perf_counter() - started) * 1000)
        result_obj = CycleResult(
            turn=turn,
            phase=phase,
            outcome=outcome,
            ok=ok,
            subgoal_id=sub.id,
            subgoal_title=sub.title,
            skills=skills,
            tool=tool_name,
            evidence=evidence[:600],
            notes=" | ".join(notes)[:400],
            duration_ms=duration_ms,
            delegations=delegations,
            research=research_count,
            proposals=proposals,
            goal_progress=state.goal.current,
        )
        self.ledger.append(result_obj.to_entry(goal_version=state.goal.version, provider=self.provider.name))
        return result_obj

    # ------------------------------------------------------------------- run
    def run(self, turns: int = 25, *, stop_when_complete: bool = False, on_cycle=None) -> list[CycleResult]:
        results: list[CycleResult] = []
        for _ in range(max(0, turns)):
            result = self.cycle()
            results.append(result)
            if on_cycle is not None:
                on_cycle(result)
            if stop_when_complete and self.state.goal.current >= self.state.goal.target:
                break
        return results

    # -------------------------------------------------------------- internals
    def _stage_for(self, sub: Subgoal, turn: int) -> str:
        stages = [s for s in sub.stages if s in STAGE_ORDER]
        if not stages:
            stages = ["ultrawork", "verify"]
        if sub.attempts == 0:
            return stages[0]
        return stages[min(len(stages) - 1, 1 + (sub.attempts % max(1, len(stages) - 1)))]

    def _find_skills(self, sub: Subgoal, stage: str) -> list[str]:
        """'Use skills to find skills': explicit hints first, then local retrieval."""
        found: list[str] = []
        for name in sub.skill_hints:
            skill = self.skills.get(name)
            if skill is not None:
                found.append(skill.name)
        for query in (sub.title, stage, f"{stage} {sub.title}"):
            for _score, skill, _reasons in self.skills.find(query, stage=stage, limit=2):
                if skill.name not in found:
                    found.append(skill.name)
        for name in STAGE_SKILLS.get(stage, ()):
            if name not in found and self.skills.get(name) is not None:
                found.append(name)
        return found[:6]

    def _should_research(self, turn: int, sub: Subgoal) -> bool:
        every = int(self.improver.params.get("research_every", 3))
        if "ultraresearch" in sub.stages and sub.attempts == 0:
            return True
        budget = float(self.improver.params.get("research_budget", 0.5))
        rng = random.Random((self.seed or 0) + turn)
        return turn % max(1, every) == 0 and rng.random() < max(0.0, min(1.0, budget + 0.4))

    def _should_delegate(self, turn: int) -> bool:
        every = int(self.improver.params.get("delegate_every", 2))
        return turn % max(1, every) == 0

    def _run_gates(self, sub: Subgoal) -> list[tuple[str, tuple[bool, str]]]:
        results: list[tuple[str, tuple[bool, str]]] = []
        for gate in sub.acceptance:
            tool = gate.get("tool")
            expect = str(gate.get("expect", "pass"))
            if not tool:
                results.append((str(gate.get("check", "manual")), (True, "declarative gate")))
                continue
            outcome = self.tools.call(str(tool), **(gate.get("args") or {}))
            passed = outcome.ok if expect == "pass" else (not outcome.ok)
            # A gate that could not run must not read like one that ran and
            # passed. It still counts as a pass for scheduling (a machine with no
            # node_modules is a supported configuration), but the ledger says so.
            detail = outcome.summary[:160]
            if outcome.skipped:
                detail = f"[skipped] {detail}"
            results.append((str(tool), (passed, detail)))
        return results

    def _all_gates_passed(self, sub: Subgoal) -> bool:
        # `_run_gates` yields (name, (passed, detail)) — unpacking it as
        # `for passed, _ in ...` silently iterated the *names* and made every
        # gate look green. That is how a subgoal was once marked done while the
        # ledger line right above it said "gate ...: fail".
        return all(passed for _name, (passed, _detail) in self._run_gates(sub))

    def _split_stuck(self, sub: Subgoal, turn: int) -> list[str]:
        """Break a repeatedly failing subgoal into two verifiable children."""
        state = self.state
        sub.split_depth += 1
        child_a = state.add_subgoal(
            f"{sub.title}: isolate the failing evidence",
            description="Narrow audit sub-step created automatically after repeated failure.",
            priority=min(5, sub.priority + 1),
            weight=max(0.5, sub.weight / 3),
            stages=["verify"],
            skill_hints=["verify-before-done"],
            action=_isolation_action(sub),
            acceptance=[_isolation_gate(sub)],
        )
        child_a.split_depth = sub.split_depth
        child_b = state.add_subgoal(
            f"{sub.title}: apply the smallest fix",
            description="Implementation sub-step created automatically after repeated failure.",
            priority=min(5, sub.priority + 1),
            weight=max(0.5, sub.weight / 3),
            stages=["ultrawork", "verify"],
            skill_hints=["ultrawork"],
            action={"tool": "json_validate", "args": {}},
            acceptance=[{"tool": "json_validate", "expect": "pass"}],
            depends_on=[child_a.id],
        )
        child_b.split_depth = sub.split_depth
        sub.depends_on = sorted(set(sub.depends_on) | {child_a.id, child_b.id})
        sub.mark("blocked", reason=f"split into {child_a.id}, {child_b.id} after {sub.failures} failures")
        state.note(f"turn {turn}: split {sub.id} -> {child_a.id}, {child_b.id}")
        return [child_a.id, child_b.id]

    def _improve(self, turn: int, sub: Subgoal, ok: bool) -> int:
        if not self.auto_improve:
            return 0
        reflect_every = int(self.improver.params.get("reflect_every", 5))
        streak = self.ledger.streak("fail")
        applied = 0
        if turn % max(1, reflect_every) == 0 or streak >= 2:
            stats = self.ledger.stats(window=40)
            recent_failures = sum(1 for item in self.state.subgoals if item.is_open() and item.failures >= 2)
            made = self.improver.reflect(
                turn=turn,
                state_summary={"open": [item.id for item in self.state.subgoals if item.is_open()]},
                recent_failures=recent_failures,
                consecutive_failures=streak,
            )
            for proposal, _reason in self.improver.auto_apply(turn=turn, consecutive_failures=streak):
                self.state.note(f"tuned: {proposal.title} {proposal.before} -> {proposal.after}")
                applied += 1
            scheduled = turn % max(1, reflect_every) == 0
            applied_structural = 0
            for proposal in made:
                if proposal.kind in {"split", "research", "prune", "promote"}:
                    # Structural changes are rate-limited too: one per scheduled
                    # reflection, never on an emergency (streak) reflection.
                    if scheduled and applied_structural == 0 and self._apply_structural(proposal, turn):
                        applied_structural += 1
                        applied += 1
        return applied

    def _apply_structural(self, proposal, turn: int) -> bool:
        """Turn a structural proposal into an actual plan change."""
        state = self.state
        if proposal.status != "pending":
            return False
        if proposal.kind == "split":
            worst = _worst_subgoal(state)
            if worst is None:
                proposal.status = "rejected"
                proposal.rationale += " [no failing subgoal to split]"
                return False
            child_a = state.add_subgoal(
                f"{worst.title}: isolate the failing evidence",
                description="Narrow audit sub-step created by the self-improvement loop.",
                priority=min(5, worst.priority + 1),
                weight=max(0.5, worst.weight / 3),
                stages=["verify"],
                skill_hints=["verify-before-done"],
                action=_isolation_action(worst),
                acceptance=[_isolation_gate(worst)],
            )
            child_b = state.add_subgoal(
                f"{worst.title}: apply the smallest fix",
                description="Implementation sub-step created by the self-improvement loop.",
                priority=min(5, worst.priority + 1),
                weight=max(0.5, worst.weight / 3),
                stages=["ultrawork", "verify"],
                skill_hints=["ultrawork"],
                action=_isolation_action(worst),
                acceptance=[_isolation_gate(worst)],
                depends_on=[child_a.id],
            )
            worst.depends_on = sorted(set(worst.depends_on) | {child_a.id, child_b.id})
            worst.split_depth = max(1, worst.split_depth)
            child_a.split_depth = worst.split_depth
            child_b.split_depth = worst.split_depth
            worst.status = "pending"
            worst.note = f"split at turn {turn}"
            proposal.status = "applied"
            proposal.applied_turn = turn
            proposal.after = {"children": [child_a.id, child_b.id]}
            self.state.note(f"split {worst.id} -> {child_a.id}, {child_b.id}")
            self.improver.save()
            return True
        if proposal.kind == "research":
            target = _most_researched(state) or _worst_subgoal(state)
            if target is None:
                proposal.status = "rejected"
                return False
            child = state.add_subgoal(
                f"{target.title}: research the open question",
                description="Research sub-step created by the self-improvement loop.",
                priority=min(5, target.priority + 1),
                weight=max(0.4, target.weight / 3),
                stages=["ultraresearch"],
                skill_hints=["ultraresearch"],
                action={"tool": "research_digest", "args": {}},
                acceptance=[{"tool": "research_digest", "expect": "pass"}],
            )
            target.depends_on = sorted(set(target.depends_on) | {child.id})
            proposal.status = "applied"
            proposal.applied_turn = turn
            proposal.after = {"child": child.id}
            self.state.note(f"added research step {child.id}")
            self.improver.save()
            return True
        if proposal.kind == "prune":
            candidates = [s for s in state.subgoals if s.status == "pending" and s.attempts == 0 and s.priority <= 2]
            if not candidates:
                proposal.status = "rejected"
                proposal.rationale += " [nothing safe to prune]"
                self.improver.save()
                return False
            victim = sorted(candidates, key=lambda s: (s.priority, s.weight, s.id))[0]
            victim.mark("dropped", reason=f"pruned at turn {turn}")
            proposal.status = "applied"
            proposal.applied_turn = turn
            proposal.after = {"dropped": victim.id}
            self.state.note(f"pruned {victim.id}")
            self.improver.save()
            return True
        if proposal.kind == "promote":
            blocked = [s for s in state.subgoals if s.status == "pending" and s.depends_on]
            if not blocked:
                proposal.status = "rejected"
                self.improver.save()
                return False
            for item in blocked:
                if all((state.get(dep) is not None and state.get(dep).status == "done") for dep in item.depends_on):
                    item.priority = min(5, item.priority + 1)
                    item.mark("pending")
            proposal.status = "applied"
            proposal.applied_turn = turn
            self.improver.save()
            return True
        return False

    #: Rotation run when the backlog is empty. Each entry is a real check with a
    #: real failure mode, so a "quiet" turn still produces evidence instead of a
    #: duplicate `idle` line. `extension_check` is last and skips tests because it
    #: is the only slow one.
    AUDIT_ROTATION: tuple[tuple[str, dict[str, Any]], ...] = (
        ("md_audit", {"paths": ["docs", "projects/suno-helper"]}),
        ("skills_lint", {}),
        ("limits_audit", {}),
        ("json_validate", {}),
        ("research_digest", {}),
        ("capability_docs", {}),
        ("extension_check", {"run_tests": False}),
        ("improve_report", {}),
        # Python tests are the slowest check here (~25 s) for the same reason the
        # extension rotation typechecks without running vitest: a 500-turn soak
        # must stay affordable. They run in full whenever a subgoal's acceptance
        # gate asks for them, and in the closing sweep.
        #
        # Not a silent skip: `agent_tests` either runs or the suite is missing,
        # and `doctor` reports the toolchain.
    )

    def _idle_cycle(self, turn: int, started: float) -> CycleResult:
        """Every subgoal is closed: extend the roadmap, else audit on a rotation.

        A loop that has nothing to build must still either find work or verify
        the work it claims. Spinning on "complete" hides regressions — the first
        long run spent six turns doing exactly that while nothing was checked.
        """
        added = self._next_wave(turn)
        if added:
            result = CycleResult(
                turn=turn,
                phase="plan",
                outcome="replan",
                ok=True,
                notes=f"all subgoals closed; queued wave with {len(added)} subgoal(s)",
                duration_ms=int((time.perf_counter() - started) * 1000),
                goal_progress=self.state.goal.current,
            )
        else:
            tool_name, args = self.AUDIT_ROTATION[turn % len(self.AUDIT_ROTATION)]
            outcome = self.tools.call(tool_name, **args)
            rotation = len(self.AUDIT_ROTATION)
            cycle_index = turn // rotation
            result = CycleResult(
                turn=turn,
                phase="audit",
                outcome="verified" if outcome.ok else "regression",
                ok=outcome.ok,
                tool=tool_name,
                evidence=f"audit {tool_name}: {outcome.summary}"[:400],
                notes=(
                    f"backlog empty; audit rotation {turn % rotation + 1}/{rotation} "
                    f"(pass {cycle_index})"
                    + ("" if outcome.ok else f"; FAILED: {outcome.summary[:120]}")
                ),
                duration_ms=int((time.perf_counter() - started) * 1000),
                goal_progress=self.state.goal.current,
            )
            if outcome.ok:
                # "Complete" means "nothing left to build and the last audit was
                # green" — not "we ran out of ideas".
                self.state.set_goal(status="complete")
            else:
                self.state.set_goal(status="active")
                self.state.note(f"audit regression at turn {turn}: {outcome.summary[:160]}")
            self.state.note(f"audit {tool_name}: {'ok' if outcome.ok else 'fail'}")
        self.state.turn = turn
        self.state.save(snapshot=True)
        self.ledger.append(result.to_entry(goal_version=self.state.goal.version, provider=self.provider.name))
        return result

    def _ensure_backlog(self, turn: int) -> None:
        """Keep the queue non-empty so a long run never idles prematurely."""
        open_items = [s for s in self.state.subgoals if s.is_open()]
        if len(open_items) <= 2:
            self._next_wave(turn)

    #: How many capability pages to claim per wave. Small enough that a wave is
    #: finished in a few turns, large enough that the queue is never starved.
    WAVE_BATCH = 2

    def _capability_wave(self, turn: int) -> list[Subgoal]:
        """Queue the next undocumented capabilities (idempotent, spec-derived).

        Unlike a hand-written wave list this cannot run out: it is driven by the
        capability registry, which is the project's real feature surface. It also
        cannot claim work that does not exist — the gate re-reads the source.
        """
        from .capabilities import CAPABILITIES, readiness

        feasible = set(readiness(self.project)["ready"])
        documented = set()
        docs_dir = self.project / "docs" / "tools"
        if docs_dir.exists():
            documented = {path.stem for path in docs_dir.glob("*.md")}
        queued = {sub.title for sub in self.state.subgoals}
        batch = 0
        added: list[Subgoal] = []
        for cap in CAPABILITIES:
            if batch >= self.WAVE_BATCH:
                break
            if cap.id in documented or cap.id not in feasible:
                continue
            title = f"Tool reference: {cap.title}"
            if title in queued:
                continue
            added.append(
                self.state.add_subgoal(
                    title=title,
                    description=f"Generate and verify the reference page for {cap.id} ({cap.phase}).",
                    priority=3 if cap.phase != "ops" else 2,
                    weight=0.6,
                    stages=["ultraplan", "ultrawork", "verify"],
                    skill_hints=["writing-skills", "verify-before-done"],
                    action={"tool": "capability_docs", "args": {"only": [cap.id]}},
                    acceptance=[
                        {"tool": "capability_docs", "expect": "pass", "args": {"only": [cap.id]}}
                    ],
                )
            )
            batch += 1
        if added:
            self.state.note(f"wave {turn}: capability docs for {', '.join(s.title for s in added)}")
        return added

    def _next_wave(self, turn: int) -> list[Subgoal]:
        """Extend the roadmap with the next unqueued phase (idempotent)."""
        capability_wave = self._capability_wave(turn)
        if capability_wave:
            return capability_wave
        waves: list[list[dict[str, Any]]] = [
            [
                {
                    "title": "Batch link parser and CSV export",
                    "description": "Paste public Suno links, extract metadata, export CSV/JSON client-side.",
                    "priority": 4,
                    "weight": 1.5,
                    "stages": ["ultraplan", "ultrawork", "verify"],
                    "skill_hints": ["local-first-extension", "ultrawork"],
                    "action": {"tool": "extension_check", "args": {}},
                    "acceptance": [{"tool": "extension_check", "expect": "pass"}],
                },
                {
                    "title": "Repeatable prompt tester log",
                    "description": "One-variable experiment log with hypothesis, evidence and decision per run.",
                    "priority": 3,
                    "weight": 1.0,
                    "stages": ["ultraplan", "ultrawork"],
                    "skill_hints": ["suno-prompt-engineering"],
                    "action": {"tool": "md_audit", "args": {"paths": ["projects/suno-helper/docs"]}},
                    "acceptance": [{"tool": "md_audit", "expect": "pass"}],
                },
            ],
            [
                {
                    "title": "Creator field guide",
                    "description": "Explain the five pillars, limit table and experiment workflow for new users.",
                    "priority": 3,
                    "weight": 1.0,
                    "stages": ["ultrawork", "verify"],
                    "skill_hints": ["suno-prompt-engineering", "writing-skills"],
                    "action": {"tool": "md_audit", "args": {"paths": ["projects/suno-helper/docs"]}},
                    "acceptance": [{"tool": "md_audit", "expect": "pass"}],
                },
                {
                    "title": "Loop observability report",
                    "description": "Keep docs/loop-report.md generated from the ledger every wave.",
                    "priority": 2,
                    "weight": 0.8,
                    "stages": ["reflect", "improve"],
                    "skill_hints": ["self-improvement-recursive"],
                    "action": {"tool": "improve_report", "args": {}},
                    "acceptance": [{"tool": "improve_report", "expect": "pass"}],
                },
            ],
            [
                {
                    "title": "Prompt library search",
                    "description": "Client-side fuzzy search over saved prompts with keyboard navigation.",
                    "priority": 2,
                    "weight": 0.8,
                    "stages": ["ultraplan", "ultrawork"],
                    "skill_hints": ["local-first-extension"],
                    "action": {"tool": "extension_check", "args": {}},
                    "acceptance": [{"tool": "extension_check", "expect": "pass"}],
                },
                {
                    "title": "Local model hand-off",
                    "description": "Document an optional Ollama hand-off so prompts can be drafted offline.",
                    "priority": 2,
                    "weight": 0.8,
                    "stages": ["ultraresearch", "ultrawork"],
                    "skill_hints": ["local-first-extension", "ultraresearch"],
                    "action": {"tool": "research_digest", "args": {}},
                    "acceptance": [{"tool": "research_digest", "expect": "pass"}],
                },
            ],
        ]
        existing = {s.title for s in self.state.subgoals}
        for wave in waves:
            pending = [spec for spec in wave if spec["title"] not in existing]
            if pending:
                added = [self.state.add_subgoal(**spec) for spec in pending]
                self.state.note(f"wave {turn}: queued {', '.join(s.id for s in added)}")
                return added
        return []

    # ------------------------------------------------------------------ views
    def status(self) -> dict[str, Any]:
        return {
            "goal": self.state.goal.to_dict(),
            "subgoals": self.state.progress_table(),
            "ledger": self.ledger.stats(window=50),
            "improver": self.improver.report(),
            "skills": len(self.skills),
            "crew": self.crew.stats(),
            "research": {"sources": len(self.research.sources), "open": len(self.research.open_questions(50))},
        }

    def render_goal(self) -> str:
        return render_goal_markdown(self.state)

    def write_goal_files(self) -> None:
        write_goal_files(self.project, self.state)


# --------------------------------------------------------------------------- #
# Rendering: /goal and /subgoals are real files a human can read and edit.
# --------------------------------------------------------------------------- #
def render_goal_markdown(state: StateStore) -> str:
    goal = state.goal
    pct = goal.progress() * 100
    bar_len = 20
    filled = int(round(bar_len * goal.progress()))
    bar = "█" * filled + "░" * (bar_len - filled)
    lines = [
        f"# /goal — {goal.title}",
        "",
        f"> {goal.statement}",
        "",
        f"`{bar}` **{pct:.1f}%** of {goal.target:.0f} · status **{goal.status}** · v{goal.version} · turn {state.turn}",
        "",
        f"- **Metric:** {goal.metric}",
        f"- **Horizon:** {goal.horizon}",
        f"- **Updated:** {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime(goal.updated_at))}",
        "",
        "## Subgoals",
        "",
        "| # | id | status | pri | weight | tries | fails | title |",
        "|---|----|--------|-----|--------|-------|-------|-------|",
    ]
    for index, sub in enumerate(sorted(state.subgoals, key=lambda s: (-s.priority, s.id)), start=1):
        icon = {"done": "✅", "active": "🔄", "blocked": "⛔", "pending": "·", "dropped": "🗑"}.get(sub.status, "?")
        lines.append(
            f"| {index} | `{sub.id}` | {icon} {sub.status} | {sub.priority} | {sub.weight:g} | {sub.attempts} | {sub.failures} | {sub.title} |"
        )
    blocked = [s for s in state.subgoals if s.status == "blocked"]
    if blocked:
        lines += ["", "## Blocked", ""]
        for sub in blocked:
            unmet = state.blocked_by(sub)
            lines.append(f"- `{sub.id}` — {sub.note or 'no note'}" + (f" (waiting on {', '.join(unmet)})" if unmet else ""))
    if goal.notes:
        lines += ["", "## Recent goal notes", ""]
        lines += [f"- {note}" for note in goal.notes[-12:]]
    return "\n".join(lines) + "\n"


def write_goal_files(root: Path, state: StateStore) -> None:
    """Write the human-readable ``/goal`` and ``/subgoals`` views."""
    goal_dir = Path(root)
    atomic_write_text(goal_dir / "GOAL.md", render_goal_markdown(state))
    rows = ["# /subgoals", "", f"_turn {state.turn} · {len(state.subgoals)} subgoals_", ""]
    for sub in sorted(state.subgoals, key=lambda s: (-s.priority, s.id)):
        rows += [
            f"## `{sub.id}` — {sub.title}",
            "",
            f"- **status:** {sub.status} · **priority:** {sub.priority} · **weight:** {sub.weight:g}",
            f"- **attempts/failures:** {sub.attempts}/{sub.failures} · **last turn:** {sub.last_turn}",
        ]
        if sub.depends_on:
            rows.append(f"- **depends on:** {', '.join(sub.depends_on)}")
        if sub.description:
            rows.append(f"- **description:** {sub.description}")
        if sub.stages:
            rows.append(f"- **stages:** {' → '.join(sub.stages)}")
        if sub.action:
            rows.append(f"- **action:** `{sub.action.get('tool')}` {sub.action.get('args') or ''}".rstrip())
        if sub.acceptance:
            gates = ", ".join(str(gate.get("tool") or gate.get("check")) for gate in sub.acceptance)
            rows.append(f"- **gates:** {gates}")
        if sub.evidence:
            rows.append(f"- **last evidence:** {sub.evidence[-1][:300]}")
        if sub.artifacts:
            rows.append(f"- **artifacts:** {', '.join(sub.artifacts[:4])}")
        rows.append("")
    atomic_write_text(goal_dir / "SUBGOALS.md", "\n".join(rows))


def _worst_subgoal(state: StateStore) -> Subgoal | None:
    candidates = [s for s in state.subgoals if s.is_open() and s.failures > 0]
    if not candidates:
        candidates = [s for s in state.subgoals if s.is_open()]
    if not candidates:
        return None
    return sorted(candidates, key=lambda s: (-s.failures, s.priority, s.id))[0]


def _most_researched(state: StateStore) -> Subgoal | None:
    candidates = [s for s in state.subgoals if s.is_open() and "ultraresearch" in s.stages]
    return candidates[0] if candidates else None


def _isolation_action(sub: Subgoal) -> dict[str, Any]:
    """Mirror the parent's first gate so the child narrows the same claim.

    The old version always audited markdown, which is why a docs gate could
    "isolate" a failure in a TypeScript subgoal and never reproduce it.
    """
    for gate in sub.acceptance:
        tool = gate.get("tool")
        if tool:
            args = dict(gate.get("args") or {})
            paths = args.get("paths")
            if isinstance(paths, list) and len(paths) > 1:
                args["paths"] = paths[:1]
            return {"tool": tool, "args": args}
    return {"tool": "md_audit", "args": {"paths": ["projects/suno-helper/docs"]}}


def _isolation_gate(sub: Subgoal) -> dict[str, Any]:
    action = _isolation_action(sub)
    return {"tool": action["tool"], "expect": "pass", "args": action["args"]}
