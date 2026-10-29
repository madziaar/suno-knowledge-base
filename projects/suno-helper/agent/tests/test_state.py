"""State machine tests: goal progress, subgoal selection, dependencies."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from suno_helper.state import Goal, StateStore, Subgoal  # noqa: E402


class GoalTests(unittest.TestCase):
    def test_progress_clamps(self) -> None:
        goal = Goal(target=100.0, current=150.0)
        self.assertEqual(goal.progress(), 1.0)
        goal.current = -5
        self.assertEqual(goal.progress(), 0.0)

    def test_progress_zero_target(self) -> None:
        self.assertEqual(Goal(target=0.0, current=10.0).progress(), 0.0)

    def test_roundtrip(self) -> None:
        goal = Goal(title="x", current=42.0)
        self.assertEqual(Goal.from_dict(goal.to_dict()).current, 42.0)

    def test_unknown_fields_ignored(self) -> None:
        goal = Goal.from_dict({"title": "t", "nonsense": 1})
        self.assertEqual(goal.title, "t")


class StateStoreTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.state = StateStore(self.root).load()

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_seed_is_idempotent(self) -> None:
        self.state.seed_default()
        count = len(self.state.subgoals)
        self.state.seed_default()
        self.assertEqual(len(self.state.subgoals), count)
        self.assertGreater(count, 4)

    def test_progress_is_weighted(self) -> None:
        self.state.add_subgoal("a", weight=1.0)
        self.state.add_subgoal("b", weight=3.0, status="done")
        self.assertAlmostEqual(self.state.goal.current, 75.0, places=2)

    def test_dropped_excluded_from_denominator(self) -> None:
        self.state.add_subgoal("a", weight=1.0, status="done")
        self.state.add_subgoal("b", weight=1.0, status="dropped")
        self.assertAlmostEqual(self.state.goal.current, 100.0, places=2)

    def test_dependencies_block_selection(self) -> None:
        first = self.state.add_subgoal("first", priority=1)
        second = self.state.add_subgoal("second", priority=5, depends_on=[first.id])
        chosen = self.state.select_next(turn=1)
        self.assertIsNotNone(chosen)
        self.assertEqual(chosen.id, first.id)
        self.state.complete(first.id)
        chosen = self.state.select_next(turn=2)
        self.assertEqual(chosen.id, second.id)

    def test_selection_is_deterministic_for_seed(self) -> None:
        self.state.add_subgoal("a", priority=3)
        self.state.add_subgoal("b", priority=3)
        one = self.state.select_next(turn=7, seed=11)
        two = self.state.select_next(turn=7, seed=11)
        self.assertEqual(one.id, two.id)

    def test_priority_wins_when_both_recent(self) -> None:
        hot = self.state.add_subgoal("hot", priority=5)
        cold = self.state.add_subgoal("cold", priority=1)
        hot.last_turn = 4
        cold.last_turn = 4
        self.assertEqual(self.state.select_next(turn=5, seed=1).id, hot.id)

    def test_starvation_floor_beats_priority(self) -> None:
        hot = self.state.add_subgoal("hot", priority=5)
        cold = self.state.add_subgoal("cold", priority=1)
        hot.last_turn = 39
        cold.last_turn = 1
        # 39 turns untouched is past STARVATION_TURNS, so cold jumps the queue
        self.assertEqual(self.state.select_next(turn=40, seed=1).id, cold.id)

    def test_starved_items_are_fifo(self) -> None:
        first = self.state.add_subgoal("first", priority=1)
        second = self.state.add_subgoal("second", priority=5)
        first.last_turn = 2
        second.last_turn = 5
        self.assertEqual(self.state.select_next(turn=60, seed=3).id, first.id)

    def test_recently_touched_items_never_starve(self) -> None:
        always = self.state.add_subgoal("always", priority=5)
        always.last_turn = 39
        self.state.select_next(turn=40, seed=1)
        always.last_turn = 39
        self.assertEqual(self.state.select_next(turn=40, seed=1).id, always.id)

    def test_thrash_guard_is_absolute_even_with_dependencies(self) -> None:
        dep = self.state.add_subgoal("dep")
        self.state.complete(dep.id)
        sub = self.state.add_subgoal("cursed", priority=5, depends_on=[dep.id])
        sub.failures = 3
        self.assertIsNone(self.state.select_next(turn=9))
        self.assertEqual(sub.status, "blocked")
        self.assertIn("human decision", sub.note)

    def test_split_depth_roundtrip(self) -> None:
        sub = self.state.add_subgoal("deep")
        sub.split_depth = 2
        self.state.save()
        reloaded = StateStore(self.root).load()
        self.assertEqual(reloaded.get(sub.id).split_depth, 2)

    def test_thrash_guard_blocks_repeatedly_failed(self) -> None:
        sub = self.state.add_subgoal("cursed", priority=5)
        sub.failures = 3
        self.assertIsNone(self.state.select_next(turn=5))
        self.assertEqual(sub.status, "blocked")

    def test_blocked_subgoal_reactivates(self) -> None:
        dep = self.state.add_subgoal("dep")
        item = self.state.add_subgoal("item", depends_on=[dep.id])
        item.status = "blocked"
        self.state.select_next(turn=1)
        self.assertEqual(item.status, "blocked")
        self.state.complete(dep.id)
        self.state.select_next(turn=2)
        self.assertEqual(item.status, "pending")

    def test_resolve_by_prefix(self) -> None:
        sub = self.state.add_subgoal("canonical limits table")
        self.assertEqual(self.state.resolve("canonical").id, sub.id)

    def test_resolve_ambiguous_prefix_raises(self) -> None:
        self.state.add_subgoal("alpha one")
        self.state.add_subgoal("alpha two")
        with self.assertRaises(KeyError):
            self.state.resolve("alpha")

    def test_record_attempt_tracks_failures(self) -> None:
        sub = self.state.add_subgoal("x")
        self.state.record_attempt(sub.id, ok=False)
        self.state.record_attempt(sub.id, ok=False, evidence="boom")
        self.assertEqual(sub.attempts, 2)
        self.assertEqual(sub.failures, 2)
        self.assertEqual(sub.evidence, [])

    def test_persistence_roundtrip(self) -> None:
        self.state.seed_default()
        self.state.turn = 12
        self.state.save(snapshot=True)
        reloaded = StateStore(self.root).load()
        self.assertEqual(reloaded.turn, 12)
        self.assertEqual(len(reloaded.subgoals), len(self.state.subgoals))
        self.assertEqual(reloaded.goal.title, self.state.goal.title)

    def test_snapshot_written(self) -> None:
        self.state.turn = 25
        self.state.seed_default()
        self.state.save(snapshot=True)
        files = list((self.root / ".suno-helper" / "goal-history").glob("*.json"))
        self.assertTrue(files)
        payload = json.loads(files[-1].read_text())
        self.assertIn("goal", payload)
        self.assertIn("subgoals", payload)

    def test_notes_are_trimmed(self) -> None:
        for index in range(60):
            self.state.note(f"n{index}")
        self.assertLessEqual(len(self.state.goal.notes), 40)

    def test_goal_version_bumps_only_on_change(self) -> None:
        version = self.state.goal.version
        self.state.set_goal(title=self.state.goal.title)
        self.assertEqual(self.state.goal.version, version)
        self.state.set_goal(title="new mission")
        self.assertEqual(self.state.goal.version, version + 1)

    def test_unresolvable_dependency_blocks(self) -> None:
        sub = self.state.add_subgoal("orphan", depends_on=["does-not-exist"])
        self.assertIn("does-not-exist", self.state.blocked_by(sub))
        self.assertIsNone(self.state.select_next(turn=1))

    def test_summary_shape(self) -> None:
        self.state.seed_default()
        summary = self.state.summary()
        self.assertEqual(summary["goal"]["target"], 100.0)
        self.assertIn("pending", summary["subgoals"])


class SubgoalTests(unittest.TestCase):
    def test_status_helpers(self) -> None:
        sub = Subgoal(id="x", title="x")
        self.assertTrue(sub.is_open())
        sub.mark("done")
        self.assertTrue(sub.is_done())
        self.assertFalse(sub.is_open())

    def test_mark_records_reason(self) -> None:
        sub = Subgoal(id="x", title="x")
        sub.mark("blocked", reason="missing data")
        self.assertEqual(sub.note, "missing data")


if __name__ == "__main__":
    unittest.main()
