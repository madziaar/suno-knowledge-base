# Open Suno & Prepare

**Command:** `/suno` or `/suno [TRACK_NUMBER]`
**Example:** `/suno` or `/suno 2`

---

## Purpose

Open Suno.ai in Chrome and prepare workspace for track generation. Optionally load a specific track ready to paste.

---

## Workflow

### Step 1: Open Suno
```
1. Use browser automation to open https://suno.com/create
2. Wait for page to load
3. Take screenshot to verify
```

### Step 2: Navigate to Workspace
```
1. Check if project workspace exists (e.g., "MAG Hood Boss Vol. 1")
2. If exists, navigate to it
3. If not, create new workspace with project name
```

### Step 3: Set Up Custom Mode
```
1. Click "Custom" mode (not Simple)
2. Ensure Lyrics Mode is set to "Manual"
3. Verify interface is ready
```

### Step 4: Load Track Content (if track number provided)
```
1. Read prompt from 01_prompts/track_[NN]_prompt.txt
2. Read lyrics from 02_lyrics/track_[NN]_lyrics.txt
3. Display both ready for pasting
4. Guide user through entry
```

---

## Suno Interface Guide

### Custom Mode Fields

| Field | What to Paste |
|-------|---------------|
| **Lyrics** (large textarea) | Full lyrics with section markers |
| **Style of Music** | The prompt/style tags |
| **Title** | Track title |

### Settings

| Setting | Value |
|---------|-------|
| Mode | Custom |
| Lyrics Mode | Manual |
| Weirdness | 50% (default) |
| Style Influence | 50% (default) |
| Vocal Gender | Male |

---

## Generation Process

```
1. Paste lyrics into Lyrics field
2. Paste style prompt into Style of Music field
3. Set title to track name
4. Ensure "Save to: [Workspace]" is selected
5. Click "Create"
6. Wait ~30 seconds for 2 versions to generate
7. Listen to both versions
8. Mark best version for extension
```

---

## After Generation

```
Two versions created:
- Version 1: [length]
- Version 2: [length]

Next steps:
1. Listen to both versions
2. Use /select [track] [version] to mark the best
3. Use /extend to extend to full length
4. Use /download to save finals
```

---

## Browser Automation Commands

### Open & Setup
```javascript
// Navigate to Suno create page
navigate to suno.com/create

// Click Custom mode
click "Custom" button

// Set to Manual lyrics mode
click "Manual" in Lyrics Mode
```

### Enter Content
```javascript
// Find lyrics textarea (large one)
const lyricsField = textarea with placeholder containing "lyrics"

// Find style field
const styleField = textarea index 1 (styles)

// Set values
lyricsField.value = [lyrics content]
lyricsField.dispatchEvent(new Event('input', {bubbles: true}))

styleField.value = [style prompt]
styleField.dispatchEvent(new Event('input', {bubbles: true}))
```

---

## Keyboard Shortcuts

| Action | Keys |
|--------|------|
| Play/Pause | Space |
| Next track | Right Arrow |
| Previous track | Left Arrow |
| Download | Hover + Download icon |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Page not loading | Refresh, check internet |
| Custom mode not available | Make sure logged in |
| Lyrics not saving | Use JavaScript injection method |
| Generation stuck | Wait or refresh and retry |
| Credits insufficient | Check credit balance |

---

## References

| Document | Path |
|----------|------|
| Suno Guide | `docs/SUNO_AI_GUIDE.md` |
| Prompt Files | `01_prompts/*.txt` |
| Lyrics Files | `02_lyrics/*.txt` |
