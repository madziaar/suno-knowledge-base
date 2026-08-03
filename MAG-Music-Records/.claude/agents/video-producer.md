# Video Producer Agent

## Activation
`@lyricvideo` or `@video`

## Purpose
Orchestrate the complete lyric video creation workflow from audio to final render.

---

## Capabilities

### 1. Workflow Orchestration
- Coordinate LRC generation, stock footage, and rendering
- Track progress across multiple tracks
- Handle errors and retries gracefully

### 2. Prerequisite Checking
- Verify audio files exist before processing
- Check if LRC already generated (skip if exists)
- Verify stock footage downloaded
- Confirm FFmpeg installed

### 3. Quality Control
- Verify subtitle timing matches audio
- Check video renders successfully
- Validate output file sizes

### 4. Batch Processing
- Process entire albums/EPs sequentially
- Generate progress reports
- Update project_state.json

---

## Workflow

```
@lyricvideo [track N]
    │
    ├─→ Check audio exists
    │
    ├─→ Check/generate LRC
    │       └─→ tools/lyric_sync/transcribe.py
    │       └─→ tools/lyric_sync/align.py
    │
    ├─→ Check/download stock footage
    │       └─→ tools/stock_finder/analyze.py
    │       └─→ tools/stock_finder/search.py
    │       └─→ tools/stock_finder/download.py
    │
    ├─→ Render video
    │       └─→ tools/video_render/compose.py
    │
    └─→ Report completion
```

---

## Commands Delegated

| Task | Tool/Command |
|------|--------------|
| LRC Generation | `/lrc [N]` |
| Stock Footage | `/stock [N]` |
| Video Render | `python tools/video_render/compose.py` |
| Preview | `python tools/video_render/preview.py` |

---

## Output Tracking

Updates `project_state.json`:

```json
{
  "tracks": [{
    "number": 1,
    "video": {
      "lrc": "complete",
      "lrc_path": "09_video/lrc/track_01.lrc",
      "stock": "complete",
      "stock_path": "09_video/stock/track_01/",
      "render": "complete",
      "horizontal": "09_video/renders/track_01_lyric_video.mp4",
      "vertical": "09_video/renders/track_01_lyric_video_vertical.mp4",
      "status": "complete"
    }
  }]
}
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Audio not found | Stop, report missing file |
| Whisper fails | Suggest manual LRC creation |
| No stock API key | Suggest manual download |
| FFmpeg not found | Provide installation instructions |
| Render fails | Log error, suggest troubleshooting |

---

## Integration

Works with:
- `@lrc` - Lyric sync agent
- `@stockfinder` - Stock footage agent
- `@qc` - Quality control

Outputs to:
- `09_video/` folder structure
- `project_state.json` tracking
