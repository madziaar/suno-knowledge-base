# Workspace Status Dashboard

> Maintenance dashboard for this repository. See [`README.md`](README.md) for
> the project index and the main knowledge base.

## Overview

- **Projects:** 12
- **Markdown documentation files:** ~2,300
- **Python files:** ~700
- **TypeScript/TSX files:** ~530
- **Working tree size:** ~74 MB (`.git`: ~13 MB)

## Project Status

### Healthy ✅

| Project | Language | Notes |
|---------|----------|-------|
| claude-ai-music-skills | Python | Main album-production toolkit. **Canonical copy** of the 3 duplicates; has CI + pre-commit |
| MAG-Music-Records | Workflow/tooling | Music label workflow for Suno content |
| SunoSync | Python | Desktop audio sync / download / radio |
| sonicforge | Web (Node) | Sonic Forge V5 prompt generator (AI Studio app) |
| suno-prompting | TypeScript | Desktop Suno V5 prompt builder (Electrobun) |
| Suno-Architect | TypeScript | Vite + Cloudflare Workers prompt generator |
| Sumini-Pro-Suno-Architect | TypeScript | AI Studio app — lyric structures + style prompts |
| Cynaps3-OpenClaw-Plugin | TypeScript | `@cynaps3/openclaw-plugin` |
| suno-song-creator-skill | Markdown (`SKILL.md`) | Cross-platform co-writing skill |

### Duplicates ⚠️ (needs consolidation)

| Project | Relationship | Action |
|---------|--------------|--------|
| coherence-system | ~81% identical to `claude-ai-music-skills` (v0.91.0) | Merge into canonical, then archive |
| SUNO-AI-Music-Skills-codex | ~73% identical; Codex port of `claude-ai-music-skills` | Merge or keep as thin port, then archive |

Also: `Suno-Architect` and `Sumini-Pro-Suno-Architect` are two variants of the
same app concept — reconcile into one.

### Incomplete 📦

| Project | Status | Action |
|---------|--------|--------|
| pseuno-ai | Incomplete (backend + frontend scaffold) | Complete or archive |

## Recent Improvements Applied

- Added root [`README.md`](README.md) as the project index
- Fixed malformed `docs/README.md` (was wrapped in an unclosed code fence)
- Removed stray ` ``` ` fence lines from `.gitignore`

## Technical Debt Summary

| Category | Detail | Priority |
|----------|--------|----------|
| Duplicate projects | 3 copies of the album-production toolkit (~45 MB) | High |
| Duplicate content | `docs/*.md` ↔ `resources/sunopormpten/*.md` (9 identical files); one PDF committed twice | High |
| Oversized test file | `tests/unit/state/test_server.py` (~17K lines / 676 KB, triplicated) | High |
| No root-level CI | Markdown link-check + lints only run inside individual projects | Medium |
| Stale/incomplete wiki | `llm-wiki/` README references files that don't exist (`getting-started.md`, `building-apps.md`, `projects/`, …) | Medium |
| Vendored third-party lists | 3 "awesome" lists committed directly instead of submodules | Low |
| TODO/FIXME comments | ~66 across code | Low |

## Recommended Next Steps

1. **High priority**
   - [ ] Consolidate the 3 duplicate projects → keep `claude-ai-music-skills`
   - [ ] Reconcile `Suno-Architect` ↔ `Sumini-Pro-Suno-Architect`
   - [ ] De-duplicate `docs/` ↔ `resources/sunopormpten/` and the duplicate PDF
   - [ ] Split the 17K-line `test_server.py` into suites

2. **Medium priority**
   - [ ] Add repo-level CI (Markdown link-check, lint, format)
   - [ ] Fix `llm-wiki/` links or move it out of this repo
   - [ ] Resolve remaining TODO/FIXME comments

3. **Low priority**
   - [ ] Convert vendored "awesome" lists / PDFs to submodules or external storage
   - [ ] Tidy `.gitignore` (duplicate entries) and standardize project licenses

## Quick Commands

```bash
# Lint (Python projects)
ruff check .

# Format
black .

# Run tests (within a project)
pytest tests/ -v

# Type check
mypy servers/bitwize-music-server tools --ignore-missing-imports
```

---
*Last updated: 2026-08-18*
