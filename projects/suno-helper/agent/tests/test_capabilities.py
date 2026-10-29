"""Capability registry tests: the doc gate must only pass on real evidence.

The point of these tests is that the generator is not a rubber stamp. A page may
only exist when the code behind it exists, so each test removes one piece of
evidence and asserts the gate fails.
"""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from suno_helper.capabilities import CAPABILITIES, by_id, ids  # noqa: E402
from suno_helper.tools import ToolBox, render_capability  # noqa: E402


def make_project(root: Path) -> Path:
    """A minimal project tree with one real capability worth documenting."""
    project = root / "projects" / "suno-helper"
    source = project / "extension" / "src" / "lib" / "demo.ts"
    source.parent.mkdir(parents=True)
    source.write_text("export function demo(): string {\n  return 'x';\n}\n", encoding="utf-8")
    test_file = project / "agent" / "tests" / "test_demo.py"
    test_file.parent.mkdir(parents=True)
    test_file.write_text("# placeholder\n", encoding="utf-8")
    return project


def toolbox(root: Path) -> ToolBox:
    return ToolBox(root, extension_dir="projects/suno-helper/extension", run_checks=False)


class RegistryInvariantTests(unittest.TestCase):
    def test_ids_are_unique_and_kebab_case(self) -> None:
        self.assertEqual(len(ids()), len(set(ids())))
        for capability_id in ids():
            self.assertRegex(capability_id, r"^[a-z0-9]+(-[a-z0-9]+)*$")

    def test_every_capability_declares_evidence(self) -> None:
        for cap in CAPABILITIES:
            self.assertTrue(cap.sources, msg=cap.id)
            self.assertTrue(cap.symbols, msg=cap.id)
            self.assertTrue(cap.behaviours, msg=cap.id)
            self.assertTrue(cap.edge_cases, msg=cap.id)

    def test_related_ids_resolve(self) -> None:
        for cap in CAPABILITIES:
            for other in cap.related:
                self.assertIsNotNone(by_id(other), msg=f"{cap.id} -> {other}")

    def test_unknown_id_returns_none(self) -> None:
        self.assertIsNone(by_id("does-not-exist"))


class RenderTests(unittest.TestCase):
    def test_render_contains_required_sections_and_marker(self) -> None:
        cap = CAPABILITIES[0]
        body = render_capability(cap, project=Path("."), extension_dir="extension")
        for section in ToolBox.DOC_SECTIONS:
            self.assertIn(section, body)
        self.assertIn(ToolBox.GENERATED_MARKER, body)
        self.assertIn(cap.summary, body)
        self.assertGreater(len(body), 500)


class GateTests(unittest.TestCase):
    def test_gate_passes_when_source_exists(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = make_project(root)
            result = _doc_for_demo(root)
            self.assertTrue(result.ok, msg=result.details)
            self.assertTrue((project / "docs" / "tools" / "demo.md").exists())

    def test_gate_fails_when_symbol_is_absent(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = make_project(root)
            (project / "extension" / "src" / "lib" / "demo.ts").write_text("export const other = 1;\n")
            result = _doc_for_demo(root)
            self.assertFalse(result.ok)
            joined = " ".join(result.details.get("problems", []))
            self.assertIn("does not expose", joined)

    def test_gate_fails_when_source_is_missing(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = make_project(root)
            (project / "extension" / "src" / "lib" / "demo.ts").unlink()
            result = _doc_for_demo(root)
            self.assertFalse(result.ok)
            self.assertIn("missing source", " ".join(result.details.get("problems", [])))

    def test_gate_fails_on_unknown_capability(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = toolbox(Path(tmp)).call("capability_docs", only=["nope"])
            self.assertFalse(result.ok)
            self.assertEqual(result.error, "unknown-capability")

    def test_hand_edited_page_is_not_overwritten(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = make_project(root)
            doc = project / "docs" / "tools" / "demo.md"
            doc.parent.mkdir(parents=True)
            doc.write_text("# Demo\n\nHand written, no marker.\n", encoding="utf-8")
            result = _doc_for_demo(root)
            self.assertFalse(result.ok)
            self.assertIn("hand-edited", " ".join(result.details.get("problems", [])))
            self.assertIn("Hand written", doc.read_text(encoding="utf-8"))

    def test_second_run_is_idempotent(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = make_project(root)
            first = _doc_for_demo(root)
            doc = project / "docs" / "tools" / "demo.md"
            snapshot = doc.read_text(encoding="utf-8")
            second = _doc_for_demo(root)
            self.assertTrue(first.ok and second.ok, msg=second.details)
            self.assertEqual(snapshot, doc.read_text(encoding="utf-8"))
            self.assertEqual(second.details["written"], [])


def _demo_doc(cap) -> str:
    lines = ["# Demo", "", "> demo capability", "", "## What it does", "", "- works"]
    lines += ["", "## Edge cases", "", "- none"]
    lines += ["", "## Evidence", "", "| Item | Path |", "|------|------|"]
    for rel in cap.sources:
        lines.append(f"| implementation | `{rel}` |")
    lines += ["", "<!-- generated: capability_docs -->", ""]
    return "\n".join(lines)


def _doc_for_demo(root: Path):
    """Run the real gate with a temporary single-capability registry."""
    from suno_helper import capabilities as caps

    demo = caps.Capability(
        id="demo",
        title="Demo capability",
        phase="core",
        summary="A demo capability used to prove the gate is not a rubber stamp.",
        sources=("extension/src/lib/demo.ts",),
        symbols=("export function demo",),
        behaviours=("Returns a string.",),
        edge_cases=("Always returns the same string.",),
        tests=("agent/tests/test_demo.py",),
    )
    original = caps.CAPABILITIES
    try:
        caps.CAPABILITIES = (demo,)
        from suno_helper import tools as tools_module

        original_render = tools_module.render_capability
        tools_module.render_capability = lambda cap, **_: _demo_doc(cap)
        try:
            # Explicit ids are strict: the gate must fail when evidence is absent.
            return toolbox(root).call("capability_docs", only=["demo"], min_chars=100)
        finally:
            tools_module.render_capability = original_render
    finally:
        caps.CAPABILITIES = original


if __name__ == "__main__":
    unittest.main()
