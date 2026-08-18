# CLI skillset — Suno knowledge base

Portable skills for **CLI coding agents** and **CLI assistants** (Claude Code, Codex, Gemini CLI, Cursor agent, Aider, OpenClaw, etc.). Distilled from this entire repository: `docs/`, `projects/`, `resources/`, `llm-wiki/`, and `archive/`.

## Install / load

Point the agent at this folder. Typical patterns:

| Client | How to load |
|--------|-------------|
| Claude Code | Copy or symlink `cli-skillset/` into `.claude/skills/` or add `AGENTS.md` as project instructions |
| Codex / OpenAI CLI | Use `AGENTS.md` as the repo agent file (or merge into an existing one) |
| Gemini CLI | Add `AGENTS.md` + `skills/` as context files |
| Generic | Tell the agent: *read `cli-skillset/AGENTS.md` then the matching `skills/*/SKILL.md`* |

Do **not** copy archived duplicates (`archive/coherence-system`, `archive/SUNO-AI-Music-Skills-codex`). Canonical album toolkit is `projects/claude-ai-music-skills`.

## Skill index

| Skill | When to load |
|-------|----------------|
| [`skills/repo-map`](skills/repo-map/SKILL.md) | Orient in this monorepo; find the right file |
| [`skills/project-router`](skills/project-router/SKILL.md) | Pick which app/plugin to edit or run |
| [`skills/suno-prompt`](skills/suno-prompt/SKILL.md) | Style prompts, models v4.5 / v5 / v5.5 |
| [`skills/lyrics-writer`](skills/lyrics-writer/SKILL.md) | Section tags, delivery cues, craft |
| [`skills/album-pipeline`](skills/album-pipeline/SKILL.md) | Concept → research → lyrics → generate → master → release |
| [`skills/label-workflow`](skills/label-workflow/SKILL.md) | MAG mixtape / track-by-track production |
| [`skills/quality-gates`](skills/quality-gates/SKILL.md) | Pre-gen, lyrics, audio, legal checks |

Root router: [`SKILL.md`](SKILL.md). Standing orders: [`AGENTS.md`](AGENTS.md).

## Source of truth (do not invent)

1. [`docs/Suno-Knowledge-Base.md`](../docs/Suno-Knowledge-Base.md) — features, pricing, formulas
2. [`projects/suno-song-creator-skill/references/`](../projects/suno-song-creator-skill/references/) — prompting + per-model files
3. [`projects/claude-ai-music-skills/`](../projects/claude-ai-music-skills/) — 50+ production skills, MCP, genres
4. [`WORKSPACE_STATUS.md`](../WORKSPACE_STATUS.md) — health, debt, archive policy
5. [`resources/`](../resources/) — community prompt lists (vendored)

## License

Same as the parent repo (CC0) unless a referenced project says otherwise.
