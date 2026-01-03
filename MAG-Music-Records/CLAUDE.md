# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## OPERATING PRINCIPLES — MANDATORY

These principles are **enforced by default**. Do not skip them unless the user explicitly overrides.

### 1. Interview Before Execution
**NEVER assume requirements.** Before creating new content (tracks, albums, features):
- Ask clarifying questions about intent, constraints, and expectations
- Confirm what "done" looks like
- Identify any exceptions to standard rules

**Triggers for interview mode:**
- New album or project creation
- First-time track generation
- Ambiguous or open-ended requests
- Any request involving style deviations
- User says: `/interview`, `let's plan`, `what do you need to know?`

### 2. Spec Before Building
**NEVER execute without a spec.** For non-trivial work:
- Write requirements to disk at `00_admin/specs/SPEC_[name].md`
- Include: deliverable, constraints, exceptions, acceptance criteria
- Reference: style guides, compliance rules

**Bypass only when:**
- User provides explicit, complete requirements
- Work is a simple revision to existing content
- User says: `skip spec`, `just do it`, `WANDA:`

### 3. Clarify Before Assuming
When uncertain:
- ASK, don't guess
- Present options with tradeoffs
- Wait for confirmation before proceeding

### 4. Quality Over Speed
- Check compliance BEFORE generating content
- Run mental QC during generation
- Flag potential issues proactively

---

## Quick Commands for Workflow Control

| User Says | Claude Does |
|-----------|-------------|
| `/interview` | Enter interview mode, ask clarifying questions |
| `/spec` | Write spec to disk, request approval |
| `approve` / `proceed` | Begin execution from spec |
| `skip spec` | Bypass spec, execute directly (user takes responsibility) |
| `WANDA:` | Raw output mode, no discussion |
| `pause` | Stop current work, await further instruction |

---

## Project Overview

**MAG Music Records** — Professional music production workflow for Suno AI content creation.

**Foundation Sound:** Rick Ross "Hood Billionaire" Luxury Trap (74-96 BPM, orchestral, heavy 808s)

**Active Projects:** (in `projects/mixtapes/`)
- `MAG_Hood_Boss_Vol_1` — Portuguese luxury trap (12 tracks)
- `MAG_Hood_Boss_UK_Vol_1` — UK English luxury trap (12 tracks)
- `MAG_Refined_Vol_1` — UK Upper Class Reggae Fusion R&B EP (6 tracks)
- `MAG_Refined_PT_Vol_1` — Portuguese Upper Class Reggae Fusion R&B EP (6 tracks) **[NEW]**

**Project Detection:** Check `project_state.json` in project folder, or ask user which project.

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

### Suno Automation (requires Claude-in-Chrome MCP)
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

### Workflow Control
| Command | Purpose |
|---------|---------|
| `/interview` | Enter interview mode, gather requirements |
| `/spec [name]` | Create spec document, request approval |

### Management
| Command | Purpose |
|---------|---------|
| `/status` | Show project progress |
| `/audioqa [file]` | Automated audio technical analysis |
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

**Available variations:** `UK_UPPER_CLASS`, `PT_UPPER_CLASS`

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
| `@audioqa` | AudioQA | Technical audio analysis, QA reports |
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
| `docs/audio_qa_playbook.md` | Audio QA system guide |
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
/audioqa [file]             # Technical audio analysis
    ↓
Human ear review            # Listen to flagged items
    ↓
/qc N                       # Quality control check
    ↓
/release N                  # Prepare for distribution
```

**Batch workflow:**
```
/track 1-12 → /generate-all → /select-all → /extend-all → /download all → /release album
```

**Parallel Agent Batch Processing (Faster):**
```
1. Launch parallel agents for prompts (2-3 tracks per agent)
2. Launch parallel agents for lyrics (2-3 tracks per agent)
3. Generate all in Suno (browser automation)
4. Generate covers in Leonardo.ai (browser automation)
5. Download covers from Leonardo.ai
6. Select favorites → Create Suno playlist
7. Download favorites → Release
```

---

## Cover Art Workflow (Leonardo.ai)

```
1. Navigate to app.leonardo.ai/image-generation
2. Set: Model=Lucid Origin, Size=1024x1024 (1:1), Style=Dynamic
3. Enter prompt based on track theme
4. Generate → Download → Save to 04_artwork/
5. Use /upload-cover [N] to upload to Suno, or keep for distribution only
```

**Image Prompt Template:**
```
[Subject/Scene], [Mood], luxury aesthetic, cinematic lighting,
[Color palette], high contrast, professional photography style,
[Special elements], 8K quality
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

## Architecture Notes

- **Commands** (`.claude/commands/`): Define slash command behavior and workflows
- **Agents** (`.claude/agents/`): Specialized roles with `@` activation (e.g., `@qc`, `@beat`)
- **Browser automation**: Suno/Leonardo commands use Claude-in-Chrome MCP tools
- **State tracking**: `project_state.json` tracks per-track progress within each project
