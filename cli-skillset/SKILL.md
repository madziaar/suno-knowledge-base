---
name: suno-kb-cli
description: >-
  Router for CLI coding agents in the suno-knowledge-base repo. Activate for
  Suno prompts, lyrics, albums, MAG mixtapes, or any edit across docs/projects.
---

# Suno KB — CLI router

Load **one** child skill. Cite real paths.

| User intent | Skill |
|-------------|--------|
| Where is this? how is the repo laid out? | `cli-skillset/skills/repo-map/SKILL.md` |
| Which project should I change / run? | `cli-skillset/skills/project-router/SKILL.md` |
| Style prompt, BPM, genre, v4.5 vs v5 vs v5.5 | `cli-skillset/skills/suno-prompt/SKILL.md` |
| Lyrics, tags, whispers, hooks | `cli-skillset/skills/lyrics-writer/SKILL.md` |
| Album / research / master / release | `cli-skillset/skills/album-pipeline/SKILL.md` |
| Track N mixtape, WANDA, MAG | `cli-skillset/skills/label-workflow/SKILL.md` |
| QA, explicit, plagiarism, loudness | `cli-skillset/skills/quality-gates/SKILL.md` |

If the user only says “write a song”, use **lyrics-writer** + **suno-prompt** together.

Standing orders: `cli-skillset/AGENTS.md`.
