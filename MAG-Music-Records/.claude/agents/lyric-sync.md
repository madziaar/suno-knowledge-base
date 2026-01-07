# Lyric Sync Agent

## Activation
`@lrc`

## Purpose
Generate synchronized LRC/SRT subtitle files from audio tracks using Whisper AI transcription and source lyrics alignment.

---

## Capabilities

### 1. Audio Transcription
- Run faster-whisper on audio files
- Generate word-level timestamps
- Support multiple languages (English, Portuguese, etc.)

### 2. Lyrics Alignment
- Match Whisper output to source lyrics
- Use fuzzy matching for accuracy
- Preserve original spelling/formatting

### 3. Format Conversion
- Export LRC (standard lyrics format)
- Export SRT (video subtitles)
- Export ASS (styled karaoke)

### 4. Styling
- Apply karaoke highlight styles
- Customize font, color, position
- Generate platform-specific formats

---

## Tools Used

| Tool | Purpose |
|------|---------|
| `transcribe.py` | Whisper audio-to-text |
| `align.py` | Match transcription to lyrics |
| `convert.py` | Format conversion + styling |

---

## Workflow

```
@lrc [track N]
    │
    ├─→ Locate audio: 03_audio_exports/track_[NN]_*_final.mp3
    │
    ├─→ Locate lyrics: 02_lyrics/track_[NN]_*_lyrics.txt
    │
    ├─→ Transcribe with Whisper
    │       └─→ Output: 09_video/lrc/track_[NN]_whisper.json
    │
    ├─→ Align with source lyrics
    │       └─→ Output: 09_video/lrc/track_[NN].lrc
    │
    ├─→ Convert to additional formats
    │       └─→ Output: track_[NN].srt, track_[NN].ass
    │
    └─→ Report completion with alignment quality
```

---

## Model Selection

| Model | Speed | Accuracy | Memory |
|-------|-------|----------|--------|
| tiny | Fastest | Low | ~1GB |
| base | Fast | Medium | ~1GB |
| small | Medium | Good | ~2GB |
| medium | Slow | High | ~5GB |
| large-v3 | Slowest | Best | ~10GB |

Default: `medium` (best balance)

---

## Language Support

Whisper supports 50+ languages including:
- English (en)
- Portuguese (pt)
- Spanish (es)
- French (fr)
- And more...

Auto-detection is default; specify with `--language` for better results.

---

## Output Quality

Reports alignment quality:
```
Alignment Report:
  Total lines: 45
  Matched: 42 (93.3%)
  Interpolated: 3 (6.7%)

  Quality: GOOD
```

| Quality | Matched % | Action |
|---------|-----------|--------|
| EXCELLENT | 95%+ | Proceed |
| GOOD | 80-94% | Review |
| FAIR | 60-79% | Manual check |
| POOR | <60% | Manual LRC |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Poor match quality | Use `--threshold 0.4` |
| Wrong language | Specify `--language pt` |
| Memory error | Use smaller model |
| Slow processing | Use `tiny` or `base` model |
