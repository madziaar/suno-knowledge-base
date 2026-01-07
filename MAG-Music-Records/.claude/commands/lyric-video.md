# Generate Lyric Video

**Command:** `/lyric-video [TRACK_NUMBER]`
**Example:** `/lyric-video 2` or `/lyric-video 6`

---

## ⛔ CRITICAL: Quality Gates

> **This workflow has MANDATORY checkpoints to prevent bad exports.**

### Gate 1: Audio Existence (HARD STOP)
```
IF audio file does NOT exist in 03_audio_exports/:
  → STOP IMMEDIATELY
  → Tell user: "Audio required. Use /download [N] first."
  → DO NOT proceed to any other step
```

### Gate 2: LRC Source Verification
```
IF LRC exists, CHECK HOW IT WAS CREATED:
  → Was it created from Whisper/CapCut Auto Captions? ✓ Proceed
  → Was it created with estimated timings? ✗ DELETE and regenerate!

The LRC file MUST have been generated from actual audio transcription.
```

### Gate 3: Preview Sync Check (MANDATORY)
```
BEFORE full render, you MUST:
  1. Generate a quick preview (30 seconds)
  2. Play preview for user to verify sync
  3. Get explicit approval: "Sync looks good"

DO NOT proceed to full render without preview approval.
```

### Gate 4: Final QC Before Delivery
```
BEFORE delivering video as complete:
  1. Verify file exists and has reasonable size
  2. Confirm with user they've watched and approved
```

---

## Purpose

Full automated workflow to generate a lyric video from audio, combining:
- Audio track
- Background stock footage
- Synchronized subtitle overlays

---

## Prerequisites

1. **Audio file:** `03_audio_exports/track_[NN]_*_final.mp3` ⚠️ **REQUIRED - HARD STOP IF MISSING**
2. **LRC/SRT file:** `09_video/lrc/track_[NN].srt` (run `/lrc [N]` first) ⚠️ **Must be from audio transcription**
3. **Stock footage:** `09_video/stock/track_[NN]/` (run `/stock [N]` first)
4. **FFmpeg installed:** Must be in system PATH

---

## Full Workflow

### Step 1: Verify Prerequisites (GATE 1 & 2)
```
MANDATORY CHECKS:
1. ✓ Audio file exists in 03_audio_exports/
   → If NO: STOP! Tell user to download audio first.

2. ✓ LRC file exists and was created from audio
   → If from estimated timings: DELETE and regenerate with Whisper/CapCut

3. ✓ Stock footage available
   → If NO: Can proceed with solid color background for preview

4. ✓ FFmpeg installed
```

### Step 2: Generate Preview (GATE 3 - MANDATORY)
```bash
python tools/video_render/preview.py \
  --audio "03_audio_exports/track_02_final.mp3" \
  --subtitles "09_video/lrc/track_02.srt" \
  --output "09_video/renders/track_02_preview.mp4" \
  --color "0x1a1a2e"
```

Preview is fast (solid color background) - good for checking subtitle timing.

### Step 3: Render Full Video
```bash
python tools/video_render/compose.py \
  --audio "03_audio_exports/track_02_final.mp3" \
  --background "09_video/stock/track_02/" \
  --subtitles "09_video/lrc/track_02.ass" \
  --output "09_video/renders/track_02_lyric_video.mp4" \
  --width 1920 --height 1080 --fps 30 \
  --vertical
```

### Step 4: Report Output
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ LYRIC VIDEO COMPLETE                                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Track: 2 - Body                                                  ║
║  Duration: 3:45                                                   ║
║  Resolution: 1920x1080                                            ║
║                                                                   ║
║  OUTPUT FILES:                                                    ║
║  • 09_video/renders/track_02_lyric_video.mp4 (YouTube)           ║
║  • 09_video/renders/track_02_lyric_video_vertical.mp4 (TikTok)   ║
║                                                                   ║
║  NEXT STEPS:                                                      ║
║  • Review video and check subtitle timing                        ║
║  • Upload to YouTube/TikTok/Instagram                            ║
║  • Generate thumbnail with /cover [N]                            ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Output Formats

| File | Resolution | Platform |
|------|------------|----------|
| `track_[NN]_lyric_video.mp4` | 1920x1080 (16:9) | YouTube, Facebook |
| `track_[NN]_lyric_video_vertical.mp4` | 1080x1920 (9:16) | TikTok, Reels, Shorts |

---

## Quality Presets

| Preset | Resolution | Use Case |
|--------|------------|----------|
| Preview | 1280x720 | Quick check, subtitle timing |
| Standard | 1920x1080 | YouTube, most platforms |
| High | 2560x1440 | High quality uploads |

---

## FFmpeg Requirements

FFmpeg must be installed and in PATH:

**Windows:**
```
winget install FFmpeg
```
Or download from: https://ffmpeg.org/download.html

**Mac:**
```
brew install ffmpeg
```

**Linux:**
```
sudo apt install ffmpeg
```

---

## Subtitle Styling

The video uses ASS format for styled subtitles:

| Style | Visual |
|-------|--------|
| karaoke | Yellow text, large font, bottom center |
| minimal | White text, clean |
| bold | Large white with black outline |

Edit style in: `tools/lyric_sync/convert.py`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| FFmpeg not found | Install FFmpeg and add to PATH |
| Subtitles not showing | Check ASS/SRT file path, use forward slashes |
| Video too short | Check audio duration matches clips |
| Poor quality | Increase resolution, lower CRF value |
| Render too slow | Use preview mode first, render overnight |

---

## Manual CapCut Alternative

For more control, use CapCut web editor:
1. `/capcut [N]` - Opens CapCut with assets prepared
2. Import audio and stock clips manually
3. Import SRT file via "Upload caption file"
4. Style captions (font size, color)
5. Export manually

---

## Integration with Workflow

```
/track N                    # Create prompt + lyrics
    ↓
/generate N                 # Generate in Suno
    ↓
/download N                 # Download audio
    ↓
/lrc N                      # Generate subtitles
    ↓
/stock N                    # Find stock footage
    ↓
/lyric-video N              # ← YOU ARE HERE
    ↓
Upload to YouTube/TikTok
```
