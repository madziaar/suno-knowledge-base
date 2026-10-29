"""Skill registry tests: frontmatter parsing, retrieval quality, lint contract."""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from suno_helper.skills import (  # noqa: E402
    SkillRegistry,
    load_skill,
    parse_frontmatter,
    parse_yaml_subset,
    tokenize,
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]


class FrontmatterTests(unittest.TestCase):
    def test_parse_scalars_and_lists(self) -> None:
        data = parse_yaml_subset(
            "name: writing-plans\n"
            "description: Use when you have a spec\n"
            "tags: [planning, tdd]\n"
            "stages:\n"
            "  - ultraplan\n"
            "  - verify\n"
            "trust: 0.8\n"
            "enabled: true\n"
        )
        self.assertEqual(data["name"], "writing-plans")
        self.assertEqual(data["tags"], ["planning", "tdd"])
        self.assertEqual(data["stages"], ["ultraplan", "verify"])
        self.assertAlmostEqual(data["trust"], 0.8)
        self.assertTrue(data["enabled"])

    def test_block_scalar_collects_continuation(self) -> None:
        data = parse_yaml_subset("description: first line\n  continued here\n")
        self.assertEqual(data["description"], "first line continued here")

    def test_quotes_stripped(self) -> None:
        self.assertEqual(parse_yaml_subset('name: "quoted"\n')["name"], "quoted")

    def test_no_frontmatter_returns_body(self) -> None:
        meta, body = parse_frontmatter("# Just markdown\n")
        self.assertEqual(meta, {})
        self.assertIn("Just markdown", body)

    def test_tokenize_drops_stopwords(self) -> None:
        tokens = tokenize("Use when the loop is running")
        self.assertNotIn("the", tokens)
        self.assertIn("loop", tokens)


class RegistryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.registry = SkillRegistry(PROJECT_ROOT).discover()

    def test_discovers_project_skills(self) -> None:
        self.assertGreaterEqual(len(self.registry), 10)

    def test_expected_skills_present(self) -> None:
        for name in (
            "using-superpowers",
            "find-skills",
            "goal-subgoal-loop",
            "hyperplan",
            "ultraresearch",
            "ultrawork",
            "verify-before-done",
            "self-improvement-recursive",
            "dispatching-agents",
            "adversarial",
            "team-pyrite",
            "teammode",
            "suno-prompt-engineering",
            "local-first-extension",
        ):
            self.assertIsNotNone(self.registry.get(name), msg=f"missing skill: {name}")

    def test_find_ranks_style_prompt_skill_first(self) -> None:
        hits = self.registry.find("clean up a duplicate style prompt")
        self.assertTrue(hits)
        self.assertEqual(hits[0][1].name, "suno-prompt-engineering")

    def test_find_routes_delegation(self) -> None:
        hits = self.registry.find("delegate parallel subagents")
        self.assertEqual(hits[0][1].name, "dispatching-agents")

    def test_find_routes_planning(self) -> None:
        hits = self.registry.find("break this down into atomic steps")
        self.assertIn(hits[0][1].name, {"hyperplan", "ultraplan", "goal-subgoal-loop"})

    def test_find_respects_stage_filter(self) -> None:
        hits = self.registry.find("verify evidence", stage="verify")
        self.assertTrue(hits)
        self.assertIn("verify", hits[0][1].stages)

    def test_find_returns_empty_for_nonsense(self) -> None:
        self.assertEqual(self.registry.find("zzzzqqqq"), [])

    def test_lint_passes_on_repo_skills(self) -> None:
        report = self.registry.lint()
        self.assertTrue(report["ok"], msg=report["problems"])

    def test_index_is_serialisable(self) -> None:
        payload = self.registry.index()
        self.assertEqual(payload["count"], len(self.registry))
        self.assertTrue(all("sha" in skill for skill in payload["skills"]))

    def test_require_falls_back_to_fuzzy(self) -> None:
        found = self.registry.require(["team-pyrite", "nonexistent-skill-name"])
        self.assertIn("team-pyrite", found)

    def test_shas_change_with_body(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "SKILL.md"
            path.write_text("---\nname: t\ndescription: Use when x\n---\n# T\nbody\n")
            one = load_skill(path)
            assert one is not None
            path.write_text("---\nname: t\ndescription: Use when x\n---\n# T\nbody2\n")
            two = load_skill(path)
            assert two is not None
            self.assertNotEqual(one.sha, two.sha)


class LintFailureTests(unittest.TestCase):
    def test_bad_skill_is_flagged(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            skill_dir = root / "skills" / "bad"
            skill_dir.mkdir(parents=True)
            (skill_dir / "SKILL.md").write_text("---\nname: bad\ndescription: does things\n---\nno heading\n")
            registry = SkillRegistry(root).discover()
            report = registry.lint()
            self.assertFalse(report["ok"])
            joined = " ".join(report["problems"])
            self.assertIn("Use when", joined)


if __name__ == "__main__":
    unittest.main()
