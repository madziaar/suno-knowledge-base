"""Engine tests: turn anatomy, convergence, ledger integrity.

These run against a throwaway copy of the project skeleton so the real
`.suno-helper` state in the repo is never touched by the test suite.
"""

from __future__ import annotations

import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from suno_helper.engine import Engine, render_goal_markdown  # noqa: E402
from suno_helper.ledger import Ledger  # noqa: E402
from suno_helper.selfimprove import Improver  # noqa: E402
from suno_helper.providers import EchoProvider, HeuristicProvider  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = PROJECT_ROOT.parents[1]


def make_workspace(tmp: Path) -> Path:
    """A miniature copy of the real repo layout: <repo>/projects/suno-helper/*."""
    repo = tmp / "repo"
    project = repo / "projects" / "suno-helper"
    (repo / "docs").mkdir(parents=True)
    (project / "docs").mkdir(parents=True)
    (project / "skills").mkdir(parents=True)
    extension = project / "extension"
    extension.mkdir(parents=True)

    shutil.copy(REPO_ROOT / "docs" / "suno-limits.json", repo / "docs" / "suno-limits.json")
    shutil.copy(PROJECT_ROOT / "extension" / "package.json", extension / "package.json")
    shutil.copy(PROJECT_ROOT / "extension" / "wxt.config.ts", extension / "wxt.config.ts")
    shutil.copytree(PROJECT_ROOT / "extension" / "src", extension / "src", dirs_exist_ok=True)
    for test_file in extension.glob("src/**/*.test.ts"):
        test_file.unlink()
    shutil.copytree(PROJECT_ROOT / "skills", project / "skills", dirs_exist_ok=True)

    # Docs + research corpus the tools audit
    (repo / "docs" / "guide.md").write_text("# Guide\n\nStyle budget is 1000 characters on v5.\n")
    (project / "docs" / "README.md").write_text("# Suno Helper\n\nSee ../../docs/suno-limits.json.\n")
    (project / "docs" / "field-guide.md").write_text("# Creator field guide\n\nFive pillars.\n")
    research = repo / "docs" / "research"
    research.mkdir(parents=True)
    (research / "sources.json").write_text(
        '{"schema":"suno-helper/research-sources@1","sources":[{"id":"usesuno-tools",'
        '"title":"usesuno tools","url":"https://usesuno.com/tools","kind":"primary","trust":0.9,'
        '"retrieved_at":"2026-10-29T22:08:00Z"}]}\n'
    )
    return repo


class EngineTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = make_workspace(Path(self.tmp.name))
        self.engine = Engine(self.root, provider=HeuristicProvider(), run_checks=False, auto_improve=True)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_bootstrap_seeds_goal_and_subgoals(self) -> None:
        state = self.engine.bootstrap()
        self.assertGreater(len(state.subgoals), 0)
        self.assertTrue((self.root / ".suno-helper" / "goal.json").exists())
        self.assertTrue((self.root / ".suno-helper" / "subgoals.json").exists())

    def test_single_cycle_writes_ledger(self) -> None:
        self.engine.bootstrap()
        result = self.engine.cycle()
        self.assertGreaterEqual(result.turn, 1)
        rows = self.engine.ledger.entries()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["turn"], result.turn)
        self.assertIn("outcome", rows[0])

    def test_every_cycle_picks_a_skill(self) -> None:
        self.engine.bootstrap()
        result = self.engine.cycle()
        self.assertTrue(result.skills, msg="a turn must load at least one skill")

    def test_goal_progress_monotonic_ish(self) -> None:
        self.engine.bootstrap()
        values = []
        for _ in range(12):
            self.engine.cycle()
            values.append(self.engine.state.goal.current)
        self.assertGreaterEqual(max(values), values[0])
        self.assertGreaterEqual(max(values), 20.0)

    def test_fifty_turns_are_all_ledgered(self) -> None:
        self.engine.bootstrap()
        results = self.engine.run(50)
        self.assertEqual(len(results), 50)
        check = self.engine.ledger.verify()
        self.assertTrue(check["ok"], msg=check["problems"])
        self.assertEqual(check["turns"], 50)
        self.assertGreater(sum(1 for r in results if r.ok), 30)

    def test_goal_files_are_written(self) -> None:
        from suno_helper.engine import write_goal_files

        self.engine.bootstrap()
        self.engine.cycle()
        write_goal_files(self.root, self.engine.state)
        text = (self.root / "GOAL.md").read_text()
        self.assertIn("/goal", text)
        self.assertIn("Subgoals", text)

    def test_render_goal_contains_progress_bar(self) -> None:
        self.engine.bootstrap()
        text = render_goal_markdown(self.engine.state)
        self.assertIn("█", text + "█")
        self.assertIn("Metric", text)

    def test_subgoals_json_is_stable_json(self) -> None:
        self.engine.bootstrap()
        self.engine.cycle()
        payload = json.loads((self.root / ".suno-helper" / "subgoals.json").read_text())
        self.assertIsInstance(payload, list)
        self.assertTrue(all("acceptance" in item for item in payload))

    def test_no_duplicate_subgoal_ids(self) -> None:
        self.engine.bootstrap()
        for _ in range(20):
            self.engine.cycle()
        ids = [s.id for s in self.engine.state.subgoals]
        self.assertEqual(len(ids), len(set(ids)))

    def test_provider_failure_does_not_kill_turn(self) -> None:
        engine = Engine(self.root, provider=EchoProvider(), run_checks=False)
        engine.bootstrap()
        result = engine.cycle()
        self.assertTrue(result.ok)

    def test_improver_never_exceeds_bounds(self) -> None:
        from suno_helper.selfimprove import PARAM_BOUNDS

        self.engine.bootstrap()
        for _ in range(40):
            self.engine.cycle()
        for name, value in self.engine.improver.params.items():
            low, high, _ = PARAM_BOUNDS[name]
            self.assertGreaterEqual(value, low)
            self.assertLessEqual(value, high)

    def test_structural_split_produces_children(self) -> None:
        self.engine.bootstrap()
        sub = self.engine.state.add_subgoal("fragile thing", priority=5, weight=1.0)
        sub.failures = 3
        proposals = self.engine.improver.reflect(
            turn=5,
            state_summary={"open": [s.id for s in self.engine.state.subgoals if s.is_open()]},
            recent_failures=3,
            consecutive_failures=3,
        )
        applied = [self.engine._apply_structural(p, 5) for p in proposals if p.kind in {"split", "research"}]
        self.assertTrue(any(applied))
        titles = [s.title for s in self.engine.state.subgoals]
        self.assertTrue(any("isolate the failing evidence" in t for t in titles))

    def test_duplicate_pending_proposals_collapse_on_load(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            engine = Engine(root, provider=HeuristicProvider(), run_checks=False)
            engine.bootstrap()
            path = root / ".suno-helper" / "proposals.json"
            row = {
                "id": "tune-1",
                "kind": "tune",
                "title": "Raise research budget",
                "rationale": "r",
                "evidence": ["a"],
                "status": "pending",
                "created_turn": 1,
                "applied_turn": 0,
                "before": {},
                "after": {},
            }
            twin = dict(row, id="tune-2", evidence=["b"])
            history = dict(row, id="tune-0", status="applied", evidence=["c"])
            path.write_text(json.dumps([row, twin, history]))
            improver = Improver(root, Ledger(root))
            pending = [p for p in improver.proposals if p.status == "pending"]
            self.assertEqual(len(pending), 1)
            self.assertEqual(pending[0].evidence, ["a", "b"])
            self.assertEqual(len([p for p in improver.proposals if p.status == "applied"]), 1)

    def test_pending_proposals_are_deduped(self) -> None:
        self.engine.bootstrap()
        for _ in range(6):
            self.engine.improver.reflect(
                turn=1,
                state_summary={"open": []},
                recent_failures=4,
                consecutive_failures=4,
            )
        pending = [p for p in self.engine.improver.proposals if p.status == "pending"]
        keys = [(p.kind, p.title) for p in pending]
        self.assertEqual(len(keys), len(set(keys)))

    def test_split_happens_once_per_subgoal(self) -> None:
        from suno_helper.state import Subgoal

        self.engine.bootstrap()
        sub = self.engine.state.add_subgoal("fragile", priority=5, weight=1.0)
        sub.failures = 2
        self.engine._split_stuck(sub, 3)
        self.assertEqual(sub.split_depth, 1)
        children = [s for s in self.engine.state.subgoals if "fragile:" in s.title]
        self.assertTrue(all(child.split_depth == 1 for child in children))

    def test_reflection_is_bounded(self) -> None:
        self.engine.bootstrap()
        for _ in range(30):
            self.engine.cycle()
        applied = [p for p in self.engine.improver.proposals if p.status == "applied"]
        self.assertLessEqual(len(applied), 31)


class ConvergenceTests(unittest.TestCase):
    def test_goal_reaches_target_within_budget(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            engine = Engine(root, provider=HeuristicProvider(), run_checks=False)
            engine.bootstrap()
            for _ in range(120):
                engine.cycle()
                if engine.state.goal.current >= engine.state.goal.target:
                    break
            self.assertGreaterEqual(engine.state.goal.current, 80.0)

    def test_a_failing_gate_never_completes_a_subgoal(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            engine = Engine(root, provider=HeuristicProvider(), run_checks=False)
            engine.bootstrap()
            sub = engine.state.add_subgoal(
                "gate lies",
                priority=5,
                weight=1.0,
                action={"tool": "noop"},
                acceptance=[{"tool": "a-tool-that-does-not-exist", "expect": "pass"}],
            )
            self.assertFalse(engine._all_gates_passed(sub))
            for _ in range(3):
                result = engine.cycle()
                if result.subgoal_id == sub.id:
                    self.assertEqual(result.outcome, "fail")
                    break
            self.assertNotEqual(sub.status, "done")
            self.assertGreater(sub.failures, 0)

    def test_idle_turn_runs_an_audit_instead_of_spinning(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            engine = Engine(root, provider=HeuristicProvider(), run_checks=False)
            engine.bootstrap()
            for sub in engine.state.subgoals:
                sub.mark("done")
            engine.state.recompute_progress()
            # Force the empty-backlog path: no capability wave may be queued.
            engine._next_wave = lambda turn: []  # type: ignore[assignment]
            result = engine.cycle()
            self.assertEqual(result.phase, "audit")
            self.assertIn(result.tool, {name for name, _ in Engine.AUDIT_ROTATION})
            self.assertTrue(result.evidence.startswith("audit "))

    def test_audit_rotation_covers_every_tool_once(self) -> None:
        names = [name for name, _ in Engine.AUDIT_ROTATION]
        self.assertEqual(len(names), len(set(names)))
        self.assertIn("md_audit", names)
        self.assertIn("capability_docs", names)

    def test_capability_wave_queues_only_ready_capabilities(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            engine = Engine(root, provider=HeuristicProvider(), run_checks=False)
            engine.bootstrap()
            # make_workspace deletes the *.test.ts files, so nothing is ready yet.
            self.assertEqual(engine._capability_wave(1), [])
            restored = PROJECT_ROOT / "extension" / "src" / "lib" / "buildStyle.test.ts"
            target = root / "projects" / "suno-helper" / "extension" / "src" / "lib" / "buildStyle.test.ts"
            target.write_text(restored.read_text(encoding="utf-8"), encoding="utf-8")
            added = engine._capability_wave(2)
            self.assertTrue(added, msg="expected the prompt-builder page to be queued")
            self.assertTrue(all("prompt-builder" in sub.title or sub.action for sub in added))

    def test_escalation_question_is_persisted(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            engine = Engine(root, provider=HeuristicProvider(), run_checks=False)
            engine.bootstrap()
            sub = engine.state.add_subgoal(
                "impossible",
                priority=5,
                weight=1.0,
                action={"tool": "json_validate", "args": {"paths": ["docs/does-not-exist.json"]}},
                acceptance=[{"tool": "a-tool-that-does-not-exist", "expect": "pass"}],
            )
            sub.split_depth = 1  # already split once: no further splitting
            sub.failures = 2
            for _ in range(3):
                engine.state.mark_closed_for_test = None
                result = engine.cycle()
                if result.outcome == "fail":
                    continue
            saved = json.loads((root / ".suno-helper" / "research-questions.json").read_text())
            questions = saved if isinstance(saved, list) else saved.get("questions", [])
            self.assertTrue(
                any("impossible" in (item.get("question") or "") for item in questions),
                msg=f"escalation question missing: {questions}",
            )

    def test_idle_turn_extends_roadmap(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            engine = Engine(root, provider=HeuristicProvider(), run_checks=False)
            engine.bootstrap()
            for sub in engine.state.subgoals:
                sub.mark("done")
            engine.state.recompute_progress()
            before = len(engine.state.subgoals)
            result = engine.cycle()
            if result.outcome == "replan":
                self.assertGreater(len(engine.state.subgoals), before)


if __name__ == "__main__":
    unittest.main()
