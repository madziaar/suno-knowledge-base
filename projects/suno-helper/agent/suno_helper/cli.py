"""Command line interface for the Suno Helper agent loop.

    python -m suno_helper status
    python -m suno_helper loop --turns 25 --every 60
    python -m suno_helper loop --turns 500 --quiet        # soak test
    python -m suno_helper skill find "clean up a style prompt"
    python -m suno_helper crew delegate sentinel "audit permissions"
    python -m suno_helper research run
    python -m suno_helper improve report
    python -m suno_helper doctor
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Sequence

from .crew import ROSTER, Crew, Task
from .engine import Engine, write_goal_files
from .fsutil import maybe_lock
from .ledger import Ledger
from .providers import build_provider
from .research import ResearchDesk, Source
from .selfimprove import Improver
from .skills import SkillRegistry
from .state import StateStore


def project_root(explicit: str | None = None) -> Path:
    """Locate the repository root (the parent of ``projects/suno-helper``)."""
    if explicit:
        return Path(explicit).resolve()
    env = os.environ.get("SUNO_HELPER_ROOT")
    if env:
        return Path(env).resolve()
    here = Path(__file__).resolve()
    # .../projects/suno-helper/agent/suno_helper/cli.py -> repo root
    candidate = here.parents[4] if len(here.parents) > 4 else here.parents[-1]
    if (candidate / "projects" / "suno-helper" / "agent").exists():
        return candidate
    for parent in [Path.cwd(), *Path.cwd().parents]:
        if (parent / "projects" / "suno-helper" / "agent").exists():
            return parent
    return Path.cwd().resolve()


def project_dir(root: Path) -> Path:
    """The deliverable directory inside the repository."""
    candidate = Path(root) / "projects" / "suno-helper"
    return candidate if candidate.exists() else Path(root)


def build_engine(args: argparse.Namespace) -> Engine:
    root = project_root(getattr(args, "root", None))
    provider = build_provider(getattr(args, "provider", None))
    engine = Engine(
        root,
        project_dir=project_dir(root) if (root / "projects" / "suno-helper").exists() else root,
        provider=provider,
        allow_network=bool(getattr(args, "allow_network", False)),
        parallel=not bool(getattr(args, "sequential", False)),
        run_checks=not bool(getattr(args, "no_checks", False)),
        seed=getattr(args, "seed", None),
        auto_improve=not bool(getattr(args, "no_improve", False)),
    )
    return engine


# --------------------------------------------------------------------------- #
# command handlers
# --------------------------------------------------------------------------- #
def cmd_status(args: argparse.Namespace) -> int:
    engine = build_engine(args)
    data = engine.status()
    if args.json:
        print(json.dumps(data, indent=2))
        return 0
    goal = data["goal"]
    pct = 100 * (goal["current"] / goal["target"] if goal["target"] else 0)
    print(f"goal: {goal['title']}")
    print(f"progress: {goal['current']:.1f}/{goal['target']:.0f} ({pct:.0f}%) status={goal['status']} v{goal['version']}")
    counts = data["ledger"].get("outcomes", {})
    print(f"turn: {engine.state.turn} · ledger turns={data['ledger'].get('turns', 0)} outcomes={counts}")
    print(f"subgoals: {len(data['subgoals'])} · skills: {data['skills']} · sources: {data['research']['sources']}")
    print(f"params: {data['improver']['params']}")
    print("")
    print(f"{'id':40} {'status':9} {'pri':>3} {'try':>4} {'fail':>5}  title")
    for row in sorted(data["subgoals"], key=lambda r: (-r["priority"], r["id"])):
        print(f"{row['id'][:40]:40} {row['status']:9} {row['priority']:>3} {row['attempts']:>4} {row['failures']:>5}  {row['title'][:50]}")
    return 0


def cmd_loop(args: argparse.Namespace) -> int:
    engine = build_engine(args)
    engine.bootstrap()
    root = engine.root
    lock_path = root / ".suno-helper" / "loop.lock"
    with maybe_lock(lock_path, enabled=not args.no_lock) as acquired:
        if not acquired:
            print("another loop is running (lock present); exiting", file=sys.stderr)
            return 3
        results = []
        deadline = time.time() + args.max_runtime if args.max_runtime > 0 else None
        try:
            for index in range(args.turns):
                result = engine.cycle()
                results.append(result)
                if not args.quiet:
                    line = (
                        f"[{result.turn:04d}] {result.phase:8} {result.outcome:9} "
                        f"sg={result.subgoal_id or '-':34} tool={result.tool or '-':16} "
                        f"{'ok' if result.ok else 'FAIL'} {result.duration_ms:>5}ms"
                    )
                    print(line)
                    if result.notes and args.verbose:
                        print(f"        {result.notes}")
                if index == 0 or (index + 1) % max(1, args.report_every) == 0:
                    engine.write_goal_files()
                if args.until_complete and engine.state.goal.current >= engine.state.goal.target:
                    print("goal reached; stopping early (--until-complete)", file=sys.stderr)
                    break
                if deadline and time.time() > deadline:
                    print("max runtime reached; stopping", file=sys.stderr)
                    break
                if args.every and index < args.turns - 1:
                    time.sleep(max(0.0, args.every))
        except KeyboardInterrupt:
            print("\ninterrupted; state saved up to the last completed turn", file=sys.stderr)
        finally:
            engine.write_goal_files()
            engine.state.save(snapshot=True)
    ok = sum(1 for r in results if r.ok)
    print(
        f"\nloop finished: {len(results)} turn(s), {ok} ok, {len(results) - ok} failed, "
        f"goal {engine.state.goal.current:.1f}/{engine.state.goal.target:.0f}"
    )
    return 0 if results and ok else (0 if not results else 1)


def cmd_cycle(args: argparse.Namespace) -> int:
    args.turns = 1
    return cmd_loop(args)


def cmd_goal(args: argparse.Namespace) -> int:
    state = StateStore(project_root(args.root)).load()
    if args.action == "show":
        print(json.dumps(state.goal.to_dict(), indent=2) if args.json else _render_goal(state))
        return 0
    if args.action == "set":
        values = {}
        for item in args.fields or []:
            if "=" not in item:
                print(f"expected key=value, got {item!r}", file=sys.stderr)
                return 2
            key, _, value = item.partition("=")
            if key in {"target", "current"}:
                values[key] = float(value)
            else:
                values[key] = value
        state.set_goal(**values)
        state.save(snapshot=True)
        print(f"goal updated (v{state.goal.version})")
        return 0
    if args.action == "note":
        state.note(args.text or "")
        state.save()
        print("note added")
        return 0
    if args.action == "history":
        directory = project_root(args.root) / ".suno-helper" / "goal-history"
        files = sorted(directory.glob("*.json")) if directory.exists() else []
        for path in files[-args.limit :]:
            print(path.name)
        return 0
    if args.action == "next":
        sub = state.select_next(seed=args.seed)
        print(sub.id if sub else "(nothing open)")
        return 0
    print("unknown goal action", file=sys.stderr)
    return 2


def cmd_subgoal(args: argparse.Namespace) -> int:
    root = project_root(args.root)
    state = StateStore(root).load()
    if args.action == "list":
        if args.json:
            print(json.dumps([s.to_dict() for s in state.subgoals], indent=2))
        else:
            for sub in sorted(state.subgoals, key=lambda s: (-s.priority, s.id)):
                print(f"{sub.status:9} {sub.priority} {sub.weight:>4g} {sub.id:44} {sub.title}")
        return 0
    if args.action == "add":
        sub = state.add_subgoal(
            args.title,
            description=args.description or "",
            priority=args.priority,
            weight=args.weight,
            stages=args.stages or [],
            skill_hints=args.skills or [],
            action={"tool": args.tool, "args": {}} if args.tool else None,
            acceptance=[{"tool": args.tool, "expect": "pass"}] if args.tool else [],
        )
        state.save(snapshot=True)
        print(f"added {sub.id}")
        return 0
    if args.action in {"done", "drop", "block"}:
        status = {"done": "done", "drop": "dropped", "block": "blocked"}[args.action]
        target = state.resolve(args.target)
        target.mark(status, reason=args.reason or f"set by cli at turn {state.turn}")
        state.recompute_progress()
        state.save(snapshot=True)
        print(f"{target.id} -> {status}")
        return 0
    if args.action == "update":
        target = state.resolve(args.target)
        fields = {}
        for item in args.fields or []:
            key, _, value = item.partition("=")
            fields[key] = float(value) if key in {"priority", "weight"} else value
        state.update_subgoal(target.id, **fields)
        state.save()
        print(f"{target.id} updated")
        return 0
    print("unknown subgoal action", file=sys.stderr)
    return 2


def cmd_skill(args: argparse.Namespace) -> int:
    registry = SkillRegistry(project_root(args.root)).discover()
    if args.action == "list":
        for skill in sorted(registry.skills.values(), key=lambda s: s.name):
            print(f"{skill.name:32} {','.join(skill.stages) or '-':22} {skill.description[:60]}")
        print(f"\n{len(registry)} skills")
        return 0
    if args.action == "find":
        for score, skill, reasons in registry.find(args.query, stage=args.stage, limit=args.limit):
            print(f"{score:5.2f}  {skill.name:32} {skill.path}")
            print(f"       {skill.description[:110]}")
            print(f"       why: {', '.join(reasons)}")
        return 0
    if args.action == "show":
        skill = registry.get(args.query) or (registry.find(args.query, limit=1) or [(0, None, [])])[0][1]
        if skill is None:
            print("not found", file=sys.stderr)
            return 1
        print(skill.load_text())
        return 0
    if args.action == "lint":
        report = registry.lint()
        print(json.dumps(report, indent=2))
        return 0 if report["ok"] else 1
    if args.action == "index":
        path = registry.write_index(project_dir(project_root(args.root)) / "skills" / "INDEX.json")
        print(f"indexed {len(registry)} skills -> {path}")
        return 0
    print("unknown skill action", file=sys.stderr)
    return 2


def cmd_crew(args: argparse.Namespace) -> int:
    registry = SkillRegistry(project_root(args.root)).discover()
    crew = Crew(build_provider(args.provider), registry)
    if args.action == "list":
        print(crew.roster_markdown())
        return 0
    if args.action == "delegate":
        result = crew.dispatch(
            Task(
                agent=args.agent,
                objective=args.objective,
                deliverables=args.deliverable or [],
                constraints=args.constraint or [],
            )
        )
        print(json.dumps(result.to_dict(), indent=2))
        return 0 if result.ok else 1
    if args.action == "debate":
        debate = crew.debate(args.objective)
        print(f"motion: {debate.motion}\ndecision: {debate.decision}\nrationale: {debate.rationale}")
        for position in debate.positions:
            print(f"\n[{position.agent}] {position.summary or position.error}")
            for risk in position.risks:
                print(f"  risk: {risk}")
        return 0
    print("unknown crew action", file=sys.stderr)
    return 2


def cmd_research(args: argparse.Namespace) -> int:
    root = project_root(args.root)
    desk = ResearchDesk(root, allow_network=args.allow_network)
    if args.action == "run":
        report = desk.run(build_provider(args.provider), turn=-1)
        print(json.dumps(report, indent=2))
        return 0
    if args.action == "ask":
        item = desk.ask(args.query, subgoal_id=args.subgoal or "", priority=args.priority)
        desk.save()
        print(item.id)
        return 0
    if args.action == "sources":
        for source in sorted(desk.sources.values(), key=lambda s: (-s.trust, s.id)):
            print(f"{source.trust:.2f} {source.kind:9} {source.retrieved_at[:10]} {source.id:36} {source.title[:50]}")
        print(f"\n{len(desk.sources)} sources, {len(desk.open_questions(999))} open questions")
        return 0
    if args.action == "add":
        desk.add_source(
            Source(
                id=args.id,
                title=args.title,
                url=args.url,
                kind=args.kind,
                trust=args.trust,
                notes=args.notes or "",
            )
        )
        desk.save()
        print(f"added source {args.id}")
        return 0
    if args.action == "digest":
        print(desk.render_index())
        return 0
    print("unknown research action", file=sys.stderr)
    return 2


def cmd_improve(args: argparse.Namespace) -> int:
    root = project_root(args.root)
    ledger = Ledger(root)
    improver = Improver(root, ledger, provider=build_provider(args.provider))
    if args.action == "report":
        print(json.dumps(improver.report(), indent=2) if args.json else improver.to_markdown())
        return 0
    if args.action == "reflect":
        proposals = improver.reflect(
            turn=ledger.last_turn(),
            state_summary={"open": []},
            recent_failures=0,
            consecutive_failures=ledger.streak("fail"),
        )
        print(f"{len(proposals)} proposal(s)")
        for proposal in proposals:
            print(f"  {proposal.id}: {proposal.title}")
        return 0
    if args.action == "apply":
        proposal = improver.get(args.proposal_id)
        if proposal is None:
            print("unknown proposal", file=sys.stderr)
            return 1
        allowed, reason = improver.gate(proposal, turn=ledger.last_turn(), consecutive_failures=99)
        if not allowed:
            print(f"gate refused: {reason}", file=sys.stderr)
            return 1
        improver.apply(proposal, turn=ledger.last_turn())
        print(f"applied {proposal.id}: {proposal.before} -> {proposal.after}")
        return 0
    if args.action == "rollback":
        ok = improver.rollback(args.proposal_id)
        print("rolled back" if ok else "nothing to roll back", file=sys.stderr if not ok else sys.stdout)
        return 0 if ok else 1
    print("unknown improve action", file=sys.stderr)
    return 2


def cmd_doctor(args: argparse.Namespace) -> int:
    root = project_root(args.root)
    checks: list[tuple[str, bool, str]] = []
    project = project_dir(root)
    checks.append(("project root", (project / "agent" / "suno_helper").exists(), str(project)))
    state = StateStore(root).load()
    checks.append(("goal state", state.goal is not None, f"{len(state.subgoals)} subgoals"))
    ledger = Ledger(root)
    integrity = ledger.verify()
    checks.append(("ledger integrity", bool(integrity["ok"]), f"{integrity['entries']} entries"))
    registry = SkillRegistry(root).discover()
    lint = registry.lint()
    checks.append(("skills", len(registry) > 0, f"{len(registry)} skills, lint {'ok' if lint['ok'] else 'issues'}"))
    desk = ResearchDesk(root)
    checks.append(("research corpus", len(desk.sources) > 0, f"{len(desk.sources)} sources"))
    limits = root / "docs" / "suno-limits.json"
    checks.append(("canonical limits", limits.exists(), str(limits)))
    ext = project / "extension" / "package.json"
    checks.append(("extension manifest", ext.exists(), str(ext)))
    provider = build_provider(args.provider)
    completion = provider.complete("TASK: PLAN\nSUBGOAL: doctor\n")
    checks.append((f"provider ({completion.provider})", completion.ok, (completion.error or "ok")[:60]))
    width = max(len(name) for name, _, _ in checks)
    failed = 0
    for name, ok, detail in checks:
        print(f"{'✅' if ok else '❌'} {name:<{width}}  {detail}")
        failed += 0 if ok else 1
    print(f"\n{len(checks) - failed}/{len(checks)} checks passed")
    return 0 if failed == 0 else 1


def cmd_export(args: argparse.Namespace) -> int:
    root = project_root(args.root)
    state = StateStore(root).load()
    payload = state.export_bundle()
    payload["ledger"] = Ledger(root).entries()
    text = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.out:
        Path(args.out).write_text(text + "\n", encoding="utf-8")
        print(f"wrote {args.out}")
    else:
        print(text)
    return 0


def cmd_selftest(args: argparse.Namespace) -> int:
    import unittest

    root = project_dir(project_root(args.root))
    sys.path.insert(0, str(root / "agent"))
    suite = unittest.defaultTestLoader.discover(str(root / "agent" / "tests"), top_level_dir=str(root / "agent"))
    runner = unittest.TextTestRunner(verbosity=2 if args.verbose else 1)
    result = runner.run(suite)
    return 0 if result.wasSuccessful() else 1


# --------------------------------------------------------------------------- #
# argparse plumbing
# --------------------------------------------------------------------------- #
def add_common(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--root", help="path to projects/suno-helper (default: auto-detect)")
    parser.add_argument("--provider", help="heuristic | ollama | openai | anthropic | echo")
    parser.add_argument("--allow-network", action="store_true", help="enable read-only GitHub research fetches")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="suno-helper",
        description="Autonomous, local-first Suno Helper loop (goal + subgoals, every turn).",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    status = sub.add_parser("status", help="show goal, subgoals and loop health")
    add_common(status)
    status.add_argument("--json", action="store_true")
    status.set_defaults(func=cmd_status)

    loop = sub.add_parser("loop", help="run the autonomous loop")
    add_common(loop)
    loop.add_argument("--turns", type=int, default=10, help="number of cycles (0 = forever)")
    loop.add_argument("--every", type=float, default=0.0, help="seconds between cycles")
    loop.add_argument("--max-runtime", type=float, default=0.0, help="hard stop after N seconds (0 = off)")
    loop.add_argument("--until-complete", action="store_true")
    loop.add_argument("--report-every", type=int, default=25)
    loop.add_argument("--quiet", action="store_true")
    loop.add_argument("--verbose", action="store_true")
    loop.add_argument("--no-lock", action="store_true")
    loop.add_argument("--no-improve", action="store_true")
    loop.add_argument("--no-checks", action="store_true", help="skip npm typecheck/tests")
    loop.add_argument("--sequential", action="store_true", help="disable parallel agent dispatch")
    loop.add_argument("--seed", type=int, default=None)
    loop.set_defaults(func=cmd_loop)

    cycle = sub.add_parser("cycle", help="run exactly one turn")
    add_common(cycle)
    cycle.add_argument("--verbose", action="store_true")
    cycle.add_argument("--quiet", action="store_true")
    cycle.add_argument("--report-every", type=int, default=1)
    cycle.add_argument("--no-improve", action="store_true")
    cycle.add_argument("--no-lock", action="store_true")
    cycle.add_argument("--no-checks", action="store_true")
    cycle.add_argument("--sequential", action="store_true")
    cycle.add_argument("--seed", type=int, default=None)
    cycle.add_argument("--until-complete", action="store_true")
    cycle.add_argument("--every", type=float, default=0.0)
    cycle.add_argument("--max-runtime", type=float, default=0.0)
    cycle.set_defaults(func=cmd_cycle)

    goal = sub.add_parser("goal", help="/goal operations")
    add_common(goal)
    goal.add_argument("action", choices=["show", "set", "note", "history", "next"])
    goal.add_argument("fields", nargs="*", help="key=value pairs for set")
    goal.add_argument("--text", help="note text")
    goal.add_argument("--limit", type=int, default=10)
    goal.add_argument("--json", action="store_true")
    goal.add_argument("--seed", type=int, default=None)
    goal.set_defaults(func=cmd_goal)

    subgoal = sub.add_parser("subgoal", help="/subgoals operations")
    add_common(subgoal)
    subgoal.add_argument("action", choices=["list", "add", "update", "done", "drop", "block"])
    subgoal.add_argument("target", nargs="?", help="subgoal id or title prefix")
    subgoal.add_argument("fields", nargs="*", help="for add: title; for update: key=value")
    subgoal.add_argument("--description")
    subgoal.add_argument("--priority", type=int, default=3)
    subgoal.add_argument("--weight", type=float, default=1.0)
    subgoal.add_argument("--stages", nargs="*")
    subgoal.add_argument("--skills", nargs="*")
    subgoal.add_argument("--tool")
    subgoal.add_argument("--reason")
    subgoal.add_argument("--json", action="store_true")
    subgoal.set_defaults(func=cmd_subgoal)

    skill = sub.add_parser("skill", help="find and inspect skills")
    add_common(skill)
    skill.add_argument("action", choices=["list", "find", "show", "lint", "index"])
    skill.add_argument("query", nargs="?", default="")
    skill.add_argument("--stage")
    skill.add_argument("--limit", type=int, default=5)
    skill.set_defaults(func=cmd_skill)

    crew = sub.add_parser("crew", help="delegate to the agent roster")
    add_common(crew)
    crew.add_argument("action", choices=["list", "delegate", "debate"])
    crew.add_argument("agent", nargs="?", default="architect")
    crew.add_argument("objective", nargs="?", default="")
    crew.add_argument("--deliverable", action="append")
    crew.add_argument("--constraint", action="append")
    crew.set_defaults(func=cmd_crew)

    research = sub.add_parser("research", help="research desk")
    add_common(research)
    research.add_argument("action", choices=["run", "ask", "sources", "add", "digest"])
    research.add_argument("query", nargs="?", default="")
    research.add_argument("--subgoal")
    research.add_argument("--priority", type=int, default=3)
    research.add_argument("--id")
    research.add_argument("--title")
    research.add_argument("--url")
    research.add_argument("--kind", default="primary")
    research.add_argument("--trust", type=float, default=0.8)
    research.add_argument("--notes")
    research.set_defaults(func=cmd_research)

    improve = sub.add_parser("improve", help="self-improvement ledger")
    add_common(improve)
    improve.add_argument("action", choices=["report", "reflect", "apply", "rollback"])
    improve.add_argument("proposal_id", nargs="?", default="")
    improve.add_argument("--json", action="store_true")
    improve.set_defaults(func=cmd_improve)

    doctor = sub.add_parser("doctor", help="environment and state checks")
    add_common(doctor)
    doctor.set_defaults(func=cmd_doctor)

    export = sub.add_parser("export", help="dump goal + subgoals + ledger as JSON")
    add_common(export)
    export.add_argument("--out")
    export.set_defaults(func=cmd_export)

    selftest = sub.add_parser("selftest", help="run the agent test suite")
    add_common(selftest)
    selftest.add_argument("--verbose", action="store_true")
    selftest.set_defaults(func=cmd_selftest)

    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args) or 0)


def _render_goal(state: StateStore) -> str:
    from .engine import render_goal_markdown

    return render_goal_markdown(state)


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
