"""Deterministic toolbox.

A turn is only worth recording if something real changed or something real was
verified. These tools are that "real": they read and write files under the
project root, run the extension's own checks, and return machine-readable
evidence. No LLM is involved, so a cron run on a machine with no API key still
does useful work.

Every tool returns :class:`ToolResult` with ``ok``, ``summary`` and ``details``;
the engine stores ``summary`` as evidence and ``artifacts`` in the subgoal.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

from .fsutil import atomic_write_text, read_json, resolve_inside

MARKER_RE = re.compile(r"<!--\s*({name}):begin\s*-->(.*?)<!--\s*{name}:end\s*-->", re.DOTALL)


@dataclass
class ToolResult:
    ok: bool
    summary: str
    details: dict[str, Any] = field(default_factory=dict)
    artifacts: list[str] = field(default_factory=list)
    error: str = ""
    #: The tool could not do its job and did not fail either — typically a
    #: missing dependency. The ledger records it so a green run over a skipped
    #: gate is visible instead of indistinguishable from a real pass.
    skipped: bool = False

    @classmethod
    def fail(cls, summary: str, *, error: str = "", details: dict | None = None) -> "ToolResult":
        return cls(ok=False, summary=summary, error=error, details=details or {})


class ToolBox:
    """Registry of deterministic tools bound to a project root."""

    def __init__(self, root: Path, *, extension_dir: str = "extension", run_checks: bool = True) -> None:
        self.root = Path(root).resolve()
        self.extension_dir = extension_dir
        self.run_checks = run_checks
        self.registry: dict[str, Callable[..., ToolResult]] = {
            "limits_audit": self.limits_audit,
            "md_audit": self.md_audit,
            "json_validate": self.json_validate,
            "skills_lint": self.skills_lint,
            "extension_check": self.extension_check,
            "research_digest": self.research_digest,
            "improve_report": self.improve_report,
            "capability_docs": self.capability_docs,
            "repo_scan": self.repo_scan,
            "agent_tests": self.agent_tests,
            "noop": self.noop,
        }

    # ---------------------------------------------------------------- driver
    def call(self, name: str, **args: Any) -> ToolResult:
        func = self.registry.get(name)
        if func is None:
            return ToolResult.fail(f"unknown tool: {name}", error="unknown-tool", details={"known": sorted(self.registry)})
        try:
            return func(**args)
        except Exception as exc:  # a broken tool must not kill a 500-turn run
            return ToolResult.fail(f"{name} crashed: {type(exc).__name__}", error=str(exc)[:400])

    def names(self) -> list[str]:
        return sorted(self.registry)

    # ------------------------------------------------------------------ tools
    def noop(self, **_args: Any) -> ToolResult:
        return ToolResult(ok=True, summary="no-op (reflection turn)")

    def limits_audit(self, *, fix: bool = False, docs: list[str] | None = None) -> ToolResult:
        """Verify the canonical limits file and check docs for contradicting claims."""
        limits_path = resolve_inside(self.root, "docs/suno-limits.json")
        data = read_json(limits_path)
        problems: list[str] = []
        if not isinstance(data, dict):
            return ToolResult.fail(
                "docs/suno-limits.json missing or unreadable",
                error="missing-limits",
                details={"path": str(limits_path)},
            )
        required_models = {"v4", "v4.5", "v5", "v5.5"}
        models = data.get("models") or {}
        missing = required_models - set(models)
        if missing:
            problems.append(f"missing model entries: {sorted(missing)}")
        for name, spec in models.items():
            for key in ("style_chars", "lyrics_chars"):
                if not isinstance(spec.get(key), int) or spec[key] <= 0:
                    problems.append(f"{name}: {key} must be a positive int")
        fields = data.get("fields") or {}
        if fields.get("simple_prompt_chars") is None:
            problems.append("fields.simple_prompt_chars missing")
        if fields.get("title_chars") is None:
            problems.append("fields.title_chars missing")

        style_v5 = (models.get("v5") or {}).get("style_chars")
        lyrics_v5 = (models.get("v5") or {}).get("lyrics_chars")
        scanned = 0
        contradictions: list[str] = []
        for rel in docs or ["docs", "projects/suno-helper/docs", "projects/suno-helper/README.md"]:
            target = self.root / rel
            files = [target] if target.is_file() else sorted(target.rglob("*.md")) if target.exists() else []
            for path in files:
                scanned += 1
                text = path.read_text(encoding="utf-8", errors="replace")
                if "suno-limits.json" in text:
                    continue
                for claim in re.finditer(r"(\d{3,4})\s*(?:chars|characters)", text, re.IGNORECASE):
                    value = int(claim.group(1))
                    line = text[: claim.start()].count("\n") + 1
                    if value in {style_v5, lyrics_v5}:
                        continue
                    if value in {200, 3000}:
                        contradictions.append(f"{path.relative_to(self.root)}:{line}: stale limit {value} without model qualifier")

        if contradictions:
            problems.append(f"{len(contradictions)} doc claim(s) contradict the canonical limits")

        if fix:
            stale = [p for p in contradictions]
            for item in stale:
                rel, _line = item.split(":", 1)
                path = self.root / rel
                if not path.exists():
                    continue
                text = path.read_text(encoding="utf-8", errors="replace")
                patched = re.sub(r"\b200\s*(?:chars|characters)\b", "200 chars (v4 and older)", text, flags=re.IGNORECASE)
                patched = re.sub(r"\b3000\s*(?:chars|characters)\b", "3000 chars (v4 and older)", patched, flags=re.IGNORECASE)
                if patched != text:
                    atomic_write_text(path, patched)
            if contradictions:
                problems.append(f"auto-qualified {len(contradictions)} stale limit claims")

        ok = not problems
        return ToolResult(
            ok=ok,
            summary=(
                f"limits ok: v5 style={style_v5} lyrics={lyrics_v5}, {scanned} docs scanned"
                if ok
                else f"limits audit found {len(problems)} problem(s)"
            ),
            details={"problems": problems, "scanned": scanned, "contradictions": contradictions[:10]},
            artifacts=["docs/suno-limits.json"],
        )

    #: Third-party / retired trees are not this project's responsibility. Auditing
    #: them produces hundreds of pre-existing issues and gates that can never
    #: pass. Matched on path *parts*, because `node_modules` also shows up two
    #: levels down (`projects/suno-helper/extension/node_modules`) and a prefix
    #: check from the repo root misses it — which is exactly what happened.
    VENDORED_DIRS = frozenset(
        {"archive", "resources", "llm-wiki", "node_modules", ".output", ".wxt", ".git", ".suno-helper", ".venv", "__pycache__"}
    )

    def _is_vendored(self, path: Path) -> bool:
        try:
            parts = path.resolve().relative_to(self.root).parts
        except ValueError:
            return True
        return any(part in self.VENDORED_DIRS for part in parts[:-1])

    def md_audit(
        self,
        *,
        paths: list[str] | None = None,
        fix: bool = False,
        max_files: int = 400,
        include_vendored: bool = False,
    ) -> ToolResult:
        """Check markdown hygiene: fences, trailing whitespace, dead relative links."""
        targets = paths or ["docs", "projects/suno-helper"]
        files: list[Path] = []
        skipped = 0
        for rel in targets:
            base = self.root / rel
            if base.is_file() and base.suffix == ".md":
                files.append(base)
            elif base.exists():
                for candidate in sorted(base.rglob("*.md")):
                    if not include_vendored and self._is_vendored(candidate):
                        skipped += 1
                        continue
                    files.append(candidate)
        files = files[:max_files]
        problems: list[str] = []
        fixed = 0
        for path in files:
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError as exc:
                problems.append(f"{path}: unreadable ({exc})")
                continue
            new_text = text
            fence_lines = sum(1 for line in text.splitlines() if line.lstrip().startswith("```"))
            if fence_lines % 2 != 0:
                problems.append(f"{_rel(self.root, path)}: odd number of code-fence lines ({fence_lines})")
            stripped = "\n".join(line.rstrip() for line in text.splitlines())
            if not stripped.endswith("\n"):
                stripped += "\n"
            if stripped != text:
                new_text = stripped
            for match in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", text):
                link = match.group(1).strip()
                if link.startswith(("http://", "https://", "#", "mailto:")):
                    continue
                target_part = link.split("#", 1)[0]
                if not target_part:
                    continue
                candidate = (path.parent / target_part).resolve()
                if not candidate.exists():
                    problems.append(f"{_rel(self.root, path)}: dead link -> {link}")
            if fix and new_text != text:
                atomic_write_text(path, new_text)
                fixed += 1
        if not files:
            return ToolResult.fail(
                "no markdown files found under " + ", ".join(targets),
                error="no-files",
                details={"targets": targets},
            )
        ok = not problems
        return ToolResult(
            ok=ok,
            summary=(
                f"markdown clean: {len(files)} files"
                if ok
                else f"{len(problems)} markdown issue(s) in {len(files)} files ({fixed} auto-fixed)"
            ),
            details={"files": len(files), "problems": problems[:15], "fixed": fixed, "vendored_skipped": skipped},
            artifacts=[_rel(self.root, p) for p in files[:5]],
        )

    def json_validate(self, *, paths: list[str] | None = None) -> ToolResult:
        """Parse every tracked JSON file that matters to the toolkit."""
        targets = paths or [
            "docs/suno-limits.json",
            "projects/suno-helper/extension/package.json",
            "projects/suno-helper/extension/tsconfig.json",
            ".suno-helper/goal.json",
            ".suno-helper/subgoals.json",
        ]
        bad: list[str] = []
        checked = 0
        for rel in targets:
            path = self.root / rel
            if not path.exists():
                continue
            checked += 1
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError) as exc:
                bad.append(f"{rel}: {exc}")
        return ToolResult(
            ok=not bad,
            summary=f"{checked} json files parsed" if not bad else f"{len(bad)} invalid json file(s)",
            details={"checked": checked, "problems": bad},
        )

    def skills_lint(self) -> ToolResult:
        from .skills import SkillRegistry

        registry = SkillRegistry(self.root).discover()
        report = registry.lint()
        missing = _expected_skills(registry)
        problems = list(report["problems"]) + [f"missing skill: {name}" for name in missing]
        return ToolResult(
            ok=not problems,
            summary=(
                f"{report['count']} skills valid"
                if not problems
                else f"{len(problems)} skill problem(s) across {report['count']} skills"
            ),
            details={
                "count": report["count"],
                "local": report.get("local", report["count"]),
                "problems": problems[:20],
                "missing": missing,
                "advisory": report.get("advisory", [])[:10],
            },
            artifacts=["skills/INDEX.md"],
        )

    def extension_check(self, *, run_tests: bool | None = None, timeout: int = 240) -> ToolResult:
        """Typecheck + unit test the extension when dependencies are installed."""
        ext = resolve_inside(self.root, self.extension_dir)
        pkg_path = ext / "package.json"
        if not pkg_path.exists():
            return ToolResult.fail("extension/package.json missing", error="missing-extension")
        try:
            pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            return ToolResult.fail("extension/package.json is not valid JSON", error=str(exc))
        scripts = pkg.get("scripts") or {}
        installed = (ext / "node_modules").exists()
        want_tests = self.run_checks if run_tests is None else run_tests
        if not installed:
            # The scaffold check names the parts a buildable extension must have.
            # It used to require `src/popup`, which is only one of the layouts
            # WXT accepts — when the popup moved to `entrypoints/popup` the check
            # failed even though the extension built fine. Require the capability,
            # not the path: shared code, a manifest, and at least one entrypoint.
            required = [ext / "src" / "lib", ext / "wxt.config.ts", ext / "package.json"]
            entrypoints = ext / "entrypoints"
            missing = [str(p.relative_to(ext)) for p in required if not p.exists()]
            if not entrypoints.exists() or not any(entrypoints.glob("*/")):
                missing.append("entrypoints/<one entry point>")
            return ToolResult(
                ok=not missing,
                summary=(
                    "SKIPPED — extension scaffold present, dependencies not installed "
                    "(run `npm install` to make this a real check)"
                    if not missing
                    else f"extension scaffold incomplete: {missing}"
                ),
                details={"dependencies_installed": False, "missing": missing, "scripts": sorted(scripts)},
                skipped=not missing,
            )
        nm = shutil.which("npm") or "npm"
        results: dict[str, Any] = {}
        ok = True
        for script in ("compile", "test"):
            if script not in scripts:
                continue
            if script == "test" and not want_tests:
                continue
            proc = subprocess.run(
                [nm, "run", "--silent", script],
                cwd=str(ext),
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            results[script] = {"code": proc.returncode, "tail": (proc.stdout + proc.stderr)[-1200:]}
            ok = ok and proc.returncode == 0
        return ToolResult(
            ok=ok,
            summary="extension compile+tests green" if ok else "extension checks failed",
            details={"results": results, "dependencies_installed": True},
            artifacts=[self.extension_dir],
        )

    def agent_tests(self, *, timeout: int = 600) -> ToolResult:
        """Run the agent's own unittest suite.

        The loop could verify the *extension's* tests and not its own. That is
        the same blind spot as a skipped gate: the thing that decides whether a
        turn is good was never itself checked.
        """
        import sys

        project = self.root / "projects" / "suno-helper"
        tests_dir = project / "agent" / "tests"
        if not tests_dir.exists():
            return ToolResult.fail("agent/tests missing", error="missing-tests")
        proc = subprocess.run(
            [sys.executable, "-m", "unittest", "discover", "-s", "agent/tests", "-t", "agent"],
            cwd=str(project),
            capture_output=True,
            text=True,
            timeout=timeout,
            env={**os.environ, "PYTHONPATH": "agent"},
        )
        tail = (proc.stdout + proc.stderr)[-1500:]
        match = re.search(r"Ran (\d+) tests?", tail)
        count = int(match.group(1)) if match else 0
        return ToolResult(
            ok=proc.returncode == 0,
            summary=(
                f"agent tests green: {count} tests"
                if proc.returncode == 0
                else f"agent tests failed (exit {proc.returncode})"
            ),
            details={"returncode": proc.returncode, "tests": count, "tail": tail},
            artifacts=["agent/tests"],
        )

    def research_digest(self) -> ToolResult:
        from .research import ResearchDesk

        desk = ResearchDesk(self.root)
        index_text = desk.render_index()
        path = resolve_inside(self.root, "docs/research/README.md")
        atomic_write_text(path, index_text)
        stale = desk.stale_sources()
        open_items = [q for q in desk.questions if q.status == "open"]
        return ToolResult(
            ok=len(desk.sources) > 0,
            summary=f"research digest: {len(desk.sources)} sources, {len(open_items)} open questions, {len(stale)} stale",
            details={"sources": len(desk.sources), "open": len(open_items), "stale": len(stale)},
            artifacts=["docs/research/README.md"],
        )

    def improve_report(self) -> ToolResult:
        from .ledger import Ledger

        ledger = Ledger(self.root)
        stats = ledger.stats(window=100)
        check = ledger.verify()
        path = resolve_inside(self.root, "docs/loop-report.md")
        body = [
            "# Autonomous loop report",
            "",
            f"- Turns recorded: **{check.get('turns', 0)}**",
            f"- Ledger integrity: {'ok' if check.get('ok') else 'problems: ' + ', '.join(check.get('problems', [])[:3])}",
            f"- Success rate (last 100): **{stats.get('success_rate', 0):.0%}**",
            f"- Average cycle: **{stats.get('avg_ms', 0):.0f} ms**",
            f"- Tools: {stats.get('tools') or '—'}",
            "",
            ledger.digest(turns=15),
        ]
        atomic_write_text(path, "\n".join(body) + "\n")
        return ToolResult(
            ok=bool(check.get("ok", True)),
            summary=f"loop report written ({stats.get('turns', 0)} turns sampled)",
            details={"ledger": check, "stats": stats},
            artifacts=["docs/loop-report.md"],
        )

    #: Every generated page carries this marker. A page without it was written by
    #: a human and is never overwritten.
    GENERATED_MARKER = "<!-- generated: capability_docs -->"
    DOC_SECTIONS = ("## What it does", "## Edge cases", "## Evidence")

    def capability_docs(
        self,
        *,
        only: list[str] | None = None,
        force: bool = False,
        min_chars: int = 500,
        docs_dir: str = "docs/tools",
    ) -> ToolResult:
        """Generate and verify one reference page per capability.

        The gate is deliberately structural: a page only counts when its source
        files exist, they expose the symbols the page claims, and the page has the
        required sections. Documentation that can pass without the code is worse
        than no documentation.
        """
        from .capabilities import CAPABILITIES, readiness

        project = self.root / Path(self.extension_dir).parent if self.extension_dir else self.root
        out_dir = project / docs_dir
        ready = set(readiness(project)["ready"])
        if only is None:
            # An audit only asks "are the docs of the shipped capabilities in
            # sync?" — capabilities whose evidence is incomplete are not shipped
            # and are reported separately instead of failing the rotation.
            wanted = [cap for cap in CAPABILITIES if cap.id in ready]
            if not wanted:
                return ToolResult(
                    ok=True,
                    summary="capability docs: no capability is ready in this tree (nothing to verify)",
                    details={"ready": sorted(ready), "unready": len(CAPABILITIES)},
                )
        else:
            wanted = [cap for cap in CAPABILITIES if cap.id in set(only)]
        if not wanted:
            return ToolResult.fail(
                f"no capability matches {only!r}",
                error="unknown-capability",
                details={"known": [cap.id for cap in CAPABILITIES]},
            )
        written: list[str] = []
        verified: list[str] = []
        problems: list[str] = []
        for cap in wanted:
            missing_sources = [rel for rel in cap.sources if not (project / rel).exists()]
            if missing_sources:
                problems.append(f"{cap.id}: missing source {missing_sources[0]}")
                continue
            corpus = "\n".join((project / rel).read_text(encoding="utf-8", errors="replace") for rel in cap.sources)
            absent = [symbol for symbol in cap.symbols if symbol not in corpus]
            if absent:
                problems.append(f"{cap.id}: source does not expose {absent[0]!r}")
                continue
            for rel in cap.tests:
                if not (project / rel).exists():
                    problems.append(f"{cap.id}: declared test file {rel} does not exist")
            path = out_dir / f"{cap.id}.md"
            body = render_capability(cap, project=project, extension_dir=self.extension_dir)
            existing = path.read_text(encoding="utf-8", errors="replace") if path.exists() else None
            if existing is None or force or (self.GENERATED_MARKER in existing and existing != body):
                atomic_write_text(path, body)
                written.append(_rel(self.root, path))
                existing = body
            cap_problems = len([p for p in problems if p.startswith(f"{cap.id}: ")])
            if existing is None:
                problems.append(f"{cap.id}: doc missing")
                continue
            if self.GENERATED_MARKER not in existing and existing != body:
                problems.append(f"{cap.id}: doc is hand-edited (no generated marker) — left alone")
                continue
            absent_sections = [section for section in self.DOC_SECTIONS if section not in existing]
            if len(existing) < min_chars:
                problems.append(f"{cap.id}: doc is {len(existing)} chars (< {min_chars})")
            if absent_sections:
                problems.append(f"{cap.id}: doc missing section {absent_sections[0]!r}")
            if len([p for p in problems if p.startswith(f"{cap.id}: ")]) == cap_problems:
                verified.append(cap.id)
        ok = not problems
        return ToolResult(
            ok=ok,
            summary=(
                f"capability docs verified: {len(verified)} page(s), {len(written)} written"
                if ok
                else f"capability docs: {len(problems)} problem(s) across {len(wanted)} capability(ies)"
            ),
            details={
                "verified": verified,
                "written": written,
                "problems": problems[:12],
                "requested": [cap.id for cap in wanted],
            },
            artifacts=[f"{self.extension_dir.split('/')[0]}/{docs_dir}/{cap.id}.md" for cap in wanted][:4],
        )

    def repo_scan(self, *, max_files: int = 4000) -> ToolResult:
        """Cheap inventory: file counts per top-level area and largest files."""
        areas: dict[str, int] = {}
        largest: list[tuple[int, str]] = []
        count = 0
        for path in self.root.rglob("*"):
            if any(part in {".git", "node_modules", ".suno-helper"} for part in path.parts):
                continue
            if not path.is_file():
                continue
            count += 1
            rel = path.relative_to(self.root)
            area = rel.parts[0] if len(rel.parts) > 1 else "(root)"
            areas[area] = areas.get(area, 0) + 1
            if path.suffix in {".md", ".py", ".ts", ".tsx", ".json"}:
                try:
                    largest.append((path.stat().st_size, str(rel)))
                except OSError:
                    pass
            if count >= max_files:
                break
        largest.sort(reverse=True)
        return ToolResult(
            ok=True,
            summary=f"repo scan: {count} files across {len(areas)} areas",
            details={"areas": areas, "largest": largest[:10]},
        )

    # --------------------------------------------------------------- helpers
    def write_report(self, *, rel_path: str, content: str) -> ToolResult:
        path = resolve_inside(self.root, rel_path)
        atomic_write_text(path, content if content.endswith("\n") else content + "\n")
        return ToolResult(ok=True, summary=f"wrote {rel_path}", artifacts=[rel_path])


def _rel(root: Path, path: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def _expected_skills(registry) -> list[str]:
    """Skills the loop's subgoals rely on by name."""
    required = [
        "using-superpowers",
        "find-skills",
        "goal-subgoal-loop",
        "ultraplan",
        "ultraresearch",
        "ultrawork",
        "verify-before-done",
        "self-improvement-recursive",
        "dispatching-agents",
        "suno-prompt-engineering",
        "local-first-extension",
    ]
    return [name for name in required if registry.get(name) is None]


def insert_marker(path: Path, name: str, content: str) -> str:
    """Insert or replace a ``<!-- name:begin -->`` block in *path*."""
    block = f"<!-- {name}:begin -->\n{content.rstrip()}\n<!-- {name}:end -->"
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    pattern = re.compile(rf"<!--\s*{re.escape(name)}:begin\s*-->.*?<!--\s*{re.escape(name)}:end\s*-->", re.DOTALL)
    if pattern.search(text):
        return pattern.sub(block, text)
    return (text.rstrip() + "\n\n" + block + "\n") if text else block + "\n"


def render_capability(cap, *, project: Path, extension_dir: str) -> str:
    """Render one capability page from the registry + real source excerpts."""
    lines = [
        f"# {cap.title}",
        "",
        f"`capability: {cap.id}` · `phase: {cap.phase}`",
        "",
        f"> {cap.summary}",
        "",
        "## What it does",
        "",
    ]
    lines += [f"- {item}" for item in cap.behaviours]
    lines += ["", "## Edge cases", ""]
    lines += [f"- {item}" for item in cap.edge_cases]
    lines += ["", "## Evidence", "", "| Item | Path |", "|------|------|"]
    for rel in cap.sources:
        lines.append(f"| implementation | `{rel}` |")
    for rel in cap.tests:
        lines.append(f"| tests | `{rel}` |")
    lines.append(f"| declared symbols | {', '.join(f'`{s}`' for s in cap.symbols)} |")
    if cap.related:
        lines.append(f"| related | {', '.join(cap.related)} |")
    lines += [
        "",
        "## How this page stays true",
        "",
        "This page is generated by `capability_docs`, which refuses to write it unless",
        "every file above exists and the source text contains every declared symbol.",
        "Edit `agent/suno_helper/capabilities.py`, not this file.",
        "",
        "<!-- generated: capability_docs -->",
    ]
    return "\n".join(lines) + "\n"
