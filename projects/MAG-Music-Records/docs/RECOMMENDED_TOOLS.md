# Recommended Plugins, Extensions & Tools

**MAG Music Records - Productivity Stack**

A curated collection of tools to streamline music production workflow, lyric writing, project organization, and research. Each recommendation includes practical reasoning for music creators.

---

## Table of Contents

1. [VS Code Extensions](#1-vs-code-extensions)
2. [Claude Code / AI Workflow Add-ons](#2-claude-code--ai-workflow-add-ons)
3. [Chrome Extensions](#3-chrome-extensions)
4. [Optional Creative Stack](#4-optional-creative-stack)
5. [Browser Bookmarks Setup](#5-browser-bookmarks-setup)

---

## 1. VS Code Extensions

### Markdown & Documentation

| Extension | Why It Helps | Best For | Install |
|-----------|--------------|----------|---------|
| **Markdown All in One** | Preview, auto-TOC, keyboard shortcuts, list editing | Writing lyrics docs, README files, track notes | `ext install yzhang.markdown-all-in-one` |
| **Markdown Preview Enhanced** | Better rendering, diagrams, export to PDF/HTML | Reviewing formatted documents, exporting EPKs | `ext install shd101wyy.markdown-preview-enhanced` |
| **markdownlint** | Consistent formatting, catches errors | Keeping docs clean and professional | `ext install davidanson.vscode-markdownlint` |

**Setup Tip:** Add to `.vscode/settings.json`:
```json
{
  "markdown.extension.toc.levels": "2..4",
  "markdownlint.config": {
    "MD013": false,
    "MD033": false
  }
}
```

---

### Task & Notes Capture

| Extension | Why It Helps | Best For | Install |
|-----------|--------------|----------|---------|
| **Todo Tree** | Scans TODOs, FIXMEs, custom tags across entire project | Tracking song tasks, pending lyrics, mixing notes | `ext install gruntfuggly.todo-tree` |
| **Foam** | Backlinks, daily notes, wiki-style knowledge base | Connecting lyric ideas, theme development, inspiration notes | `ext install foam.foam-vscode` |
| **Dendron** | Hierarchical notes, powerful search, schemas | Large catalogs, complex project documentation | `ext install dendron.dendron` |

**Todo Tree Custom Tags for Music Projects:**
```json
{
  "todo-tree.general.tags": [
    "TODO",
    "FIXME",
    "LYRICS",
    "MIX",
    "HOOK",
    "VERSE",
    "SAMPLE",
    "CLEAR"
  ],
  "todo-tree.highlights.customHighlight": {
    "LYRICS": { "icon": "note", "foreground": "#9C27B0" },
    "MIX": { "icon": "settings", "foreground": "#FF9800" },
    "HOOK": { "icon": "star", "foreground": "#FFD700" },
    "SAMPLE": { "icon": "alert", "foreground": "#F44336" },
    "CLEAR": { "icon": "law", "foreground": "#E91E63" }
  }
}
```

---

### File Navigation

| Extension | Why It Helps | Best For | Install |
|-----------|--------------|----------|---------|
| **File Utils** | Rename, move, duplicate, delete from command palette | Reorganizing tracks, batch file operations | `ext install sleistner.vscode-fileutils` |
| **Path Intellisense** | Autocomplete file paths as you type | Linking assets, referencing audio files in docs | `ext install christian-kohler.path-intellisense` |
| **Project Manager** | Save and switch between projects | Managing multiple albums/EPs simultaneously | `ext install alefragnani.project-manager` |

---

### Git & Versioning

| Extension | Why It Helps | Best For | Install |
|-----------|--------------|----------|---------|
| **GitLens** | Inline blame, file history, compare versions | Tracking lyric changes, seeing who edited what | `ext install eamodio.gitlens` |
| **Git Graph** | Visual branch diagram, easy merge/rebase | Understanding project timeline, release branches | `ext install mhutchie.git-graph` |
| **Git History** | View and search log, compare commits | Finding when specific lyrics changed | `ext install donjayamanne.githistory` |

**Workflow Tip:** Use branches for major versions:
- `main` - Released/final versions
- `develop` - Work in progress
- `feature/track-name` - Individual song development

---

### AI & Workflow

| Extension | Why It Helps | Best For | Install |
|-----------|--------------|----------|---------|
| **Continue** | Alternative AI assistant integration | Using multiple AI models, local models | `ext install continue.continue` |
| **Code Snippets** | Custom text expansions | WANDA commands, standard prompts | Built-in (see below) |
| **Peacock** | Color-code different workspaces | Distinguishing album projects visually | `ext install johnpapa.vscode-peacock` |

---

## 2. Claude Code / AI Workflow Add-ons

### Custom Snippets for WANDA Commands

Create snippets file at `.vscode/wanda.code-snippets`:

```json
{
  "WANDA Status Check": {
    "prefix": "wstatus",
    "body": [
      "WANDA: Show current project status for ${1:track_name}",
      "Include: completion %, pending tasks, next actions"
    ],
    "description": "Quick status check"
  },
  "WANDA Lyric Review": {
    "prefix": "wlyric",
    "body": [
      "WANDA: Review lyrics for ${1:track_name}",
      "Check: flow, rhyme scheme, emotional impact, hook strength"
    ],
    "description": "Lyric quality review"
  },
  "WANDA Track Brainstorm": {
    "prefix": "wbrain",
    "body": [
      "WANDA: Brainstorm ideas for ${1:concept}",
      "Genre: ${2:afrobeats|pop|r&b}",
      "Mood: ${3:uplifting|melancholic|energetic}",
      "Reference: ${4:artist/song}"
    ],
    "description": "Creative brainstorming session"
  },
  "WANDA Release Checklist": {
    "prefix": "wrelease",
    "body": [
      "WANDA: Generate release checklist for ${1:track_name}",
      "Platform: ${2:DistroKid|all}",
      "Include: metadata, artwork specs, timeline"
    ],
    "description": "Pre-release checklist"
  },
  "WANDA Sample Clear": {
    "prefix": "wsample",
    "body": [
      "WANDA: Check sample clearance requirements for ${1:sample_description}",
      "Original: ${2:artist} - ${3:song}",
      "Usage: ${4:loop|chop|interpolation}"
    ],
    "description": "Sample clearance guidance"
  }
}
```

---

### Prompt Templates

Create a `templates/` folder with reusable prompts:

**`templates/lyric-review.txt`**
```
Review the following lyrics for [TRACK_NAME]:

Analyze:
1. Hook memorability (1-10)
2. Verse flow and rhythm
3. Emotional consistency
4. Rhyme scheme quality
5. Commercial potential
6. Suggested improvements

Lyrics:
[PASTE LYRICS HERE]
```

**`templates/track-brief.txt`**
```
Generate a creative brief for new track:

Working Title: [NAME]
Genre: [PRIMARY] / [SECONDARY]
BPM Range: [XXX-XXX]
Key: [MAJOR/MINOR PREFERENCE]
Mood: [DESCRIPTION]
Target Audience: [DEMOGRAPHIC]
Reference Tracks: [1-3 SONGS]
Lyrical Theme: [CONCEPT]
Must Include: [SPECIFIC ELEMENTS]
Avoid: [WHAT TO SKIP]
```

**`templates/metadata-prep.txt`**
```
Prepare metadata for distribution:

Track Title: [EXACT TITLE]
Artist Name: [AS IT SHOULD APPEAR]
Featured Artists: [IF ANY]
Album/Single: [NAME]
Genre (Primary): [SELECT]
Genre (Secondary): [SELECT]
Release Date: [YYYY-MM-DD]
ISRC: [IF ASSIGNED]
UPC: [IF ASSIGNED]
Copyright: [YEAR] [OWNER]
Publishing: [DETAILS]
Explicit: [YES/NO]
Lyrics: [ATTACHED/LINK]
```

---

### Keyboard Shortcuts

Add to `keybindings.json` (Ctrl+Shift+P > "Open Keyboard Shortcuts (JSON)"):

```json
[
  {
    "key": "ctrl+shift+w",
    "command": "workbench.action.terminal.sendSequence",
    "args": { "text": "claude\n" },
    "when": "terminalFocus"
  },
  {
    "key": "ctrl+alt+s",
    "command": "workbench.action.files.saveAll"
  },
  {
    "key": "ctrl+alt+t",
    "command": "workbench.action.terminal.toggleTerminal"
  },
  {
    "key": "ctrl+alt+m",
    "command": "markdown.showPreviewToSide"
  }
]
```

---

### Session Management Tips

1. **Start of Session**
   - Review `TODO.md` or run Todo Tree scan
   - Check git status for uncommitted work
   - Open relevant track folder in explorer

2. **During Session**
   - Use `// TODO:` comments liberally
   - Save frequently (Ctrl+S or auto-save)
   - Commit at logical checkpoints

3. **End of Session**
   - Update progress in track status doc
   - Commit with clear message
   - Note next actions in TODO

4. **Context Recovery**
   - Keep a `SESSION_LOG.md` for quick context
   - Use Git commits as session markers
   - Tag important milestones

---

## 3. Chrome Extensions

### Reference Capture

| Extension | Why It Helps | Best For | Link |
|-----------|--------------|----------|------|
| **Notion Web Clipper** | Save pages, highlights, bookmarks to Notion | Building reference libraries, saving inspiration | [Chrome Store](https://chrome.google.com/webstore/detail/notion-web-clipper/knheggckgoiihginacbkhaalnibhilkk) |
| **Obsidian Web Clipper** | Clip to Obsidian vault with formatting | Local-first knowledge base | [Chrome Store](https://chrome.google.com/webstore/detail/obsidian-web-clipper/cnjifjpddelmedmihgijeibhnjfabmlf) |
| **Liner** | Highlight any web content, organize by topic | Marking key info in articles, lyrics references | [Chrome Store](https://chrome.google.com/webstore/detail/liner-search-faster-highl/bmhcbmnbenmcecpmpepghooflbehcack) |
| **Save to Google Drive** | One-click save pages, images, docs | Quick backup of important references | [Chrome Store](https://chrome.google.com/webstore/detail/save-to-google-drive/gmbmikajjgmnabiglmofipeabaddhgne) |

---

### Screenshot & Clipping

| Extension | Why It Helps | Best For | Link |
|-----------|--------------|----------|------|
| **GoFullPage** | Capture entire scrolling pages | Saving full articles, reference boards | [Chrome Store](https://chrome.google.com/webstore/detail/gofullpage-full-page-scre/fdpohaocaechififmbbbbbknoalclacl) |
| **Awesome Screenshot** | Annotate, crop, record screen | Documenting processes, sharing visual feedback | [Chrome Store](https://chrome.google.com/webstore/detail/awesome-screenshot-and-sc/nlipoenfbbikpbjkfpfillcgkoblgpmj) |
| **Nimbus Screenshot** | Advanced capture with editor | Creating visual guides, annotated references | [Chrome Store](https://chrome.google.com/webstore/detail/nimbus-screenshot-screen/bpconcjcammlapcogcnnelfmaeghhagj) |

---

### Tab Management

| Extension | Why It Helps | Best For | Link |
|-----------|--------------|----------|------|
| **OneTab** | Collapse all tabs to list, restore later | Managing research sessions, reducing memory | [Chrome Store](https://chrome.google.com/webstore/detail/onetab/chphlpgkkbolifaimnlloiipkdnihall) |
| **Session Buddy** | Save, manage, restore tab sessions | Switching between projects, preserving context | [Chrome Store](https://chrome.google.com/webstore/detail/session-buddy/edacconmaakjimmfgnblocblbcdcpbko) |
| **Workona** | Project-based tab workspaces | Dedicated spaces per album/project | [Chrome Store](https://chrome.google.com/webstore/detail/workona-tab-manager/ailcmbgekjpnablpdkmaaccecekgdhlh) |
| **Tab Wrangler** | Auto-close inactive tabs | Keeping browser fast and focused | [Chrome Store](https://chrome.google.com/webstore/detail/tab-wrangler/egnjhciaieeiiohknchakcodbpgjnchh) |

---

### Research Helpers

| Extension | Why It Helps | Best For | Link |
|-----------|--------------|----------|------|
| **Keyword Surfer** | Search volume data in Google results | Understanding trending topics, SEO for releases | [Chrome Store](https://chrome.google.com/webstore/detail/keyword-surfer/bafijghppfhdpldihckdcadbcobikaca) |
| **Similar Sites** | Find related websites | Discovering new platforms, competitors | [Chrome Store](https://chrome.google.com/webstore/detail/similar-sites-discover-re/necpbmbhhdiplmfhmjicabdeighkndkn) |
| **Wappalyzer** | Identify website technologies | Understanding what tools others use | [Chrome Store](https://chrome.google.com/webstore/detail/wappalyzer-technology-pro/gppongmhjkpfnbhagpmjfkondmcpelp) |

---

### Audio & Music

| Extension | Why It Helps | Best For | Link |
|-----------|--------------|----------|------|
| **Shazam** | Identify songs playing in browser | Finding samples, discovering music in videos | [Chrome Store](https://chrome.google.com/webstore/detail/shazam-find-song-names-fr/mmioliijnhnoblpgimnlajmefafdfilb) |
| **Enhancer for YouTube** | Speed control, loop sections, audio boost | Studying reference tracks, transcribing | [Chrome Store](https://chrome.google.com/webstore/detail/enhancer-for-youtube/ponfpcnoihfmfllpaingbgckeeldkhle) |
| **Video Speed Controller** | Precise speed control on any HTML5 video | Slowing down complex musical passages | [Chrome Store](https://chrome.google.com/webstore/detail/video-speed-controller/nffaoalbilbmmfgbnbgppjihopabppdk) |
| **Audio Only YouTube** | Play YouTube as audio only | Reference listening without video distraction | [Chrome Store](https://chrome.google.com/webstore/detail/audio-only-youtube/pkocpiliahoaohbolmkelakpiphnllog) |

---

## 4. Optional Creative Stack

### Local Audio Organization

| Tool | Why It Helps | Best For | Link |
|------|--------------|----------|------|
| **Mp3tag** (Windows) | Edit metadata, batch operations, cover art | Organizing sample libraries, fixing tags | [mp3tag.de](https://www.mp3tag.de/en/) |
| **MusicBrainz Picard** | Auto-tagging from online database | Cleaning up large music collections | [picard.musicbrainz.org](https://picard.musicbrainz.org/) |
| **TagScanner** | Batch rename from tags, powerful formatting | Consistent file naming conventions | [xdlab.ru/en](https://www.xdlab.ru/en/) |
| **Kid3** | Cross-platform tag editor | Linux/Mac alternative to Mp3tag | [kid3.kde.org](https://kid3.kde.org/) |

**Recommended Naming Convention:**
```
[Artist] - [Track Title] ([BPM] [Key]).mp3
Example: MAG - Sunrise Melody (120 Cmaj).mp3
```

---

### Lightweight DAW & Preview

| Tool | Why It Helps | Best For | Link |
|------|--------------|----------|------|
| **Audacity** | Free, simple editing, noise reduction | Quick edits, format conversion, rough cuts | [audacityteam.org](https://www.audacityteam.org/) |
| **VLC Media Player** | Plays any format, speed control, convert | Previewing unusual formats, quick playback | [videolan.org](https://www.videolan.org/) |
| **Ocenaudio** | Clean interface, real-time preview effects | Faster alternative to Audacity | [ocenaudio.com](https://www.ocenaudio.com/) |
| **Wavosaur** | Lightweight, VST support, portable | Quick audio processing, no install needed | [wavosaur.com](https://www.wavosaur.com/) |

---

### File Organization

| Tool | Why It Helps | Best For | Link |
|------|--------------|----------|------|
| **Everything** (Windows) | Instant search across all drives | Finding files instantly, locating samples | [voidtools.com](https://www.voidtools.com/) |
| **FreeFileSync** | Backup, sync, mirror folders | Backing up projects, syncing to cloud | [freefilesync.org](https://freefilesync.org/) |
| **WizTree** | Visual disk space analyzer | Finding large files, cleanup | [diskanalyzer.com](https://diskanalyzer.com/) |
| **7-Zip** | Compress/decompress any format | Archiving completed projects, sharing | [7-zip.org](https://www.7-zip.org/) |

**Backup Strategy:**
```
Local Drive (Primary)
    |
    +-- Cloud Sync (Google Drive/Dropbox) - Work in Progress
    |
    +-- External Drive - Weekly Full Backup
    |
    +-- Archive Drive - Completed Projects (Compressed)
```

---

### Creative Utilities

| Tool | Why It Helps | Best For | Link |
|------|--------------|----------|------|
| **Spotify Dedup** | Remove duplicate playlists songs | Cleaning reference playlists | [spotify-dedup.com](https://spotify-dedup.com/) |
| **TuneMyMusic** | Transfer playlists between services | Moving references between platforms | [tunemymusic.com](https://www.tunemymusic.com/) |
| **Photopea** | Free Photoshop alternative in browser | Quick artwork edits | [photopea.com](https://www.photopea.com/) |
| **Remove.bg** | Remove image backgrounds | Creating artwork assets | [remove.bg](https://www.remove.bg/) |

---

## 5. Browser Bookmarks Setup

### Recommended Folder Structure

```
Bookmarks Bar/
|
+-- [MAG Music Records]
|   |
|   +-- [Production]
|   |   +-- Suno AI (suno.ai)
|   |   +-- Splice (splice.com)
|   |   +-- Loopcloud (loopcloud.com)
|   |   +-- Tracklib (tracklib.com)
|   |
|   +-- [Distribution]
|   |   +-- DistroKid Dashboard (distrokid.com)
|   |   +-- TuneCore (tunecore.com)
|   |   +-- CD Baby (cdbaby.com)
|   |   +-- Ditto Music (dittomusic.com)
|   |
|   +-- [Analytics]
|   |   +-- Spotify for Artists (artists.spotify.com)
|   |   +-- Apple Music for Artists (artists.apple.com)
|   |   +-- YouTube Studio (studio.youtube.com)
|   |   +-- Chartmetric (chartmetric.com)
|   |
|   +-- [Copyright & Legal]
|   |   +-- ASCAP ACE (ascap.com/repertory)
|   |   +-- BMI Repertoire (repertoire.bmi.com)
|   |   +-- SESAC (sesac.com)
|   |   +-- Copyright.gov (copyright.gov)
|   |   +-- WhoSampled (whosampled.com)
|   |   +-- Tracklib Clearance (tracklib.com)
|   |
|   +-- [AI Tools]
|   |   +-- Suno AI (suno.ai)
|   |   +-- Claude (claude.ai)
|   |   +-- ChatGPT (chat.openai.com)
|   |   +-- Mubert (mubert.com)
|   |   +-- AIVA (aiva.ai)
|   |   +-- Boomy (boomy.com)
|   |
|   +-- [Reference Playlists]
|   |   +-- Spotify - Genre Reference (spotify.com/playlist/...)
|   |   +-- YouTube - Production Tutorials (youtube.com/playlist/...)
|   |   +-- SoundCloud - Underground (soundcloud.com/...)
|   |   +-- Apple Music - New Music (music.apple.com/...)
|   |
|   +-- [Marketing]
|   |   +-- Canva (canva.com)
|   |   +-- Linktree (linktr.ee)
|   |   +-- Feature.fm (feature.fm)
|   |   +-- Toneden (toneden.io)
|   |   +-- SubmitHub (submithub.com)
|   |
|   +-- [Learning]
|       +-- YouTube - Music Production (youtube.com)
|       +-- Skillshare (skillshare.com)
|       +-- Coursera Music (coursera.org)
|       +-- Production Music Live (productionmusiclive.com)
```

### Quick Access Bookmarklets

Add these as bookmarks for quick actions:

**Search Song on WhoSampled:**
```javascript
javascript:(function(){var s=prompt('Search WhoSampled:','');if(s)window.open('https://www.whosampled.com/search/?q='+encodeURIComponent(s))})();
```

**Check ASCAP Database:**
```javascript
javascript:(function(){var s=prompt('Search ASCAP:','');if(s)window.open('https://www.ascap.com/repertory#/ace/search/workID/'+encodeURIComponent(s))})();
```

**Quick BPM Calculator:**
```javascript
javascript:(function(){var b=prompt('Enter BPM:','120');if(b){var ms=60000/b;alert('BPM: '+b+'\nMs per beat: '+ms.toFixed(2)+'\nMs per bar: '+(ms*4).toFixed(2)+'\n1/8 note: '+(ms/2).toFixed(2)+'ms\n1/16 note: '+(ms/4).toFixed(2)+'ms')}})();
```

---

## Quick Reference Card

### Essential Tools by Task

| Task | Primary Tool | Alternative |
|------|--------------|-------------|
| Write lyrics | VS Code + Markdown | Foam for ideas |
| Track project status | Todo Tree | GitHub Issues |
| Find samples | WhoSampled + Shazam | Tracklib |
| Quick audio edit | Audacity | Ocenaudio |
| Tag audio files | Mp3tag | MusicBrainz |
| Find any file | Everything | Windows Search |
| Backup projects | FreeFileSync | Google Drive |
| Check copyright | ASCAP ACE + BMI | WhoSampled |
| Research | Liner + OneTab | Session Buddy |
| Create artwork | Photopea | Canva |

---

## Installation Priority

### Phase 1: Essential (Install First)
- [ ] VS Code: Markdown All in One
- [ ] VS Code: Todo Tree
- [ ] VS Code: GitLens
- [ ] Chrome: OneTab
- [ ] Chrome: Shazam
- [ ] Desktop: Everything (Windows)
- [ ] Desktop: Mp3tag

### Phase 2: Productivity Boost
- [ ] VS Code: File Utils
- [ ] VS Code: Path Intellisense
- [ ] VS Code: Git Graph
- [ ] Chrome: Enhancer for YouTube
- [ ] Chrome: GoFullPage
- [ ] Desktop: Audacity
- [ ] Desktop: FreeFileSync

### Phase 3: Advanced Workflow
- [ ] VS Code: Foam or Dendron
- [ ] VS Code: Project Manager
- [ ] Chrome: Session Buddy or Workona
- [ ] Chrome: Liner
- [ ] Desktop: MusicBrainz Picard

---

*Document created for MAG Music Records workflow optimization.*
*Last updated: December 2024*
