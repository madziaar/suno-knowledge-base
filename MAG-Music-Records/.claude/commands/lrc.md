# Generate LRC File

**Command:** `/lrc [TRACK_NUMBER]`
**Example:** `/lrc 2` or `/lrc 6`

---

## Purpose

Generate synchronized LRC/SRT subtitle files from audio using Whisper AI transcription, then align with source lyrics for accuracy.

---

## Prerequisites

1. **Audio file exists:** `03_audio_exports/track_[NN]_*_final.mp3`
2. **Lyrics file exists:** `02_lyrics/track_[NN]_*_lyrics.txt`
3. **Python dependencies installed:**
   ```bash
   pip install faster-whisper numpy torch python-Levenshtein pysrt
   ```

---

## Workflow

### Step 1: Locate Files
```
1. Find audio file in 03_audio_exports/ matching track number
2. Find lyrics file in 02_lyrics/ matching track number
3. Create output directory: 09_video/lrc/
```

### Step 2: Run Whisper Transcription
```bash
python tools/lyric_sync/transcribe.py \
  "03_audio_exports/track_02_body_final.mp3" \
  --model medium \
  --output "09_video/lrc/track_02_whisper.json"
```

### Step 3: Align with Source Lyrics
```bash
python tools/lyric_sync/align.py \
  --whisper "09_video/lrc/track_02_whisper.json" \
  --lyrics "02_lyrics/track_02_body_lyrics.txt" \
  --output "09_video/lrc/track_02.lrc" \
  --title "Track Title" \
  --artist "MAG Music Records" \
  --srt
```

### Step 4: Convert to ASS (Styled)
```bash
python tools/lyric_sync/convert.py \
  --input "09_video/lrc/track_02.lrc" \
  --formats srt,ass \
  --style karaoke
```

---

## Output Files

| File | Format | Purpose |
|------|--------|---------|
| `track_[NN].lrc` | LRC | Standard lyrics format |
| `track_[NN].srt` | SRT | Video subtitle format |
| `track_[NN].ass` | ASS | Styled karaoke format |
| `track_[NN]_whisper.json` | JSON | Raw transcription data |

---

## Style Options for ASS

| Style | Description |
|-------|-------------|
| `karaoke` | Yellow text, large font, centered bottom |
| `minimal` | White text, clean look |
| `bold` | Large white text with heavy outline |

---

## Manual LRC Creation (Alternative)

If Whisper is not available, create LRC manually:

```
[ti:Track Title]
[ar:MAG Music Records]
[al:Album Name]

[00:02.00]First lyric line
[00:06.00]Second lyric line
[00:10.00]Third lyric line
```

Save to: `09_video/lrc/track_[NN].lrc`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Whisper not found | `pip install faster-whisper` |
| CUDA out of memory | Use `--model small` or `--model tiny` |
| Poor alignment | Lower `--threshold 0.4` for fuzzy matching |
| Wrong language | Add `--language en` or `--language pt` |

---

## Next Steps

After LRC generation:
1. `/stock [N]` - Find stock footage
2. `/lyric-video [N]` - Generate full video
