# Listen to Track Versions

**Command:** `/listen [TRACK_NUMBER]` or `/listen all`
**Example:** `/listen 2` or `/listen all`

---

## Purpose

Play track versions in Suno.ai for review and comparison. Helps select the best version before extending.

---

## Prerequisites

- Track must be generated (audio stage complete)
- User logged into Suno

---

## Workflow

### Step 1: Get Track Info
```
1. Read project_state.json
2. Get track title and Suno ID
3. Get available versions
```

### Step 2: Navigate to Suno
```
1. Open suno.com/library or workspace
2. Find track by title
3. Take screenshot to verify
```

### Step 3: Play Versions
```
1. Click first version
2. Click play button
3. Wait for user to listen
4. Ask for feedback or next action
```

### Step 4: Report
```
╔══════════════════════════════════════════════════════════════════╗
║                    LISTENING: Track 2                            ║
║                    "Patrão do Bairro"                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  VERSIONS                                                         ║
║  ─────────────────────────────────────────────────────────────── ║
║  ▶ v1 │ 1:35 │ Playing...                                       ║
║    v2 │ 1:41 │                                                   ║
║                                                                   ║
║  Selected: None                                                  ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  CONTROLS                                                         ║
║  • /listen 2 v2 - Play version 2                                 ║
║  • /select 2 v1 - Select version 1                               ║
║  • /listen 3 - Move to next track                                ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Play Specific Version

```
/listen 2 v1    # Play version 1 of track 2
/listen 2 v2    # Play version 2 of track 2
```

---

## Listen All

Review all tracks sequentially:
```
/listen all
```

This creates a playlist view:
```
╔══════════════════════════════════════════════════════════════════╗
║                    ALBUM REVIEW                                  ║
║                    MAG Hood Boss Vol. 1                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  PLAYLIST                                                         ║
║  ─────────────────────────────────────────────────────────────── ║
║  #  │ Title              │ Ver │ Length │ Status                 ║
║  ───┼────────────────────┼─────┼────────┼─────────────────────── ║
║  1  │ Abertura           │ v1  │ 1:28   │ ✓ Selected            ║
║  2  │ Patrão do Bairro   │ -   │ -      │ ○ Needs selection     ║
║  3  │ Ouro dos Anos 80   │ v2  │ 1:29   │ ✓ Selected            ║
║  ...                                                              ║
║                                                                   ║
║  ▶ Now Playing: Track 2 - v1                                     ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NAVIGATION                                                       ║
║  • /next - Play next track                                       ║
║  • /prev - Play previous track                                   ║
║  • /select 2 v1 - Select current version                         ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Browser Automation Details

### Finding Play Button
```javascript
// Find play button for specific track/version
const playButton = document.querySelector('[aria-label="Play"], [data-testid="play-button"]');
if (playButton) playButton.click();
```

### Navigating Between Versions
```javascript
// Click on version tab or thumbnail
const versionTabs = document.querySelectorAll('[role="tab"], .version-item');
versionTabs[versionIndex].click();
```

---

## Quick Actions After Listening

| Command | Action |
|---------|--------|
| `/select 2 v1` | Select this version |
| `/listen 2 v2` | Play other version |
| `/listen 3` | Move to next track |
| `/extend 2` | Extend selected version |
| `/regenerate 2` | Generate new versions |

---

## Rating While Listening

Add notes while listening:
```
/rate 2 v1 "Good energy but hook could be stronger"
/rate 2 v2 "Best one - clean mix, strong hook"
```

These notes help when making final selections.

---

## Error Handling

| Error | Action |
|-------|--------|
| Track not found | Report, suggest /generate |
| Suno not loaded | Navigate to Suno |
| Playback failed | Refresh, retry |
| No versions | Suggest /generate first |

---

## Listening Tips

When reviewing versions:
1. **First listen**: Overall vibe, does it fit?
2. **Second listen**: Focus on vocals/lyrics clarity
3. **Third listen**: Check mix balance, 808s, instruments
4. **Compare**: A/B test between versions

Use headphones for best evaluation.
