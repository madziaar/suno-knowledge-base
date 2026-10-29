---
name: suno-prompt-engineering
description: Use when writing, cleaning, validating or reviewing a Suno style prompt or lyric structure - five pillars, per-model limits, tag vocabulary and exclude lists
tags: [suno, prompt, style, lyrics, tags, limits, five-pillars]
stages: [ultraresearch, ultrawork, verify]
---

# Suno Prompt Engineering

Source of numbers: **`docs/suno-limits.json`** (canonical). Never restate a limit
from memory — read the file.

## The five pillars (Style field)

| # | Pillar | Example |
|---|--------|---------|
| 1 | Genre (1–2 anchors, dominant first) | `dark synthwave` |
| 2 | Instrumentation (≤ 4 named) | `arpeggiated Moog bass, TR-808, gated snare` |
| 3 | Mood / energy | `melancholic, nocturnal, driving` |
| 4 | Vocal character | `breathy female vocal, close-mic, whispered verses` |
| 5 | Production / era / space | `tape saturation, wide stereo, 1987 FM-radio sheen` |

Join with commas. **Front-load** the two most important pillars — Suno weights
early terms more heavily.

## Hard rules

- **Brackets belong to lyrics.** Never wrap BPM, key or a style tag in `[]`
  inside the Style field.
- **No hype words.** `masterpiece`, `best quality`, `perfect vocals`,
  `amazing production` carry zero signal. The cleaner removes them.
- **6–12 tags is the sweet spot.** Past ~18 you are restating.
- **Two genres maximum** unless the fusion is explicitly the point, and then say
  how they interact ("drum-and-bass rhythm under a shoegaze wall of guitars").
- **Describe, do not name.** Living artists are not instructions; translate into
  instrumentation, delivery and production.
- **Exclusions go in Exclude Styles**, comma-separated: `autotune, cowbell,
  acoustic guitar, choir`.

## Lyric structure tags

Structural: `[Intro]` `[Verse]` `[Verse 1]` `[Pre-Chorus]` `[Chorus]`
`[Post-Chorus]` `[Bridge]` `[Breakdown]` `[Instrumental]` `[Final Chorus]`
`[Outro]`

Performance: `[Male Vocal]` `[Female Vocal]` `[Duet]` `[Both]` `[Whispered]`
`[Spoken Word]` `[Gang Vocals]`

Rules:
- one structural tag per section; add **one** performance hint only if it earns
  its place;
- blank line between sections;
- never invent undocumented control codes, weights or timestamps;
- arrangement belongs in Style, not scattered through the lyrics.

## Model differences

| Model | Style | Lyrics | Style format |
|-------|-------|--------|--------------|
| v4 / v3.5 | 200 | 3000 | comma-separated tag list |
| v4.5 / v5 / v5.5 | 1000 | 5000 | narrative prose works better on v5+ |

Front-load in *both* formats; the difference is grammar, not strategy.

## The cleaner contract

```
input  → dedupe tags → drop hype words → collapse whitespace
       → drop brackets from style → truncate at budget (grapheme-safe)
output → { value, removed[], truncated, warnings[] }
```

Never truncate silently. Report the overflow and the number of characters lost.

## Review checklist

- [ ] first 20–30 words carry genre + vocal
- [ ] 6–12 tags, ≤ 2 genres
- [ ] no brackets, no hype words
- [ ] exclusions in their own field
- [ ] lyrics complete, sections tagged, no production prose
- [ ] within the canonical budget for the selected model
