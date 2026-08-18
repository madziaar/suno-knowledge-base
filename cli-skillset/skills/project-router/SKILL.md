---
name: project-router
description: Choose which project to run or edit. Use for implementation, bugs, features, or "which app".
---

# Project router

| If the user wants… | Open |
|--------------------|------|
| Album conversation pipeline, MCP, 50+ skills, genres | `projects/claude-ai-music-skills` **canonical** |
| Label mixtape playbooks, WANDA track prompts | `projects/MAG-Music-Records` |
| Desktop download / library / radio / prompt vault | `projects/SunoSync` |
| Web prompt generator “Sonic Forge V5” | `projects/sonicforge` |
| Desktop plain-English → V5 prompts (Electrobun) | `projects/suno-prompting` |
| Vite + CF Workers + Suno API + Gemini + LRC | `projects/Suno-Architect` |
| Chat-style lyric/structure prompt engine | `projects/Sumini-Pro-Suno-Architect` |
| OpenClaw / TypeScript plugin | `projects/Cynaps3-OpenClaw-Plugin` |
| Cross-platform `SKILL.md` co-writing | `projects/suno-song-creator-skill` |
| Spotify-taste prompts (scaffold only) | `projects/pseuno-ai` — **incomplete** |

## Do not edit

- `archive/*` unless recovering a Codex-only file
- Root “awesome” copies that already live under `resources/`

## Typical commands

```bash
# Python album toolkit
cd projects/claude-ai-music-skills && pytest tests/ -q

# Node / Vite apps
cd projects/Suno-Architect && npm install && npm run dev   # bind 0.0.0.0 if previewing

# OpenClaw plugin
cd projects/Cynaps3-OpenClaw-Plugin && npm test
```

Always read the project’s own `README.md` (and `CLAUDE.md` if present) before changing code.

## Distinct codebases

`Suno-Architect` and `Sumini-Pro-Suno-Architect` are **not** forks of each other. Do not merge them.
