# Creator field guide

The method behind the tools. If you only read one page, read this one.

## 1. Two fields, two jobs

Suno's custom mode gives you a **Style** field and a **Lyrics** field. They are
not interchangeable and mixing them is the most common mistake.

| Field | Carries | Does **not** carry |
|-------|---------|--------------------|
| Style | genre, instrumentation, mood, vocal character, production, tempo | lyric lines, section tags, "make it good" |
| Lyrics | words + `[Section]` tags + a single performance hint | arrangement, BPM, key, production notes |

Numbers live in [`docs/suno-limits.json`](../../../docs/suno-limits.json). In
short: v4.5/v5/v5.5 allow 1,000 characters of Style and 5,000 of lyrics; v4 and
older allow 200 and 3,000.

## 2. The five pillars

Build the Style field from five dimensions, in this order:

1. **Genre** — one or two anchors, dominant first. `dark synthwave`
2. **Instrumentation** — at most four named instruments, say how they play.
   `arpeggiated Moog bass, TR-808, gated snare`
3. **Mood** — two or three words. `melancholic, nocturnal, driving`
4. **Vocal** — gender, texture, delivery. `breathy female vocal, close-mic`
5. **Production** — era, space, mix character. `tape saturation, wide stereo`

Rules that matter more than the list:

- **Front-load.** The first 20–30 words carry the most weight.
- **6–12 tags is the sweet spot.** Past ~18 you are restating yourself.
- **No hype words.** `masterpiece`, `best quality`, `perfect vocals` describe
  nothing and spend budget. The cleaner deletes them.
- **No brackets in Style.** Brackets belong to the Lyrics field.
- **Describe, do not name.** A living artist's name is not an instruction;
  translate it into instrumentation, delivery and production.

## 3. Structure tags

Structural: `[Intro]` `[Verse]` `[Verse 1]` `[Pre-Chorus]` `[Chorus]`
`[Post-Chorus]` `[Bridge]` `[Breakdown]` `[Instrumental]` `[Final Chorus]`
`[Outro]`

Performance: `[Male Vocal]` `[Female Vocal]` `[Duet]` `[Both]` `[Whispered]`
`[Spoken Word]` `[Gang Vocals]`

- One structural tag per section. One performance hint **only if it earns it**.
- Blank line between sections.
- Tags are semantic guidance, not guaranteed control. Never claim Suno will obey
  them exactly.
- Never invent undocumented control codes, weights or timestamps.

If you write in another language, the normaliser maps `[主歌]`, `[副歌]`,
`【サビ】`, `[Estribillo]`, `[Припев]`, `[Zwrotka]`, `[Refren]`, `[Couplet]` and
friends to the canonical English tags. Ordinary lyric lines are never touched.

## 4. Exclusions belong in their own field

Put unwanted sounds in **Exclude Styles**, comma-separated: `autotune, cowbell,
acoustic guitar, choir`. Do not write "no autotune" in the Style field — the
negation spends budget and frequently summons the thing.

## 5. Test one variable at a time

This is the difference between generating and producing.

1. Write one **question**: "does a drier vocal improve clarity?"
2. Change **one** thing. Everything else stays byte-identical.
3. Generate. Record the evidence.
4. Decide: **keep**, **revert**, or **narrow** (the question was too broad).

Use [`prompt-experiments.md`](prompt-experiments.md) as the log. After ten
entries you will know more about your own sound than any prompt list can teach
you.

## 6. Length, honestly

- The lyrics field allows ~5,000 characters but ~3,000 (40–60 lines) is the
  quality sweet spot; beyond that sections get rushed or dropped.
- The duration estimator gives you syllables ÷ pace, per section, with a ±12%
  range. Treat it as a warning system, not a measurement: a bridge that reads
  "~78 s" is a bridge Suno will compress.
- Instrumental sections cost time but carry no syllables: intro ≈ 8 s,
  instrumental/solo ≈ 20 s, breakdown ≈ 12 s, outro ≈ 10 s.

## 7. What this toolkit will not do

- It will not scrape Suno, hold your session cookie, or use a reverse-engineered
  API. Those break without warning and put your account at risk.
- It will not upload your lyrics anywhere. There is no server to upload them to.
- It will not promise a specific result from a tag. Tags are probabilistic.

## 8. A workflow that works

```
1. idea (one sentence)
2. five pillars → Style (builder, locks on what you like)
3. lyrics with section tags (normaliser)
4. duration check (estimator) → trim the long section
5. exclusions (builder) → one or two, not twenty
6. generate 4 takes
7. pick one, write down the one thing you'd change
8. change only that. regenerate.
9. save the winner to the library (local)
```

Steps 7–9 are what turn a hobby into a catalogue.
