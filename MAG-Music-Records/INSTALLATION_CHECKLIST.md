# MAG Music Records - Complete Tools Installation Checklist
> Master guide for setting up your entire production system

## 📋 Quick Overview

This checklist covers installation of:
- ✅ 4 new AI agents (@distro, @social, @metadata, @setlist)
- ✅ Batch operations system
- ✅ VS Code extensions
- ✅ Lalal.ai stem separation
- ✅ DaVinci Resolve (video editing)
- ✅ Ozone mastering
- ✅ Ableton Live 12

**Total Setup Time:** 4-6 hours (can spread over multiple days)

---

## PHASE 1: Agents & Scripts (✅ DONE!)

### What Was Installed

**New Agents:**
- [ ] @distro - DistroKid upload automation
- [ ] @social - Social media content generation
- [ ] @metadata - Metadata validation
- [ ] @setlist - Track sequencing optimizer

**New Scripts:**
- [ ] Batch operations script (PowerShell)
- [ ] Lalal.ai stem separation (Python)
- [ ] Ozone batch helper (PowerShell)

**Documentation:**
- [ ] Lalal.ai integration guide
- [ ] DaVinci Resolve guide
- [ ] Ozone mastering guide
- [ ] Ableton Live 12 guide

**Status:** ✅ All created and committed to Git!

**Verify:**
```powershell
cd "C:\Giquina-Projects\MAG Music Records"
git status
```

---

## PHASE 2: VS Code Extensions (15 minutes)

### Step 1: Install Recommended Extensions

**Run the install script:**
```powershell
cd "C:\Giquina-Projects\MAG Music Records"
.\scripts\install-extensions.ps1
```

**Or install manually:**

**Priority 1 (Must Have):**
- [ ] Python (ms-python.python)
- [ ] Pylance (ms-python.vscode-pylance)
- [ ] PowerShell (ms-vscode.powershell)
- [ ] GitLens (eamodio.gitlens)
- [ ] Path Intellisense (christian-kohler.path-intellisense)
- [ ] Better Comments (aaron-bond.better-comments)
- [ ] Git Graph (mhutchie.git-graph)

**Priority 2 (Recommended):**
- [ ] Project Manager (alefragnani.project-manager)
- [ ] Portuguese Spell Checker (streetsidesoftware.code-spell-checker-portuguese)
- [ ] Markdown All in One (yzhang.markdown-all-in-one)
- [ ] Rainbow CSV (mechatroner.rainbow-csv)
- [ ] File Utils (sleistner.vscode-fileutils)

**Priority 3 (Nice to Have):**
- [ ] Live Server (ms-vscode.live-server)
- [ ] GitHub Actions (github.vscode-github-actions)
- [ ] Markdown Preview Enhanced (bierner.markdown-preview-github-styles)

**Verify:**
- Open VS Code
- Extensions panel should show all installed
- Restart VS Code to activate

---

## PHASE 3: Lalal.ai Stem Separation (30 minutes)

### Step 1: Create Account

- [ ] Go to https://www.lalal.ai
- [ ] Create free account
- [ ] Test with 1 track (free tier: 10 minutes/month)

### Step 2: Upgrade (Optional)

**If satisfied with quality:**
- [ ] Upgrade to Lite ($15/month) for 300 minutes
- [ ] Or Plus ($25/month) for 750 minutes

**For 10-track album:**
- Lite is sufficient (30 min album = 60 min processing)

### Step 3: Install Python Dependencies

```bash
cd "C:\Giquina-Projects\MAG Music Records\tools\stem_separation"
pip install -r requirements.txt
```

### Step 4: Set API Key (Optional - For Automation)

**If you want automated batch processing:**
1. [ ] Go to https://www.lalal.ai/api/
2. [ ] Generate API key
3. [ ] Set environment variable:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('LALAL_API_KEY', 'your-key-here', 'User')
   ```

### Step 5: Test

**Manual test:**
- [ ] Upload 1 Suno track to Lalal.ai
- [ ] Download vocals.wav + instrumental.wav
- [ ] Save to: `03_audio_exports/track_[NN]_stems/`

**Automated test (if API key set):**
```bash
python tools/stem_separation/lalal_batch.py "C:\Giquina-Projects\MAG Music Records\projects\mixtapes\MAG_Hardcore_Drill_Vol_1"
```

**Verify:**
- [ ] Stems sound clean (90-95% separation)
- [ ] Vocals isolated properly
- [ ] Instrumental has minimal vocal bleed

---

## PHASE 4: DaVinci Resolve (1-2 hours)

### Step 1: Download

- [ ] Go to https://www.blackmagicdesign.com/products/davinciresolve
- [ ] Click "Download"
- [ ] Fill out form (required, but info can be fake)
- [ ] Download **DaVinci Resolve 19** (NOT Studio)
- [ ] File size: ~3.5 GB

### Step 2: Install

- [ ] Run installer
- [ ] Choose Standard Installation
- [ ] Wait 10-15 minutes
- [ ] Restart computer if prompted

### Step 3: First Launch

- [ ] Open DaVinci Resolve
- [ ] Skip "Quick Setup" wizard
- [ ] Create new project: "MAG_Lyric_Videos"
- [ ] Set project settings:
  - Timeline Resolution: 1920x1080
  - Frame Rate: 30 fps
  - Audio Sample Rate: 48000 Hz

### Step 4: Test with Sample Video

**Follow quick start in guide:**
- [ ] Import audio track
- [ ] Add background (album cover or stock footage)
- [ ] Add text (lyrics)
- [ ] Export as MP4

**Read full guide:**
- [ ] Open: `docs/DAVINCI_RESOLVE_GUIDE.md`
- [ ] Follow "Your First Lyric Video" tutorial

**Verify:**
- [ ] Can create simple lyric video
- [ ] Export works (MP4 file created)
- [ ] Video plays in media player

---

## PHASE 5: Ozone Mastering (30 minutes)

### Step 1: Get Ozone

**Option A: Free Trial (Recommended to Start)**
- [ ] Go to https://www.izotope.com/en/products/ozone.html
- [ ] Click "Try Ozone Free"
- [ ] Create account
- [ ] Download installer (~200 MB)
- [ ] 30-day full access (Suite edition)

**Option B: Wait for Sale**
- [ ] Sign up for Plugin Boutique emails
- [ ] Wait for Black Friday / Cyber Monday
- [ ] Buy Ozone 11 for $29-49 (instead of $249)

**Option C: Use LANDR Instead**
- [ ] Sign up at https://www.landr.com
- [ ] $7.50/month (unlimited masters)
- [ ] Upload tracks, download mastered files
- [ ] No software needed

### Step 2: Install (if using Ozone)

- [ ] Run Ozone installer
- [ ] Select plugin formats: VST3, AAX
- [ ] Install to default location
- [ ] Open iZotope Portal app
- [ ] Authorize trial

### Step 3: Test Master

**Standalone app:**
- [ ] Open "Ozone Standalone"
- [ ] File → Open Audio File
- [ ] Select: `03_audio_exports/track_01_[name].wav`
- [ ] Click "Master Assistant"
- [ ] Select target: Streaming
- [ ] Let it analyze (30 seconds)
- [ ] Preview result
- [ ] Export: `track_01_[name]_mastered.wav`

**Verify:**
- [ ] Mastered track sounds louder (but not distorted)
- [ ] LUFS around -14 (check meter)
- [ ] True Peak under -1.0 dBTP

**Read full guide:**
- [ ] Open: `docs/OZONE_MASTERING_GUIDE.md`

---

## PHASE 6: Ableton Live 12 (2-3 hours)

### Step 1: Download Trial

- [ ] Go to https://www.ableton.com/en/trial/
- [ ] Click "Download Free Trial"
- [ ] Create account (free)
- [ ] Download **Live 12 Suite Trial** (~3 GB)
- [ ] 90 days full access (no credit card needed!)

### Step 2: Install

- [ ] Run installer
- [ ] Accept license
- [ ] Install to: `C:\Program Files\Ableton\Live 12`
- [ ] Install Core Library (70GB) - IMPORTANT!
- [ ] Wait 15-20 minutes

### Step 3: First Launch

- [ ] Open Ableton Live 12
- [ ] Click "Try Live 12 Suite"
- [ ] Log in with Ableton account
- [ ] Authorize on your computer

### Step 4: Audio Setup

**Preferences → Audio:**
- [ ] Driver Type: ASIO
- [ ] If no ASIO: Download ASIO4ALL (https://www.asio4all.org/)
- [ ] Audio Device: ASIO4ALL or your interface
- [ ] Sample Rate: 48000 Hz
- [ ] Buffer Size: 512 samples (for mixing)

### Step 5: Create First Beat

**Follow quick start in guide:**
- [ ] Create new project
- [ ] Add drum samples
- [ ] Add 808 bass (Operator synth)
- [ ] Add melody (Analog synth)
- [ ] Arrange in timeline
- [ ] Export as WAV

**Read full guide:**
- [ ] Open: `docs/ABLETON_LIVE_12_GUIDE.md`

**Verify:**
- [ ] Can create basic beat
- [ ] Can export WAV file
- [ ] Audio plays without crackling

---

## PHASE 7: Optional Tools

### 1. Splice Sounds (Sample Library)

- [ ] Sign up: https://splice.com/sounds
- [ ] $9.99/month for 100 credits
- [ ] Download samples: drums, 808s, melodies
- [ ] Install Splice app for easy access

### 2. Plugin Boutique Account

- [ ] Create account: https://www.pluginboutique.com
- [ ] Subscribe to email alerts
- [ ] Get notified of sales on Ozone, iZotope plugins

### 3. ASIO4ALL (Windows Audio Driver)

- [ ] Download: https://www.asio4all.org/
- [ ] Install (5 minutes)
- [ ] Use with Ableton if no audio interface

### 4. EqualizerAPO (System-Wide Audio)

- [ ] Download: https://sourceforge.net/projects/equalizerapo/
- [ ] Install (improves all audio output)
- [ ] Use with Peace GUI for easy EQ control

---

## 🎯 FINAL CHECKLIST

### Production Tools
- [ ] ✅ VS Code extensions installed
- [ ] ✅ Lalal.ai account created and tested
- [ ] ✅ DaVinci Resolve installed and tested
- [ ] ✅ Ozone trial installed (or LANDR account)
- [ ] ✅ Ableton Live 12 trial installed

### Agents & Scripts
- [ ] ✅ 4 new agents (@distro, @social, @metadata, @setlist)
- [ ] ✅ Batch operations script
- [ ] ✅ Lalal.ai batch script
- [ ] ✅ Ozone helper script

### Documentation
- [ ] ✅ Read Lalal.ai guide
- [ ] ✅ Read DaVinci Resolve guide
- [ ] ✅ Read Ozone guide
- [ ] ✅ Read Ableton guide

### Test Workflow
- [ ] Create 1 track in Ableton
- [ ] Master track in Ozone
- [ ] Separate stems with Lalal.ai
- [ ] Create lyric video in DaVinci Resolve
- [ ] Generate social content with @social
- [ ] Prepare for DistroKid with @distro

---

## 🚀 NEXT STEPS

### Week 1: Learn the Tools
- [ ] Create 3 beats in Ableton
- [ ] Master 3 tracks in Ozone
- [ ] Create 1 lyric video in DaVinci Resolve

### Week 2: Integrate into Workflow
- [ ] Combine Suno + Ableton editing
- [ ] Batch separate stems with Lalal.ai
- [ ] Master entire album with Ozone

### Week 3: Production Pipeline
- [ ] Use @distro for DistroKid prep
- [ ] Use @social for Instagram/TikTok content
- [ ] Use @setlist to optimize tracklist
- [ ] Use @metadata to validate everything

### Month 2-3: Decide Purchases
- [ ] Ableton Trial expires Day 90 → Buy Standard ($449)?
- [ ] Ozone Trial expires Day 30 → Buy Elements ($29)?
- [ ] Lalal.ai working well → Keep ($15/month)?
- [ ] DaVinci Resolve → Upgrade to Studio ($295)?

---

## 💰 COST SUMMARY

### Free Tools (Keep Forever)
- DaVinci Resolve: **FREE**
- VS Code Extensions: **FREE**
- Batch Scripts: **FREE**

### Subscription Tools
- Lalal.ai Lite: **$15/month**
- OR LANDR: **$7.50/month**
- (Optional) Splice Sounds: **$9.99/month**

### One-Time Purchases (When Sales Happen)
- Ableton Live 12 Standard: **$449** (or $269 with edu discount)
- Ozone 11 Elements: **$29-49** (on sale, regular $129)

**Total Monthly:** $15-25
**Total One-Time:** $478-518

**For a professional music production setup, this is incredibly affordable!**

---

## ✅ COMPLETION VERIFICATION

**Run this command to verify installation:**

```powershell
cd "C:\Giquina-Projects\MAG Music Records"
.\scripts\verify-installation.ps1
```

(Script checks if all tools are installed and configured correctly)

---

**YOU'RE ALL SET!** 🎉

You now have a **professional music production system** that rivals any major label setup!

**Questions?** Let me know and I'll help troubleshoot any installation issues!
