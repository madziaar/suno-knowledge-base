# MAG Music Records

Professional music production workflow for Suno AI content creation.

## Quick Start

### 1. Setup Git Hooks (One-time)
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-hooks.ps1
```

### 2. Start Production
```
WANDA: Prompt Track 2
WANDA: Lyrics Track 2
WANDA: Description Track 2
```

## Current Project

**MAG Hardcore Drill Vol. 1** — 7-track mixtape
- Lead single: Track 2
- Genre: Hardcore Drill / UK Drill
- Status: Pre-production

## Repository Structure

```
├── .claude/agents/     # Claude skill definitions
├── docs/playbooks/     # Step-by-step workflows
├── templates/          # Suno prompts, lyrics, metadata templates
├── scripts/hooks/      # Git hooks (PowerShell)
└── projects/mixtapes/  # Active projects
```

## Key Commands

| Command | Action |
|---------|--------|
| `WANDA: Prompt Track N` | Generate Suno prompt only |
| `WANDA: Lyrics Track N` | Generate lyrics only |
| `WANDA: Description Track N` | Generate description (≤1000 chars) |
| `@qc Track N` | Run quality control checklist |
| `@release Track N` | Prepare for distribution |

## Documentation

- [CLAUDE.md](CLAUDE.md) — How to work in this repo
- [Workflow Playbook](docs/playbooks/WORKFLOW_MIXTAPE_VOL_1.md) — Full production guide
- [WANDA Guide](docs/playbooks/WANDA_EXECUTION.md) — Clean output mode
- [Quality Control](docs/playbooks/QUALITY_CONTROL.md) — Kill list checklist
- [Strip Club Playbook](docs/playbooks/STRIP_CLUB_PLAYBOOK.md) — Adult track guidelines

## File Policy

**Committed:** Prompts, lyrics, metadata, artwork (PNG/JPG), documentation
**NOT Committed:** Audio files (wav/mp3), secrets, large binaries

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
