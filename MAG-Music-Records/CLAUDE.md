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

### 2. Cultural Research Before Content
**NEVER generate lyrics/content without cultural research.** For any new song or project:
- Activate `@research` agent automatically
- Research reference song's meaning, vibe, cultural context
- Find authentic phrases and speech patterns for the style
- Create Cultural Brief at `08_decisions/CULTURAL_BRIEF.md`
- Get user approval on Cultural Brief before generating content

**This applies to:**
- New album or EP creation
- Any new track generation
- Style changes or new vibes
- Reference songs provided by user

**Bypass only when:**
- User says: `skip research`, `WANDA:`
- Simple revision to existing lyrics

### 3. Spec Before Building
**NEVER execute without a spec.** For non-trivial work:
- Write requirements to disk at `00_admin/specs/SPEC_[name].md`
- Include: deliverable, constraints, exceptions, acceptance criteria
- Reference: style guides, compliance rules

**Bypass only when:**
- User provides explicit, complete requirements
- Work is a simple revision to existing content
- User says: `skip spec`, `just do it`, `WANDA:`

### 4. Clarify Before Assuming
When uncertain:
- ASK, don't guess
- Present options with tradeoffs
- Wait for confirmation before proceeding

### 5. Quality Over Speed
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

**Active Projects:** (in `projects/mixtapes/`)

| Project | Language | Style | Tracks |
|---------|----------|-------|--------|
| `MAG_Hood_Boss_Vol_1` | Portuguese | Luxury Trap | 12 |
| `MAG_Hood_Boss_UK_Vol_1` | UK English | Luxury Trap | 12 |
| `MAG_Refined_Vol_1` | UK English | Reggae Fusion R&B | 6 |
| `MAG_Refined_PT_Vol_1` | Portuguese + Creole | Reggae Fusion R&B + Latin Club | 8 |
| `MAG_Hardcore_Drill_Vol_1` | Portuguese | Luxury Trap | 10 |

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
- Genre characteristics (luxury trap, cinematic, reggae fusion)
- Mood/energy descriptions (boss energy, triumphant, romantic)
- Vocal tone descriptions (deep, commanding, smooth)
- BPM ranges (not matched with other elements)

---

## Suno Prompting Safety

**CRITICAL:** Certain words trigger Suno's content filters and block generation.

### Avoid in Prompts
- **Artist names:** Akon, Rick Ross, R. Kelly, etc.
- **Song names:** "Don't Matter", "Snake", etc.
- **Potentially flagged terms:** "skank" (use "offbeat" instead)
- **Direct style references:** "Akon Don't Matter vibes" → "Carefree Island Vibes"

### Safe Alternatives
| Blocked | Use Instead |
|---------|-------------|
| Reggae Skank Guitar | Offbeat Reggae Guitar |
| Akon vibes | Carefree Island Vibes |
| Artist-style references | Genre/mood descriptions |

---

## Style Rules by Project Type

### Luxury Trap Projects (Hood Boss, Hardcore Drill)
- **BPM:** 74-96 (NEVER exceed 100)
- **808s:** Heavy, sustained, booming (NOT sliding drill 808s)
- **Production:** Orchestral strings, brass fanfares, piano, cinematic
- **Vocals:** Deep, commanding, authoritative male voice
- **Delivery:** Slow, deliberate, measured (NOT fast/aggressive)

### Reggae Fusion R&B Projects (Refined)
- **BPM:** 95-108 (island groove tempo)
- **Production:** Rhodes chords, island percussion, warm synth pads
- **808s:** Melodic bassline (NOT heavy trap 808s)
- **Vocals:** Smooth, melodic male vocals with tasteful auto-tune
- **Elements:** Latin/Middle Eastern influences for club tracks

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

### Video Production (Lyric Videos)
| Command | Purpose |
|---------|---------|
| `/lrc [N]` | Generate LRC/SRT subtitles from audio (Whisper AI) |
| `/stock [N]` | Find and download stock footage (Pexels/Pixabay) |
| `/lyric-video [N]` | Full lyric video workflow |
| `/lyric-video-all` | Batch generate videos for entire album |

### Management
| Command | Purpose |
|---------|---------|
| `/status` | Show project progress |
| `/audioqa [file]` | Automated audio technical analysis |
| `/qc [N]` | Quality control check |
| `/release [N]` | Prepare track for distribution |

### Creative
| Command | Purpose |
|---------|---------|
| `/style` | Review artist style profile |
| `/idea [text]` | Add creative idea to backlog |
| `/interview` | Enter interview mode |
| `/spec [name]` | Create spec document |

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

**Available variations:** `UK_UPPER_CLASS`, `PT_UPPER_CLASS`, `UK_ENGLISH`

---

## Agent System

Production enhancement agents for professional quality output:

| Command | Agent | Purpose |
|---------|-------|---------|
| `@research` | CulturalResearcher | **CRITICAL** - Cultural research before content creation |
| `@beat` | BeatDoctor | Sound design, instrumentation notes |
| `@humanize` | HumanTouch | De-robotize lyrics, add natural imperfections |
| `@vocals` | VocalCoach | Ad-libs, delivery notes, energy curves |
| `@culture` | CultureCheck | Regional slang accuracy, authenticity |
| `@mix` | MixEngineer | Post-production notes, EQ suggestions |
| `@audioqa` | AudioQA | Technical audio analysis, QA reports |
| `@qc` | QualityGate | Quality control checklist |
| `@release` | ReleaseOps | Distribution preparation |
| `@repo` | RepoOps | Repository maintenance |
| `@lyricvideo` | VideoProducer | Lyric video workflow orchestration |
| `@lrc` | LyricSync | Generate LRC/SRT from audio |
| `@stockfinder` | StockFinder | Find stock footage for videos |

**Hidden Agents** (orchestration, not user-invocable):
- Orchestrator, PromptSmith, Lyricist, DescWriter

Agent definitions: `.claude/agents/`

---

## Audio QA System

Automated technical analysis using Python/librosa.

### Setup
```bash
pip install librosa numpy soundfile scipy
```

### Usage
```bash
python tools/audio_qa/analyze.py <audio_file> [--output report.json]
```

### What's Automated vs Human-Required

**Automated:** BPM, loudness (LUFS), true peak, dynamic range, clipping, frequency balance, stereo width, phase correlation, silence detection

**Human ear required:** Vocal clarity, 808 tone quality, mix balance, emotional impact, genre authenticity

See `docs/audio_qa_playbook.md` for full details.

---

## Key Reference Files

| File | Purpose |
|------|---------|
| `docs/COMPLIANCE_AND_SAFETY.md` | **CRITICAL** - Copyright compliance rules |
| `docs/MASTER_STYLE_GUIDE.md` | Canonical sound identity |
| `docs/SUNO_AI_GUIDE.md` | Suno AI prompting best practices |
| `docs/ALBUM_FACTORY/README.md` | Album factory system guide |
| `docs/audio_qa_playbook.md` | Audio QA system guide |
| `.claude/commands/*.md` | Slash command definitions |
| `.claude/agents/index.md` | Agent system overview |

---

## Suno Prompt Templates

### Luxury Trap
```
[Language] Luxury Trap, Cinematic Hip-Hop, [BPM] BPM, Grand Orchestral Strings, Brass Fanfare, Deep Commanding Male Vocals, Heavy 808 Bass, [Mood], Professional Mix
```

### Reggae Fusion R&B
```
[Language] Reggae Fusion R&B, [BPM] BPM, Island Percussion, Warm Rhodes Chords, Melodic Bassline, Offbeat Guitar, Smooth Melodic Male Vocals, [Mood], Professional Mix
```

### Latin/Arabic Club
```
[Language] Latin R&B Club, [BPM] BPM, Middle Eastern Strings, Latin Percussion, Exotic Scales, Groovy Bassline, Sensual Male Vocals, Dance Floor Energy, Professional Mix
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
/download N                 # Download final audio
    ↓
/audioqa [file]             # Technical audio analysis
    ↓
Human ear review            # Listen to flagged items
    ↓
/qc N                       # Quality control check
    ↓
/release N                  # Prepare for distribution
    ↓
====== VIDEO PHASE ======
    ↓
/lrc N                      # Generate LRC subtitles
    ↓
/stock N                    # Find stock footage
    ↓
/lyric-video N              # Render lyric video
    ↓
Upload to YouTube/TikTok    # Distribution
```

---

## Cover Art Workflow (Leonardo.ai)

```
1. Navigate to app.leonardo.ai/image-generation
2. Set: Model=Lucid Origin, Size=1024x1024 (1:1), Style=Dynamic
3. Enter prompt based on track theme
4. Generate → Download → Save to 04_artwork/
5. Use /upload-cover [N] to upload to Suno
```

---

## File Naming

```
track_[NN]_[short_name]_[type].[ext]
```
Examples: `track_02_hood_boss_prompt.txt`, `track_07_serpente_lyrics.txt`

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
├── 09_video/             (lyric video assets)
│   ├── lrc/              (LRC/SRT/ASS files)
│   ├── stock/            (stock footage by track)
│   ├── renders/          (final videos)
│   └── thumbnails/
└── project_state.json    (track status)
```

---

## Git Rules

**Committed:** Prompts, lyrics, descriptions, metadata, artwork (PNG/JPG), documentation

**NOT Committed:** Audio files (wav/mp3/flac), .env, secrets

**Setup hooks (one-time):**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1
```

---

## Architecture Notes

- **Commands** (`.claude/commands/`): Define slash command behavior and workflows
- **Agents** (`.claude/agents/`): Specialized roles with `@` activation
- **Tools** (`tools/`): Python scripts for audio analysis
- **Browser automation**: Suno/Leonardo commands use Claude-in-Chrome MCP tools
- **State tracking**: `project_state.json` tracks per-track progress within each project
