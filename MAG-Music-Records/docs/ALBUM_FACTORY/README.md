# Album Factory — Quick Start Guide

**For New Claude Code Instances**

---

## Welcome

You are about to create a new MAG Music Records album. This system allows you to generate complete albums (prompts, lyrics, descriptions) by combining the **Master Style Guide** with a **Variation Spec**.

---

## Step 1: Read the Foundation

**REQUIRED:** Before doing anything, read the master style guide:

```
docs/MASTER_STYLE_GUIDE.md
```

This contains:
- Core sound identity (Rick Ross luxury trap foundation)
- BPM ranges (74-96, NEVER faster)
- Vocal style specifications
- Production elements
- Lyrical themes
- Song/album structure templates
- Suno AI prompt templates
- Quality control standards

---

## Step 2: Get Your Variation Spec

The user will tell you which variation to use. Available variations:

| Variation | File | Description |
|-----------|------|-------------|
| European Portuguese | N/A (use master directly) | Already done: MAG Hood Boss Vol. 1 |
| UK English | `VARIATIONS/UK_ENGLISH.md` | UK roadman slang, London references |

**Read the variation file** to understand what changes from the master.

---

## Step 3: Create the Project

### Folder Structure

Create in `projects/mixtapes/`:

```
MAG_[Album_Name]_Vol_[N]/
├── 00_admin/
│   ├── TRACKLIST.md
│   └── STYLE_REFERENCE.md (copy + modify from master)
├── 01_prompts/
│   └── track_NN_[name]_prompt.txt
├── 02_lyrics/
│   └── track_NN_[name]_lyrics.txt
├── 03_audio_exports/     (local only, not committed)
├── 04_artwork/
├── 05_metadata/
│   └── release_tracker.md
├── 06_release/
├── 07_archive/
└── 08_decisions/
```

### Naming Convention

```
track_[NN]_[short_name]_[type].txt
```

Examples:
- `track_01_intro_prompt.txt`
- `track_01_intro_lyrics.txt`
- `track_02_boss_anthem_prompt.txt`

---

## Step 4: Generate Content

### For Each Track:

1. **Create Prompt** — Use master template + variation adjustments
2. **Create Lyrics** — Follow themes, apply language/slang from variation
3. **Create Description** — Max 1000 characters for distribution

### Prompt Formula

```
[Variation Language] Luxury Trap, Cinematic Hip-Hop, [BPM] BPM, [Instruments from Master], [Vocal Style], [Mood], [Variation-Specific Elements], Professional Mix
```

### Lyrics Formula

```
[Section Tags: Intro, Verse, Hook, Bridge, Outro]
[Language from Variation]
[Themes from Master]
[Slang/References from Variation]
[Ad-libs: UGH!, MAG, etc.]
```

---

## Step 5: Quality Control

Before finalizing, verify against master standards:

- [ ] BPM within range (74-96)
- [ ] Deep commanding vocals specified
- [ ] Heavy 808s present
- [ ] Orchestral/cinematic elements
- [ ] Core themes represented
- [ ] Variation language/slang applied correctly
- [ ] Hooks are memorable
- [ ] Structure follows template

---

## Quick Command Reference

User says → You do:

| User Command | Action |
|--------------|--------|
| "Create [Album Name] using [Variation]" | Full album generation |
| "Generate Track N" | Single track (prompt + lyrics) |
| "WANDA: Prompt Track N" | Output ONLY the Suno prompt |
| "WANDA: Lyrics Track N" | Output ONLY the lyrics |
| "WANDA: Description Track N" | Output ONLY description (≤1000 chars) |

---

## Example Workflow

**User:** "Create MAG Hood Boss UK Vol. 1 using UK_ENGLISH variation"

**You:**
1. Read `docs/MASTER_STYLE_GUIDE.md`
2. Read `docs/ALBUM_FACTORY/VARIATIONS/UK_ENGLISH.md`
3. Create project folder structure
4. Generate TRACKLIST.md (12 tracks, UK-adapted titles)
5. Generate all prompts (using master template + UK language)
6. Generate all lyrics (UK slang, London references)
7. Report completion with track list

---

## What NOT to Change

These elements are FIXED regardless of variation:

- BPM range (74-96) — NEVER go faster
- Vocal style (deep, commanding, boss-like)
- Production style (luxury trap, orchestral, heavy 808s)
- Song structure (intro → verses → hooks → outro)
- Core themes (success, boss mentality, loyalty, etc.)
- Ad-libs (UGH!, MAG)
- Quality standards

---

## What TO Change (Per Variation)

These adapt based on variation spec:

- Language (UK English, Brazilian PT, French, etc.)
- Slang and colloquialisms
- Cultural references
- Location references
- Track titles (translated/adapted)
- Specific imagery and metaphors

---

## Reference Links

| Document | Path |
|----------|------|
| Master Style Guide | `docs/MASTER_STYLE_GUIDE.md` |
| Suno AI Guide | `docs/SUNO_AI_GUIDE.md` |
| WANDA Reference | `docs/wanda/WANDA_REFERENCE.md` |
| Variations | `docs/ALBUM_FACTORY/VARIATIONS/` |
| Existing Albums | `projects/mixtapes/` |

---

## Troubleshooting

**"The sound is too fast/aggressive"**
→ Check BPM. Must be 74-96. This is NOT drill or grime.

**"Vocals don't sound right"**
→ Re-read vocal specs in master. Deep, commanding, measured. Not aggressive.

**"Missing the luxury feel"**
→ Add orchestral elements (strings, brass, piano) to prompts.

**"Language sounds wrong"**
→ Check variation spec for correct slang and references.

---

*Album Factory v1.0 — MAG Music Records*
