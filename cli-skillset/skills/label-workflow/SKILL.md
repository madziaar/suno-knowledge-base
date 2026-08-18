---
name: label-workflow
description: MAG Music Records mixtape workflow. Use for WANDA commands, Track N prompts, drill/mixtape ops.
---

# Label workflow (MAG)

Root: `projects/MAG-Music-Records`

## Commands (user language)

| Phrase | Do |
|--------|-----|
| `WANDA: Prompt Track N` | Style prompt only |
| `WANDA: Lyrics Track N` | Lyrics only |
| `WANDA: Description Track N` | Metadata / listing copy |

Read `projects/MAG-Music-Records/README.md`, `SOURCE_OF_TRUTH.md`, and playbooks under `docs/playbooks/` plus templates in `templates/`.

## Layout

```
.claude/agents/     # local agent defs
docs/playbooks/
templates/
scripts/hooks/      # PowerShell git hooks
projects/mixtapes/  # active tape folders
tracks/
```

## Rules

- One track at a time unless asked for the full tape.
- Keep prompt / lyrics / description as **separate** artifacts matching their templates.
- Honor `ARTIST_STYLE_PROFILE.md` and any tape-specific bible (`RICK_ROSS_STYLE_BLUEPRINT.md` etc.) before inventing a new voice.
- After generation, run `quality-gates` before calling a track done.

Hooks: `scripts/setup-hooks.ps1` (Windows). On Linux/macOS, do not blindly run ps1; follow `INSTALLATION_CHECKLIST.md`.
