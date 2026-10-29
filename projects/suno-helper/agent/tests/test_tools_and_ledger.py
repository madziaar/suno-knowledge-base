"""Tool and ledger tests: path containment, atomic writes, rotation, digests."""

from __future__ import annotations

import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from suno_helper.fsutil import PathEscapeError, atomic_write_json, atomic_write_text, read_json, resolve_inside  # noqa: E402
from suno_helper.ledger import Entry, Ledger  # noqa: E402
from suno_helper.tools import ToolBox, insert_marker  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = PROJECT_ROOT.parents[1]


class FsUtilTests(unittest.TestCase):
    def test_atomic_write_creates_parents(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "a" / "b" / "c.txt"
            atomic_write_text(path, "hi\n")
            self.assertEqual(path.read_text(), "hi\n")

    def test_atomic_json_roundtrip(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "x.json"
            atomic_write_json(path, {"a": 1})
            self.assertEqual(read_json(path), {"a": 1})

    def test_read_json_default_on_corrupt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.json"
            path.write_text("{not json")
            self.assertEqual(read_json(path, default={"ok": False}), {"ok": False})

    def test_resolve_inside_rejects_escape(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            with self.assertRaises(PathEscapeError):
                resolve_inside(root, "../outside.txt")

    def test_resolve_inside_allows_nested(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.assertEqual(resolve_inside(root, "a/b.txt"), (root / "a" / "b.txt").resolve())


class LedgerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_append_and_read(self) -> None:
        ledger = Ledger(self.root)
        ledger.append(Entry(turn=1, phase="work", outcome="done", ok=True))
        ledger.append(Entry(turn=2, phase="verify", outcome="done", ok=True))
        self.assertEqual(len(ledger.entries()), 2)
        self.assertEqual(ledger.last_turn(), 2)

    def test_missing_required_key_raises(self) -> None:
        ledger = Ledger(self.root)
        with self.assertRaises(ValueError):
            ledger.append({"turn": 1})

    def test_stats(self) -> None:
        ledger = Ledger(self.root)
        for turn in range(1, 11):
            ledger.append(Entry(turn=turn, phase="work", outcome="done" if turn % 2 else "fail", ok=bool(turn % 2), tool="md_audit", duration_ms=10))
        stats = ledger.stats()
        self.assertEqual(stats["turns"], 10)
        self.assertAlmostEqual(stats["success_rate"], 0.5)
        self.assertEqual(stats["tools"]["md_audit"], 10)

    def test_streak(self) -> None:
        ledger = Ledger(self.root)
        ledger.append(Entry(turn=1, phase="w", outcome="done", ok=True))
        ledger.append(Entry(turn=2, phase="w", outcome="fail", ok=False))
        ledger.append(Entry(turn=3, phase="w", outcome="fail", ok=False))
        self.assertEqual(ledger.streak("fail"), 2)

    def test_verify_catches_bad_order(self) -> None:
        ledger = Ledger(self.root)
        ledger.append(Entry(turn=5, phase="w", outcome="done"))
        ledger.append(Entry(turn=2, phase="w", outcome="done"))
        self.assertFalse(ledger.verify()["ok"])

    def test_rotation_keeps_file_small(self) -> None:
        ledger = Ledger(self.root, max_bytes=400)
        for turn in range(1, 30):
            ledger.append(Entry(turn=turn, phase="w", outcome="done", notes="x" * 50))
        archives = list((self.root / ".suno-helper" / "ledger-archive").glob("*.jsonl"))
        self.assertTrue(archives)
        self.assertLess(self.root.joinpath(".suno-helper/ledger.jsonl").stat().st_size, 800)

    def test_digest_is_bounded(self) -> None:
        ledger = Ledger(self.root)
        for turn in range(1, 60):
            ledger.append(Entry(turn=turn, phase="w", outcome="done", notes="y" * 200))
        self.assertLessEqual(len(ledger.digest(turns=50)), 2400)

    def test_markdown_summary(self) -> None:
        ledger = Ledger(self.root)
        ledger.append(Entry(turn=1, phase="w", outcome="done", ok=True, tool="md_audit"))
        text = ledger.summary_markdown()
        self.assertIn("| turn |", text)


class ToolBoxTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "docs").mkdir()
        shutil.copy(REPO_ROOT / "docs" / "suno-limits.json", self.root / "docs" / "suno-limits.json")
        self.tools = ToolBox(self.root, run_checks=False)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_limits_audit_passes_on_canonical_file(self) -> None:
        result = self.tools.call("limits_audit")
        self.assertTrue(result.ok, msg=result.details)

    def test_limits_audit_fails_without_file(self) -> None:
        (self.root / "docs" / "suno-limits.json").unlink()
        result = self.tools.call("limits_audit")
        self.assertFalse(result.ok)

    def test_limits_audit_detects_stale_claim(self) -> None:
        (self.root / "docs" / "guide.md").write_text("Style is capped at 200 characters.\n")
        result = self.tools.call("limits_audit", docs=["docs"])
        self.assertFalse(result.ok)
        self.assertTrue(result.details["contradictions"])

    def test_md_audit_detects_odd_fence(self) -> None:
        (self.root / "docs" / "x.md").write_text("# t\n```\nunclosed\n")
        result = self.tools.call("md_audit", paths=["docs"])
        self.assertFalse(result.ok)

    def test_md_audit_fix_trims_trailing_space(self) -> None:
        path = self.root / "docs" / "y.md"
        path.write_text("# t   \ntext\n")
        self.tools.call("md_audit", paths=["docs"], fix=True)
        self.assertNotIn("t   \n", path.read_text())

    def test_md_audit_skips_vendored_trees(self) -> None:
        vendored = self.root / "archive" / "old"
        vendored.mkdir(parents=True)
        (vendored / "broken.md").write_text("[x](./missing.md)\n")
        (self.root / "docs").mkdir(exist_ok=True)
        (self.root / "docs" / "ok.md").write_text("# ok\n")
        result = self.tools.call("md_audit", paths=["archive", "docs"])
        self.assertTrue(result.ok, msg=result.details)
        self.assertGreaterEqual(result.details.get("vendored_skipped", 0), 1)

    def test_md_audit_can_opt_into_vendored(self) -> None:
        vendored = self.root / "archive" / "old"
        vendored.mkdir(parents=True)
        (vendored / "broken.md").write_text("[x](./missing.md)\n")
        result = self.tools.call("md_audit", paths=["archive"], include_vendored=True)
        self.assertFalse(result.ok)

    def test_md_audit_detects_dead_link(self) -> None:
        (self.root / "docs" / "z.md").write_text("[x](./missing.md)\n")
        result = self.tools.call("md_audit", paths=["docs"])
        self.assertFalse(result.ok)

    def test_json_validate(self) -> None:
        self.assertTrue(self.tools.call("json_validate").ok)
        (self.root / "docs" / "bad.json").write_text("{")
        self.assertFalse(self.tools.call("json_validate", paths=["docs/bad.json"]).ok)

    def test_unknown_tool_is_reported(self) -> None:
        result = self.tools.call("does_not_exist")
        self.assertFalse(result.ok)
        self.assertIn("unknown-tool", result.error)

    def test_improve_report_writes_file(self) -> None:
        result = self.tools.call("improve_report")
        self.assertTrue(result.ok)
        self.assertTrue((self.root / "docs" / "loop-report.md").exists())

    def test_research_digest_requires_sources(self) -> None:
        result = self.tools.call("research_digest")
        self.assertFalse(result.ok)

    def test_repo_scan(self) -> None:
        result = self.tools.call("repo_scan")
        self.assertTrue(result.ok)
        self.assertIn("areas", result.details)

    def test_insert_marker_replaces_block(self) -> None:
        path = self.root / "docs" / "m.md"
        path.write_text("# t\n")
        first = insert_marker(path, "limits", "| a |\n")
        path.write_text(first)
        second = insert_marker(path, "limits", "| b |\n")
        self.assertIn("| b |", second)
        self.assertNotIn("| a |", second)
        self.assertEqual(second.count("limits:begin"), 1)


if __name__ == "__main__":
    unittest.main()
