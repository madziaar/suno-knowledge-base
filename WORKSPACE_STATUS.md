# Workspace Status Dashboard

> Maintenance dashboard for this repository. See [`README.md`](README.md) for
> the project index and the main knowledge base.

## Overview

- **Active projects:** 10
- **Archived projects:** 2 (see [`archive/README.md`](archive/README.md))
- **Markdown documentation files:** ~2,300
- **Python files:** ~700
- **TypeScript/TSX files:** ~530
- **Working tree size:** ~45 MB (`.git`: ~13 MB)

## Project Status

### Healthy ✅

| Project | Language | Notes |
|---------|----------|-------|
| claude-ai-music-skills | Python | Main album-production toolkit. **Canonical copy**; has CI + pre-commit |
| MAG-Music-Records | Workflow/tooling | Music label workflow for Suno content |
| SunoSync | Python | Desktop audio sync / download / radio |
| sonicforge | Web (Node) | Sonic Forge V5 prompt generator (AI Studio app) |
| suno-prompting | TypeScript | Desktop Suno V5 prompt builder (Electrobun) |
| Suno-Architect | TypeScript | Vite + Cloudflare Workers prompt generator with Suno API integration |
| Sumini-Pro-Suno-Architect | TypeScript | AI Studio chat-style prompt engine (distinct codebase from Suno-Architect) |
| Cynaps3-OpenClaw-Plugin | TypeScript | `@cynaps3/openclaw-plugin` |
| suno-song-creator-skill | Markdown (`SKILL.md`) | Cross-platform co-writing skill |

### Archived 📦

| Project | Relationship | Location |
|---------|--------------|----------|
| coherence-system | ~81% identical to `claude-ai-music-skills` (v0.91.0) | [`archive/coherence-system`](archive/coherence-system) |
| SUNO-AI-Music-Skills-codex | ~73% identical; Codex port of `claude-ai-music-skills` | [`archive/SUNO-AI-Music-Skills-codex`](archive/SUNO-AI-Music-Skills-codex) |

### Incomplete 📦

| Project | Status | Action |
|---------|--------|--------|
| pseuno-ai | Incomplete (backend + frontend scaffold) | Complete or archive |

## Recent Improvements Applied

- Added root [`README.md`](README.md) as the project index
- Fixed malformed `docs/README.md` (was wrapped in an unclosed code fence)
- Removed stray ` ``` ` fence lines from `.gitignore`
- **Consolidated duplicates:** archived `coherence-system` and
  `SUNO-AI-Music-Skills-codex` into [`archive/`](archive/), keeping
  `claude-ai-music-skills` as canonical (~30 MB removed from `projects/`)
- **De-duplicated content:** removed 10 docs from `docs/` that were identical
  copies of files in `resources/sunopormpten/`, and removed a PDF committed twice

## Technical Debt Summary

| Category | Detail | Priority |
|----------|--------|----------|
| Oversized test file | `claude-ai-music-skills/tests/unit/state/test_server.py` (~17K lines / 676 KB) | High |
| No root-level CI | Markdown link-check + lints only run inside individual projects | Medium |
| Stale/incomplete wiki | `llm-wiki/` README references files that don't exist (`getting-started.md`, `building-apps.md`, `projects/`, …) | Medium |
| Vendored third-party lists | 3 "awesome" lists committed directly instead of submodules | Low |
| TODO/FIXME comments | ~66 across code | Low |

## Recommended Next Steps

1. **High priority**
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
