# Generate Track in Suno

**Command:** `/generate [TRACK_NUMBER]`
**Example:** `/generate 2`

---

## Purpose

Automate single track generation in Suno.ai using browser automation. Loads prompt and lyrics, enters them into Suno, and triggers generation.

---

## Prerequisites

Before running:
- Prompt file must exist: `01_prompts/track_[NN]_*_prompt.txt`
- Lyrics file must exist: `02_lyrics/track_[NN]_*_lyrics.txt`
- Suno.ai must be accessible in browser
- User must be logged into Suno

---

## Workflow

### Step 1: Verify Files Exist
```
1. Check 01_prompts/ for track prompt
2. Check 02_lyrics/ for track lyrics
3. If missing, abort and report
```

### Step 2: Load Content
```
1. Read prompt file content
2. Read lyrics file content
3. Get track title from TRACKLIST.md
```

### Step 3: Open Suno
```
1. Navigate to suno.com/create
2. Wait for page load
3. Take screenshot to verify
```

### Step 4: Navigate to Workspace
```
1. Find workspace dropdown/selector
2. Select project workspace (e.g., "MAG Hood Boss Vol. 1")
3. If not exists, create it
```

### Step 5: Set Up Custom Mode
```
1. Click "Custom" button (not Simple)
2. Set Lyrics Mode to "Manual"
3. Verify settings
```

### Step 6: Enter Content
```javascript
// Using JavaScript injection for reliability:

// 1. Find and set lyrics
const textareas = document.querySelectorAll('textarea');
for (const ta of textareas) {
  const placeholder = ta.getAttribute('placeholder') || '';
  if (placeholder.toLowerCase().includes('lyrics') || placeholder.toLowerCase().includes('write')) {
    ta.value = `[LYRICS_CONTENT]`;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    break;
  }
}

// 2. Find and set style prompt (usually index 1)
const stylesTextarea = textareas[1];
if (stylesTextarea) {
  stylesTextarea.value = `[PROMPT_CONTENT]`;
  stylesTextarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// 3. Set title
const titleInput = document.querySelector('input[type="text"]');
if (titleInput) {
  titleInput.value = `[TRACK_TITLE]`;
  titleInput.dispatchEvent(new Event('input', { bubbles: true }));
}
```

### Step 7: Generate
```
1. Click "Create" button
2. Wait for generation to start
3. Monitor progress (~30 seconds)
4. Take screenshot when complete
```

### Step 8: Report Results
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ TRACK GENERATED                                               ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Track: 2 - "Patrão do Bairro"                                   ║
║  Versions Created: 2                                             ║
║                                                                   ║
║  Version 1: 1:28                                                 ║
║  Version 2: 1:35                                                 ║
║                                                                   ║
║  Credits Used: 100                                               ║
║  Workspace: MAG Hood Boss Vol. 1                                 ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  • /listen 2 - Play both versions                                ║
║  • /select 2 v1 - Select best version                            ║
║  • /extend 2 - Extend to full length                             ║
║  • /generate 3 - Generate next track                             ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Browser Automation Details

### Element Selectors

| Element | Selector Strategy |
|---------|-------------------|
| Custom Mode | Button text "Custom" |
| Lyrics Field | Textarea with placeholder containing "lyrics" |
| Style Field | Second textarea (index 1) |
| Title Field | Input[type="text"] near title label |
| Create Button | Button text "Create" |
| Workspace | Dropdown near "Save to" |

### JavaScript Injection Pattern
```javascript
// This pattern works reliably with Suno's React interface:
element.value = 'new value';
element.dispatchEvent(new Event('input', { bubbles: true }));
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Prompt file not found | Abort, suggest `/prompt N` |
| Lyrics file not found | Abort, suggest `/lyrics N` |
| Suno not logged in | Prompt user to log in |
| Workspace not found | Create new workspace |
| Generation failed | Retry once, then report |
| Insufficient credits | Report and stop |

---

## State Updates

After successful generation:
```json
{
  "stages": {
    "audio": {
      "status": "complete",
      "sunoId": "[generated_id]",
      "date": "2026-01-01"
    }
  },
  "versions": [
    { "id": "v1", "length": "1:28", "rating": null },
    { "id": "v2", "length": "1:35", "rating": null }
  ]
}
```

---

## Credits Cost

| Action | Credits |
|--------|---------|
| Generate (2 versions) | ~100 |
| Extend | ~50 per extension |

Always check credit balance before batch operations.
