---
name: album-pipeline
description: Full album production via claude-ai-music-skills. Concept, research, lyrics, Suno, master, promo.
---

# Album pipeline

**Canonical tree:** `projects/claude-ai-music-skills`  
**Do not** implement against `archive/coherence-system` or `archive/SUNO-AI-Music-Skills-codex`.

## Flow

```
session-start / setup / configure
        ↓
album-ideas → album-conceptualizer → new-album
        ↓
researcher (+ domain researchers) → verify-sources  [human sign-off]
        ↓
lyric-writer → lyric-refiner → lyric-reviewer
pronunciation-specialist → explicit-checker → plagiarism-checker
        ↓
suno-engineer → pre-generation-check
        ↓
[user generates on Suno]
        ↓
import-audio / import-track / import-art
mix-engineer → mastering-engineer
        ↓
promo-writer → promo-reviewer → promo-director
release-director → validate-album
```

Invoke in-plugin as `/bitwize-music:<skill>` when that plugin is installed. In a generic CLI, **read** `projects/claude-ai-music-skills/skills/<name>/SKILL.md` and follow it.

Index: `projects/claude-ai-music-skills/docs/skills.md`  
Decision tree: `projects/claude-ai-music-skills/reference/SKILL_INDEX.md`  
Suno V5 notes: `projects/claude-ai-music-skills/reference/suno/v5-best-practices.md`  
Genres: `projects/claude-ai-music-skills/genres/` (~72)

## Model tiers (when using Claude Code plugin)

| Work | Bias |
|------|------|
| Lyrics, concepts, legal/verify | strongest model |
| Research coord, pronunciation | mid |
| Import, clipboard, validate | fastest |

## Quality

Nothing ships without gates in `cli-skillset/skills/quality-gates/SKILL.md`.

## Documentary albums

No lyrics until sources are captured, cross-checked, and the user signs off. Every claim traces to a file.

## Install (optional)

```text
/plugin marketplace add bitwize-music-studio/claude-ai-music-skills
/plugin install bitwize-music@claude-ai-music-skills
/bitwize-music:setup
```

Linux/macOS or WSL; Python 3.10+.
