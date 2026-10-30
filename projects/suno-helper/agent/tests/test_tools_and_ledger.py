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
from suno_helper.engine import Engine  # noqa: E402
from suno_helper.ledger import Entry, Ledger  # noqa: E402
from suno_helper.providers import HeuristicProvider  # noqa: E402
from suno_helper.tools import ToolBox, insert_marker  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = PROJECT_ROOT.parents[1]

from .test_engine import make_workspace  # noqa: E402


class SkippedGateTests(unittest.TestCase):
    """A gate that could not run must not read like one that passed."""

    def _toolbox(self, tmp: str) -> "ToolBox":
        from suno_helper.tools import ToolBox

        root = make_workspace(Path(tmp))
        ext = root / "projects" / "suno-helper" / "extension"
        import shutil

        if (ext / "node_modules").exists():
            shutil.rmtree(ext / "node_modules")
        return ToolBox(root, extension_dir=str(ext.relative_to(root)), run_checks=True)

    def test_missing_dependencies_report_skipped_not_plain_ok(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = self._toolbox(tmp).call("extension_check")
            self.assertTrue(result.ok)
            self.assertTrue(result.skipped)
            self.assertTrue(result.summary.startswith("SKIPPED"), msg=result.summary)
            self.assertIn("npm install", result.summary)

    def test_scaffold_failure_is_not_reported_as_skipped(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            import shutil

            shutil.rmtree(root / "projects" / "suno-helper" / "extension" / "entrypoints")
            from suno_helper.tools import ToolBox

            result = ToolBox(root, extension_dir="projects/suno-helper/extension", run_checks=True).call(
                "extension_check"
            )
            self.assertFalse(result.ok)
            self.assertFalse(result.skipped)

    def test_the_engine_marks_skipped_gates_in_the_ledger(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            import shutil

            ext = root / "projects" / "suno-helper" / "extension"
            if (ext / "node_modules").exists():
                shutil.rmtree(ext / "node_modules")
            engine = Engine(root, provider=HeuristicProvider(), run_checks=True, auto_improve=False)
            engine.bootstrap()
            engine.state.add_subgoal(
                title="Gate that cannot run",
                description="extension_check with no node_modules",
                priority=5,
                weight=1.0,
                action={"tool": "extension_check", "args": {}},
                acceptance=[{"tool": "extension_check", "expect": "pass"}],
            )
            for _ in range(6):
                engine.cycle()
            rows = engine.ledger.entries()
            evidence = " ".join(str(row.get("evidence", "")) for row in rows)
            self.assertIn("[skipped]", evidence)


class PermissionBudgetTests(unittest.TestCase):
    """The manifest's permission list is a promise; this keeps it small."""

    ALLOWED = {"storage", "downloads", "activeTab", "scripting"}
    CONFIG = REPO_ROOT / "projects/suno-helper/extension/wxt.config.ts"

    def test_permissions_stay_within_the_allowlist(self) -> None:
        import re

        text = self.CONFIG.read_text(encoding="utf-8")
        match = re.search(r"permissions:\s*\[([^\]]*)\]", text)
        self.assertIsNotNone(match, msg="wxt.config.ts has no permissions array")
        declared = {item.strip().strip("'\"") for item in match.group(1).split(",") if item.strip()}
        self.assertTrue(declared, msg="an extension with no permissions is a typo, not a design")
        unexpected = declared - self.ALLOWED
        self.assertEqual(unexpected, set(), msg=f"permissions outside the budget: {sorted(unexpected)}")

    def test_host_access_is_enumerated_not_wildcarded(self) -> None:
        """Every declared host must name one domain.

        Checked against the parsed arrays, not the file text: the config's own
        comment mentions `<all_urls>` to say it is absent, and a test that greps
        the whole file would fail on the sentence forbidding what it checks.
        """
        import re

        text = self.CONFIG.read_text(encoding="utf-8")
        blocks = re.findall(r"host_permissions:\s*\[([^\]]*)\]", text)
        self.assertTrue(blocks, msg="no host_permissions array")
        hosts = {item.strip().strip("'\"") for item in blocks[0].split(",") if item.strip()}
        self.assertTrue(hosts, msg="an extension that reads pages must declare which pages")
        for host in hosts:
            self.assertNotIn("<all_urls>", host)
            self.assertNotIn("*://*", host)
            self.assertRegex(host, r"^https://[^/]+/\*$", msg=f"host is not a single origin: {host}")


class RepoHygieneTests(unittest.TestCase):
    """Guards that would have caught the lost-`src/lib` merge."""

    def test_extension_sources_are_not_gitignored(self) -> None:
        import subprocess

        required = [
            "projects/suno-helper/extension/src/lib/limits.ts",
            "projects/suno-helper/extension/src/components/ui.tsx",
            "projects/suno-helper/extension/src/backend/jobs.ts",
            "projects/suno-helper/extension/entrypoints/popup/App.tsx",
        ]
        problematic = [rel for rel in required if not (REPO_ROOT / rel).exists()]
        self.assertEqual(problematic, [], msg=f"missing on disk: {problematic}")

        proc = subprocess.run(
            ["git", "check-ignore", *required],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
        )
        # exit 1 means "nothing matched an ignore rule" — which is what we want.
        self.assertEqual(
            proc.returncode,
            1,
            msg=f"these files are gitignored and would vanish on merge:\n{proc.stdout}",
        )

    def test_entrypoints_import_only_real_modules(self) -> None:
        import re

        cli = (REPO_ROOT / "projects/suno-helper/extension/entrypoints/popup/App.tsx").read_text(encoding="utf-8")
        imports = re.findall(r"from '(\.\./)+((?:src|entrypoints)/[^']+)'", cli)
        for _dots, rel in imports:
            self.assertTrue(
                (REPO_ROOT / "projects/suno-helper/extension" / rel.split("/")[0]).exists(),
                msg=f"App.tsx imports from a missing directory: {rel}",
            )


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
