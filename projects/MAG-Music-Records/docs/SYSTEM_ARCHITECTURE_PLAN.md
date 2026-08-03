# MAG Music Records — System Architecture Plan

**Status:** PLANNING ONLY — No Implementation
**Date:** 2025-12-31
**Reference:** Giquina Accountancy Direct Filing System

---

## Executive Summary

This document outlines an architectural blueprint for transforming MAG Music Records from a basic folder structure into a **self-operating music production system** modeled on the governance-first, automation-second philosophy proven in the Giquina Accountancy project.

---

## Part 1: How the Giquina Accountancy System Works

### Core Architecture Layers

The accountancy system operates on **5 distinct layers**:

| Layer | Purpose | Components |
|-------|---------|------------|
| **1. Governance** | Authority & control | GCS Authority Matrix, decision logs, board resolutions, registers |
| **2. Configuration** | Rules & deadlines | MASTER_DEADLINES.yaml, SOURCE_OF_TRUTH.md, entity definitions |
| **3. Automation** | Repetitive tasks | PowerShell file watchers, daily health checks, CI/CD pipelines |
| **4. Intelligence** | AI task routing | 7 Claude skills, orchestrator pattern, entity-aware routing |
| **5. Software** | API integration | Python package for Companies House/HMRC XML submissions |

### Key Automation Principles

1. **File Auto-Routing**
   - PowerShell FileSystemWatcher monitors Downloads/Desktop
   - 30+ filename patterns route files to correct folders
   - Audit trail logged to CSV for every file movement

2. **Daily Health Checks**
   - Automated script runs daily
   - Checks compliance status, unclassified documents, deadlines
   - Generates weekly summaries on Fridays
   - Logs everything to dated log files

3. **Pre-Commit Quality Gates**
   - 6 hook categories prevent bad commits
   - Security scanning (bandit) blocks credentials
   - Type checking (mypy) enforces code quality
   - Custom hook blocks hardcoded secrets

4. **Deadline-Driven Alerts**
   - YAML-based deadline configuration
   - Priority calculation (P0-P3) based on days remaining
   - Escalation protocols embedded in rules
   - Session startup checks for critical deadlines

### Governance/Control Logic

| Concept | Implementation |
|---------|----------------|
| **Authority Matrix** | Who can approve what, at what threshold |
| **Veto Rights** | GCS can block non-compliant actions |
| **Decision Log** | Every significant decision recorded with date/approver |
| **Resolution Register** | All board resolutions with unique IDs, status tracking |
| **Single Source of Truth** | Immutable reference file for canonical definitions |

### What's Automatic vs Manual

| Automatic | Manual |
|-----------|--------|
| File routing by pattern | Final authority approval |
| Deadline calculations | Strategic decisions |
| Compliance status updates | Document review |
| XML form generation | Auth code entry |
| Pre-commit validation | Board resolution signing |
| Daily health checks | Exception handling |

### Success Indicators

1. Zero missed compliance deadlines
2. All files correctly classified
3. Complete audit trail for every action
4. Pre-commit hooks catch all issues before commit
5. AI correctly routes 95%+ of tasks to appropriate skill
6. Governance decisions traceable end-to-end

---

## Part 2: Planning a Similar System for MAG Music Records

### Core System Layers (Music Context)

| Layer | Accountancy Equivalent | Music Adaptation |
|-------|------------------------|------------------|
| **Governance** | GCS Authority Matrix | Release authority (who approves tracks for release) |
| **Configuration** | MASTER_DEADLINES.yaml | MASTER_RELEASE_CALENDAR.yaml |
| **Automation** | File sync, daily checks | Track file routing, production health checks |
| **Intelligence** | 7 Claude skills | 6+ Claude agents (already created) |
| **Software** | Companies House API | DistroKid/TuneCore API (future), Suno integration |

### Automation Principles to Apply

#### 1. File Auto-Routing
**Current State:** Manual file placement
**Target State:** PowerShell watcher routes files by pattern

| Pattern | Destination |
|---------|-------------|
| `*suno*prompt*` | `01_prompts/` |
| `*lyrics*`, `*.lrc` | `02_lyrics/` |
| `*.wav`, `*.mp3`, `*.flac` | `03_audio_exports/` (local only) |
| `*cover*`, `*artwork*` | `04_artwork/` |
| `*metadata*`, `*description*` | `05_metadata/` |
| `*distrokid*`, `*release*` | `06_release/` |

#### 2. Daily Production Health Checks
**Script:** `scripts/daily-production-check.ps1`

| Check | Purpose |
|-------|---------|
| Tracklist Status | How many tracks have prompts/lyrics/audio |
| Unclassified Files | Files in wrong folders or root |
| Naming Convention | Files not following `track_NN_` pattern |
| Release Blockers | Missing artwork, metadata, descriptions |
| Deadline Reminders | Upcoming release dates |

#### 3. Pre-Commit Quality Gates
**Already Implemented:** Audio file blocking, secret detection, naming validation

**To Add:**
- Character count validation (descriptions ≤1000 chars)
- Required metadata field checks
- TRACKLIST.md sync verification

#### 4. Release Calendar Configuration

```yaml
# config/releases/MASTER_RELEASE_CALENDAR.yaml
releases:
  - id: MAG_HDRILL_V1_TRACK02
    type: single
    project: MAG_Hardcore_Drill_Vol_1
    track: 2
    target_date: 2025-02-01
    status: in_production
    priority: P0
    dependencies:
      - prompt_complete
      - lyrics_complete
      - audio_approved
      - artwork_ready
      - metadata_complete
    blockers: []
```

### Governance/Control Logic (Music Context)

| Accountancy Concept | Music Equivalent |
|---------------------|------------------|
| **Board Resolution** | Release Approval (sign-off before upload) |
| **Authority Matrix** | Who can approve final mix, who can upload |
| **Decision Log** | Version history (why we chose take 3 over take 1) |
| **Compliance Register** | Rights/Credits Register (who wrote what, splits) |
| **GCS Veto** | QC Gate (fail = cannot proceed to release) |

#### Music Authority Matrix

| Decision Type | Authority Level | Approval Method |
|---------------|-----------------|-----------------|
| Prompt creation | Self | WANDA command |
| Lyrics creation | Self | WANDA command |
| Audio generation | Self | Suno generation |
| **Final mix approval** | **Producer sign-off** | QC checklist pass |
| **Release approval** | **Artist sign-off** | Release checklist complete |
| **Upload to distributor** | **Final authority** | All metadata verified |
| Credit changes | All parties | Written agreement |

#### Release Approval Checklist (Replaces Board Resolution)

```markdown
# RELEASE APPROVAL: [Track Title]

## Pre-Release Verification
- [ ] Audio QC passed (Grade B or higher)
- [ ] Lyrics finalized (no pending changes)
- [ ] Description ≤1000 characters
- [ ] Artwork approved (3000x3000, no bleed)
- [ ] Metadata complete (all fields filled)
- [ ] Credits verified (all contributors listed)
- [ ] Explicit flag correct
- [ ] No copyright issues

## Approval
Approved by: _______________
Date: _______________
Notes: _______________
```

### Automatic vs Manual (Music Context)

| Automatic | Manual |
|-----------|--------|
| File routing by pattern | Creative decisions (which take to use) |
| Naming convention validation | Lyrics writing |
| Character count checks | Final mix approval |
| Deadline calculations | Release date selection |
| QC checklist generation | QC pass/fail decision |
| Metadata template population | Artist/title entry |
| Release tracker updates | Upload execution |

### Success Criteria

1. **Zero missed release dates** — All deadlines tracked and alerted
2. **No audio in git** — Pre-commit hook blocks 100% of audio commits
3. **Complete audit trail** — Every version, every decision logged
4. **Copy-paste ready outputs** — WANDA mode delivers clean content
5. **Sub-5-minute track setup** — Templates reduce friction
6. **100% metadata accuracy** — No rejected uploads due to missing fields

---

## Part 3: Translating to MAG Music Records

### What Replaces "Compliance & Audit" in Music

| Accountancy | Music Equivalent | Purpose |
|-------------|------------------|---------|
| Statutory deadlines | Release calendar | When things must be done |
| Companies House filings | DistroKid uploads | Submitting to authorities |
| Board resolutions | Release approvals | Sign-off before action |
| Compliance registers | Credits/splits register | Who owns/contributed what |
| Audit trail | Version history | Why decisions were made |
| Authority matrix | Approval workflow | Who can approve what |

### Friction Reduction Plan

#### Track Creation
| Current | Target |
|---------|--------|
| Think of prompt structure | `WANDA: Prompt Track N` generates complete prompt |
| Format lyrics manually | Template with section markers pre-filled |
| Guess description length | Auto character count, warning if >1000 |

#### Metadata Management
| Current | Target |
|---------|--------|
| Fill metadata from scratch | Pre-populated template from TRACKLIST.md |
| Manual explicit flag checking | Derived from tracklist |
| Remember all required fields | Checklist validates completeness |

#### Platform Uploads
| Current | Target |
|---------|--------|
| Manual data entry per platform | Generated metadata block copy-paste ready |
| Remember formatting requirements | Templates enforce requirements |
| Check character limits manually | Automated validation |

#### Revisions
| Current | Target |
|---------|--------|
| Overwrite files | Versioned naming (`track_02_body_v2.txt`) |
| Forget why changes were made | Decision log captures rationale |
| Lose previous versions | Archive folder preserves history |

#### Collaboration
| Current | Target |
|---------|--------|
| Verbal agreements on credits | Credits register (written, versioned) |
| Unclear approval process | Authority matrix defines workflow |
| No audit trail | Decision log records all sign-offs |

### "Self-Operating" Music Project Vision

A self-operating music project would:

1. **Auto-detect production stage** — "Track 2 has prompt but no lyrics, suggesting lyrics creation"
2. **Route files automatically** — Downloads go to correct project folders
3. **Enforce quality gates** — Cannot mark "complete" until QC passes
4. **Generate required artifacts** — Metadata auto-populated from existing data
5. **Alert on blockers** — "Track 2 release blocked: artwork missing"
6. **Maintain complete audit trail** — Every decision logged with timestamp
7. **Provide single source of truth** — One place for canonical track/project data

---

## Part 4: Implementation Blueprint

### Phase 1: Configuration Layer (Week 1)

**Goal:** Establish canonical data sources

| Component | File | Purpose |
|-----------|------|---------|
| Source of Truth | `SOURCE_OF_TRUTH.md` | Immutable definitions |
| Release Calendar | `config/releases/MASTER_RELEASE_CALENDAR.yaml` | Deadline tracking |
| Project Rules | `config/rules/PRODUCTION_RULES.yaml` | Validation rules |

#### SOURCE_OF_TRUTH.md Contents
```markdown
# SOURCE OF TRUTH — MAG Music Records

## Projects
| Short Code | Full Name | Status |
|------------|-----------|--------|
| MAG_HDRILL_V1 | MAG Hardcore Drill Vol. 1 | Active |

## Track Naming
Format: track_[NN]_[short_name]_[type].[ext]
Example: track_02_body_prompt.txt

## File Types
| Type | Extensions | Committed |
|------|------------|-----------|
| Prompt | .txt | Yes |
| Lyrics | .txt | Yes |
| Audio | .wav, .mp3, .flac | NO |
| Artwork | .png, .jpg | Yes |
| Metadata | .md, .txt | Yes |

## Character Limits
| Content | Limit |
|---------|-------|
| Description | 1000 chars |
| Track title | 100 chars |

## WANDA Commands
| Command | Output Type |
|---------|-------------|
| WANDA: Prompt Track N | Raw prompt |
| WANDA: Lyrics Track N | Raw lyrics |
| WANDA: Description Track N | Raw description |
```

### Phase 2: Automation Layer (Week 2)

**Goal:** Automated file routing and health checks

| Script | Function |
|--------|----------|
| `scripts/file-router.ps1` | Monitor and route files by pattern |
| `scripts/daily-check.ps1` | Production health check |
| `scripts/validate-track.ps1` | Per-track validation |

#### file-router.ps1 Routing Table
```powershell
$routingRules = @{
    '*prompt*' = '01_prompts'
    '*lyrics*' = '02_lyrics'
    '*.wav' = '03_audio_exports'  # Local only warning
    '*.mp3' = '03_audio_exports'  # Local only warning
    '*cover*' = '04_artwork'
    '*artwork*' = '04_artwork'
    '*metadata*' = '05_metadata'
    '*description*' = '05_metadata'
    '*distrokid*' = '06_release'
}
```

#### daily-check.ps1 Output
```
=== MAG Music Records Daily Check ===
Date: 2025-12-31

PROJECT: MAG_Hardcore_Drill_Vol_1
├── Prompts: 0/7
├── Lyrics: 0/7
├── Audio: 0/7 (local)
├── Artwork: 0/1
├── Metadata: 0/7
└── Status: PRE-PRODUCTION

UNCLASSIFIED FILES: 0
NAMING VIOLATIONS: 0
UPCOMING DEADLINES: None set

NEXT ACTIONS:
1. Start with Track 2 (lead single)
2. Run: WANDA: Prompt Track 2
```

### Phase 3: Intelligence Layer (Week 3)

**Goal:** Enhanced Claude agents with cross-referencing

| Enhancement | Description |
|-------------|-------------|
| Orchestrator pattern | Route tasks to appropriate agent |
| Entity awareness | Agents know project context |
| Cross-referencing | Agents read from SOURCE_OF_TRUTH.md |
| Status awareness | Agents check release_tracker.md before suggesting actions |

#### Orchestrator Skill Design
```markdown
# Orchestrator Skill

## Purpose
Routes all user requests to appropriate agent based on:
- Command prefix (WANDA:, @qc, @release, @repo)
- Context (which project, which track)
- Current status (from release_tracker.md)

## Routing Table
| Input Pattern | Route To |
|---------------|----------|
| WANDA: Prompt | PromptSmith |
| WANDA: Lyrics | Lyricist |
| WANDA: Description | DescWriter |
| @qc | QualityGate |
| @release | ReleaseOps |
| @repo | RepoOps |

## Context Injection
Before routing, orchestrator:
1. Reads current project status
2. Identifies track number
3. Checks blockers
4. Injects context into target agent
```

### Phase 4: Governance Layer (Week 4)

**Goal:** Release authority and audit trail

| Component | Purpose |
|-----------|---------|
| Release Approval Template | Sign-off checklist |
| Credits Register | Who contributed what |
| Decision Log | Why choices were made |
| Version Archive | Previous versions preserved |

#### Credits Register Format
```markdown
# Credits Register — MAG Hardcore Drill Vol. 1

## Track 2: [Title]
| Role | Name | Split % | Verified |
|------|------|---------|----------|
| Artist | | | [ ] |
| Producer | | | [ ] |
| Songwriter | | | [ ] |
| Featured | | | [ ] |

Agreement Date: ___
Agreement File: ___
```

#### Decision Log Format
```markdown
# Decision Log — MAG Hardcore Drill Vol. 1

| Date | Track | Decision | Rationale | Approved By |
|------|-------|----------|-----------|-------------|
| 2025-12-31 | 2 | Selected take 3 | Best hook delivery | [Name] |
```

---

## Implementation Checklist (Not for execution — reference only)

### Configuration Files to Create
- [ ] `SOURCE_OF_TRUTH.md`
- [ ] `config/releases/MASTER_RELEASE_CALENDAR.yaml`
- [ ] `config/rules/PRODUCTION_RULES.yaml`
- [ ] `config/rules/NAMING_CONVENTIONS.yaml`

### Scripts to Create
- [ ] `scripts/file-router.ps1`
- [ ] `scripts/daily-check.ps1`
- [ ] `scripts/validate-track.ps1`
- [ ] `scripts/generate-metadata.ps1`

### Templates to Create
- [ ] `templates/release-approval.md`
- [ ] `templates/credits-register.md`
- [ ] `templates/decision-log.md`
- [ ] `templates/version-archive-readme.md`

### Agent Enhancements
- [ ] Create orchestrator skill
- [ ] Add SOURCE_OF_TRUTH reference to all agents
- [ ] Add status-awareness to agents
- [ ] Add cross-project support (future projects)

### Folder Additions
- [ ] `config/releases/`
- [ ] `config/rules/`
- [ ] `projects/mixtapes/MAG_Hardcore_Drill_Vol_1/07_archive/`
- [ ] `projects/mixtapes/MAG_Hardcore_Drill_Vol_1/08_decisions/`

---

## Summary: Key Differences

| Aspect | Accountancy | Music |
|--------|-------------|-------|
| Primary output | Compliance filings | Released tracks |
| Authority | Board/GCS | Artist/Producer |
| Deadlines | Statutory (fixed) | Release calendar (flexible) |
| Quality gate | Regulatory compliance | QC checklist |
| Audit driver | Legal requirement | Version control |
| Integration | Companies House/HMRC APIs | DistroKid/streaming platforms |

## Summary: Key Similarities

| Principle | Accountancy | Music |
|-----------|-------------|-------|
| Single source of truth | SOURCE_OF_TRUTH.md | SOURCE_OF_TRUTH.md |
| File auto-routing | Pattern-based PowerShell | Pattern-based PowerShell |
| Daily health checks | Compliance status | Production status |
| Pre-commit gates | Block secrets/bad code | Block audio/secrets |
| AI task routing | 7 skills + orchestrator | 6 agents + orchestrator |
| Deadline tracking | YAML configuration | YAML configuration |
| Authority matrix | Who approves filings | Who approves releases |
| Audit trail | Decision log | Decision log |

---

**This plan provides the architectural foundation. Implementation should proceed phase-by-phase with validation at each stage.**
