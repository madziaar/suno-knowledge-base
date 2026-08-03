# Lalal.ai Stem Separation Workflow
# Integrate stem separation into MAG Music Records production pipeline

## Overview

Lalal.ai separates your Suno AI tracks into individual stems:
- Vocals
- Drums
- Bass
- Other (melody, synths, strings, etc.)

This allows you to:
- Remix tracks with different instrumentals
- Create instrumental versions
- Extract acapellas for mashups
- Fix individual elements (compress vocals, boost 808s, etc.)
- Create custom mixes

---

## Setup

### 1. Sign Up for Lalal.ai

**Free Tier:**
- 10 minutes of audio per month
- Good for testing

**Lite Plan ($15/month):**
- 90 minutes per month (~30 tracks)
- Recommended for active production

**Plus Plan ($25/month):**
- 300 minutes per month (~100 tracks)
- Best if producing multiple albums

**Link:** https://www.lalal.ai

### 2. API Access (Optional)

Lalal.ai has an API for automation, but it's expensive ($15 for 60 minutes).
For now, we'll use the web interface with a streamlined workflow.

---

## Workflow Integration

### Step 1: Export Audio from Suno

After generating a track in Suno:
1. Select best version
2. Click "Download"
3. Save to: `03_audio_exports/track_[NN]_[name]_suno_raw.wav`

### Step 2: Upload to Lalal.ai

1. Go to https://www.lalal.ai
2. Click "Select Files"
3. Upload: `track_[NN]_[name]_suno_raw.wav`
4. Select "4 Stems" (Vocals, Drums, Bass, Other)
5. Click "Process Entire File"
6. Wait 1-2 minutes

### Step 3: Download Stems

Once processed:
1. Click "Download All" (ZIP file)
2. Extract ZIP to: `03_audio_exports/track_[NN]_stems/`

Your folder structure should look like:
```
03_audio_exports/
├── track_02_hood_boss_suno_raw.wav
└── track_02_stems/
    ├── track_02_hood_boss_vocals.wav
    ├── track_02_hood_boss_drums.wav
    ├── track_02_hood_boss_bass.wav
    └── track_02_hood_boss_other.wav
```

### Step 4: Organize Files

Run this PowerShell script to auto-organize:

```powershell
# Run from project root
.\scripts\organize-stems.ps1 -TrackNumber 2
```

### Step 5: Import to DAW (Optional)

If you have Ableton/FL Studio:
1. Create new project
2. Import all 4 stems
3. Adjust levels, add effects
4. Export final mix

---

## Automated Workflow (Advanced)

### Batch Upload Script

For uploading multiple tracks at once:

```powershell
# Upload all tracks in 03_audio_exports to Lalal.ai
.\scripts\lalal-batch-upload.ps1 -Project MAG_HDRILL_V1
```

This script will:
1. Find all `*_suno_raw.wav` files
2. Open Lalal.ai in browser
3. Prompt you to upload each file
4. Create folders for stems

---

## Use Cases

### Use Case 1: Create Instrumental Version
**For:** YouTube uploads (avoid copyright strikes), karaoke, remixes

**Steps:**
1. Separate stems via Lalal.ai
2. Delete vocals stem
3. Mix drums + bass + other
4. Export as: `track_[NN]_instrumental.wav`

### Use Case 2: Boost 808 Bass
**Problem:** Suno's 808s are sometimes weak

**Steps:**
1. Separate stems
2. Import bass stem to DAW
3. Add compression + EQ
4. Boost low end (50-100 Hz)
5. Re-mix with other stems

### Use Case 3: Create Acapella
**For:** Mashups, remixes, collaborations

**Steps:**
1. Separate stems
2. Use only vocals stem
3. Apply light EQ to remove artifacts
4. Export as: `track_[NN]_acapella.wav`

### Use Case 4: Fix Muddy Mix
**Problem:** Too many elements competing

**Steps:**
1. Separate stems
2. EQ each stem individually:
   - Vocals: Boost 2-5 kHz (presence)
   - Drums: Boost 4-8 kHz (clarity)
   - Bass: Boost 50-100 Hz (weight)
   - Other: Cut 200-400 Hz (mud removal)
3. Re-balance levels
4. Export clean mix

---

## Quality Tips

### Getting Best Results

**Upload Settings:**
- ✅ Use highest quality audio (WAV from Suno)
- ✅ Select "4 Stems" (most separation)
- ❌ Don't use MP3 (lossy compression hurts separation)

**Separation Quality:**
- **Excellent:** Vocals, drums (clean separation)
- **Good:** Bass (mostly clean)
- **Fair:** Other (can have bleed from other stems)

**Common Issues:**
- Vocals bleeding into "other" stem → Normal, adjust levels
- Bass in "other" stem → Boost bass stem, reduce other
- Drums in "vocals" → Use noise gate in DAW

---

## Integration with MAG Music Records Workflow

### Updated Production Workflow

```
1. Generate track in Suno
2. Download best version
3. Separate stems via Lalal.ai ⭐ (NEW STEP)
4. Import stems to DAW (optional)
5. Polish/remix (optional)
6. Run audio QA on final mix
7. Master with Ozone
8. Create lyric video
9. Upload to DistroKid
```

### When to Use Stem Separation

**Always:**
- Creating instrumental versions
- Mastering needs (separate processing of vocals/music)

**Sometimes:**
- Track needs remixing
- 808s are too weak
- Mix is muddy

**Rarely:**
- Track sounds perfect as-is
- No time for extra processing

---

## File Naming Convention

```
# Raw Suno export
track_[NN]_[name]_suno_raw.wav

# Separated stems
track_[NN]_[name]_vocals.wav
track_[NN]_[name]_drums.wav
track_[NN]_[name]_bass.wav
track_[NN]_[name]_other.wav

# Processed versions
track_[NN]_[name]_instrumental.wav
track_[NN]_[name]_acapella.wav
track_[NN]_[name]_remix.wav
track_[NN]_[name]_mastered.wav
```

---

## Cost Management

### Maximizing Free Tier (10 min/month)
- Use only for best tracks
- Separate 3-4 tracks per month
- Use Spleeter (free) for rough separations

### Lite Plan Strategy (90 min/month)
- ~30 tracks per month
- Enough for 3 albums
- Best value for money

### When to Upgrade to Plus
- Producing 100+ tracks/month
- Multiple projects simultaneously
- Need stems for all tracks

---

## Alternatives to Lalal.ai

### Free Options

**Spleeter (Python):**
```bash
pip install spleeter
spleeter separate -p spleeter:4stems track.wav -o output/
```
- FREE, unlimited
- Lower quality than Lalal.ai
- Good for testing

**Demucs:**
- Better quality than Spleeter
- Slower processing
- FREE

### Paid Options

**iZotope RX 11:**
- Best quality stem separation
- $399 (one-time)
- Also includes audio repair tools

**LANDR:**
- Stem separation + mastering
- $15/month bundle

---

## Scripts

### organize-stems.ps1

Located at: `scripts/organize-stems.ps1`

**Usage:**
```powershell
.\scripts\organize-stems.ps1 -TrackNumber 2
```

**What it does:**
1. Creates `track_[NN]_stems/` folder
2. Moves downloaded stems into folder
3. Renames files to MAG Music Records convention
4. Updates project_state.json

---

## FAQ

**Q: Can I use separated stems commercially?**
A: Yes, if your Suno track is commercially licensed.

**Q: How long does separation take?**
A: 1-2 minutes for a 3-minute track.

**Q: Can I separate instrumental-only tracks?**
A: Yes, but vocal stem will be empty.

**Q: Quality better than Spleeter?**
A: Yes, significantly better (especially vocals).

**Q: Can I separate video files?**
A: No, extract audio first, then separate.

---

## Next Steps

1. Sign up: https://www.lalal.ai
2. Test with 1 track (free tier)
3. If satisfied, upgrade to Lite ($15/month)
4. Integrate into workflow
5. Use stems for remixing/mastering

---

## Related Tools
- `@audioqa` → Analyze separated stems
- `scripts/organize-stems.ps1` → Auto-organize downloads
- Ableton Live → Import stems for remixing
- Ozone 10 → Master final mix

---

**Need help?** Open an issue or ask in project chat.
