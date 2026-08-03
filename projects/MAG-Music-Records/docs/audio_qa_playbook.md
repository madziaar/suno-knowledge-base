# Audio QA Playbook

## Overview

The Audio QA system provides automated technical analysis of audio files to identify quality issues before release. It complements (but does not replace) human listening review.

---

## How the System Works

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Audio File     │────▶│  Python Scripts  │────▶│  QA Report      │
│  (WAV/MP3/etc)  │     │  (librosa)       │     │  (Markdown/JSON)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐             │
         │              │  Technical       │             │
         │              │  Analysis Only   │             │
         │              └──────────────────┘             │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│  Human Ear      │◀──────────────────────────│  Flagged Items  │
│  Review         │                           │  for Listening  │
└─────────────────┘                           └─────────────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Agent Definition | `.claude/agents/audio-qa-engineer.md` | Capabilities and limitations |
| Command Definition | `.claude/commands/audioqa.md` | Usage and workflow |
| Analysis Script | `tools/audio_qa/analyze.py` | Core audio analysis |
| Dependencies | `tools/audio_qa/requirements.txt` | Python packages |
| Test Script | `tools/audio_qa/test_pipeline.py` | Pipeline verification |
| Report Template | `reports/_template_audioQA.md` | Output format |

---

## What is Automated vs Human-Required

### Automated Analysis (Machine Can Do)

These checks are performed automatically by the Python scripts:

| Check | What It Measures | Why It Matters |
|-------|------------------|----------------|
| **BPM Detection** | Tempo in beats per minute | MAG targets 74-96 BPM |
| **Loudness (LUFS)** | Integrated loudness | Streaming platform normalization |
| **True Peak** | Maximum sample value | Prevents digital clipping |
| **Dynamic Range** | Difference between loud/quiet | Avoids over-compression |
| **Clipping Detection** | Samples at maximum | Digital distortion |
| **Frequency Balance** | Energy distribution across spectrum | Mix clarity |
| **Stereo Width** | Left/Right relationship | Spatial imaging |
| **Phase Correlation** | Mono compatibility | Club/radio playback |
| **Silence Detection** | Lead-in and tail length | Streaming requirements |

### Human Ear Checks (Only Humans Can Do)

These require actual listening and cannot be automated:

| Check | What to Listen For | Why It Matters |
|-------|-------------------|----------------|
| **Vocal Clarity** | Can you understand every word? | Lyric intelligibility |
| **808 Tone Quality** | Does it have the right character? | MAG signature sound |
| **Mix Balance** | Are all elements audible and balanced? | Professional quality |
| **Emotional Impact** | Does it feel right? | Artistic intent |
| **Vocal Delivery** | Slow, deliberate, commanding? | MAG style consistency |
| **Orchestral Blend** | Do strings/brass fit naturally? | Luxury trap aesthetic |
| **Artifact Check** | Any clicks, pops, glitches? | Technical cleanliness |
| **Genre Authenticity** | Does it sound like luxury trap? | Brand consistency |

---

## How to Run Analysis

### Prerequisites

1. **Install Python dependencies:**
   ```bash
   pip install -r tools/audio_qa/requirements.txt
   ```

2. **Verify installation:**
   ```bash
   python tools/audio_qa/test_pipeline.py
   ```

### Single File Analysis

```bash
# Using slash command (recommended)
/audioqa tracks/incoming/track_02_hood_boss.wav

# Or directly with Python
python tools/audio_qa/analyze.py tracks/incoming/track_02_hood_boss.wav --pretty
```

### Batch Analysis

```bash
# Analyze all files in incoming folder
/audioqa tracks/incoming/
```

### Interactive Mode

```bash
/audioqa
# Then enter path when prompted
```

### Output Options

```bash
# Save JSON output
python tools/audio_qa/analyze.py track.wav --output report.json

# Pretty-print JSON
python tools/audio_qa/analyze.py track.wav --pretty
```

---

## How to Interpret Reports

### Status Levels

| Status | Meaning | Action |
|--------|---------|--------|
| **PASS** | Meets all criteria | Proceed to human ear check |
| **WARNING** | Minor issues detected | Review, may be acceptable |
| **FAIL** | Critical issues found | Must fix before release |
| **ERROR** | Analysis failed | Check file/dependencies |

### Metric Thresholds (MAG Productions)

#### BPM
| Range | Status | Notes |
|-------|--------|-------|
| 74-96 | PASS | Target range for luxury trap |
| 70-100 | WARNING | Acceptable but verify artistic intent |
| <70 or >100 | FAIL | Outside luxury trap style |

#### Loudness (LUFS)
| Range | Status | Notes |
|-------|--------|-------|
| -14 to -10 | PASS | Optimal for streaming |
| -16 to -9 | WARNING | May be normalized significantly |
| <-18 or >-8 | FAIL | Too quiet or too loud |

#### True Peak
| Value | Status | Notes |
|-------|--------|-------|
| < -1.0 dBTP | PASS | Safe headroom |
| < -0.5 dBTP | WARNING | Tight, may clip on conversion |
| >= 0 dBTP | FAIL | Clipping detected |

#### Dynamic Range
| Value | Status | Notes |
|-------|--------|-------|
| > 6 dB | PASS | Good dynamics |
| > 4 dB | WARNING | Heavy compression |
| < 4 dB | FAIL | Over-compressed |

---

## Workflow Integration

### Standard Production Flow

```
1. /download N              # Get audio from Suno
           │
           ▼
2. /audioqa [file]          # Run automated analysis
           │
           ▼
3. Review report            # Check for FAIL/WARNING
           │
           ▼
   ┌───────┴───────┐
   │               │
   ▼               ▼
FAIL/WARNING      PASS
   │               │
   ▼               │
Fix issues         │
Re-export          │
   │               │
   ▼               │
/audioqa again     │
   │               │
   └───────┬───────┘
           │
           ▼
4. Human ear check          # Listen to flagged items
           │
           ▼
5. /qc N                    # Full quality control
           │
           ▼
6. /release N               # Distribution prep
```

### File Organization

```
tracks/
├── incoming/          # Drop raw exports here
│   └── track_02.wav
├── processed/         # Approved tracks
│   └── track_02.wav
reports/
├── _template_audioQA.md
└── audioqa_track_02_20250615_143022.md
```

---

## Common Issues and Fixes

### Issue: Clipping Detected
**Cause:** True peak exceeds 0 dBTP
**Fix:**
1. Lower master fader by 1-2 dB
2. Use limiter with -1.0 dBTP ceiling
3. Re-export

### Issue: Muddy Bass
**Cause:** Excessive energy in 250-500Hz range
**Fix:**
1. Apply EQ cut around 300-400Hz (-2 to -4 dB)
2. Check for frequency buildup from layered instruments
3. High-pass filter non-bass elements

### Issue: Harsh Highs
**Cause:** Excessive energy in 2-6kHz range
**Fix:**
1. Apply gentle EQ reduction in 3-5kHz (-1 to -3 dB)
2. De-ess vocals if needed
3. Check hi-hat/cymbal levels

### Issue: Over-Compressed
**Cause:** Dynamic range < 4 dB
**Fix:**
1. Reduce compressor ratio
2. Increase compressor threshold
3. Back off limiter gain reduction

### Issue: Phase Problems
**Cause:** Stereo correlation < 0.3
**Fix:**
1. Check for stereo widening effects
2. Verify bass is centered (mono below 150Hz)
3. Check for phase-inverted channels

### Issue: Excessive Silence
**Cause:** Long lead-in or tail
**Fix:**
1. Trim leading silence to <100ms
2. Trim trailing silence to <500ms
3. Add short fade-in/out if needed

---

## Best Practices

### Before Analysis
1. Export at highest quality (24-bit WAV)
2. Use consistent file naming
3. Organize files in `tracks/incoming/`

### During Analysis
1. Run `/audioqa` on every export
2. Review all FAIL and WARNING items
3. Don't skip human ear checks

### After Analysis
1. Keep all reports for documentation
2. Move approved files to `tracks/processed/`
3. Archive reports with release materials

### Human Ear Review Checklist

When performing human ear check:

1. **Environment:**
   - Use quality headphones or monitors
   - Minimize background noise
   - Take breaks to prevent ear fatigue

2. **Reference:**
   - Compare against reference tracks
   - Check on multiple systems (earbuds, car, phone)

3. **Focus Areas:**
   - First listen: overall impression
   - Second listen: vocals and lyrics
   - Third listen: bass and low end
   - Fourth listen: details and effects

---

## Troubleshooting

### "librosa not available"
```bash
pip install librosa numpy soundfile scipy
```

### "File not found"
- Check path spelling
- Use absolute paths
- Verify file extension

### "Unsupported format"
Supported: WAV, MP3, FLAC, M4A, OGG, AIFF

Convert using:
```bash
ffmpeg -i input.xxx -acodec pcm_s24le output.wav
```

### "Analysis error"
1. Run test pipeline: `python tools/audio_qa/test_pipeline.py`
2. Check file isn't corrupted
3. Try re-exporting source file

---

## Technical Notes

### Loudness Approximation

The LUFS measurement in this system is an approximation. For mastering-critical decisions, use a dedicated LUFS meter that implements full ITU-R BS.1770 specification.

### BPM Detection Accuracy

BPM detection works best on tracks with clear rhythmic content. Electronic and hip-hop tracks typically produce accurate results. Very sparse or ambient sections may confuse the algorithm.

### Frequency Analysis

Frequency balance percentages are relative to total spectral energy. They indicate distribution, not absolute levels. Use them to identify imbalances, not as precise targets.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-03 | Initial release |

---

*MAG Music Records Audio QA System*
*"Measure what machines can measure. Listen for what only humans can hear."*
