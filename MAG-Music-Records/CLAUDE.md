# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MAG Music Records** — Professional music production workflow for Suno AI content creation.

**Foundation Sound:** Rick Ross "Hood Billionaire" Luxury Trap (74-96 BPM, orchestral, heavy 808s)

**Active Projects:**
- `MAG_Hood_Boss_Vol_1` — Portuguese luxury trap (12 tracks)
- `MAG_Hood_Boss_UK_Vol_1` — UK English luxury trap (12 tracks)

## Critical Style Rules

**THIS IS NOT DRILL.** All MAG productions follow Rick Ross luxury trap style:
- **BPM:** 74-96 (NEVER exceed 100)
- **808s:** Heavy, sustained, booming (NOT sliding drill 808s)
- **Production:** Orchestral strings, brass fanfares, piano, cinematic
- **Vocals:** Deep, commanding, authoritative male voice
- **Delivery:** Slow, deliberate, measured (NOT fast/aggressive)

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/track [N]` | Full workflow for Track N |
| `/prompt [N]` | Generate Suno prompt only |
| `/lyrics [N]` | Generate lyrics only |
| `/desc [N]` | Generate description (max 1000 chars) |
| `/qc [N]` | Quality control check |
| `/status` | Show project progress |
| `/release [N]` | Prepare track for distribution |
| `/suno` | Open Suno and prepare for generation |
| `/style` | Review artist style profile |
| `/idea` | Add creative idea to backlog |

## WANDA Mode

WANDA (Write And No Discussion Added) outputs raw, copy-paste-ready content.

**Activation:** Prefix with `WANDA:`
```
WANDA: Prompt Track 2    → Raw Suno prompt
WANDA: Lyrics Track 2    → Raw lyrics with section markers
WANDA: Description Track 2 → Description (max 1000 chars)
```

**Rules:** No preamble, no outro, no markdown code blocks. Direct paste into Suno/DistroKid.

## Agent System

### Core Agents
| Agent | Activation | Purpose |
|-------|------------|---------|
| PromptSmith | `WANDA: Prompt` | Suno prompt generation |
| Lyricist | `WANDA: Lyrics` | Lyrics generation |
| DescWriter | `WANDA: Description` | Track descriptions |
| QualityGate | `@qc` | Quality control |
| ReleaseOps | `@release` | Distribution prep |
| RepoOps | `@repo` | Repository maintenance |

### Production Enhancement Agents
| Agent | Activation | Purpose |
|-------|------------|---------|
| BeatDoctor | `@beat` | Sound design, instrumentation, sonic blueprints |
| HumanTouch | `@humanize` | De-robotize lyrics, add natural imperfections |
| VocalCoach | `@vocals` | Ad-libs, delivery notes, energy curves |
| CultureCheck | `@culture` | Regional slang accuracy, authenticity |
| MixEngineer | `@mix` | Post-production notes, prompt refinement |

Agent definitions: `.claude/agents/`

## Album Factory System

For creating new albums with regional/language variations:

1. **Read foundation:** `docs/MASTER_STYLE_GUIDE.md`
2. **Get variation spec:** `docs/ALBUM_FACTORY/VARIATIONS/[VARIATION].md`
3. **Create project folder:** `projects/mixtapes/MAG_[Name]_Vol_[N]/`
4. **Generate content:** Prompts → Lyrics → Suno → QC

Available variations: `UK_ENGLISH` (more can be added)

Quick start: `docs/ALBUM_FACTORY/README.md`

## Key Reference Files

| File | Purpose |
|------|---------|
| `docs/MASTER_STYLE_GUIDE.md` | Canonical sound identity (Rick Ross foundation) |
| `docs/SUNO_AI_GUIDE.md` | Suno AI prompting best practices |
| `RICK_ROSS_STYLE_BLUEPRINT.md` | Detailed production reference |
| `SOURCE_OF_TRUTH.md` | Naming conventions, character limits |
| `projects/.../00_admin/TRACKLIST.md` | Track specs per project |
| `projects/.../05_metadata/release_tracker.md` | Current track status |

## Suno Prompt Template

```
[Language] Luxury Trap, Cinematic Hip-Hop, [BPM] BPM, Grand Orchestral Strings, Brass Fanfare, Deep Commanding Male Vocals, Heavy 808 Bass, [Mood], [Special Elements], Professional Mix
```

## Production Workflow

### Standard
```
PROMPT → LYRICS → SUNO AUDIO → QC → DESCRIPTION → METADATA → RELEASE
```

### Enhanced (with Production Agents)
```
BEATDOCTOR → PROMPTSMITH → LYRICIST → HUMANTOUCH → VOCALCOACH → SUNO
                                           ↓
                                     CULTURECHECK
                                           ↓
                                   SUNO OUTPUT → MIXENGINEER → QC
```

## File Naming

```
track_[NN]_[short_name]_[type].[ext]
```
Examples: `track_02_real_ones_prompt.txt`, `track_02_real_ones_lyrics.txt`

## Character Limits

| Field | Limit |
|-------|-------|
| Track Description | 1000 chars (hard limit) |
| Prompt Content | 4000 chars |
| Lyrics Content | 8000 chars |

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
└── 08_decisions/
```

## Git Rules

**Committed:** Prompts, lyrics, descriptions, metadata, artwork (PNG/JPG), documentation
**NOT Committed:** Audio files (wav/mp3/flac), .env, secrets

Pre-commit hooks block audio files and secrets automatically.

## Scripts

```powershell
# Setup hooks (one-time)
powershell -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1

# Daily health check
.\scripts\daily-check.ps1

# Validate track files
.\scripts\validate-track.ps1 -Track 2
```
