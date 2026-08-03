# /audioqa - Audio Quality Analysis Command

## Command
```
/audioqa [filepath]
/audioqa [directory]
/audioqa
```

## Purpose
Analyze audio files for technical quality issues, generate detailed QA reports with actionable recommendations.

## Arguments
- `filepath` - Path to audio file (WAV, MP3, FLAC, M4A, OGG)
- `directory` - Path to folder (analyzes all audio files within)
- No argument - Interactive mode, prompts for file path

## Workflow

### 1. File Validation
```
- Check file/directory exists
- Validate supported audio format
- Verify file is not corrupted
```

### 2. Run Analysis Script
```bash
python tools/audio_qa/analyze.py "[filepath]"
```

### 3. Analysis Performed
| Check | Method | Automated |
|-------|--------|-----------|
| BPM Detection | librosa beat tracking | Yes |
| Loudness (LUFS) | ITU-R BS.1770 | Yes |
| True Peak | dBTP measurement | Yes |
| Clipping Detection | Sample value scan | Yes |
| Dynamic Range | Loudness range | Yes |
| Frequency Balance | Spectral centroid | Yes |
| Stereo Width | Correlation analysis | Yes |
| Silence Detection | RMS threshold | Yes |
| Phase Issues | Phase correlation | Yes |

### 4. Generate Report
Save report to: `reports/audioqa_[trackname]_[YYYYMMDD_HHMMSS].md`

### 5. Display Summary
Show pass/warn/fail summary with key metrics.

---

## Example Usage

### Single File Analysis
```
/audioqa tracks/incoming/track_02_hood_boss.wav
```

Output:
```
AUDIO QA REPORT: track_02_hood_boss.wav
========================================

TECHNICAL METRICS:
  BPM: 84.2 (TARGET: 74-96) ✓ PASS
  Integrated LUFS: -11.2 ✓ PASS
  True Peak: -0.8 dBTP ⚠ WARNING
  Dynamic Range: 7.4 dB ✓ PASS

AUTOMATED CHECKS:
  [PASS] No digital clipping detected
  [PASS] Stereo phase correlation OK
  [WARN] Slight high-frequency harshness (6-8kHz)
  [PASS] Bass frequency balance OK

HUMAN EAR CHECKS REQUIRED:
  [ ] Verify vocal clarity and intelligibility
  [ ] Confirm 808 tone matches MAG style
  [ ] Check overall mix balance

RECOMMENDATIONS:
  1. Consider slight EQ cut around 7kHz (-1 to -2dB)
  2. Apply limiter ceiling at -1.0 dBTP for safe true peak

Report saved: reports/audioqa_track_02_hood_boss_20250615_143022.md
```

### Batch Analysis
```
/audioqa tracks/incoming/
```

Output:
```
BATCH AUDIO QA ANALYSIS
=======================

Scanning: tracks/incoming/
Found 5 audio files

[1/5] track_01_intro.wav ........... ✓ PASS
[2/5] track_02_hood_boss.wav ....... ⚠ WARNING (1 issue)
[3/5] track_03_luxury_life.wav ..... ✗ FAIL (clipping)
[4/5] track_04_empire.wav .......... ✓ PASS
[5/5] track_05_boss_moves.wav ...... ✓ PASS

SUMMARY:
  PASS: 3 tracks
  WARNING: 1 track
  FAIL: 1 track

Individual reports saved to: reports/

Action Required:
  - track_03_luxury_life.wav needs re-export (clipping detected)
  - track_02_hood_boss.wav has minor issues (see report)
```

### Interactive Mode
```
/audioqa

> No file specified. Enter audio file path:
> tracks/incoming/track_02_hood_boss.wav

Analyzing...
```

---

## Integration with Agent

This command invokes the `@audioqa` (Audio QA Engineer) agent:

```
.claude/agents/audio-qa-engineer.md
```

The agent:
1. Validates input
2. Runs Python analysis scripts
3. Interprets results against MAG quality thresholds
4. Generates human-readable report
5. Flags items for human ear check

---

## Quality Thresholds (MAG Productions)

| Metric | PASS | WARNING | FAIL |
|--------|------|---------|------|
| BPM | 74-96 | 70-100 | Outside range |
| LUFS | -14 to -10 | -16 to -9 | < -18 or > -8 |
| True Peak | < -1.0 dBTP | < -0.5 dBTP | >= 0 dBTP |
| Dynamic Range | > 6 dB | > 4 dB | < 4 dB |

---

## Prerequisites

### Python Dependencies
```bash
pip install -r tools/audio_qa/requirements.txt
```

### FFmpeg (optional, for format detection)
```bash
# Windows (via chocolatey)
choco install ffmpeg

# Or download from ffmpeg.org
```

---

## Error Handling

| Error | Message | Solution |
|-------|---------|----------|
| File not found | "Audio file not found: [path]" | Check path spelling |
| Unsupported format | "Unsupported format: .xyz" | Convert to WAV/MP3/FLAC |
| Corrupted file | "File appears corrupted" | Re-export from DAW/Suno |
| Analysis failed | "Analysis error: [details]" | Check Python dependencies |
| Empty file | "File contains no audio data" | Re-download/re-export |

---

## Output Files

### Report Location
```
reports/audioqa_[trackname]_[YYYYMMDD_HHMMSS].md
```

### JSON Data (for programmatic use)
```
reports/audioqa_[trackname]_[YYYYMMDD_HHMMSS].json
```

---

## Workflow Integration

```
/download N              # Download from Suno
    ↓
/audioqa [downloaded]    # ← RUN QA ANALYSIS
    ↓
Human ear review         # Listen to flagged items
    ↓
Fix issues (if any)      # Re-export if FAIL
    ↓
/qc N                    # Full quality control
    ↓
/release N               # Prepare for distribution
```

---

## Notes

- Analysis is TECHNICAL only - does not evaluate artistic quality
- Always perform human ear check on flagged items
- Reports are guides, not final judgments
- Keep all reports for release documentation
