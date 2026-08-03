# WANDA Execution Guide

**WANDA** = Write And No Discussion Added

## Core Principle

When WANDA mode is active, Claude outputs **ONLY** the requested content. No preamble, no explanation, no commentary.

## Activation

Prefix your request with `WANDA:` followed by the content type and target.

## Commands

### Prompt Generation
```
WANDA: Prompt Track 2
```
**Output:** Raw Suno prompt text only

### Lyrics Generation
```
WANDA: Lyrics Track 2
```
**Output:** Lyrics with section markers only

### Description Generation
```
WANDA: Description Track 2
```
**Output:** Track description (max 1000 chars) only

## WANDA Rules

| Rule | Requirement |
|------|-------------|
| No intro | Skip "Here's..." or "I've created..." |
| No outro | Skip "Let me know if..." or "Feel free to..." |
| No markdown | Unless explicitly requested |
| No code blocks | Raw text for direct copy-paste |
| Character limit | Descriptions ≤1000 characters |
| Section markers | Lyrics use [Intro], [Verse 1], [Chorus], etc. |

## Examples

### Bad (Non-WANDA)
```
User: Give me a prompt for Track 2

Claude: Here's a Suno prompt for Track 2 of your mixtape:

[Style: UK Drill, 140 BPM...]

Let me know if you'd like any adjustments!
```

### Good (WANDA)
```
User: WANDA: Prompt Track 2

Claude: [Style: UK Drill, Hardcore, Dark]
[BPM: 140]
[Mood: Aggressive, Street, Raw]
[Instruments: 808 bass, hi-hats, drill snares]
[Vocals: Male, aggressive delivery, slight autotune]
[Structure: Intro - Verse - Chorus - Verse - Chorus - Outro]
```

## Batch Commands

### Multiple Tracks
```
WANDA: Prompt Tracks 1-3
```

### Full Track Package
```
WANDA: Full Track 2
```
Outputs prompt, then lyrics, then description (separated by `---`)

## Context Awareness

WANDA commands reference:
- `00_admin/TRACKLIST.md` for track details
- Previous prompts/lyrics for consistency
- Genre guidelines from `STRIP_CLUB_PLAYBOOK.md` if applicable

## Escaping WANDA

To get explanations or discussion:
```
Explain: Track 2 prompt choices
Review: Track 2 lyrics structure
```

## Copy-Paste Workflow

1. Run WANDA command
2. Select all output (Ctrl+A in response)
3. Copy (Ctrl+C)
4. Paste directly into Suno/DistroKid
5. No cleanup needed
