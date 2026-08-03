# SOURCE OF TRUTH
## MAG Music Records - Canonical Project Reference

> **Version:** 1.0.0
> **Last Updated:** 2024-12-31
> **Maintainer:** MAG Music Records Team

This document is the single canonical reference for all project definitions, naming conventions, file handling rules, and automation commands. All agents, scripts, and team members MUST reference this document for consistency.

---

## 1. Project Definitions

### Active Projects

| Project ID | Full Name | Abbreviation | Status |
|------------|-----------|--------------|--------|
| `MAG_HDRILL_V1` | MAG Hardcore Drill Vol. 1 | HDRILL-V1 | Active |

### Project ID Format
```
MAG_[GENRE/STYLE]_V[VERSION]
```

---

## 2. Track Naming Format

### Standard Pattern
```
track_[NN]_[short_name]_[type].[ext]
```

### Components

| Component | Description | Example | Rules |
|-----------|-------------|---------|-------|
| `NN` | Two-digit track number | `01`, `02`, `13` | Zero-padded, sequential |
| `short_name` | Descriptive identifier | `nightfall`, `city_lights` | Lowercase, underscores only, max 30 chars |
| `type` | Artifact type code | `prompt`, `lyrics`, `desc` | See Type Codes below |
| `ext` | File extension | `md`, `txt`, `yaml` | Lowercase only |

### Type Codes

| Code | Full Name | Extension | Description |
|------|-----------|-----------|-------------|
| `prompt` | Generation Prompt | `.md` | AI generation instructions |
| `lyrics` | Lyrics | `.md` | Song lyrics/vocals |
| `desc` | Description | `.md` | Track description for platforms |
| `meta` | Metadata | `.yaml` | Track metadata configuration |
| `notes` | Production Notes | `.md` | Internal production notes |
| `audio` | Audio File | `.wav`, `.mp3` | Final audio output |
| `stem` | Audio Stem | `.wav` | Individual instrument stems |

### Examples
```
track_01_nightfall_prompt.md
track_01_nightfall_lyrics.md
track_01_nightfall_desc.md
track_02_city_lights_meta.yaml
```

---

## 3. File Commit Rules

### Committed Files (Version Controlled)

| File Type | Extensions | Committed | Notes |
|-----------|------------|-----------|-------|
| Prompts | `.md` | YES | Core creative assets |
| Lyrics | `.md` | YES | Core creative assets |
| Descriptions | `.md` | YES | Platform content |
| Metadata | `.yaml`, `.json` | YES | Configuration |
| Scripts | `.py`, `.sh`, `.ps1` | YES | Automation |
| Documentation | `.md` | YES | Reference materials |
| Templates | `.md`, `.yaml` | YES | Boilerplate files |

### Excluded Files (Git Ignored)

| File Type | Extensions | Committed | Reason |
|-----------|------------|-----------|--------|
| Audio Files | `.wav`, `.mp3`, `.flac`, `.aiff` | NO | Size, binary |
| Video Files | `.mp4`, `.mov`, `.avi` | NO | Size, binary |
| Project Files | `.als`, `.flp`, `.logic` | NO | DAW-specific, binary |
| Stems | `.wav` | NO | Size, binary |
| Exports | `*_export.*` | NO | Generated output |

---

## 4. Character Limits

### Platform Constraints

| Field | Limit | Validation |
|-------|-------|------------|
| Track Description | 1000 chars | Hard limit |
| Track Title | 100 chars | Recommended max |
| Short Description | 280 chars | Social media |
| Prompt Content | 4000 chars | AI generation |
| Lyrics Content | 8000 chars | Per track |
| Meta Tags | 500 chars | Combined |

### Validation Rules
- Descriptions MUST include character count in metadata
- Prompts SHOULD stay under 2000 chars for best results
- Exceeding limits will cause automation failures

---

## 5. WANDA Commands Reference

WANDA (Workflow Automation for Narrative and Digital Assets) is the internal automation system.

### Core Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `WANDA:VALIDATE` | `WANDA:VALIDATE [path]` | Validate file naming and structure |
| `WANDA:GENERATE` | `WANDA:GENERATE [type] [track]` | Generate artifact from template |
| `WANDA:CHECK` | `WANDA:CHECK [project]` | Run project health check |
| `WANDA:EXPORT` | `WANDA:EXPORT [track] [format]` | Export track assets |
| `WANDA:STATUS` | `WANDA:STATUS [project]` | Show project status |
| `WANDA:SYNC` | `WANDA:SYNC` | Synchronize with release calendar |

### Command Examples
```bash
WANDA:VALIDATE projects/MAG_HDRILL_V1/
WANDA:GENERATE prompt track_03
WANDA:CHECK MAG_HDRILL_V1
WANDA:STATUS MAG_HDRILL_V1
```

### Command Flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview changes without executing |
| `--force` | Override warnings (use with caution) |
| `--verbose` | Detailed output |
| `--quiet` | Minimal output |

---

## 6. Folder Structure

### Root Structure
```
MAG Music Records/
├── .claude/                    # Claude AI configuration
├── .github/                    # GitHub workflows
├── .vscode/                    # Editor settings
├── config/                     # Configuration files
│   ├── releases/              # Release calendar configs
│   └── rules/                 # Validation rules
├── docs/                       # Documentation
├── projects/                   # Project workspaces
│   └── [PROJECT_ID]/          # Individual project
│       ├── tracks/            # Track assets
│       ├── artwork/           # Visual assets
│       └── releases/          # Release packages
├── scripts/                    # Automation scripts
├── templates/                  # Template files
├── SOURCE_OF_TRUTH.md         # This file
├── CLAUDE.md                   # AI assistant config
└── README.md                   # Project readme
```

### Immutable Folders

These folders have protected structure and naming:

| Folder | Reason | Modification Rules |
|--------|--------|-------------------|
| `.claude/` | AI configuration | Admin only |
| `.github/` | CI/CD workflows | Admin only |
| `config/` | System configuration | Version controlled changes only |
| `templates/` | Boilerplate files | Versioned, append-only |

### Mutable Folders

| Folder | Purpose | Modification Rules |
|--------|---------|-------------------|
| `projects/` | Active work | Follow naming conventions |
| `docs/` | Documentation | Team editable |
| `scripts/` | Automation | Requires review |

---

## 7. Agent Activation Commands

### Starting Agent Sessions

| Command | Context | Behavior |
|---------|---------|----------|
| `@agent start` | Begin session | Load SOURCE_OF_TRUTH |
| `@agent context [project]` | Set project | Focus on specific project |
| `@agent validate` | Check current work | Run validation rules |
| `@agent help` | Get assistance | Show available commands |

### Agent Modes

| Mode | Command | Description |
|------|---------|-------------|
| Creative | `@mode creative` | Focus on content generation |
| Technical | `@mode technical` | Focus on structure/automation |
| Review | `@mode review` | Focus on quality checks |
| Release | `@mode release` | Focus on release preparation |

### Context Loading
Agents MUST load in this order:
1. `SOURCE_OF_TRUTH.md` (this file)
2. `CLAUDE.md` (AI-specific rules)
3. Project-specific `README.md`
4. Active track metadata

---

## 8. Version Numbering

### Version Suffix Rules

| Suffix | Meaning | Usage |
|--------|---------|-------|
| `_v1`, `_v2`, `_v3` | Iteration number | Work in progress |
| `_draft` | Initial draft | Not reviewed |
| `_review` | Under review | Awaiting feedback |
| `_final` | Approved final | Ready for release |
| `_alt` | Alternative version | Variant exploration |

### Version Progression
```
[name]_v1.md → [name]_v2.md → [name]_final.md
```

### Rules
- Never skip version numbers
- `_final` requires explicit approval
- Keep all versions until release complete
- Archive old versions in `_archive/` subfolder after release

---

## 9. Quality Gates

### Pre-Release Checklist

| Gate | Requirement | Automated |
|------|-------------|-----------|
| Naming | All files follow conventions | YES |
| Completeness | All required artifacts present | YES |
| Limits | Character counts within bounds | YES |
| Metadata | All metadata fields populated | YES |
| Review | Human approval documented | NO |
| Dependencies | All blockers resolved | PARTIAL |

---

## 10. Quick Reference

### File Naming Regex
```regex
^track_[0-9]{2}_[a-z0-9_]{1,30}_(prompt|lyrics|desc|meta|notes)\.(md|yaml|txt)$
```

### Prohibited Patterns
- Spaces in filenames
- Special characters: `! @ # $ % ^ & * ( ) + = { } [ ] | \ : " ; ' < > , ? /`
- Uppercase letters in filenames
- Leading/trailing underscores
- Double underscores

### Emergency Contacts
- System issues: Check `scripts/` for maintenance tools
- Process questions: Reference this document first

---

*This document is authoritative. When in doubt, follow SOURCE_OF_TRUTH.*
