---
name: repo-map
description: Map the suno-knowledge-base tree. Use when locating docs, projects, archive, or resources.
---

# Repo map

```
.
├── README.md                 # project index
├── WORKSPACE_STATUS.md       # health + debt
├── cli-skillset/             # this CLI pack
├── docs/                     # core KB + ES syntax guide
├── projects/                 # 10 active tools
├── archive/                  # retired duplicates — do not extend
├── resources/                # vendored awesome lists / prompt PDFs
└── llm-wiki/                 # small LLM wiki (stale links — treat as incomplete)
```

## Docs

| Path | Use |
|------|-----|
| `docs/Suno-Knowledge-Base.md` | Features (v5.5), pricing, prompt formulas, competitors |
| `docs/README.md` | Long song-syntax / templates (ES-heavy) |
| `docs/readme-claude.md` | Claude + Suno Pro tags, 120-char style limit notes |

## Projects (active)

See `cli-skillset/skills/project-router/SKILL.md` for run/edit routing.

## Archive

`coherence-system` and `SUNO-AI-Music-Skills-codex` are near-duplicates of `projects/claude-ai-music-skills`. Read only for Codex/zh-CN leftovers.

## Resources

- `resources/awesome-suno-prompts` — genre prompt dumps
- `resources/Awesome-Suno`, `resources/awesome-suno-ai` — link lists
- `resources/sunopormpten` — tag cheat sheets (ES/EN)

Do not duplicate these into `docs/` again.

## Scale (from WORKSPACE_STATUS)

~2,300 markdown files, ~700 Python, ~530 TS/TSX. Prefer targeted reads. Do not glob the whole tree into context.
