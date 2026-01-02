# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MAG Music Records** — Professional music production workflow for Suno AI content creation.

**Foundation Sound:** Rick Ross "Hood Billionaire" Luxury Trap (74-96 BPM, orchestral, heavy 808s)

**Active Projects:**
- `MAG_Hood_Boss_Vol_1` — Portuguese luxury trap (12 tracks)
- `MAG_Hood_Boss_UK_Vol_1` — UK English luxury trap (12 tracks)

---

## COMPLIANCE — READ FIRST

**CRITICAL:** All content must be 100% ORIGINAL. See `docs/COMPLIANCE_AND_SAFETY.md`

### Golden Rule
> **Copy the FEELING, never the FINGERPRINT.**

### Forbidden
- Copying/paraphrasing existing lyrics
- Recreating melodies from existing songs
- Translating lyrics from other songs
- Matching multiple elements from a single song
- **Violence/weapons** (no guns, skeng, war, attack, warfare references)
- Explicit drug references

### Allowed
- Genre characteristics (luxury trap, cinematic)
- Mood/energy descriptions (boss energy, triumphant)
- Vocal tone descriptions (deep, commanding)
- BPM ranges (not matched with other elements)

---

## Critical Style Rules

**THIS IS NOT DRILL.** All MAG productions follow Rick Ross luxury trap style:
- **BPM:** 74-96 (NEVER exceed 100)
- **808s:** Heavy, sustained, booming (NOT sliding drill 808s)
- **Production:** Orchestral strings, brass fanfares, piano, cinematic
- **Vocals:** Deep, commanding, authoritative male voice
- **Delivery:** Slow, deliberate, measured (NOT fast/aggressive)

---

## Slash Commands

### Core Production
| Command | Purpose |
|---------|---------|
| `/track [N]` | Full workflow: prompt + lyrics + description |
| `/prompt [N]` | Generate Suno prompt (WANDA mode) |
| `/lyrics [N]` | Generate lyrics (WANDA mode) |
| `/desc [N]` | Generate description (max 1000 chars) |

### Suno Automation
| Command | Purpose |
|---------|---------|
| `/suno` | Open Suno, prepare workspace |
| `/suno [N]` | Open Suno with Track N loaded |
| `/generate [N]` | Generate track N in Suno (browser automation) |
| `/generate-all` | Batch generate all tracks |
| `/listen [N]` | Play track versions in Suno |
| `/select [N] [V]` | Select best version (e.g., `/select 2 v1`) |
| `/extend [N]` | Extend track to full length |
| `/download [N]` | Download final audio from Suno |

### Artwork
| Command | Purpose |
|---------|---------|
| `/cover [N]` | Generate cover art for track N |
| `/cover-album` | Generate album cover art |
| `/upload-cover [N]` | Upload cover to Suno for track N |

### Management
| Command | Purpose |
|---------|---------|
| `/status` | Show project progress |
| `/qc [N]` | Quality control check |
| `/qc all` | QC all tracks |
| `/release [N]` | Prepare track for distribution |
| `/release album` | Prepare full album |

### Creative
| Command | Purpose |
|---------|---------|
| `/style` | Review artist style profile |
| `/idea [text]` | Add creative idea to backlog |

---

## WANDA Mode

WANDA (Write And No Discussion Added) outputs raw, copy-paste-ready content.

**Activation:** Prefix with `WANDA:`
```
WANDA: Prompt Track 2    → Raw Suno prompt
WANDA: Lyrics Track 2    → Raw lyrics with section markers
WANDA: Description Track 2 → Description (max 1000 chars)
```

**Rules:** No preamble, no outro, no markdown code blocks. Direct paste into Suno/DistroKid.

---

## Album Factory System

For creating new albums with regional/language variations:

1. **Read foundation:** `docs/MASTER_STYLE_GUIDE.md`
2. **Get variation spec:** `docs/ALBUM_FACTORY/VARIATIONS/[VARIATION].md`
3. **Create project folder:** `projects/mixtapes/MAG_[Name]_Vol_[N]/`
4. **Generate content:** Prompts → Lyrics → Suno → QC

**Available variations:** `UK_ENGLISH` (more can be added)

**Quick start:** `docs/ALBUM_FACTORY/NEW_ALBUM_PROMPT.md`

---

## Agent System

Production enhancement agents for professional quality output:

| Command | Agent | Purpose |
|---------|-------|---------|
| `@beat` | BeatDoctor | Sound design, instrumentation notes |
| `@humanize` | HumanTouch | De-robotize lyrics, add natural imperfections |
| `@vocals` | VocalCoach | Ad-libs, delivery notes, energy curves |
| `@culture` | CultureCheck | Regional slang accuracy, authenticity |
| `@mix` | MixEngineer | Post-production notes, EQ suggestions |
| `@qc` | QualityGate | Quality control checklist |
| `@release` | ReleaseOps | Distribution preparation |
| `@repo` | RepoOps | Repository maintenance |

Agent definitions: `.claude/agents/`

---

## Key Reference Files

| File | Purpose |
|------|---------|
| `docs/COMPLIANCE_AND_SAFETY.md` | **CRITICAL** - Copyright compliance rules |
| `docs/MASTER_STYLE_GUIDE.md` | Canonical sound identity (Rick Ross foundation) |
| `docs/SUNO_AI_GUIDE.md` | Suno AI prompting best practices |
| `docs/ALBUM_FACTORY/README.md` | Album factory system guide |
| `.claude/commands/*.md` | Slash command definitions |
| `.claude/agents/index.md` | Agent system overview |

---

## Suno Prompt Template

```
[Language] Luxury Trap, Cinematic Hip-Hop, [BPM] BPM, Grand Orchestral Strings, Brass Fanfare, Deep Commanding Male Vocals, Heavy 808 Bass, [Mood], [Special Elements], Professional Mix
```

---

## Production Workflow

```
/track N                    # Generate prompt, lyrics, description
    ↓
/generate N                 # Create in Suno (2 versions)
    ↓
/listen N                   # Review versions
    ↓
/select N v1                # Pick best version
    ↓
/extend N                   # Extend to full length
    ↓
/cover N                    # Generate cover art
    ↓
/upload-cover N             # Upload cover to Suno
    ↓
/download N                 # Download final audio
    ↓
/qc N                       # Quality control check
    ↓
/release N                  # Prepare for distribution
```

**Batch workflow:**
```
/track 1-12 → /generate-all → /select-all → /extend-all → /download all → /release album
```

---

## File Naming

```
track_[NN]_[short_name]_[type].[ext]
```
Examples: `track_02_hood_boss_prompt.txt`, `track_02_hood_boss_lyrics.txt`

---

## Character Limits

| Field | Limit |
|-------|-------|
| Track Description | 1000 chars (hard limit) |
| Prompt Content | 4000 chars |
| Lyrics Content | 8000 chars |

---

## Project Folder Structure

```
projects/mixtapes/MAG_[Album]_Vol_[N]/
├── 00_admin/
│   └── TRACKLIST.md
├── 01_prompts/
├── 02_lyrics/
├── 03_audio_exports/     (not committed)
├── 04_artwork/
├── 05_metadata/
│   └── release_tracker.md
├── 06_release/
├── 07_archive/
├── 08_decisions/
└── project_state.json    (track status)
```

---

## Git Rules

**Committed:** Prompts, lyrics, descriptions, metadata, artwork (PNG/JPG), documentation

**NOT Committed:** Audio files (wav/mp3/flac), .env, secrets

Pre-commit hooks block audio files and secrets automatically.

**Setup hooks (one-time):**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1
```

---

## Command Files

All slash commands defined in `.claude/commands/`:
```
.claude/commands/
├── track.md        # /track - Full track workflow
├── prompt.md       # /prompt - Generate Suno prompt
├── lyrics.md       # /lyrics - Generate lyrics
├── desc.md         # /desc - Generate description
├── status.md       # /status - Project status
├── qc.md           # /qc - Quality control
├── suno.md         # /suno - Open Suno workspace
├── style.md        # /style - Artist style profile
├── idea.md         # /idea - Add creative idea
├── release.md      # /release - Release preparation
├── generate.md     # /generate - Generate track in Suno
├── generate-all.md # /generate-all - Batch generate
├── listen.md       # /listen - Play versions
├── select.md       # /select - Select best version
├── extend.md       # /extend - Extend to full length
├── download.md     # /download - Download from Suno
├── cover.md        # /cover - Generate track cover art
├── cover-album.md  # /cover-album - Generate album cover
└── upload-cover.md # /upload-cover - Upload cover to Suno
```
