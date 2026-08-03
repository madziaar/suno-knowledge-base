# Generate All Tracks in Suno

**Command:** `/generate-all` or `/generate-all [START]-[END]`
**Example:** `/generate-all` or `/generate-all 1-6`

---

## Purpose

Batch generate multiple tracks in Suno.ai sequentially. Useful for generating entire album or range of tracks.

---

## Prerequisites

Before running:
- All prompt files must exist: `01_prompts/track_[NN]_*_prompt.txt`
- All lyrics files must exist: `02_lyrics/track_[NN]_*_lyrics.txt`
- Suno.ai must be accessible in browser
- User must be logged into Suno
- Sufficient credits (100 per track × number of tracks)

---

## Workflow

### Step 1: Verify All Files
```
1. Scan 01_prompts/ for all track prompts
2. Scan 02_lyrics/ for all track lyrics
3. Match prompts to lyrics by track number
4. Report any missing files before starting
```

### Step 2: Credit Check
```
1. Calculate total credits needed (tracks × 100)
2. Check current Suno credit balance
3. If insufficient, report and stop
4. If sufficient, proceed with confirmation
```

### Step 3: Queue Tracks
```
1. Build generation queue in track order
2. Display queue for user confirmation
3. Wait for user approval to proceed
```

### Step 4: Sequential Generation
```
For each track in queue:
  1. Load prompt and lyrics
  2. Navigate to suno.com/create
  3. Enter content (use /generate workflow)
  4. Click Create
  5. Wait for generation (~45 seconds)
  6. Log result
  7. Brief pause (5 seconds) between tracks
```

### Step 5: Report Results
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ BATCH GENERATION COMPLETE                                     ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Tracks Generated: 12/12                                         ║
║  Total Credits Used: 1200                                        ║
║  Time Elapsed: 18 minutes                                        ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  RESULTS                                                          ║
║  ─────────────────────────────────────────────────────────────── ║
║  Track  │ Title              │ Status │ Versions                 ║
║  ───────┼────────────────────┼────────┼───────────────────────── ║
║  1      │ Abertura           │ ✓      │ v1 (1:28), v2 (1:32)    ║
║  2      │ Patrão do Bairro   │ ✓      │ v1 (1:35), v2 (1:41)    ║
║  3      │ Ouro dos Anos 80   │ ✓      │ v1 (1:22), v2 (1:29)    ║
║  ...                                                              ║
║  12     │ Enxofre            │ ✓      │ v1 (1:45), v2 (1:38)    ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  • /listen all - Review all generated versions                   ║
║  • /select all - Select best versions                            ║
║  • /extend-all - Extend all to full length                       ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Missing prompt file | Skip track, report at end |
| Missing lyrics file | Skip track, report at end |
| Generation failed | Retry once, then skip |
| Insufficient credits | Stop batch, report remaining |
| Rate limit hit | Pause 60 seconds, retry |
| Session timeout | Re-authenticate, continue |

---

## Partial Generation

If generation is interrupted:
```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠ BATCH GENERATION INTERRUPTED                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Completed: 7/12 tracks                                          ║
║  Remaining: 5 tracks (8, 9, 10, 11, 12)                          ║
║                                                                   ║
║  To resume: /generate-all 8-12                                   ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Rate Limiting

To avoid Suno rate limits:
- 5 second pause between generations
- Maximum 20 tracks per session
- If rate limited, automatic 60 second cooldown

---

## Credits Estimation

| Tracks | Credits Needed | Approximate Time |
|--------|----------------|------------------|
| 1-3    | 300            | ~3 minutes       |
| 4-6    | 600            | ~6 minutes       |
| 7-10   | 1000           | ~10 minutes      |
| 11-12  | 1200           | ~12 minutes      |

Always verify credit balance before batch operations.
