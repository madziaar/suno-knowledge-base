# Select Best Version

**Command:** `/select [TRACK_NUMBER] [VERSION]`
**Example:** `/select 2 v1` or `/select 2 v2`

---

## Purpose

Mark the best version of a generated track as the "selected" version for extension and final export.

---

## Workflow

### Step 1: Show Available Versions
```
If no version specified:
  1. List all versions for track
  2. Show duration and rating
  3. Ask user to select
```

### Step 2: Verify Selection
```
1. Confirm track number and version
2. Show version details
3. Get user confirmation
```

### Step 3: Update State
```
1. Update project_state.json
2. Set selectedVersion field
3. Log selection in history
```

### Step 4: Report
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ VERSION SELECTED                                              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Track: 2 - "Patrão do Bairro"                                   ║
║  Selected: Version 1                                             ║
║                                                                   ║
║  Version Details:                                                 ║
║  • Duration: 1:35                                                ║
║  • Generated: 2026-01-01                                         ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  • /extend 2 - Extend to full length                             ║
║  • /listen 2 - Play selected version                             ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Version Comparison View

When showing versions:
```
╔══════════════════════════════════════════════════════════════════╗
║                    SELECT VERSION: Track 2                       ║
║                    "Patrão do Bairro"                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  VERSION COMPARISON                                               ║
║  ─────────────────────────────────────────────────────────────── ║
║  Version │ Duration │ Generated   │ Notes                        ║
║  ────────┼──────────┼─────────────┼───────────────────────────── ║
║  v1      │ 1:35     │ 2026-01-01  │ Stronger intro               ║
║  v2      │ 1:41     │ 2026-01-01  │ Better hook delivery         ║
║                                                                   ║
║  Currently selected: None                                        ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  Enter: /select 2 v1 or /select 2 v2                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Rating Versions

You can add notes when selecting:
```
/select 2 v1 "Stronger intro, cleaner mix"
```

This adds the note to the version record for future reference.

---

## Select All (Interactive)

For selecting best versions across all tracks:
```
/select-all
```

This walks through each track with multiple versions and prompts for selection.

---

## State Updates

After selection:
```json
{
  "tracks": [
    {
      "number": 2,
      "title": "Patrão do Bairro",
      "versions": [
        { "id": "v1", "length": "1:35", "rating": null },
        { "id": "v2", "length": "1:41", "rating": null }
      ],
      "selectedVersion": "v1",
      "notes": "Stronger intro, cleaner mix"
    }
  ]
}
```

---

## Selection Criteria Guide

When choosing between versions, consider:

| Aspect | What to Check |
|--------|---------------|
| **Intro** | Clean start, proper buildup |
| **Hook** | Clear delivery, memorable |
| **Beat** | Consistent, proper 808s |
| **Vocals** | Clear, proper tone |
| **Mix** | Balanced, no clipping |
| **Vibe** | Matches intended mood |

---

## Change Selection

To change a previous selection:
```
/select 2 v2
```

This will update the selection and log the change in history.

---

## Error Handling

| Error | Action |
|-------|--------|
| Track not found | Report, list available tracks |
| Version not found | Report, list available versions |
| No versions generated | Suggest running /generate first |
