---
name: quality-gates
description: Pre-generation, lyrics, audio, and release checks. Use before Suno generate or calling a track done.
---

# Quality gates

Implementations live in `projects/claude-ai-music-skills/skills/` (`pre-generation-check`, `lyric-reviewer`, `explicit-checker`, `plagiarism-checker`, `voice-checker`, `validate-album`, `mastering-engineer`). Use this checklist when those tools are not running.

## Pre-generation

- [ ] Model chosen; Style matches that model’s format
- [ ] No unwanted artist names in Style
- [ ] Genre + vocal + instruments + BPM (if needed) present
- [ ] ≤2–3 negatives; no contradictory adjectives
- [ ] Lyrics tagged; ≲3000 chars; cues short
- [ ] Explicit flag decided
- [ ] Documentary claims sourced + user-approved
- [ ] Pronunciation risks marked (names, toponyms, dense clusters)

## Lyrics (13-point digest)

- [ ] POV consistent
- [ ] Chorus earns repeat (hook, not paragraph)
- [ ] Syllables singable; no tongue-twisters on downbeats
- [ ] Section order makes musical sense
- [ ] No leftover `[TODO]` / placeholder names
- [ ] Language matches requested locale
- [ ] Humor/turn lands if promised
- [ ] Cross-track repetition checked on albums

## Audio / master (after import)

- [ ] No clip / digital hash
- [ ] Leading/trailing silence trimmed
- [ ] Streaming loudness ~ **-14 LUFS** (unless genre bible says else)
- [ ] Mono-compatible low end; no phase collapse
- [ ] Vocal intelligible vs beat
- [ ] Stems labeled if exported

## Rights

- Credit “generated with Suno” when required by ToS
- Human lyricist credited
- Save prompt + date + model with the file
- Commercial use: user confirms plan + terms

## Fail closed

If a gate fails, say which box and the smallest fix. Do not “ship anyway” unless the user overrides explicitly.
