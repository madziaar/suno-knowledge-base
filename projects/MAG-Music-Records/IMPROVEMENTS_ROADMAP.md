# MAG Music Records - System Improvements Roadmap
> Generated: January 7, 2026
> Status: Proposed Enhancements

## 🚀 Quick Wins (Implement Now)

### 1. New Agents to Build

#### **@distro** - DistroKid Upload Agent
**Purpose:** Automate track uploads to DistroKid
**Features:**
- Read metadata from `05_metadata/release_tracker.md`
- Format data for DistroKid (artist, title, ISRC, genre, etc.)
- Generate upload checklist
- Track submission status

**Location:** `.claude/agents/distro-uploader.md`

#### **@social** - Social Media Content Generator
**Purpose:** Create promotional content for tracks
**Features:**
- Generate Instagram captions (with emojis, hashtags)
- Create TikTok video scripts
- YouTube video descriptions
- Twitter/X promotional tweets
- Track launch announcement templates

**Location:** `.claude/agents/social-media.md`

#### **@setlist** - Tracklist Curator
**Purpose:** Optimize track ordering for mixtapes
**Features:**
- Analyze BPM flow across tracks
- Suggest optimal track sequence
- Balance energy levels (high/low energy tracks)
- Flag jarring transitions

**Location:** `.claude/agents/setlist-curator.md`

#### **@metadata** - Metadata Validator
**Purpose:** Ensure all metadata is complete before release
**Features:**
- Check YAML files for required fields
- Validate character limits (descriptions, titles)
- Ensure ISRC codes are present
- Flag missing cover art
- Generate release readiness report

**Location:** `.claude/agents/metadata-validator.md`

---

## 🔧 Tool Enhancements

### 2. Audio QA Improvements

**Current:** Analyzes BPM, LUFS, clipping, frequency balance
**Add:**
- **Silence detection** at track start/end (auto-trim recommendations)
- **Phase correlation** warnings (mono compatibility)
- **Comparative analysis** (compare track to reference/template)
- **Batch mode** (analyze entire album at once)

**File:** `tools/audio_qa/analyze.py`

---

### 3. Lyric Sync Enhancements

**Current:** Transcribes audio → LRC/SRT
**Add:**
- **Manual correction mode** (UI to adjust timestamps)
- **Batch processing** (process all tracks in project)
- **Preview mode** (play audio with subtitles before rendering)

**File:** `tools/lyric_sync/align.py`

---

### 4. New Tool: Cover Art Generator (Local)

**Purpose:** Generate cover art WITHOUT Leonardo.ai (fully automated)
**Tech:** Stable Diffusion (local), SDXL, or Midjourney API
**Features:**
- Read track metadata
- Generate prompt based on track theme
- Create 1024x1024 album art
- Save to `04_artwork/`

**Location:** `tools/cover_art_gen/`

**Benefits:**
- No manual Leonardo.ai workflow
- Batch generate all covers at once
- Style consistency across album

---

## 📋 Workflow Improvements

### 5. Project State Tracking

**Current:** Manual `project_state.json`
**Improve:**
- **Auto-update** when tracks complete phases
- **Visual dashboard** (HTML report showing project status)
- **Blockers tracking** (flag tracks waiting on decisions)

**File:** `tools/project_tracker/dashboard.py`

---

### 6. WANDA Command Expansion

**New Commands:**

| Command | Purpose |
|---------|---------|
| `/metadata [N]` | Generate YAML metadata for track N |
| `/batch-generate` | Generate ALL tracks (prompts + lyrics + descriptions) at once |
| `/social [N]` | Generate social media content for track N |
| `/distro [N]` | Prepare DistroKid upload package |
| `/preview [N]` | Open preview dashboard (audio + lyrics + cover) |
| `/archive [project]` | Move completed project to archive |

---

## 🎨 UI/UX Improvements

### 7. Local Web Dashboard

**Purpose:** Visual project management interface
**Features:**
- Track status grid (prompt ✅ / lyrics ✅ / audio ✅ / cover ✅)
- Quick links to Suno/Leonardo
- Audio player with waveform visualization
- Lyric editor with live preview
- Release calendar view

**Tech:** Simple HTML/CSS/JS (no backend needed)
**Location:** `tools/dashboard/index.html`

---

## 🤖 Automation Enhancements

### 8. GitHub Actions Workflows

**Purpose:** Automate validation and reports
**Workflows:**

#### **1. Pre-commit Validation**
- Validate file naming conventions
- Check character limits
- Ensure metadata completeness
- Block commit if failures

#### **2. Weekly Project Report**
- Generate progress report
- Send summary email
- Update release calendar

#### **3. Audio QA on Upload**
- Auto-run audio analysis when audio files added
- Post results as GitHub comment
- Flag issues immediately

**Location:** `.github/workflows/`

---

### 9. Batch Operations

**Create:** `scripts/batch-operations.ps1`

**Functions:**
- `Batch-Generate-All` → Generate all tracks in project
- `Batch-AudioQA` → Analyze all audio files
- `Batch-LyricVideo` → Create all lyric videos
- `Batch-Upload` → Prepare all tracks for DistroKid

---

## 📁 File Organization Improvements

### 10. Better Folder Structure

**Add to each project:**

```
projects/mixtapes/MAG_[Album]_Vol_[N]/
├── 00_admin/
│   ├── specs/              (NEW: Detailed specs for each track)
│   ├── decisions/          (NEW: Decision logs)
│   └── research/           (NEW: Cultural briefs)
├── 01_prompts/
├── 02_lyrics/
├── 03_audio_exports/
├── 04_artwork/
│   ├── covers/             (NEW: Individual track covers)
│   └── album/              (NEW: Album cover)
├── 05_metadata/
│   ├── yaml/               (NEW: Structured metadata per track)
│   └── json/               (NEW: Batch import formats)
├── 06_release/
│   ├── distrokid/          (NEW: DistroKid upload packages)
│   └── spotify/            (NEW: Spotify Canvas videos)
├── 07_archive/
├── 08_decisions/
├── 09_video/
│   ├── lrc/
│   ├── stock/
│   ├── renders/
│   └── social/             (NEW: Social media clips)
└── 10_analytics/           (NEW: Streaming data, engagement metrics)
```

---

## 🔍 Search & Discovery

### 11. Fuzzy Search for Tracks

**Purpose:** Quickly find tracks across projects
**Example:**
```
/find "ascensao"  → Shows all tracks with "ascensao" in title/lyrics/filename
```

**Implementation:** PowerShell script with fuzzy matching

---

## 🎓 Documentation Improvements

### 12. Video Tutorials

**Create:** `docs/tutorials/` folder with:
- **Getting Started** (5-minute overview)
- **Creating Your First Track** (15 minutes)
- **Batch Production** (10 minutes)
- **Quality Control Checklist** (10 minutes)

**Format:** Markdown + Loom videos

---

### 13. Troubleshooting Guide

**File:** `docs/TROUBLESHOOTING.md`

**Sections:**
- Suno generation failures
- Audio QA flagged issues
- LRC sync problems
- Cover art generation errors
- GitHub Actions failures

---

## 🧪 Testing & Quality

### 14. Automated Testing

**Tests to Build:**
- **Naming Convention Tests** (ensure all files follow standard)
- **Metadata Completeness Tests**
- **Character Limit Tests**
- **Audio Quality Tests** (LUFS, clipping, etc.)

**Framework:** Python pytest
**Location:** `tests/`

---

## 📊 Analytics & Insights

### 15. Production Metrics Dashboard

**Track:**
- Average time per track (from prompt → release)
- Success rate (tracks that make it to release vs. discarded)
- Most common QA failures
- Agent usage statistics

**Output:** HTML report generated weekly

---

## 🌐 Integration Ideas

### 16. Spotify API Integration

**Purpose:** Auto-fetch streaming data
**Features:**
- Track play counts
- Listener demographics
- Playlist additions
- Save listening data to `10_analytics/`

---

### 17. Genius API Integration

**Purpose:** Upload lyrics to Genius automatically
**Features:**
- Auto-create Genius pages for tracks
- Upload lyrics with formatting
- Add annotations (behind-the-scenes notes)

---

## 🛠️ Development Tools

### 18. VS Code Tasks

**Add:** `.vscode/tasks.json` with shortcuts

**Examples:**
- **Ctrl+Shift+B**: Run audio QA on current file
- **Ctrl+Shift+T**: Generate LRC for current audio
- **Ctrl+Shift+R**: Run project validation

---

### 19. Snippets

**File:** `.vscode/snippets.code-snippets`

**Examples:**
- `track-yaml` → Generate track metadata template
- `cultural-brief` → Generate cultural research template
- `wanda-prompt` → Generate WANDA command template

---

## 🚦 Priority Ranking

### **HIGH PRIORITY** (Do First)
1. `@distro` agent (DistroKid automation)
2. `@metadata` agent (validation)
3. Batch operations script
4. Audio QA enhancements (silence detection, batch mode)

### **MEDIUM PRIORITY** (Do Next)
1. `@social` agent (social media content)
2. `@setlist` agent (track ordering)
3. Local cover art generator
4. Project dashboard (HTML)

### **LOW PRIORITY** (Nice to Have)
1. Spotify API integration
2. Genius API integration
3. Video tutorials
4. Analytics dashboard

---

## 📝 Next Steps

1. **Review this roadmap** → Which features do you want first?
2. **Pick 3 improvements** → Let's build them now
3. **Test and iterate** → Make sure they work perfectly
4. **Document** → Update CLAUDE.md with new features

---

**Questions to answer:**
- Which agent should we build first?
- Do you want the local cover art generator (no Leonardo.ai)?
- Should we build the HTML dashboard?
- Want batch operations for faster production?

Let me know what excites you most!
