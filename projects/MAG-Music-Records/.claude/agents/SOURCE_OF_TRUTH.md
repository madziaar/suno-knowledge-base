# SOURCE_OF_TRUTH.md

**Canonical Reference Document for MAG Music Records Agent System**

This document defines the authoritative sources for all data, terminology, and workflows used by Claude agents.

---

## Document Hierarchy

```
PRIORITY 1 (Highest)
├── SOURCE_OF_TRUTH.md      ← You are here (definitions & standards)
├── release_tracker.md      ← Current status (live state)
│
PRIORITY 2 (Project-Specific)
├── TRACKLIST.md            ← Track specifications
├── CLAUDE.md               ← Repository guidelines
│
PRIORITY 3 (Reference)
├── Playbooks (docs/playbooks/)
└── Templates (templates/)
```

When conflicts arise, higher priority documents override lower ones.

---

## Canonical File Locations

| Document | Path | Purpose |
|----------|------|---------|
| **Release Tracker** | `projects/mixtapes/[PROJECT]/05_metadata/release_tracker.md` | Live track status |
| **Tracklist** | `projects/mixtapes/[PROJECT]/00_admin/TRACKLIST.md` | Track specifications |
| **Prompts** | `projects/mixtapes/[PROJECT]/01_prompts/` | Suno prompt files |
| **Lyrics** | `projects/mixtapes/[PROJECT]/02_lyrics/` | Lyrics files |
| **Audio** | `projects/mixtapes/[PROJECT]/03_audio_exports/` | Audio (LOCAL ONLY) |
| **Artwork** | `projects/mixtapes/[PROJECT]/04_artwork/` | Visual assets |
| **Metadata** | `projects/mixtapes/[PROJECT]/05_metadata/` | Descriptions, tracker |
| **Release** | `projects/mixtapes/[PROJECT]/06_release/` | Final packages |

### Current Active Project
```
PROJECT = MAG_Hardcore_Drill_Vol_1
```

---

## Track Lifecycle Stages

Every track progresses through these stages in order:

```
1. PLANNING     → Track defined in TRACKLIST.md
2. PROMPT       → Suno prompt created (01_prompts/)
3. LYRICS       → Lyrics created (02_lyrics/)
4. GENERATION   → Audio generated in Suno (local)
5. QC           → Quality control pass
6. DESCRIPTION  → Track description written (05_metadata/)
7. METADATA     → Full metadata complete
8. RELEASE      → Uploaded to distribution
9. LIVE         → Available on streaming platforms
```

### Stage Status Values

| Symbol | Status | Meaning |
|--------|--------|---------|
| ⬜ | Pending | Not started |
| 🔄 | In Progress | Currently being worked on |
| ✅ | Complete | Finished and verified |
| ❌ | Blocked | Issue preventing progress |

---

## Command Prefix Definitions

### WANDA Mode Commands
**WANDA = Write And No Discussion Added**

| Prefix | Target Agent | Output Type |
|--------|--------------|-------------|
| `WANDA: Prompt [Track N]` | PromptSmith | Raw Suno prompt text |
| `WANDA: Lyrics [Track N]` | Lyricist | Raw lyrics with markers |
| `WANDA: Description [Track N]` | DescWriter | Raw description (<=1000 chars) |

### Utility Commands

| Prefix | Target Agent | Output Type |
|--------|--------------|-------------|
| `@repo [command]` | RepoOps | Structured report/action |
| `@qc [Track N]` | QualityGate | QC report with grade |
| `@release [Track N/album]` | ReleaseOps | Release prep checklist |

---

## Naming Conventions

### Track File Naming
```
track_[NN]_[short_name]_[type].[ext]
```

| Component | Format | Example |
|-----------|--------|---------|
| `NN` | Zero-padded track number | 02, 05, 11 |
| `short_name` | Lowercase, underscores | body, street_dreams |
| `type` | Content type | prompt, lyrics, description |
| `ext` | File extension | txt, md |

### Examples
```
track_02_body_prompt.txt
track_02_body_lyrics.txt
track_02_body_description.txt
```

### Audio Files (Local Only - Never Committed)
```
track_[NN]_[short_name]_v[N].[ext]
track_02_body_v1.mp3
track_02_body_final.wav
```

---

## Genre Definitions

### Primary Genre: Hardcore Drill

| Attribute | Value |
|-----------|-------|
| BPM Range | 140-150 (primary), 85-100 (slow tracks) |
| Key Characteristics | Heavy 808s, drill hi-hats, dark pads |
| Vocal Style | Aggressive delivery, slight autotune |
| Structure | Intro - Verse - Chorus - Verse - Chorus - Outro |

### Sub-genres & Tags

| Tag | BPM | Energy | Use Case |
|-----|-----|--------|----------|
| Banger | 140-150 | High | Main floor, peaks |
| Drop | 140-150 | High | Heavy bass drops |
| Grind | 85-95 | Medium | Sensual, slower |
| Peak | 95-100 | High | Peak club hours |
| Ambient | Any | Low | Transitions |
| Build | Any | Rising | Anticipation |

---

## Quality Standards

### Prompt Requirements
- [ ] Genre tags present and accurate
- [ ] BPM specified and matches tracklist
- [ ] Mood descriptors included
- [ ] Instrument breakdown included
- [ ] Vocal style specified
- [ ] Structure defined

### Lyrics Requirements
- [ ] Section markers present: [Intro], [Verse 1], [Chorus], etc.
- [ ] Flow matches specified BPM
- [ ] Hook is memorable and repeatable
- [ ] Language matches tracklist specification
- [ ] Explicit content flagged appropriately

### Description Requirements
- [ ] Maximum 1000 characters (hard limit)
- [ ] Captures track vibe accurately
- [ ] No hashtags (unless explicitly requested)
- [ ] Platform-ready (DistroKid, streaming services)

### Audio Requirements (User-Verified)
- [ ] No clipping or distortion
- [ ] Balanced bass (not overpowering)
- [ ] Vocals clear and intelligible
- [ ] Proper length (per tracklist)

---

## Agent Responsibilities

| Agent | Creates | Updates | Checks |
|-------|---------|---------|--------|
| **PromptSmith** | Prompts | - | TRACKLIST.md |
| **Lyricist** | Lyrics | - | TRACKLIST.md, Prompts |
| **DescWriter** | Descriptions | - | TRACKLIST.md, Lyrics |
| **QualityGate** | QC Reports | release_tracker.md | All assets |
| **ReleaseOps** | Metadata | release_tracker.md | All assets |
| **RepoOps** | Files/Structure | - | Repository health |
| **Orchestrator** | - | - | Routes all requests |

---

## Status Checking Protocol

Before any agent takes action, it MUST:

1. **Check release_tracker.md** for current track status
2. **Verify prerequisites** are complete for the requested stage
3. **Validate inputs** exist (e.g., prompt exists before lyrics)
4. **Report blockers** if prerequisites are missing

### Dependency Chain
```
PROMPT ← (no dependencies)
LYRICS ← requires PROMPT
DESCRIPTION ← requires LYRICS
QC ← requires PROMPT + LYRICS + DESCRIPTION
RELEASE ← requires QC PASS
```

---

## Error Handling

When an agent encounters an issue:

1. **STOP** - Do not proceed with incomplete data
2. **REPORT** - Clearly state what is missing/wrong
3. **SUGGEST** - Provide the correct command or next step
4. **WAIT** - Let the user resolve before continuing

### Common Error Messages

| Situation | Agent Response |
|-----------|----------------|
| Track not in TRACKLIST | "Track N not found in TRACKLIST.md. Available tracks: 1-7" |
| Missing prerequisite | "Cannot generate lyrics - prompt does not exist. Run: WANDA: Prompt Track N" |
| Invalid command | "Unknown command. Did you mean: [suggestions]" |
| File not found | "Expected file not found: [path]. Create with: [command]" |

---

## Version Control

| Field | Value |
|-------|-------|
| Document Version | 1.0 |
| Last Updated | 2024-XX-XX |
| Maintained By | Orchestrator Agent |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  MAG MUSIC RECORDS - AGENT QUICK REFERENCE              │
├─────────────────────────────────────────────────────────┤
│  WANDA: Prompt Track N  → Raw Suno prompt               │
│  WANDA: Lyrics Track N  → Raw lyrics                    │
│  WANDA: Description Track N → Raw description           │
│  @qc Track N            → Quality control report        │
│  @release Track N       → Release prep checklist        │
│  @repo status           → Repository health check       │
├─────────────────────────────────────────────────────────┤
│  CURRENT PROJECT: MAG_Hardcore_Drill_Vol_1              │
│  LEAD SINGLE: Track 2                                   │
│  STATUS: Check release_tracker.md                       │
└─────────────────────────────────────────────────────────┘
```
