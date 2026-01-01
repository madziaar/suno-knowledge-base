# New Album Prompt Template

**Copy this to a new Claude Code instance to create a new album.**

---

## Quick Start (Copy This to New Claude Instance)

```
I want to create a new MAG Music Records album.

**Album Name:** MAG Hood Boss UK Vol. 1
**Variation:** UK_ENGLISH

First, read these files in order:
1. docs/ALBUM_FACTORY/README.md (instructions)
2. docs/MASTER_STYLE_GUIDE.md (foundation - Rick Ross luxury trap)
3. docs/ALBUM_FACTORY/VARIATIONS/UK_ENGLISH.md (UK slang and adaptations)

Then create the full album:
- Project folder in projects/mixtapes/MAG_Hood_Boss_UK_Vol_1/
- All 12 track prompts
- All 12 track lyrics
- Tracklist and metadata files

Generate everything. I'll handle Suno generation myself.
```

---

## Available Variations

| Variation ID | Language | Status |
|--------------|----------|--------|
| `EUROPEAN_PT` | European Portuguese | DONE (MAG Hood Boss Vol. 1) |
| `UK_ENGLISH` | UK English + Roadman slang | READY |

---

## The Two Albums

### 1. MAG Hood Boss Vol. 1 (Portuguese) — COMPLETED
- Location: `projects/mixtapes/MAG_Hood_Boss_Vol_1/`
- Language: European Portuguese
- All 12 tracks generated in Suno

### 2. MAG Hood Boss UK Vol. 1 (UK English) — TO CREATE
- Location: `projects/mixtapes/MAG_Hood_Boss_UK_Vol_1/`
- Language: UK English with roadman slang
- Use `UK_ENGLISH` variation

---

## UK Album Prompt (Copy This)

```
I want to create MAG Hood Boss UK Vol. 1.

Read these files first:
1. docs/ALBUM_FACTORY/README.md
2. docs/MASTER_STYLE_GUIDE.md
3. docs/ALBUM_FACTORY/VARIATIONS/UK_ENGLISH.md

IMPORTANT RULES:
- Keep Rick Ross luxury trap sound (80-95 BPM, NOT drill tempo)
- Use UK English with roadman slang (mandem, fam, ends, etc.)
- Keep deep commanding vocals, heavy 808s, orchestral elements
- Only change the LANGUAGE, not the SOUND

Create full album:
- Project folder structure
- All 12 prompts
- All 12 lyrics
- Tracklist and metadata

Reference the Portuguese album at projects/mixtapes/MAG_Hood_Boss_Vol_1/ for track themes and structure.
```

---

## What Claude Will Create

```
projects/mixtapes/MAG_Hood_Boss_UK_Vol_1/
├── 00_admin/
│   ├── TRACKLIST.md
│   └── STYLE_REFERENCE.md
├── 01_prompts/
│   ├── track_01_introduction_prompt.txt
│   ├── track_02_hood_boss_prompt.txt
│   └── ... (all 12 tracks)
├── 02_lyrics/
│   ├── track_01_introduction_lyrics.txt
│   ├── track_02_hood_boss_lyrics.txt
│   └── ... (all 12 tracks)
├── 05_metadata/
│   └── release_tracker.md
└── README.md
```

---

## After Creation — Suno Workflow

1. Open Suno.ai
2. Create workspace "MAG Hood Boss UK Vol. 1"
3. For each track:
   - Copy prompt → paste in Style field
   - Copy lyrics → paste in Lyrics field
   - Click Create (generates 2 versions)
4. Listen and pick best version
5. Extend to full length (3-4 min)
6. Download finals

---

## Key Files to Reference

| File | Purpose |
|------|---------|
| `docs/MASTER_STYLE_GUIDE.md` | Rick Ross luxury trap foundation |
| `docs/ALBUM_FACTORY/README.md` | Album creation instructions |
| `docs/ALBUM_FACTORY/VARIATIONS/UK_ENGLISH.md` | UK slang dictionary & adaptations |
| `projects/mixtapes/MAG_Hood_Boss_Vol_1/` | Portuguese album (reference) |

---

*Album Factory v1.0 — MAG Music Records*
