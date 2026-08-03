# Claude Agents Index

Quick reference for all available agents in MAG Music Records.

---

## System Architecture

```
                    ┌──────────────────────┐
                    │    ORCHESTRATOR      │
                    │   (Central Router)   │
                    └──────────┬───────────┘
                               │
   ┌───────────────┬───────────┼───────────┬───────────────┐
   │               │           │           │               │
   ▼               ▼           ▼           ▼               ▼
┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐  ┌──────────┐
│  WANDA  │  │Production│  │Utility │  │ Quality │  │Reference │
│  Mode   │  │  Agents  │  │Agents  │  │ Agents  │  │Documents │
├─────────┤  ├──────────┤  ├────────┤  ├─────────┤  ├──────────┤
│Prompt-  │  │BeatDoctor│  │Release │  │Quality- │  │SOURCE_OF_│
│  Smith  │  │HumanTouch│  │  Ops   │  │  Gate   │  │TRUTH.md  │
│Lyricist │  │VocalCoach│  │RepoOps │  │Culture- │  │release_  │
│Desc-    │  │          │  │        │  │  Check  │  │tracker.md│
│  Writer │  │          │  │        │  │Mix-     │  │          │
│         │  │          │  │        │  │Engineer │  │          │
└─────────┘  └──────────┘  └────────┘  └─────────┘  └──────────┘
```

All requests flow through the Orchestrator, which checks status, validates prerequisites, and routes to the appropriate agent.

---

## Agent Overview

### Core Agents
| Agent | Activation | Purpose | Mode |
|-------|------------|---------|------|
| [Orchestrator](orchestrator.md) | *auto* | Central routing hub | Utility |
| [RepoOps](repo-ops.md) | `@repo` | Repository maintenance | Utility |
| [PromptSmith](promptsmith.md) | `WANDA: Prompt` | Suno prompt generation | WANDA |
| [Lyricist](lyricist.md) | `WANDA: Lyrics` | Lyrics generation | WANDA |
| [DescWriter](descwriter.md) | `WANDA: Description` | Track descriptions | WANDA |
| [QualityGate](qualitygate.md) | `@qc` | Quality control | Utility |
| [ReleaseOps](releaseops.md) | `@release` | Distribution prep | Utility |

### Production Enhancement Agents (NEW)
| Agent | Activation | Purpose | Makes Music Less AI |
|-------|------------|---------|---------------------|
| [BeatDoctor](beatdoctor.md) | `@beat` | Sound design, instrumentation, reference tracks | Unique sounds per track |
| [HumanTouch](humantouch.md) | `@humanize` | De-robotize lyrics, add imperfections | Natural speech patterns |
| [VocalCoach](vocalcoach.md) | `@vocals` | Ad-libs, delivery notes, energy curves | Professional vocal direction |
| [CultureCheck](culturecheck.md) | `@culture` | Regional slang accuracy, authenticity | Believable content |
| [MixEngineer](mixengineer.md) | `@mix` | Post-production notes, EQ suggestions | Professional polish |

### Audio Analysis Agents
| Agent | Activation | Purpose | Notes |
|-------|------------|---------|-------|
| [AudioQA](audio-qa-engineer.md) | `@audioqa` | Technical audio analysis, QA reports | Automated checks + human ear flags |

### Distribution & Marketing Agents (NEW)
| Agent | Activation | Purpose | Makes Release Process Easier |
|-------|------------|---------|------------------------------|
| [DistroUploader](distro-uploader.md) | `@distro` | DistroKid upload automation, metadata formatting | Saves 15+ min per track |
| [SocialMedia](social-media.md) | `@social` | Social media content generation | Auto-generates IG, TikTok, Twitter, YouTube content |
| [MetadataValidator](metadata-validator.md) | `@metadata` | Validate metadata completeness | Catches errors before upload |
| [SetlistCurator](setlist-curator.md) | `@setlist` | Optimize track sequencing for better listening | BPM flow, energy arc analysis |

---

## Canonical References

All agents reference these source documents:

| Document | Path | Purpose |
|----------|------|---------|
| [SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md) | `.claude/agents/` | Canonical definitions |
| release_tracker.md | `projects/.../05_metadata/` | Current status |
| TRACKLIST.md | `projects/.../00_admin/` | Track specifications |

---

## Command Reference

### WANDA Mode Commands

WANDA (Write And No Discussion Added) agents output ONLY raw content - no preamble, no explanation.

```
WANDA: Prompt Track 2    → Raw Suno prompt
WANDA: Lyrics Track 2    → Raw lyrics with section markers
WANDA: Description Track 2 → Raw description (max 1000 chars)
```

### Utility Commands

Utility agents provide structured reports and actions.

```
@repo status            → Repository health check
@repo validate          → Full validation
@qc Track 2             → Quality control report
@release Track 2        → Release prep checklist
@release album          → Full album release prep
```

---

## Workflow Dependency Chain

### Standard Workflow
```
PLANNING → PROMPT → LYRICS → AUDIO → QC → DESCRIPTION → METADATA → RELEASE
                                          │
                                          └── Each stage requires previous stage complete
```

### Enhanced Workflow (with Production Agents)
```
BEATDOCTOR → PROMPTSMITH → LYRICIST → HUMANTOUCH → VOCALCOACH → SUNO
                                           │            │
                                     CULTURECHECK  ─────┘
                                           │
                                        SUNO OUTPUT → MIXENGINEER → QC
```

| Stage | Agent | Prerequisite |
|-------|-------|--------------|
| Sonic Blueprint | BeatDoctor | None (runs first for album planning) |
| Prompt | PromptSmith | Sonic blueprint (optional) |
| Lyrics | Lyricist | Prompt exists |
| Humanize | HumanTouch | Lyrics exist |
| Vocal Direction | VocalCoach | Humanized lyrics |
| Culture Audit | CultureCheck | Humanized lyrics |
| Mix Assessment | MixEngineer | Suno audio generated |
| Description | DescWriter | Lyrics exist |
| QC | QualityGate | All components |
| Release | ReleaseOps | QC Pass |

---

## Agent Files

All agent definitions are stored in `.claude/agents/`:

```
.claude/agents/
├── index.md              # This file
├── SOURCE_OF_TRUTH.md    # Canonical definitions
├── orchestrator.md       # Central router
├── repo-ops.md           # RepoOps agent
├── promptsmith.md        # PromptSmith agent
├── lyricist.md           # Lyricist agent
├── descwriter.md         # DescWriter agent
├── qualitygate.md        # QualityGate agent
├── releaseops.md         # ReleaseOps agent
│
│   # Production Enhancement Agents
├── beatdoctor.md         # Sound design & instrumentation
├── humantouch.md         # De-robotize lyrics
├── vocalcoach.md         # Vocal delivery guidance
├── culturecheck.md       # Regional authenticity
├── mixengineer.md        # Post-production notes
│
│   # Audio Analysis Agents
├── audio-qa-engineer.md  # Technical audio QA
│
│   # Distribution & Marketing Agents (NEW)
├── distro-uploader.md    # DistroKid automation
├── social-media.md       # Social content generation
├── metadata-validator.md # Metadata validation
└── setlist-curator.md    # Track sequencing optimizer
```

---

## Status Checking

Before any action, agents check:

1. **release_tracker.md** - Current track/project status
2. **Prerequisites** - Required prior stages complete
3. **SOURCE_OF_TRUTH.md** - Valid commands and formats

### Quick Status Commands

```
"What's the status?"      → Orchestrator shows project overview
"Where are we at?"        → Orchestrator shows track progress
@repo status              → Repository health
@release checklist        → Distribution readiness
```

---

## Adding New Agents

To add a new agent:

1. Create `[agent-name].md` in `.claude/agents/`
2. Include required sections:
   - Purpose
   - Capabilities
   - Inputs
   - Outputs
   - Guardrails
   - Example Usage
   - **Source References** (NEW - must reference SOURCE_OF_TRUTH.md)
3. Update this index
4. Update `CLAUDE.md` agent table
5. Add to Orchestrator routing table

### Required Source References Section

All agents must include:

```markdown
## Source References

| Document | Purpose | Check Frequency |
|----------|---------|-----------------|
| SOURCE_OF_TRUTH.md | Canonical definitions | Always |
| release_tracker.md | Current status | Before actions |
| TRACKLIST.md | Track specifications | For track operations |

### Integration with Orchestrator

[Agent] accepts context injection from the Orchestrator:
\`\`\`yaml
ORCHESTRATOR_CONTEXT:
  track_number: N
  current_stage: [from release_tracker.md]
  ...
\`\`\`
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  MAG MUSIC RECORDS - AGENT QUICK REFERENCE                  │
├─────────────────────────────────────────────────────────────┤
│  WANDA: Prompt Track N     Generate Suno prompt             │
│  WANDA: Lyrics Track N     Generate lyrics                  │
│  WANDA: Description Track N Generate description            │
│  @qc Track N               Quality control report           │
│  @release Track N          Release prep checklist           │
│  @repo status              Repository health check          │
│  @distro Track N           DistroKid upload package (NEW)   │
│  @social Track N           Social media content (NEW)       │
│  @metadata Track N         Validate metadata (NEW)          │
│  @setlist [project]        Optimize tracklist (NEW)         │
├─────────────────────────────────────────────────────────────┤
│  STATUS: "What's the status?" or "Where are we at?"         │
│  HELP: Reference this index or CLAUDE.md                    │
├─────────────────────────────────────────────────────────────┤
│  CURRENT PROJECT: MAG_Hardcore_Drill_Vol_1                  │
│  LEAD SINGLE: Track 2                                       │
└─────────────────────────────────────────────────────────────┘
```
