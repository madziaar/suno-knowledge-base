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
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
│  WANDA Mode   │    │  Utility Mode   │    │  Reference    │
│    Agents     │    │    Agents       │    │  Documents    │
├───────────────┤    ├─────────────────┤    ├───────────────┤
│ PromptSmith   │    │ QualityGate     │    │ SOURCE_OF_    │
│ Lyricist      │    │ ReleaseOps      │    │   TRUTH.md    │
│ DescWriter    │    │ RepoOps         │    │ release_      │
│               │    │                 │    │   tracker.md  │
└───────────────┘    └─────────────────┘    └───────────────┘
```

All requests flow through the Orchestrator, which checks status, validates prerequisites, and routes to the appropriate agent.

---

## Agent Overview

| Agent | Activation | Purpose | Mode |
|-------|------------|---------|------|
| [Orchestrator](orchestrator.md) | *auto* | Central routing hub | Utility |
| [RepoOps](repo-ops.md) | `@repo` | Repository maintenance | Utility |
| [PromptSmith](promptsmith.md) | `WANDA: Prompt` | Suno prompt generation | WANDA |
| [Lyricist](lyricist.md) | `WANDA: Lyrics` | Lyrics generation | WANDA |
| [DescWriter](descwriter.md) | `WANDA: Description` | Track descriptions | WANDA |
| [QualityGate](qualitygate.md) | `@qc` | Quality control | Utility |
| [ReleaseOps](releaseops.md) | `@release` | Distribution prep | Utility |

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

```
PLANNING → PROMPT → LYRICS → AUDIO → QC → DESCRIPTION → METADATA → RELEASE
                                          │
                                          └── Each stage requires previous stage complete
```

| Stage | Agent | Prerequisite |
|-------|-------|--------------|
| Prompt | PromptSmith | None |
| Lyrics | Lyricist | Prompt exists |
| Description | DescWriter | Lyrics exist |
| QC | QualityGate | Prompt + Lyrics + Description |
| Release | ReleaseOps | QC Pass |

---

## Agent Files

All agent definitions are stored in `.claude/agents/`:

```
.claude/agents/
├── index.md              # This file
├── SOURCE_OF_TRUTH.md    # Canonical definitions
├── orchestrator.md       # Central router (NEW)
├── repo-ops.md           # RepoOps agent
├── promptsmith.md        # PromptSmith agent
├── lyricist.md           # Lyricist agent
├── descwriter.md         # DescWriter agent
├── qualitygate.md        # QualityGate agent
└── releaseops.md         # ReleaseOps agent
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
├─────────────────────────────────────────────────────────────┤
│  STATUS: "What's the status?" or "Where are we at?"         │
│  HELP: Reference this index or CLAUDE.md                    │
├─────────────────────────────────────────────────────────────┤
│  CURRENT PROJECT: MAG_Hardcore_Drill_Vol_1                  │
│  LEAD SINGLE: Track 2                                       │
└─────────────────────────────────────────────────────────────┘
```
