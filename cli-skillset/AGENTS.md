# AGENTS.md — CLI assistants in suno-knowledge-base

You are a coding/creative agent working in Ralph Madziar’s Suno knowledge base.

## First actions

1. Read `cli-skillset/SKILL.md` (router).
2. Read `README.md` and `WORKSPACE_STATUS.md` at repo root if the task spans projects.
3. Load **one** matching skill under `cli-skillset/skills/` — do not dump every skill into context.
4. Open the **canonical source files** that skill cites. Prefer those over memory.

## Hard rules

- **Canonical album toolkit:** `projects/claude-ai-music-skills`. Ignore `archive/` unless the user asks for Codex/zh-CN variants.
- **Do not** treat `pseuno-ai` as production-ready (incomplete).
- **Do not** commit artist names into Suno *style* prompts when avoidable — describe sound. Generation prompts persist as metadata.
- **Model format:** v4.5 = comma-tag lists; v5 / v5.5 = narrative prose. Front-load genre + vocal in the first ~3 words of Style.
- **Lyrics cues:** short parentheticals only (`(whispered)`, `(spoken)`). Arrangement lives in Style, not lyrics.
- **Personal/private catalog data** (playlist-only songs) stays off public artifacts.
- **No exploits / scrapers that attack Suno.** Catalog pulls only when the user already has a documented skill flow and consents.
- Stay on the current git branch. Do not rewrite archived trees.

## Context budget

| Need | Read |
|------|------|
| Prompt one song | `skills/suno-prompt` + `suno-song-creator-skill/references/models/<model>.md` |
| Write lyrics | `skills/lyrics-writer` + prompting guide |
| Full album | `skills/album-pipeline` then specific skills in `claude-ai-music-skills/skills/` |
| Edit a product | `skills/project-router` then that project’s README |
| “Where is X?” | `skills/repo-map` |

## Output for music tasks

Default deliverable for a finished song:

1. Title
2. Target model (`v5.5` unless user/profile says otherwise)
3. Style prompt (format matching model)
4. Lyrics with `[Section]` tags
5. Arrangement notes (optional)
6. 2–3 variation hooks (optional)
7. Paths of files you actually used

## Code tasks

- Python album tools: ruff / pytest inside the project.
- TS web apps: follow each project’s `package.json` scripts.
- Do not add root CI unless asked.
- Do not vendor more awesome-lists.

## Communication

Be concrete. Prefer file paths and copy-pasteable prompts. Ask at most one clarifying question when model, language, or commercial intent is unknown.
