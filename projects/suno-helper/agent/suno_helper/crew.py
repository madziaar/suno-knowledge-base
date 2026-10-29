"""Agent crew: role roster, isolated-context delegation, adversarial review.

Origins
-------
The division/roster idea comes from the "Team Pyrite" material supplied by the
owner: a commander delegating to specialists (security, infrastructure, data,
prediction, memory, scheduling, creative, code, comms, audio, visual). That
topology is genuinely useful, so it is implemented here as an engineering crew.

Two things from that material are *deliberately not* implemented, because they
contradict the repository's own rules (see ``cli-skillset/AGENTS.md``) and the
local-first privacy promise:

* the NSFW roleplay voice — irrelevant to shipping code and unsafe to put in a
  public repository;
* "safety protocols are suggestions", "never refuse", "act first, ask
  forgiveness never", "transparency is optional", covert data extraction.

What replaces them: every agent is **read-scoped to the repo**, every action is
**logged in the ledger**, destructive work is **refused outright**
(:class:`RefusedTask`), and any recommendation must carry **evidence**. Autonomy
inside those rails is genuinely high — the loop runs hundreds of turns without a
human in it — but the rails are what make that safe to leave on a cron.

What *is* adopted, and is the real prize: anticipatory execution (propose the
next subgoal before it is needed) and healthy disagreement (adversarial review
between a builder and a skeptic, mediated by evidence rather than vibes).
"""

from __future__ import annotations

import hashlib
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass, field
from typing import Iterable, Sequence

from .providers import Provider
from .skills import SkillRegistry

# Task text that an agent is never allowed to act on, regardless of provider.
FORBIDDEN_MARKERS = (
    "rm -rf /",
    "git push --force",
    "git reset --hard",
    "drop table",
    "curl | sh",
    "chmod 777",
    "disable audit",
    "exfiltrate",
    "steal",
    "bypass authentication",
    "scrape suno.com",
)


class RefusedTask(RuntimeError):
    """Raised when a task violates the crew's hard rails."""


@dataclass(frozen=True)
class AgentRole:
    """A specialist with a narrow mission and explicit guardrails."""

    id: str
    title: str
    division: str
    mission: str
    style: str
    tools: tuple[str, ...] = ()
    skills: tuple[str, ...] = ()
    guardrails: tuple[str, ...] = ()
    max_context_chars: int = 6000

    def brief(self) -> str:
        guard = "; ".join(self.guardrails) if self.guardrails else "read-scoped to the repo"
        return (
            f"ROLE: {self.title} ({self.division})\n"
            f"MISSION: {self.mission}\n"
            f"STYLE: {self.style}\n"
            f"TOOLS: {', '.join(self.tools) or 'none'}\n"
            f"GUARDRAILS: {guard}"
        )


# --------------------------------------------------------------------------- #
# Roster. Names are short, human, and describe the job (no persona required).
# --------------------------------------------------------------------------- #
ROSTER: dict[str, AgentRole] = {
    "architect": AgentRole(
        id="architect",
        title="Architect",
        division="Automation & Operations",
        mission="Turn a subgoal into the smallest ordered set of file-level changes.",
        style="terse, order-of-operations obsessed, refuses scope creep",
        tools=("read_file", "md_audit"),
        skills=("ultraplan",),
        guardrails=("no code edits", "must name the files it plans to touch"),
    ),
    "scout": AgentRole(
        id="scout",
        title="Scout",
        division="Data & Intelligence",
        mission="Answer one research question from primary sources and cite them.",
        style="citation-first, says 'unknown' when the source is missing",
        tools=("research_digest",),
        skills=("ultraresearch",),
        guardrails=("primary sources before community posts", "never invent a URL"),
    ),
    "forge": AgentRole(
        id="forge",
        title="Forge",
        division="Automation & Operations",
        mission="Write the implementation and keep it typed, tested and small.",
        style="pragmatic, test alongside the change",
        tools=("write_file", "extension_check"),
        skills=("ultrawork", "local-first-extension"),
        guardrails=("no new dependency without a stated reason", "tests for every pure function"),
    ),
    "sentinel": AgentRole(
        id="sentinel",
        title="Sentinel",
        division="Security & Infrastructure",
        mission="Attack the plan: find privacy leaks, permission bloat and unverified claims.",
        style="paranoid, concrete, cites the offending line",
        tools=("md_audit", "json_validate"),
        skills=("verify-before-done",),
        guardrails=("must name a concrete risk, not a vibe", "prefers removing a permission to adding one"),
    ),
    "verifier": AgentRole(
        id="verifier",
        title="Verifier",
        division="Security & Infrastructure",
        mission="Prove the acceptance gates actually pass, with command output as evidence.",
        style="binary pass/fail, no partial credit",
        tools=("limits_audit", "extension_check", "skills_lint"),
        skills=("verify-before-done",),
        guardrails=("evidence or it did not happen", "never marks done on a warning"),
    ),
    "chronicler": AgentRole(
        id="chronicler",
        title="Chronicler",
        division="Data & Intelligence",
        mission="Keep goal, subgoals, ledger and docs coherent across hundreds of turns.",
        style="records decisions and their reasons",
        tools=("write_report", "doc_sync"),
        skills=("goal-subgoal-loop",),
        guardrails=("append, never rewrite history",),
    ),
    "tuner": AgentRole(
        id="tuner",
        title="Tuner",
        division="Infrastructure",
        mission="Find wasted work in the loop: slow tools, repeated research, starving subgoals.",
        style="looks at timings and counts, not opinions",
        tools=("improve_report",),
        skills=("self-improvement-recursive",),
        guardrails=("one variable per cycle",),
    ),
    "curator": AgentRole(
        id="curator",
        title="Curator",
        division="Data & Intelligence",
        mission="Keep the prompt/skill corpus deduplicated, tagged and findable.",
        style="taxonomy-minded",
        tools=("skills_lint",),
        skills=("find-skills",),
        guardrails=("no duplicate skill names",),
    ),
    "scribe": AgentRole(
        id="scribe",
        title="Scribe",
        division="Communication",
        mission="Write the changelog, README section or release note a human will read.",
        style="plain language, no marketing adjectives",
        tools=("write_report",),
        skills=("writing-skills",),
        guardrails=("no claims without a linked artifact",),
    ),
}


def role(role_id: str) -> AgentRole:
    try:
        return ROSTER[role_id]
    except KeyError as exc:
        raise KeyError(f"unknown agent role: {role_id} (known: {', '.join(sorted(ROSTER))})") from exc


@dataclass
class Task:
    """A single delegation: one role, one objective, isolated context."""

    agent: str
    objective: str
    subgoal_id: str = ""
    deliverables: list[str] = field(default_factory=list)
    constraints: list[str] = field(default_factory=list)
    acceptance: list[str] = field(default_factory=list)
    context: str = ""
    skills: list[str] = field(default_factory=list)
    task_id: str = ""

    def __post_init__(self) -> None:
        if not self.task_id:
            digest = hashlib.sha256(f"{self.agent}:{self.objective}:{self.subgoal_id}".encode()).hexdigest()[:10]
            self.task_id = f"{self.agent}-{digest}"

    def render(self, role_obj: AgentRole, skill_texts: Sequence[str] = ()) -> str:
        lines = [
            role_obj.brief(),
            "",
            f"TASK: DELEGATE",
            f"SUBGOAL: {self.objective}",
            "DELIVERABLES:",
            *(f"- {item}" for item in (self.deliverables or ["a short, evidence-backed answer"])),
            "CONSTRAINTS:",
            *(f"- {item}" for item in self.constraints),
            "GATES:",
            *(f"- {item}" for item in self.acceptance),
        ]
        if self.context:
            budget = role_obj.max_context_chars
            excerpt = self.context[:budget]
            lines += ["", "CONTEXT:", excerpt]
        if skill_texts:
            lines += ["", "SKILLS:"]
            for text in skill_texts:
                lines.append(text[:2500])
        lines += [
            "",
            "Respond with one JSON object containing: summary, findings[], evidence[], "
            "recommendations[], risks[], confidence (0-1).",
        ]
        return "\n".join(lines)


@dataclass
class AgentResult:
    """Normalised output of a delegation."""

    task_id: str
    agent: str
    ok: bool
    summary: str = ""
    findings: list[str] = field(default_factory=list)
    evidence: list[str] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)
    risks: list[str] = field(default_factory=list)
    confidence: float = 0.0
    duration_ms: int = 0
    provider: str = "heuristic"
    raw: str = ""
    error: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    @property
    def actionable(self) -> bool:
        return self.ok and bool(self.recommendations or self.evidence)


@dataclass
class Debate:
    """Adversarial review: two roles argue, a third decides on evidence."""

    motion: str
    positions: list[AgentResult] = field(default_factory=list)
    decision: str = "pending"
    rationale: str = ""
    accepted: list[str] = field(default_factory=list)
    rejected: list[str] = field(default_factory=list)


class Crew:
    """Dispatches tasks to the roster."

    Every delegation builds a *fresh* prompt from curated context. Session
    history is never forwarded, which keeps subagents focused and keeps the
    coordinator's context free for planning.
    """

    def __init__(
        self,
        provider: Provider,
        skills: SkillRegistry,
        *,
        max_workers: int = 4,
        enable_remote: bool = False,
    ) -> None:
        self.provider = provider
        self.skills = skills
        self.max_workers = max(1, int(max_workers))
        self.enable_remote = enable_remote
        self.history: list[AgentResult] = []

    # ------------------------------------------------------------------ guard
    def check(self, task: Task) -> None:
        haystack = " ".join([task.objective, *task.constraints, *task.deliverables, task.context]).lower()
        for marker in FORBIDDEN_MARKERS:
            if marker in haystack:
                raise RefusedTask(f"task {task.task_id} contains forbidden instruction: {marker!r}")

    # --------------------------------------------------------------- planning
    def plan(self, subgoal: dict, *, stages: Iterable[str] = ()) -> list[Task]:
        """Choose a small set of specialists for one subgoal."""
        title = str(subgoal.get("title", ""))
        description = str(subgoal.get("description", ""))
        gates = [str(gate) for gate in subgoal.get("acceptance", [])]
        stage_set = {stage.lower() for stage in stages}
        tasks: list[Task] = []
        if "ultraresearch" in stage_set or subgoal.get("research"):
            tasks.append(
                Task(
                    agent="scout",
                    objective=f"Research the open questions for: {title}",
                    deliverables=["answer per question", "source list with dates", "what is still unknown"],
                    acceptance=gates,
                    context=description,
                )
            )
        tasks.append(
            Task(
                agent="architect",
                objective=f"Plan the smallest change that satisfies: {title}",
                deliverables=["ordered steps", "files to touch", "risks"],
                acceptance=gates,
                context=description,
            )
        )
        tasks.append(
            Task(
                agent="forge",
                objective=f"Implement or validate: {title}",
                deliverables=["what changed or was validated", "how it was checked"],
                acceptance=gates,
                context=description,
            )
        )
        tasks.append(
            Task(
                agent="sentinel",
                objective=f"Red-team the approach for: {title}",
                deliverables=["concrete risks", "privacy/permission concerns"],
                acceptance=gates,
                context=description,
            )
        )
        for task in tasks:
            self.check(task)
        return tasks

    # --------------------------------------------------------------- dispatch
    def dispatch(self, task: Task, *, skill_limit: int = 2) -> AgentResult:
        role_obj = role(task.agent)
        skill_texts: list[str] = []
        wanted = list(task.skills) or list(role_obj.skills)
        for name in wanted[:skill_limit]:
            skill = self.skills.get(name)
            if skill is None:
                hits = self.skills.find(name, limit=1)
                skill = hits[0][1] if hits else None
            if skill is not None:
                skill_texts.append(skill.load_text())
                if skill.name not in task.skills:
                    task.skills.append(skill.name)
        prompt = task.render(role_obj, skill_texts)
        started = time.perf_counter()
        completion = self.provider.complete(prompt, system="You are a focused engineering subagent.", json_mode=True)
        payload = completion.as_json()
        if isinstance(payload, list):
            payload = {"findings": payload}
        if not isinstance(payload, dict):
            payload = {"summary": completion.text.strip()[:600]}
        result = AgentResult(
            task_id=task.task_id,
            agent=task.agent,
            ok=bool(completion.ok),
            summary=str(payload.get("summary", "") or "")[:1200],
            findings=_as_list(payload.get("findings")),
            evidence=_as_list(payload.get("evidence")),
            recommendations=_as_list(payload.get("recommendations")),
            risks=_as_list(payload.get("risks")),
            confidence=_as_float(payload.get("confidence")),
            duration_ms=int((time.perf_counter() - started) * 1000),
            provider=completion.provider,
            raw=completion.text[:2000],
            error=completion.error,
        )
        self.history.append(result)
        return result

    def dispatch_many(self, tasks: Sequence[Task], *, parallel: bool = True) -> list[AgentResult]:
        """Run independent tasks concurrently (one agent per problem domain)."""
        if not tasks:
            return []
        if not parallel or len(tasks) == 1:
            return [self.dispatch(task) for task in tasks]
        results: list[AgentResult] = []
        with ThreadPoolExecutor(max_workers=min(self.max_workers, len(tasks))) as pool:
            futures = {pool.submit(self.dispatch, task): task for task in tasks}
            for future in as_completed(futures):
                task = futures[future]
                try:
                    results.append(future.result())
                except Exception as exc:  # never kill the loop for one agent
                    results.append(
                        AgentResult(
                            task_id=task.task_id,
                            agent=task.agent,
                            ok=False,
                            error=f"{type(exc).__name__}: {exc}",
                        )
                    )
        results.sort(key=lambda res: res.task_id)
        return results

    # ------------------------------------------------------------------ debate
    def debate(self, motion: str, *, builder: str = "forge", skeptic: str = "sentinel", context: str = "") -> Debate:
        """Have a builder and a skeptic argue; decide on evidence, not rhetoric."""
        support = self.dispatch(
            Task(
                agent=builder,
                objective=f"Argue FOR: {motion}",
                deliverables=["strongest case", "evidence"],
                context=context,
            )
        )
        oppose = self.dispatch(
            Task(
                agent=skeptic,
                objective=f"Argue AGAINST: {motion}",
                deliverables=["concrete failure modes", "evidence"],
                context=context,
            )
        )
        debate = Debate(motion=motion, positions=[support, oppose])
        evidence = set(support.evidence) | set(oppose.evidence)
        supported = bool(support.evidence) and not oppose.risks
        if supported and support.confidence >= oppose.confidence:
            debate.decision = "accept"
            debate.rationale = "builder carried the evidence and the skeptic named no concrete risk"
        elif oppose.risks:
            debate.decision = "revise"
            debate.rationale = "skeptic named concrete risk(s): " + "; ".join(oppose.risks[:3])
        else:
            debate.decision = "hold"
            debate.rationale = "neither side produced verifiable evidence"
        debate.accepted = support.recommendations[:3]
        debate.rejected = oppose.risks[:3]
        debate.rationale += f" (evidence items: {len(evidence)})"
        return debate

    # ------------------------------------------------------------- anticipate
    def anticipate(self, subgoals: Sequence[dict], *, limit: int = 2) -> list[str]:
        """Propose what the loop will need next (anticipatory, not autonomous).

        These are *proposals* appended to the goal notes; the loop only promotes
        them to real subgoals through :meth:`~suno_helper.selfimprove.Improver`.
        """
        open_items = [item for item in subgoals if item.get("status") in {"pending", "active", "blocked"}]
        proposals: list[str] = []
        for item in open_items[:limit]:
            stages = set(item.get("stages", []))
            if "ultraresearch" in stages:
                proposals.append(f"Pre-fetch sources for '{item.get('title')}' before it becomes blocking")
            if item.get("failures", 0) >= 2:
                proposals.append(f"Split '{item.get('title')}' — {item.get('failures')} failed attempts")
        return proposals

    # ------------------------------------------------------------------ stats
    def stats(self) -> dict:
        total = len(self.history)
        ok = sum(1 for result in self.history if result.ok)
        by_agent: dict[str, int] = {}
        for result in self.history:
            by_agent[result.agent] = by_agent.get(result.agent, 0) + 1
        return {
            "delegations": total,
            "success_rate": round(ok / total, 3) if total else 0.0,
            "by_agent": by_agent,
        }

    def roster_markdown(self) -> str:
        lines = ["| Agent | Division | Mission | Guardrails |", "|-------|----------|---------|------------|"]
        for item in sorted(ROSTER.values(), key=lambda r: (r.division, r.id)):
            lines.append(
                f"| `{item.id}` | {item.division} | {item.mission} | {'; '.join(item.guardrails) or '—'} |"
            )
        return "\n".join(lines) + "\n"

    def to_json(self) -> str:
        return json.dumps({key: value.brief() for key, value in sorted(ROSTER.items())}, indent=2)


def _as_list(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value if str(item).strip()][:12]
    if isinstance(value, str):
        text = value.strip()
        return [text] if text else []
    return [str(value)]


def _as_float(value: object) -> float:
    try:
        return max(0.0, min(1.0, float(value)))  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return 0.0
