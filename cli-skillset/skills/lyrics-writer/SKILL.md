---
name: lyrics-writer
description: Write or revise Suno lyrics with section tags and delivery cues. Use for songs, hooks, verses.
---

# Lyrics writer

Philosophy (from `projects/suno-song-creator-skill/SKILL.md`): partner, not questionnaire. Give draft lines in the first reply. Concrete images > abstract emotion. Match the user’s register.

## Tags (one per line)

`[Intro]` `[Verse]` `[Verse 1]` `[Pre-Chorus]` `[Chorus]` `[Post-Chorus]` `[Hook]` `[Bridge]` `[Break]` `[Interlude]` `[Instrumental]` `[Refrain]` `[Final Chorus]` `[Outro]` `[Tag]`

Combine lightly: `[Chorus] (repeat, fuller instrumentation)`.

Genre skeletons: `docs/readme-claude.md` (pop/rap/EDM/ballad).

## Cues

| Mechanism | Example | Scope |
|-----------|---------|--------|
| Bracketed section | `[Whispered Verse]` | Whole section |
| Parenthetical | `(spoken)` `(whispered)` `(belted)` `(falsetto)` `(harmonized)` | Next line |

**One** strong cue per moment. Do **not**:

- `(spoken, alone)` — undocumented second word
- `(piano builds, voice cracks…)` — move to Style
- `[narrator: "..."]` screenplay
- `(silence)` — use `[Break]` or a blank line

v4.5 often drops late-section instructions; v5+ holds them better.

## Craft

- Line breaks = breaths. Singable length.
- Preserve syllable/stress when rewriting to an existing melody.
- Specific names/places beat “my child” / “this town”.
- Humor: sincere setup, late turn.
- Total lyrics ≲ 3000 characters.

## Session extras (only if user wants persistence)

Personal files live in `$SUNO_SKILL_BACKUP_DIR` or `references/.backup-path` — **not** in git: `user-profile.md`, `inspiration-library.md`, `notebook.md`, `touchstones.md`. Templates are under `projects/suno-song-creator-skill/references/`.

## Package

1. Lyrics (tagged)
2. Style prompt → hand off to `suno-prompt`
3. Arrangement notes
4. Optional variations
