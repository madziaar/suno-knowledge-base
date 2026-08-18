---
name: suno-prompt
description: Craft Suno style prompts. Use for models, BPM, genre, instruments, restraint, character limits.
---

# Suno style prompt

## Required reads (in order)

1. `projects/suno-song-creator-skill/references/models/README.md` — picker
2. Matching model file:
   - `.../models/v5-5.md` — default latest (narrative, polish, voice clone)
   - `.../models/v5.md` — raw / lo-fi / austere (v5.5 over-polishes)
   - `.../models/v4-5.md` — comma-tag; Add Vocals / Instrumentals
3. `projects/suno-song-creator-skill/references/suno-prompting-guide.md` — shared vocab
4. Optional formulas: `docs/Suno-Knowledge-Base.md` § Prompt Engineering

## Format by model

| Model | Style field | Notes |
|-------|-------------|--------|
| v4.5 / + | Comma-separated tags | Front-load keywords |
| v5 | Narrative prose | When instruments *enter* |
| v5.5 | Narrative prose | Fight default gloss with restraint lines |

**Tokenizer:** first ~3 words weigh most → `genre/subgenre → vocal → mood → 1–2 instruments → BPM → production → dynamics → 2–3 negatives`.

## Always include

- Specific subgenre (not “rock”)
- Vocal: gender/register/character/mic
- 2–4 instruments with *character* (fingerpicked nylon, not “guitar”)
- BPM if it matters (key signature is **not** reliable)
- Production: dry/wet, space, mix
- For quiet songs: explicit lock — “final chorus same volume as verse one. No build anywhere.”

## Never / rarely

- Artist or song-title name-drops in Style (baked into public metadata)
- Contradictions (`minimal` + `orchestral explosion`) unless structured as verse vs chorus
- >2–3 negatives; collapse to `no build anywhere`
- Arrangement novels inside lyric `(parentheses)`

## Caps (treat as soft; confirm in model file)

Older Claude guides cite ~120 chars style / 1000 prompt / 5000 lyrics. **v5+ is more generous**; still keep lyrics ≲3000 chars. Prefer the per-model file over `docs/readme-claude.md` when they disagree.

## Output template

```
Model: v5.5
Style:
<prompt>

Why this format: <one line>
Negatives used: <list or none>
Variations:
- ...
```

Community extras: `resources/awesome-suno-prompts`, `resources/sunopormpten`.
