# Video Quality Control

**Command:** `/video-qc [TRACK_NUMBER]` or `/video-qc [FILE_PATH]`
**Example:** `/video-qc 2` or `/video-qc "C:/Downloads/video.mp4"`

---

## Purpose

Verify lyric video quality before delivery. Checks sync, file integrity, and gets user approval.

---

## Checklist

### 1. File Verification
```
[ ] Video file exists
[ ] File size is reasonable (>10MB for a full song)
[ ] File format is MP4
[ ] Duration matches expected audio length (within 5 seconds)
```

### 2. Sync Verification (REQUIRES HUMAN)
```
[ ] Play first 30 seconds - lyrics appear when sung
[ ] Check chorus timing - lyrics sync with vocals
[ ] Check ending - no lyrics left over after song ends
```

### 3. Visual Quality
```
[ ] Text is readable (not too small, proper contrast)
[ ] No text cut off at edges
[ ] Background visuals are appropriate
```

### 4. Audio Quality
```
[ ] Audio is present and audible
[ ] No clipping or distortion
[ ] Volume level appropriate
```

---

## Workflow

### Step 1: Technical Check
```bash
# Get video info using FFprobe
ffprobe -v quiet -print_format json -show_format -show_streams "video.mp4"

# Check for:
# - Duration
# - Resolution
# - Codec
# - Audio stream present
```

### Step 2: Human Review
```
Ask user to:
1. Play the video
2. Watch at least:
   - First 30 seconds (verify intro sync)
   - One chorus section (verify main sync)
   - Last 10 seconds (verify outro)
3. Report: "Sync looks good" or describe issues
```

### Step 3: Approval
```
IF user approves:
  → Mark video as QC passed
  → Update project_state.json
  → Ready for release

IF issues found:
  → Document issues
  → Return to /lrc or /lyric-video to fix
  → Re-run /video-qc after fixes
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Lyrics appear early | LRC timing offset | Re-sync with CapCut Auto Captions |
| Lyrics appear late | LRC timing offset | Re-sync with CapCut Auto Captions |
| Lyrics completely wrong | LRC from estimated timings | Delete LRC, regenerate from audio |
| Text too small | Wrong font size | Re-export with larger font |
| Text cut off | Wrong positioning | Adjust subtitle margins |
| No audio | Audio track missing | Re-render with audio file |

---

## QC Report Template

```
╔══════════════════════════════════════════════════════════════════╗
║  VIDEO QC REPORT                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Track: [N] - [Title]                                             ║
║  File: [filename.mp4]                                             ║
║                                                                   ║
║  TECHNICAL CHECKS                                                 ║
║  [✓/✗] File exists                                               ║
║  [✓/✗] Size: [X] MB                                              ║
║  [✓/✗] Duration: [X:XX]                                          ║
║  [✓/✗] Resolution: [WxH]                                         ║
║  [✓/✗] Audio present                                             ║
║                                                                   ║
║  HUMAN REVIEW                                                     ║
║  [✓/✗] Intro sync verified                                       ║
║  [✓/✗] Chorus sync verified                                      ║
║  [✓/✗] Outro sync verified                                       ║
║  [✓/✗] Text readable                                             ║
║                                                                   ║
║  RESULT: [PASS/FAIL]                                              ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Integration

Run after `/lyric-video` completes:

```
/lyric-video N
    ↓
/video-qc N        ← YOU ARE HERE
    ↓
[If PASS] → Upload to YouTube/TikTok
[If FAIL] → Fix and re-render
```
