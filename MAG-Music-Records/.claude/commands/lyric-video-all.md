# Generate All Lyric Videos

**Command:** `/lyric-video-all` or `/lyric-video-all [START]-[END]`
**Example:** `/lyric-video-all` or `/lyric-video-all 1-6`

---

## Purpose

Batch generate lyric videos for all tracks (or a range) in the current project. Automates the full pipeline: LRC → Stock → Render.

---

## Prerequisites

1. **All audio files ready:** `03_audio_exports/track_*_final.mp3`
2. **All lyrics files ready:** `02_lyrics/track_*_lyrics.txt`
3. **FFmpeg installed**
4. **API keys configured (optional):** PEXELS_API_KEY, PIXABAY_API_KEY

---

## Workflow

### Step 1: Scan Project
```
1. Read TRACKLIST.md to get all track numbers
2. Check which tracks have audio files
3. Check which tracks already have LRC files
4. Check which tracks already have stock footage
5. Report status and request confirmation
```

### Step 2: Pre-Generation Report
```
╔══════════════════════════════════════════════════════════════════╗
║  LYRIC VIDEO BATCH - PRE-FLIGHT CHECK                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Project: MAG_Refined_Vol_1                                      ║
║  Tracks: 1-6                                                      ║
║                                                                   ║
║  Track │ Audio │ Lyrics │ LRC  │ Stock │ Video │ Status         ║
║  ──────┼───────┼────────┼──────┼───────┼───────┼──────────────  ║
║  1     │ ✓     │ ✓      │ ✓    │ ✓     │ ✓     │ Complete       ║
║  2     │ ✓     │ ✓      │ ✓    │ ⬜    │ ⬜    │ Need stock     ║
║  3     │ ✓     │ ✓      │ ⬜   │ ⬜    │ ⬜    │ Need LRC       ║
║  4     │ ✓     │ ✓      │ ⬜   │ ⬜    │ ⬜    │ Need LRC       ║
║  5     │ ✓     │ ✓      │ ⬜   │ ⬜    │ ⬜    │ Need LRC       ║
║  6     │ ✓     │ ✓      │ ✓    │ ✓     │ ⬜    │ Ready to render║
║                                                                   ║
║  ACTIONS REQUIRED:                                                ║
║  • Generate LRC for 4 tracks (3, 4, 5, 6)                        ║
║  • Find stock footage for 5 tracks                               ║
║  • Render video for 5 tracks                                     ║
║                                                                   ║
║  Estimated time: ~30 minutes                                      ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝

Proceed with batch generation? (y/n)
```

### Step 3: Sequential Processing
```
For each track:
  1. Generate LRC if missing
  2. Find stock footage if missing
  3. Render lyric video
  4. Create vertical version
  5. Update project_state.json
  6. Report progress
```

### Step 4: Completion Report
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ BATCH COMPLETE                                                 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Videos Generated: 6/6                                           ║
║  Total Time: 45 minutes                                          ║
║                                                                   ║
║  OUTPUT FILES:                                                    ║
║  ─────────────────────────────────────────────────────────────── ║
║  Track │ Horizontal (16:9)               │ Vertical (9:16)       ║
║  ──────┼─────────────────────────────────┼─────────────────────  ║
║  1     │ track_01_lyric_video.mp4        │ track_01_*_vertical   ║
║  2     │ track_02_lyric_video.mp4        │ track_02_*_vertical   ║
║  3     │ track_03_lyric_video.mp4        │ track_03_*_vertical   ║
║  4     │ track_04_lyric_video.mp4        │ track_04_*_vertical   ║
║  5     │ track_05_lyric_video.mp4        │ track_05_*_vertical   ║
║  6     │ track_06_lyric_video.mp4        │ track_06_*_vertical   ║
║                                                                   ║
║  All files saved to: 09_video/renders/                           ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Parallel Processing

For faster generation, Claude can spawn multiple agents:

```
Agent 1: /lrc 1, /lrc 2, /lrc 3
Agent 2: /lrc 4, /lrc 5, /lrc 6
Agent 3: /stock 1, /stock 2, /stock 3
Agent 4: /stock 4, /stock 5, /stock 6
```

Then render sequentially (FFmpeg is CPU-intensive).

---

## Error Handling

| Error | Action |
|-------|--------|
| Missing audio | Skip track, report at end |
| Missing lyrics | Skip track, report at end |
| LRC generation failed | Retry once, then skip |
| Stock API rate limit | Wait 60 seconds, retry |
| FFmpeg error | Log error, continue next track |

---

## Resume Interrupted Batch

If batch is interrupted:
```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠ BATCH INTERRUPTED                                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Completed: 3/6 tracks                                           ║
║  Remaining: 4, 5, 6                                              ║
║                                                                   ║
║  To resume: /lyric-video-all 4-6                                 ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Project State Tracking

Updates `project_state.json` with video status:

```json
{
  "tracks": [
    {
      "number": 1,
      "video": {
        "lrc": "complete",
        "stock": "complete",
        "render": "complete",
        "horizontal": "09_video/renders/track_01_lyric_video.mp4",
        "vertical": "09_video/renders/track_01_lyric_video_vertical.mp4"
      }
    }
  ]
}
```
