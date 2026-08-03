# DaVinci Resolve - Professional Lyric Video Creation
# Complete guide for MAG Music Records

## Overview

DaVinci Resolve is a **FREE professional video editor** used by Hollywood studios.
Perfect for creating high-quality lyric videos for your tracks.

**Why DaVinci Resolve?**
- ✅ Completely FREE (Studio version $295)
- ✅ No watermarks
- ✅ Professional color grading
- ✅ Advanced text animations
- ✅ 4K export
- ✅ GPU-accelerated rendering

---

## Installation

### Download
**Link:** https://www.blackmagicdesign.com/products/davinciresolve/

1. Click "Download"
2. Fill in form (or skip with fake email)
3. Download DaVinci Resolve 19 (FREE version)
4. Install (requires ~15GB space)

### System Requirements
- **Windows 10/11** (you have this)
- **GPU:** Any modern GPU (NVIDIA/AMD/Intel)
- **RAM:** 16GB minimum (32GB recommended)
- **Storage:** 15GB for software, 100GB+ for projects

---

## Quick Start (5-Minute Lyric Video)

### Step 1: Create New Project

1. Open DaVinci Resolve
2. Click "New Project"
3. Name: `MAG_Track_[NN]_Lyric_Video`
4. Click "Create"

### Step 2: Import Audio

1. Click "Media Pool" (top left)
2. Click "Import Media"
3. Select: `03_audio_exports/track_[NN]_[name].wav`
4. Drag audio to timeline (bottom)

### Step 3: Add Lyrics

**Using LRC File (Automated):**

If you have `track_[NN].lrc` from Whisper:
1. File → Import → Subtitle
2. Select `09_video/lrc/track_[NN].lrc`
3. Resolve auto-syncs text to audio

**Manual Method:**

1. Click "Effects" library (top left)
2. Search "Text"
3. Drag "Text+" to timeline above audio
4. Double-click text track → Edit text
5. Type first lyric line
6. Adjust duration to match audio
7. Repeat for each line

### Step 4: Style Text

**In Inspector Panel (right):**

**Font:**
- Font: Montserrat Bold / Bebas Neue / Futura
- Size: 80-120
- Color: White
- Stroke: 5px Black (for readability)

**Position:**
- Vertical: Bottom third (leave room for subtitles)
- Horizontal: Center

**Animation:**
- Fade In: 0.5 seconds
- Fade Out: 0.5 seconds

### Step 5: Add Background

**Option 1: Stock Footage**
1. Import stock video (from `09_video/stock/`)
2. Place on track below text
3. Apply color grade (see below)

**Option 2: Solid Color + Motion Graphics**
1. Generators → Solid Color
2. Choose color (brand colors: black, gold, deep purple)
3. Add particles/overlays (see advanced section)

**Option 3: Album Cover + Ken Burns Effect**
1. Import album cover
2. Add to timeline
3. Add "Transform" keyframes (zoom in slowly)

### Step 6: Export

1. Go to "Deliver" tab (bottom)
2. Preset: "YouTube 1080p"
3. Filename: `track_[NN]_[name]_lyric_video.mp4`
4. Location: `09_video/renders/`
5. Click "Add to Render Queue"
6. Click "Render All"

**Export Settings:**
- Format: MP4
- Codec: H.264
- Resolution: 1920x1080 (1080p)
- Frame Rate: 30 fps
- Bitrate: 15 Mbps (high quality)

---

## Professional Lyric Video Workflow

### A. Advanced Text Animations

**Word-by-Word Highlighting:**

1. Create text for full line
2. Duplicate text track (Ctrl+D)
3. Bottom layer: Gray text (inactive words)
4. Top layer: White text (active words)
5. Mask top layer to reveal words as they're sung

**Bounce Effect:**

1. Add Transform keyframe at start of word
2. Scale: 100% → 120% → 100% (bounce)
3. Duration: 0.2 seconds
4. Repeat for each word

**Slide In Animation:**

1. Position keyframe: Off-screen left
2. Position keyframe: Center (0.5 seconds later)
3. Easing: Ease Out (smooth deceleration)

### B. Background Techniques

**Stock Footage Tips:**

- **Luxury Trap:** Cityscapes at night, slow-motion car footage, money shots
- **Reggae Fusion:** Beach scenes, palm trees, sunset
- **Drill:** Urban landscapes, gritty cityscapes, rain

**Color Grading:**

For Luxury Trap aesthetic:
1. Lift Shadows: -20 (make blacks deeper)
2. Gain Highlights: +10 (make whites brighter)
3. Saturation: -20 (desaturated, cinematic)
4. Tint: +5 Blue, +5 Green (cool tones)

For Reggae Fusion aesthetic:
1. Lift Shadows: +10 (warmer blacks)
2. Saturation: +30 (vibrant colors)
3. Tint: +10 Orange, +5 Yellow (warm tones)

### C. Multi-Layer Lyric Display

**Karaoke Style (Current + Next Line):**

```
Timeline:
Track 4: Next line (gray, top)
Track 3: Current line (white, center)
Track 2: Previous line (fading out, bottom)
Track 1: Background video
```

**Implementation:**
1. Duplicate lyric tracks
2. Offset timing (1 line ahead, 1 line behind)
3. Adjust opacity (next: 50%, current: 100%, previous: 30%)

### D. Audio Visualization

**Waveform Display:**

1. Effects → Audio Spectrum Analyzer
2. Place below lyrics
3. Sync to audio track
4. Color: Match brand (gold/white)
5. Style: Bars (not circular)

**Level Meter:**

1. Effects → Loudness Meter
2. Position: Bottom corners
3. Minimal, unobtrusive

---

## MAG Music Records Lyric Video Template

### Brand Guidelines

**Colors:**
- Primary: Black (#000000)
- Secondary: Gold (#FFD700)
- Accent: Deep Purple (#4B0082)
- Text: White (#FFFFFF)

**Fonts:**
- Primary: Montserrat Bold
- Secondary: Bebas Neue
- Accent: Futura

**Logo Placement:**
- Bottom right corner
- 10% opacity
- 200x200px

### Template Structure

**Opening (0:00-0:05):**
- Black screen
- Fade in: MAG Music Records logo
- Text: "Presents"

**Intro (0:05-0:10):**
- Fade to background
- Text: Track title (large, centered)
- Text: Artist name (smaller, below)

**Verses (0:10-End):**
- Lyrics appear line-by-line
- Background: Stock footage or animated gradient
- Consistent styling throughout

**Outro (Last 5 seconds):**
- Fade out lyrics
- Show streaming links:
  - Spotify
  - Apple Music
  - YouTube Music
- MAG Music Records logo + tagline

---

## Automation Scripts

### Batch Export Script

Export all lyric videos in project:

```powershell
.\scripts\davinci-batch-export.ps1 -Project MAG_HDRILL_V1
```

### LRC to DaVinci Resolve Converter

Convert LRC subtitle files to Resolve format:

```powershell
.\scripts\lrc-to-resolve.ps1 -Track 2
```

---

## Advanced Techniques

### 1. Particle Effects

**Gold Particles for Luxury Trap:**

1. Effects → Particles → Particle Rain
2. Particle Image: Small circle
3. Color: Gold
4. Speed: Slow (5%)
5. Opacity: 30%

### 2. Camera Movement

**Slow Zoom (Ken Burns Effect):**

1. Select background clip
2. Add Transform keyframe at start: Scale 100%
3. Add Transform keyframe at end: Scale 110%
4. Creates subtle zoom-in effect

### 3. Beat-Synced Cuts

**Cutting on Beat:**

1. Listen to audio
2. Mark beat drops with "M" key
3. Cut footage at each marker (Ctrl+B)
4. Apply quick flash transitions

### 4. 3D Text

**Using Fusion (built into Resolve):**

1. Switch to Fusion tab
2. Add Text+ node
3. Add 3D Transform node
4. Rotate text in 3D space
5. Add lighting effects

---

## Performance Optimization

### Proxy Workflow

For smooth editing on older PCs:

1. Right-click clip in Media Pool
2. Generate → Optimized Media
3. Edit with proxies (fast)
4. Export using original media (full quality)

### Cache Settings

1. Playback → Render Cache → Smart
2. This pre-renders effects for smooth playback

### GPU Acceleration

1. Preferences → System → Memory and GPU
2. GPU Processing Mode: CUDA (NVIDIA) or OpenCL (AMD)
3. Restart Resolve

---

## Integration with MAG Music Records Workflow

### Updated Video Production Workflow

```
1. Generate track in Suno
2. Download audio
3. Generate LRC subtitles (Whisper AI)
   ↓
4. Find stock footage (Pexels/Pixabay)
   ↓
5. Import to DaVinci Resolve ⭐
   - Audio track
   - LRC subtitles
   - Stock footage
   - Album cover
   ↓
6. Style text (brand fonts/colors)
7. Add animations
8. Color grade background
9. Add logo/branding
   ↓
10. Export MP4 (1080p, 15 Mbps)
11. Save to: 09_video/renders/
    ↓
12. Upload to YouTube/TikTok
```

---

## Keyboard Shortcuts (Speed Up Workflow)

### Essential Shortcuts

| Action | Shortcut |
|--------|----------|
| Play/Pause | Space |
| Mark In | I |
| Mark Out | O |
| Cut | Ctrl+B |
| Undo | Ctrl+Z |
| Zoom to Fit | Shift+Z |
| Add Marker | M |
| Ripple Delete | Shift+Delete |
| Copy | Ctrl+C |
| Paste | Ctrl+V |

### Text Editing

| Action | Shortcut |
|--------|----------|
| Edit Text | Double-click |
| Duplicate Clip | Alt+Drag |
| Transform (Scale) | Inspector → Transform |
| Add Keyframe | Diamond icon |

---

## Export Presets

### YouTube 1080p
- Format: MP4
- Codec: H.264
- Resolution: 1920x1080
- Frame Rate: 30fps
- Bitrate: 15 Mbps

### Instagram/TikTok (Square)
- Format: MP4
- Codec: H.264
- Resolution: 1080x1080
- Frame Rate: 30fps
- Bitrate: 10 Mbps

### Instagram Stories/Reels (Vertical)
- Format: MP4
- Codec: H.264
- Resolution: 1080x1920
- Frame Rate: 30fps
- Bitrate: 10 Mbps

---

## Troubleshooting

**Problem:** Resolve crashes on export
**Solution:** Lower resolution to 720p or enable proxies

**Problem:** Text is blurry
**Solution:** Increase text size, add stroke, enable "Sharpen" in Inspector

**Problem:** Audio out of sync
**Solution:** Right-click audio → "Slip into Sync"

**Problem:** Slow playback
**Solution:** Generate optimized media, lower timeline resolution to 720p

---

## Resources

### Free Stock Footage
- Pexels: https://www.pexels.com/videos/
- Pixabay: https://pixabay.com/videos/
- Coverr: https://coverr.co/
- Mixkit: https://mixkit.co/

### Free Fonts
- Google Fonts: https://fonts.google.com/
- DaFont: https://www.dafont.com/
- FontSquirrel: https://www.fontsquirrel.com/

### Free Overlays/VFX
- FootageCrate: https://footagecrate.com/
- ProductionCrate: https://productioncrate.com/

### Tutorials
- Official: https://www.blackmagicdesign.com/products/davinciresolve/training
- YouTube: Casey Faris, MrAlexTech

---

## Related Tools
- `tools/lyric_sync/` → Generate LRC subtitles
- `tools/stock_finder/` → Download stock footage
- `scripts/davinci-batch-export.ps1` → Batch export videos
- `@lyricvideo` agent → Orchestrate full workflow

---

**Ready to create pro lyric videos? Start with the 5-minute quick start guide above!**
