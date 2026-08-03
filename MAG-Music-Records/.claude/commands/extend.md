# Extend Track in Suno

**Command:** `/extend [TRACK_NUMBER]` or `/extend [TRACK_NUMBER] [VERSION]`
**Example:** `/extend 2` or `/extend 2 v1`

---

## Purpose

Extend a generated track to full length in Suno.ai. Takes a ~1:30 clip and extends it to 3-4 minutes.

---

## Prerequisites

- Track must be generated in Suno (audio stage complete)
- Selected version must be specified (or will prompt)
- User logged into Suno

---

## Workflow

### Step 1: Verify Track Status
```
1. Check project_state.json for track
2. Verify audio stage is complete
3. Get Suno ID for the track
4. If no version selected, prompt user
```

### Step 2: Navigate to Track
```
1. Open suno.com/library or workspace
2. Find track by title or ID
3. Click to open track details
4. Take screenshot to verify
```

### Step 3: Select Version
```
If version not specified:
  1. Show available versions
  2. Ask user which to extend
  3. Wait for selection
```

### Step 4: Extend Track
```
1. Click "Extend" button on selected version
2. Configure extension:
   - Extension type: "Continue from end"
   - Use same style/prompt
3. Click "Extend" to start
4. Wait for generation (~30-45 seconds)
```

### Step 5: Repeat if Needed
```
If track still under 3 minutes:
  1. Extend again from end
  2. Repeat until target length reached
  3. Maximum 4 extensions per track
```

### Step 6: Report Results
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ TRACK EXTENDED                                                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Track: 2 - "Patrão do Bairro"                                   ║
║  Version: v1                                                      ║
║                                                                   ║
║  Original Length: 1:35                                           ║
║  Extended Length: 3:42                                           ║
║  Extensions Used: 2                                              ║
║  Credits Used: 100                                               ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  • /listen 2 - Play extended version                             ║
║  • /download 2 - Download final audio                            ║
║  • /extend 3 - Extend next track                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Extension Strategy

| Current Length | Action | Target |
|----------------|--------|--------|
| ~1:30 | Extend once | ~2:30 |
| ~2:30 | Extend once | ~3:30 |
| ~3:00+ | Done | Full track |

---

## Browser Automation Details

### Finding Extend Button
```javascript
// Look for extend button by text or icon
const buttons = document.querySelectorAll('button');
for (const btn of buttons) {
  if (btn.textContent.toLowerCase().includes('extend') ||
      btn.querySelector('[data-icon="extend"]')) {
    btn.click();
    break;
  }
}
```

### Extension Configuration
```javascript
// Select "Continue from end" option if present
const options = document.querySelectorAll('[role="option"], [role="radio"]');
for (const opt of options) {
  if (opt.textContent.toLowerCase().includes('continue') ||
      opt.textContent.toLowerCase().includes('end')) {
    opt.click();
    break;
  }
}
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Track not found | Abort, report |
| Version not found | List available versions |
| Extension failed | Retry once |
| Credits insufficient | Report, stop |
| Already max length | Skip, report as complete |

---

## State Updates

After successful extension:
```json
{
  "stages": {
    "extended": {
      "status": "complete",
      "length": "3:42",
      "extensions": 2,
      "date": "2026-01-01"
    }
  }
}
```

---

## Extend All Tracks

To extend all tracks at once:
```
/extend-all
```

This runs `/extend` for each track with a selected version.
