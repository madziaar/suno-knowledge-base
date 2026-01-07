# iZotope Ozone - Batch Mastering Workflow
> Professional AI-powered mastering for MAG Music Records

## Overview

iZotope Ozone is the industry standard for AI-powered mastering. It analyzes your track and automatically applies:
- EQ correction
- Compression
- Limiting
- Stereo widening
- Harmonic excitation

**Result:** Broadcast-ready masters in 30 seconds per track

---

## Download & Install

### Option 1: Buy Ozone 11 (Wait for Sale!)

**Regular Price:** $249
**Sale Price:** $29-49 (happens 4-6 times per year)

**When sales happen:**
- Black Friday (November)
- Cyber Monday
- New Year sales
- Plugin Boutique sales
- Plugin Alliance sales

**Where to buy:**
- https://www.izotope.com (official)
- https://www.pluginboutique.com (frequent sales)
- https://www.jrrshop.com (best deals)

**Recommendation:** Sign up for Plugin Boutique email alerts

### Option 2: Try Ozone Elements (Cheaper)

**Price:** $129 (often $29 on sale)
**What's included:**
- Master Assistant (AI mastering)
- Maximizer (limiter)
- EQ
- Imager

**What's missing:**
- Advanced modules (Vintage Tape, Exciter, etc.)
- Manual detailed control

**For MAG Music Records:** Ozone Elements is sufficient!

### Option 3: Free Trial

**30-day free trial:**
1. Go to https://www.izotope.com/en/products/ozone.html
2. Click "Try Ozone Free"
3. Create account
4. Download installer
5. Use for 30 days (full features)

**Pro tip:** Trial is enough to master one full album!

---

## Installation

### Step 1: Download

1. Create account at https://www.izotope.com
2. Download **Ozone 11** (or Ozone Elements)
3. File size: ~200 MB

### Step 2: Install

1. Run installer
2. Choose installation path
3. Select plugin formats:
   - ✅ **VST3** (for most DAWs)
   - ✅ **AAX** (if you use Pro Tools)
   - ✅ **AU** (Mac only, for Logic Pro)
4. Install takes 5 minutes

### Step 3: Activate

1. Open **iZotope Portal** app (installed automatically)
2. Log in with your account
3. Click "Authorize" next to Ozone
4. Done!

---

## Quick Start: Master Your First Track

### Method 1: Standalone App (Easiest)

Ozone can run as a **standalone application** (no DAW needed!)

1. Open **Ozone Standalone** (search in Windows start menu)
2. File → Open Audio File
3. Select: `03_audio_exports/track_01_ascensao.wav`
4. Click **Master Assistant** button (big button at top)
5. Select target:
   - **Streaming** (Spotify, Apple Music) ← Choose this
   - CD/Vinyl
   - Broadcast
6. Click **Next**
7. Ozone analyzes track (30 seconds)
8. Preview result (play button)
9. If happy: File → Export Audio
10. Save as: `03_audio_exports/track_01_ascensao_mastered.wav`

**Time per track:** 2-3 minutes (mostly waiting for analysis)

### Method 2: DAW Plugin (Advanced)

If you have FL Studio, Ableton, Logic, etc.:

1. Open DAW
2. Load your track
3. Add **Ozone 11** to master channel
4. Click **Master Assistant**
5. Let it analyze
6. Export track

---

## Batch Mastering Workflow

**Problem:** Ozone doesn't have built-in batch processing

**Solution:** Use **preset workflow** + manual processing

### Step 1: Create Master Preset

1. Master Track 1 using Master Assistant
2. When happy with result, save preset:
   - Click preset menu (top left)
   - Save As → "MAG_Luxury_Trap_Master_V1"
3. This preset now contains all settings

### Step 2: Apply to Other Tracks

For tracks 2-10:
1. Load track in Ozone Standalone
2. Load preset: "MAG_Luxury_Trap_Master_V1"
3. Adjust only if needed (usually works as-is)
4. Export

**Time savings:**
- First track: 3-5 minutes (Master Assistant)
- Tracks 2-10: 1 minute each (load preset, export)
- **Total:** 15 minutes for 10-track album

---

## Advanced: Script-Assisted Workflow

While Ozone doesn't support command-line, we can automate the manual parts.

### PowerShell Helper Script

**Location:** `tools/mastering/ozone_batch_helper.ps1`

```powershell
# Ozone Batch Mastering Helper
# Organizes files and provides checklist

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$audioDir = Join-Path $ProjectPath "03_audio_exports"
$masteredDir = Join-Path $audioDir "mastered"

# Create mastered folder
New-Item -ItemType Directory -Force -Path $masteredDir | Out-Null

# Find all non-mastered tracks
$tracks = Get-ChildItem $audioDir -Filter "track_*.wav" | Where-Object {
    $_.Name -notlike "*_mastered*" -and
    $_.Name -notlike "*_stems*"
}

Write-Host "`n🎚️ Ozone Batch Mastering Workflow" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Project: $ProjectPath" -ForegroundColor White
Write-Host "Tracks to master: $($tracks.Count)`n" -ForegroundColor Yellow

# Create checklist
$checklist = @()

foreach ($track in $tracks) {
    $trackNum = if ($track.Name -match "track_(\d+)") { $matches[1] } else { "??" }
    
    $checklistItem = @{
        Track = "Track $trackNum"
        InputFile = $track.Name
        OutputFile = $track.Name -replace ".wav", "_mastered.wav"
        Status = "⏳ Pending"
    }
    
    # Check if already mastered
    $masteredFile = Join-Path $masteredDir $checklistItem.OutputFile
    if (Test-Path $masteredFile) {
        $checklistItem.Status = "✅ Complete"
    }
    
    $checklist += $checklistItem
}

# Display checklist
Write-Host "Mastering Checklist:" -ForegroundColor Green
Write-Host "-------------------" -ForegroundColor Green

$checklist | ForEach-Object {
    $status = $_.Status
    $color = if ($status -like "*Complete*") { "Green" } else { "Yellow" }
    
    Write-Host "$($_.Track): $status" -ForegroundColor $color
    Write-Host "  Input:  $($_.InputFile)" -ForegroundColor Gray
    Write-Host "  Output: $($_.OutputFile)" -ForegroundColor Gray
    Write-Host ""
}

# Provide instructions
Write-Host "`nInstructions:" -ForegroundColor Cyan
Write-Host "-------------" -ForegroundColor Cyan
Write-Host "1. Open Ozone Standalone app"
Write-Host "2. For each track above:"
Write-Host "   a. File → Open Audio File → Select input file"
Write-Host "   b. Master Assistant → Streaming → Analyze"
Write-Host "   c. File → Export Audio → Save as output file to 'mastered' folder"
Write-Host "   d. Mark track complete in this list"
Write-Host "3. When all complete, run: .\ozone_batch_helper.ps1 -ProjectPath `"$ProjectPath`" -Verify"
Write-Host ""

# Generate export filenames
Write-Host "Quick Copy (for Ozone export dialog):" -ForegroundColor Yellow
$checklist | Where-Object { $_.Status -notlike "*Complete*" } | ForEach-Object {
    Write-Host "  $($masteredDir)\$($_.OutputFile)" -ForegroundColor White
}

Write-Host "`n✨ Use this script to track progress!" -ForegroundColor Green
```

**Usage:**
```powershell
.\tools\mastering\ozone_batch_helper.ps1 -ProjectPath "C:\Giquina-Projects\MAG Music Records\projects\mixtapes\MAG_HDRILL_V1"
```

**What it does:**
1. Lists all tracks needing mastering
2. Shows checklist with status
3. Provides copy-paste filenames for exports
4. Tracks completion

---

## Mastering Settings

### Target Settings for Streaming

**LUFS Target:** -14 LUFS (Spotify, Apple Music standard)
**True Peak:** -1.0 dBTP (prevent clipping)
**Dynamics:** Preserve some (don't over-compress)

**Ozone Master Assistant automatically sets these!**

### Manual Adjustments (if needed)

If Master Assistant result sounds:

**Too Loud/Compressed:**
- Lower **Maximizer** threshold (-2 to -4 dB)
- Reduce **Dynamics** module ratio

**Too Quiet:**
- Increase **Maximizer** ceiling (but keep under -1.0 dBTP)
- Add more gain in **Master EQ**

**Too Bright/Harsh:**
- EQ: Reduce 8-12 kHz by 1-2 dB
- Lower **Exciter** amount

**Too Dark/Muddy:**
- EQ: Reduce 200-400 Hz by 1-2 dB
- Boost 5-8 kHz by 1 dB

**Too Narrow (mono):**
- Increase **Imager** width (but don't go crazy, max 120%)

---

## Genre-Specific Presets

### Luxury Trap (Your Main Genre)

**Settings:**
- **Reference Track:** Future, Rick Ross, 21 Savage
- **Target LUFS:** -9 to -10 (heavier/louder than pop)
- **Bass:** Preserve sub-bass (don't over-compress below 60 Hz)
- **Dynamics:** Medium compression (keep some punch)

**Manual tweaks:**
- EQ: Boost 40-60 Hz (+1 dB) for heavy 808s
- EQ: Slight cut 200-400 Hz (-0.5 dB) to prevent muddiness
- Imager: Keep bass mono (below 100 Hz)
- Maximizer: Ceiling -0.3 dB (loudness priority)

### Reggae Fusion R&B

**Settings:**
- **Reference Track:** Akon, Sean Paul, Drake
- **Target LUFS:** -12 to -13 (more dynamic than trap)
- **Warmth:** Add vintage tape saturation
- **Dynamics:** Light compression (preserve groove)

**Manual tweaks:**
- EQ: Boost 100-200 Hz (+0.5 dB) for warmth
- EQ: Boost 3-5 kHz (+1 dB) for vocal clarity
- Exciter: Add subtle harmonic excitation
- Imager: Wider stereo (up to 130%)

---

## Quality Check After Mastering

### Listen Test

**Critical listening points:**
1. ✅ Louder than original (but not distorted)
2. ✅ Clear vocals (not buried)
3. ✅ Punchy bass (not muddy)
4. ✅ Bright but not harsh
5. ✅ Stereo width feels natural

**A/B Test:**
- Toggle between original and mastered
- Mastered should sound "polished" not "destroyed"

### Technical Check

**Use Ozone's built-in meters:**
- **LUFS:** Should be -14 for streaming
- **True Peak:** Should be under -1.0 dBTP
- **Dynamic Range:** Should be 6-10 dB (trap), 8-12 dB (R&B)

**If any values are off, re-master with adjusted settings**

---

## Export Settings

### For Distribution (DistroKid)

**Format:** WAV
**Sample Rate:** 44.1 kHz or 48 kHz
**Bit Depth:** 16-bit or 24-bit
**Channels:** Stereo

**Ozone Export Dialog:**
1. Format: WAV
2. Sample Rate: Same as source
3. Bit Depth: 24-bit (highest quality for DistroKid)
4. Dither: POW-r #2 (if downsampling from 32-bit)
5. Click Export

### For Streaming Services

Same as distribution (WAV 24-bit) - don't convert to MP3 yourself!
DistroKid will handle conversions for each platform.

### For Preview/Testing

**Format:** MP3
**Bitrate:** 320 kbps
**Use for:** Sending to collaborators, social media previews

---

## Troubleshooting

### Issue: "Master sounds distorted"
**Solution:**
- Lower Maximizer ceiling by 1-2 dB
- Check True Peak meter (should be under -1.0 dBTP)
- If still distorted, source audio may have clipping (fix in Suno)

### Issue: "Master sounds too quiet"
**Solution:**
- Increase Maximizer threshold
- Add makeup gain in Master EQ
- Check LUFS meter (should be around -14 for streaming)

### Issue: "Master sounds dull/lifeless"
**Solution:**
- Add Exciter module (light harmonic excitement)
- Boost high-mids (3-8 kHz) by 1-2 dB in EQ
- Increase Imager width slightly

### Issue: "Master sounds harsh/fatiguing"
**Solution:**
- Reduce Exciter amount
- Cut 8-12 kHz by 1-2 dB in EQ
- Lower compression ratio in Dynamics module

---

## Alternatives to Ozone

### 1. LANDR (Online Service)

**Price:** $7.50/month (unlimited masters)
**How it works:**
1. Upload WAV to https://www.landr.com
2. Select "Streaming" preset
3. Download mastered file in 2 minutes

**Pros:** No software needed, fast
**Cons:** Less control than Ozone, monthly cost

### 2. eMastered

**Price:** $9/month
**Similar to LANDR** but with stem separation included

### 3. CloudBounce

**Price:** $8.90/month
**Good for quick masters**, reference track matching

**Recommendation:** Start with LANDR ($7.50/month) if you don't want to buy Ozone

---

## Integration with Workflow

### Updated Production Workflow

```
SUNO GENERATION
    ↓
DOWNLOAD AUDIO
    ↓
STEM SEPARATION (Lalal.ai)
    ↓
AUDIO QA (librosa analysis)
    ↓
OZONE MASTERING ← YOU ARE HERE
    ↓
FINAL QC CHECK
    ↓
DISTROKID UPLOAD
```

---

## Batch Processing Summary

**10-track album mastering:**

**Method 1: Manual (Ozone)**
- Track 1: 5 minutes (Master Assistant + adjustments)
- Tracks 2-10: 1.5 minutes each (load preset, export)
- **Total:** 18-20 minutes

**Method 2: Online Service (LANDR)**
- Upload all 10 tracks
- Wait 20 minutes (processes in parallel)
- Download all at once
- **Total:** 20 minutes + upload time

**Recommendation:** Use Ozone for final albums, LANDR for quick tests/demos

---

## Next Steps

1. ✅ Download Ozone (free trial or wait for sale)
2. ✅ Master Track 1 using Master Assistant
3. ✅ Save preset: "MAG_Master_V1"
4. ✅ Apply to remaining tracks
5. ✅ Run final QC check
6. ✅ Export to `03_audio_exports/mastered/`
7. ✅ Upload to DistroKid

**Need help with settings?** Let me know your track and I'll recommend specific tweaks!
