# DaVinci Resolve - Professional Lyric Video Creation Guide
> Complete workflow for MAG Music Records

## Overview

DaVinci Resolve is a **FREE** professional video editing software (Hollywood-grade). We'll use it to create:
- Lyric videos with animated text
- Music videos with stock footage
- Promotional content for social media
- YouTube visualizers

**Why DaVinci Resolve?**
- ✅ **100% FREE** (no watermarks, full features)
- ✅ Professional-grade (used in Hollywood)
- ✅ Better than Premiere Pro for color grading
- ✅ Built-in Fusion (After Effects alternative)
- ✅ Fairlight audio editor (Pro Tools alternative)

---

## Download & Install

### 1. Download DaVinci Resolve 19

**Free Version:**
- Link: https://www.blackmagicdesign.com/products/davinciresolve
- Click "Download" button
- Fill out form (fake info is fine, they just want email)
- Choose: **DaVinci Resolve 19** (NOT Studio)

**File Size:** ~3.5 GB
**Windows Requirements:**
- Windows 10/11 (64-bit)
- 16 GB RAM minimum (32 GB recommended)
- NVIDIA/AMD GPU with 4GB+ VRAM (recommended)
- 50 GB free disk space

### 2. Install

1. Run installer
2. Accept license agreement
3. Choose: **Standard Installation**
4. Wait 10-15 minutes
5. Launch DaVinci Resolve

### 3. First Launch Setup

1. Skip "Quick Setup" wizard
2. Create new project: "MAG Music Records - Lyric Videos"
3. Set project settings:
   - **Timeline Resolution:** 1920x1080 (Full HD)
   - **Timeline Frame Rate:** 30 fps
   - **Audio Sample Rate:** 48000 Hz

---

## Interface Overview

DaVinci Resolve has **7 pages** (tabs at bottom):

1. **Media** → Import files
2. **Cut** → Fast rough editing
3. **Edit** → Precision editing (main workspace)
4. **Fusion** → Motion graphics, effects
5. **Color** → Color grading
6. **Fairlight** → Audio mixing
7. **Deliver** → Export final video

**For lyric videos, you'll use:**
- **Media** (import audio, footage)
- **Edit** (assemble timeline)
- **Fusion** (animated text)
- **Deliver** (export)

---

## Quick Start: Your First Lyric Video

### Step 1: Project Setup

1. Launch DaVinci Resolve
2. File → New Project → "Track_01_Lyric_Video"
3. Project Settings (gear icon):
   - **Timeline Resolution:** 1920x1080
   - **Timeline Frame Rate:** 30 fps
   - **Playback Frame Rate:** 30 fps

### Step 2: Import Assets

Go to **Media** page (bottom left):

1. Navigate to your project folder:
   ```
   03_audio_exports/track_01_ascensao.wav
   09_video/stock/track_01/
   04_artwork/track_01_cover.jpg
   ```

2. Drag files into Media Pool

**What you need:**
- ✅ Audio track (WAV file)
- ✅ Background video/image (stock footage or album cover)
- ✅ Lyrics (as text file for reference)

### Step 3: Create Timeline

Go to **Edit** page:

1. Right-click in Media Pool → **Create New Timeline**
2. Name: "Track_01_Final"
3. Settings:
   - **Use Project Settings** (check this)
   - Click **Create**

### Step 4: Add Audio

1. Drag audio file (`track_01_ascensao.wav`) to timeline
2. It will appear in **audio track A1**
3. Play to hear (spacebar to play/pause)

### Step 5: Add Background

**Option A: Static Image (Album Cover)**
1. Drag album cover to **video track V1**
2. Right-click → **Change Clip Duration** → Match audio length
3. Image will now last entire song

**Option B: Stock Footage**
1. Drag stock video clips to **video track V1**
2. Trim clips to fit music sections
3. Add multiple clips end-to-end

**Option C: Animated Background**
1. Add solid color: **Effects Library** → Generators → Solid Color
2. Drag to **V1** track
3. Change color in Inspector panel

### Step 6: Add Lyrics (The Important Part!)

Go to **Fusion** page:

1. Select timeline clip in V1
2. Click **New Fusion Clip** (or right-click → New Fusion Clip)
3. You're now in Fusion compositor

**Add Text Node:**
1. Drag **Text+** node from toolbar (or Shift+Space → type "text")
2. Connect Text+ output to MediaOut input
3. In Inspector (right panel), type first lyric line

**Styling:**
- **Font:** Choose bold, readable font (Montserrat, Bebas Neue, Impact)
- **Size:** 60-80 (depends on text length)
- **Color:** White or yellow (high contrast)
- **Stroke:** Add black stroke (Appearance → Border Width: 0.01-0.03)
- **Shadow:** Drop Shadow for depth

**Positioning:**
- **Center:** Layout → Center On Frame (checkbox)
- **Bottom Third:** Y Center: -0.3 (lower on screen)

### Step 7: Animate Text (Optional)

Add animation keyframes:

1. Timeline scrubber at 0:00:00 → Set **Opacity: 0**
2. Timeline scrubber at 0:00:10 → Set **Opacity: 1** (fade in)
3. Timeline scrubber at end → Set **Opacity: 0** (fade out)

**Advanced Animation:**
- **Slide In:** Animate X/Y Center position
- **Scale Up:** Animate Size from 50 to 100
- **Glow:** Add Glow node after Text+

### Step 8: Export Video

Go to **Deliver** page:

1. **Format:** MP4
2. **Codec:** H.264
3. **Resolution:** 1920x1080
4. **Frame Rate:** 30 fps
5. **Quality:** Restrict to: 20,000 kb/s (high quality)
6. **Audio Codec:** AAC, 320 kb/s

**Export Location:**
```
09_video/renders/track_01_lyric_video_v1.mp4
```

Click **Add to Render Queue** → **Render All**

**Export time:** 2-5 minutes for 3-minute song (depends on GPU)

---

## Advanced: Full Lyric Video Workflow

### Step 1: Prepare Lyrics File

Create: `09_video/lrc/track_01_lyrics.txt`

Format:
```
[00:00] Intro
[00:15] Verse 1 - Line 1
[00:18] Verse 1 - Line 2
[00:22] Verse 1 - Line 3
[00:26] Pre-Chorus
[00:30] Chorus - Line 1
[00:33] Chorus - Line 2
```

**Timestamps:** Use LRC format (from Whisper AI transcription)

### Step 2: Multi-Layer Text (Line by Line)

Instead of one text layer, create **one text node per line**:

1. In Fusion, duplicate Text+ node (Ctrl+C, Ctrl+V)
2. Position each line in timeline at correct timestamp
3. Overlap slightly for smooth flow

**Timeline Structure:**
```
[Verse 1 Line 1] -------- [00:15 - 00:18]
[Verse 1 Line 2]     -------- [00:18 - 00:22]
[Verse 1 Line 3]         -------- [00:22 - 00:26]
```

### Step 3: Highlight Current Line

**Method 1: Opacity**
- Active line: **Opacity 100%**
- Next line (preview): **Opacity 40%**
- Previous line: **Opacity 20%** (fades out)

**Method 2: Color**
- Active line: **Yellow**
- Inactive lines: **White**

**Method 3: Scale**
- Active line: **Size 80**
- Inactive lines: **Size 60**

### Step 4: Karaoke Effect (Word-by-Word Highlight)

**Advanced: Use Fusion macros**

1. Install "Krokodove" (free Fusion plugin)
   - Link: https://www.steakunderwater.com/wesuckless/viewtopic.php?t=1368
2. Drag macro to text node
3. Sync word timings with audio waveform

**Manual Method:**
- Split text into individual words
- Animate each word's color at precise timing
- Use audio waveform in timeline for accuracy

### Step 5: Background Motion

**Option A: Ken Burns Effect (Pan & Zoom)**
1. Select album cover in timeline
2. **Inspector** → Transform → add keyframes
3. Start: **Zoom: 1.0**, **Position: Center**
4. End: **Zoom: 1.2**, **Position: Slightly offset**

**Option B: Parallax Layers**
1. Duplicate background layer 3 times (V1, V2, V3)
2. Each layer: Different blur amount + opacity
3. Animate each layer at slightly different speeds

**Option C: Stock Footage Loop**
1. Use 10-second stock clip
2. Loop 18 times for 3-minute song
3. Add **Blend Mode: Screen** for overlay effect

### Step 6: Visual Effects

**Glow Effect:**
1. Select text in Fusion
2. Add **Glow** node
3. Adjust Gain (brightness) and Glow Size

**Particles (Optional):**
1. Add **Particle Emitter** node
2. Emit particles from text edges
3. Adjust count, speed, lifetime

**Chromatic Aberration (Trendy):**
1. Add **Channel Booleans** node
2. Separate RGB channels
3. Offset Red/Blue slightly for glitch effect

---

## Templates for Speed

### Create Reusable Template

1. Complete one lyric video
2. File → Export → **Timeline as Compound Clip**
3. Save as: "MAG_Lyric_Video_Template_V1"

**Next video:**
1. Import template
2. Replace audio
3. Replace lyrics text
4. Export

**This saves 80% of setup time!**

---

## Social Media Formats

### YouTube (1920x1080)
- Already set up correctly
- Export as MP4, H.264

### Instagram Reels (1080x1920 - Portrait)
1. Project Settings → Timeline Resolution: **1080x1920**
2. Reposition text/background for vertical format
3. Export as MP4

### TikTok (1080x1920 - Portrait)
- Same as Instagram Reels
- Keep text in "safe zone" (middle 70% of screen)

### Instagram Feed (1080x1080 - Square)
1. Project Settings → Timeline Resolution: **1080x1080**
2. Crop background to square
3. Center text

**Pro Tip:** Create all 3 formats from same project:
1. Master timeline: 1920x1080
2. Duplicate timeline 3 times
3. Adjust each for different aspect ratio
4. Batch export all

---

## Performance Optimization

### Speed Up Render Times

**1. Use Proxy Mode**
- Media Pool → Right-click clips → Generate Proxy Media
- Works with lower-res files during edit
- Switches to full-res on export

**2. Optimize Playback**
- Playback → Proxy Mode: Quarter Resolution
- Timeline → Render Cache: Smart

**3. Hardware Acceleration**
- Preferences → System → Memory and GPU
- Enable **GPU acceleration for Resolve FX**
- Allocate more RAM to DaVinci

**4. Render in Background**
- Deliver → Add to Render Queue
- Continue working while exporting (Resolve Studio only)

### Reduce Export Time

**Settings:**
- **Codec:** H.264 (faster than H.265)
- **Encoding:** Hardware (NVIDIA NVENC or AMD AMF)
- **Quality:** Use bitrate instead of CRF

**Typical Times (3-minute video):**
- **Low-end PC:** 10-15 minutes
- **Mid-range PC with GPU:** 3-5 minutes
- **High-end PC with RTX 4080:** 1-2 minutes

---

## Troubleshooting

### Issue: "Unsupported GPU"
**Solution:**
- Download **Studio Driver** (NVIDIA)
- Update GPU drivers
- If too old, use CPU-only mode (slower)

### Issue: "Playback stuttering"
**Solution:**
- Lower playback resolution (Playback → Timeline Proxy Mode → Half)
- Generate optimized media (Media Pool → Generate Optimized Media)
- Close other apps to free RAM

### Issue: "Audio out of sync"
**Solution:**
- Check Timeline Frame Rate matches audio sample rate
- Right-click audio → Retime and Scaling → Change Speed
- Re-import audio as new clip

### Issue: "Exported video quality looks bad"
**Solution:**
- Increase bitrate (Deliver → Video → Restrict to: 30,000 kb/s)
- Use H.265 (HEVC) instead of H.264 (better quality, slower)
- Export as ProRes (huge file, perfect quality)

---

## Keyboard Shortcuts

### Essential Shortcuts

| Action | Shortcut |
|--------|----------|
| Play/Pause | **Spacebar** |
| Mark In | **I** |
| Mark Out | **O** |
| Cut Clip | **Ctrl+B** |
| Delete Clip | **Delete** or **Backspace** |
| Zoom Timeline | **Alt+Scroll** |
| Undo | **Ctrl+Z** |
| Redo | **Ctrl+Shift+Z** |
| Render | **Ctrl+Enter** (in Deliver page) |

### Fusion Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Node | **Shift+Space** |
| Duplicate Node | **Ctrl+C**, **Ctrl+V** |
| Frame All | **F** |
| Play Timeline | **Spacebar** |

---

## Advanced Tips

### 1. Audio Waveform Sync
- Enable waveform display: Timeline → Audio → Show Audio Waveforms
- Sync text keyframes to audio peaks visually

### 2. Color Grading for Brand Consistency
- Go to **Color** page
- Apply color grade to background footage
- Save as preset: Right-click node → Create Preset
- Apply to all future videos for consistent look

### 3. Batch Export Multiple Videos
- Create separate timelines for each track
- Deliver page → Add all to render queue
- Let it run overnight (renders sequentially)

### 4. Green Screen Replacement
- Record yourself in front of green screen
- Add to timeline above background
- Add **Chroma Key** effect
- Adjust key threshold until green is transparent

---

## Recommended Plugins (All Free)

### 1. **MotionVFX - Motype**
- Free animated text presets
- Link: https://www.motionvfx.com/store,motype,p3155.html

### 2. **Krokodove (Karaoke Effect)**
- Word-by-word text animation
- Link: https://www.steakunderwater.com/wesuckless/

### 3. **Reactor** (Plugin Manager)
- One-click install for hundreds of free Fusion plugins
- Link: https://www.steakunderwater.com/wesuckless/viewtopic.php?t=3067

---

## Full Workflow Summary

```
1. Import audio + background to Media Pool
2. Create timeline (1920x1080, 30fps)
3. Drag audio to A1 track
4. Drag background to V1 track
5. Go to Fusion → Add Text+ nodes
6. Type lyrics, style text (font, color, stroke)
7. Position text (bottom third, centered)
8. Animate (fade in/out, optional)
9. Repeat for all lyric lines with timestamps
10. Go to Deliver → Export as MP4 H.264
11. Save to: 09_video/renders/track_[NN]_lyric_video_v1.mp4
```

**Time per video:**
- First video: 2-3 hours (learning curve)
- With template: 30-45 minutes per video
- Batch 10 videos: 1 day

---

## Next Steps

1. ✅ Download DaVinci Resolve (https://www.blackmagicdesign.com/products/davinciresolve)
2. ✅ Follow "Quick Start" section for first video
3. ✅ Create reusable template
4. ✅ Batch process entire album
5. ✅ Upload to YouTube, TikTok, Instagram

**Want a pre-made template?** Let me know and I'll create one for you!
