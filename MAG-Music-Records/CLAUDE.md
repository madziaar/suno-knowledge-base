# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MAG Music Records** — A professional music production workflow for creating Suno AI prompts, lyrics, and descriptions. Focused on fast, repeatable production with clean repo governance.

**Current Focus:** MAG Hardcore Drill Vol. 1 (7-track mixtape, starting with Track 2 as lead single)

## WANDA Mode Rules

WANDA (Write And No Discussion Added) enforces clean, copy-paste-ready outputs.

### Activation Commands
- `WANDA: Prompt [Track N]` — Output ONLY the Suno prompt text
- `WANDA: Lyrics [Track N]` — Output ONLY the lyrics with section markers
- `WANDA: Description [Track N]` — Output ONLY the description (max 1000 chars)

### WANDA Constraints
1. **No preamble** — Skip "Here's the..." or "I've created..."
2. **No explanation** — No commentary before/after the content
3. **No formatting extras** — No markdown code blocks unless explicitly requested
4. **Character limits** — Descriptions must be ≤1000 characters
5. **Copy-paste ready** — Output should paste directly into Suno/DistroKid

## Repository Structure

```
MAG Music Records/
├── .claude/agents/          # Claude skill definitions
├── docs/playbooks/          # Step-by-step workflows
├── docs/wanda/              # WANDA reference docs
├── templates/
│   ├── prompts/             # Suno prompt templates
│   ├── lyrics/              # Lyrics structure templates
│   ├── descriptions/        # Track description templates
│   └── distro-kid/          # Distribution metadata templates
├── scripts/hooks/           # Git hooks (PowerShell)
└── projects/mixtapes/
    └── MAG_Hardcore_Drill_Vol_1/
        ├── 00_admin/        # Tracklist, planning
        ├── 01_prompts/      # Suno prompts per track
        ├── 02_lyrics/       # Lyrics per track
        ├── 03_audio_exports/# Rendered audio (NOT committed)
        ├── 04_artwork/      # Cover art, visuals
        ├── 05_metadata/     # Release tracker, metadata
        └── 06_release/      # Final release packages
```

## Naming Conventions

### Track Files
```
track_[NN]_[short_name]_[type].[ext]
```
Examples:
- `track_02_body_prompt.txt`
- `track_02_body_lyrics.txt`
- `track_02_body_description.txt`

### Audio Exports (local only, not committed)
```
track_[NN]_[short_name]_v[N].[ext]
```
Examples:
- `track_02_body_v1.mp3`
- `track_02_body_final.wav`

## Artifact Locations

| Artifact Type | Location | Committed? |
|---------------|----------|------------|
| Suno Prompts | `projects/.../01_prompts/` | Yes |
| Lyrics | `projects/.../02_lyrics/` | Yes |
| Audio Files | `projects/.../03_audio_exports/` | **NO** |
| Artwork | `projects/.../04_artwork/` | Yes (PNG/JPG only) |
| Metadata | `projects/.../05_metadata/` | Yes |
| Release Notes | `projects/.../06_release/` | Yes |

## Starting Point: Track 2 Lead Single

Track 2 is the lead single. Begin production here:
1. Review tracklist: `projects/mixtapes/MAG_Hardcore_Drill_Vol_1/00_admin/TRACKLIST.md`
2. Generate prompt: `WANDA: Prompt Track 2`
3. Generate lyrics: `WANDA: Lyrics Track 2`
4. Generate in Suno, export audio locally
5. Generate description: `WANDA: Description Track 2`
6. Update release tracker: `projects/mixtapes/MAG_Hardcore_Drill_Vol_1/05_metadata/release_tracker.md`

## Git Hooks Setup (Windows)

Run once to enable local hooks:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1
```

This enables:
- Block committing audio files (wav/mp3/flac)
- Block committing secrets (.env, tokens)
- Validate required files exist
- Enforce naming conventions

## Available Claude Agents

| Agent | Command Prefix | Purpose |
|-------|---------------|---------|
| RepoOps | `@repo` | Maintains structure, templates, hooks |
| PromptSmith | `WANDA: Prompt` | Suno prompt generation |
| Lyricist | `WANDA: Lyrics` | Lyrics generation |
| DescWriter | `WANDA: Description` | Track descriptions |
| QualityGate | `@qc` | Kill list review, pass/fail |
| ReleaseOps | `@release` | Metadata, distribution prep |

## Key Playbooks

- `docs/playbooks/WORKFLOW_MIXTAPE_VOL_1.md` — Full production workflow
- `docs/playbooks/WANDA_EXECUTION.md` — WANDA mode reference
- `docs/playbooks/QUALITY_CONTROL.md` — Kill list and QC criteria
- `docs/playbooks/STRIP_CLUB_PLAYBOOK.md` — Adult/club track guidelines

## Quick Commands

```
WANDA: Prompt Track 2          # Generate Suno prompt
WANDA: Lyrics Track 2          # Generate lyrics
WANDA: Description Track 2     # Generate description (≤1000 chars)
@qc Track 2                    # Run quality control checklist
@release Track 2               # Prepare metadata for release
```
