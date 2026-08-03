# Download Track from Suno

**Command:** `/download [TRACK_NUMBER]` or `/download all`
**Example:** `/download 2` or `/download all`

---

## Purpose

Download final audio files from Suno.ai to local project folder. Saves to `03_audio_exports/` directory.

---

## Prerequisites

- Track must be extended to full length
- User logged into Suno
- Write access to project folder

---

## Workflow

### Step 1: Verify Track Ready
```
1. Check project_state.json
2. Verify extended stage complete
3. Get track title and Suno ID
```

### Step 2: Navigate to Track
```
1. Open suno.com/library or workspace
2. Find track by title
3. Select the extended version
4. Take screenshot to verify
```

### Step 3: Download Audio
```
1. Click download button (three dots menu → Download)
2. Select format:
   - MP3 (default for review)
   - WAV (for final export if available)
3. Wait for download to complete
4. File downloads to browser default location
```

### Step 4: Move to Project
```
1. Locate downloaded file
2. Rename to project convention:
   track_[NN]_[short_name]_final.[ext]
3. Move to 03_audio_exports/
4. Verify file integrity
```

### Step 5: Report Results
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ TRACK DOWNLOADED                                              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Track: 2 - "Patrão do Bairro"                                   ║
║                                                                   ║
║  Format:   MP3 (320kbps)                                         ║
║  Duration: 3:42                                                   ║
║  Size:     8.7 MB                                                ║
║                                                                   ║
║  Saved to:                                                        ║
║  03_audio_exports/track_02_patrao_do_bairro_final.mp3            ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  • /qc 2 - Run quality control                                   ║
║  • /desc 2 - Generate description                                ║
║  • /release 2 - Prepare for release                              ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Download All Tracks

### Command: `/download all`
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ BATCH DOWNLOAD COMPLETE                                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Downloaded: 12/12 tracks                                        ║
║  Total Size: 104.5 MB                                            ║
║                                                                   ║
║  FILES                                                            ║
║  ─────────────────────────────────────────────────────────────── ║
║  ✓ track_01_abertura_final.mp3              (8.2 MB)             ║
║  ✓ track_02_patrao_do_bairro_final.mp3      (8.7 MB)             ║
║  ✓ track_03_ouro_dos_anos_80_final.mp3      (9.1 MB)             ║
║  ...                                                              ║
║  ✓ track_12_enxofre_final.mp3               (8.9 MB)             ║
║                                                                   ║
║  Location: 03_audio_exports/                                     ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## File Naming Convention

```
track_[NN]_[short_name]_[version].[ext]

Examples:
- track_02_patrao_do_bairro_v1.mp3      (version 1)
- track_02_patrao_do_bairro_v2.mp3      (version 2)
- track_02_patrao_do_bairro_final.mp3   (selected final)
- track_02_patrao_do_bairro_final.wav   (high quality export)
```

---

## Browser Automation Details

### Finding Download Button
```javascript
// Method 1: Three-dot menu
const moreButton = document.querySelector('[aria-label="More options"], [data-testid="more-menu"]');
if (moreButton) {
  moreButton.click();
  // Wait for menu, then click Download
  setTimeout(() => {
    const downloadOption = [...document.querySelectorAll('[role="menuitem"]')]
      .find(el => el.textContent.toLowerCase().includes('download'));
    if (downloadOption) downloadOption.click();
  }, 500);
}

// Method 2: Direct download button
const downloadBtn = document.querySelector('[aria-label="Download"], button:has([data-icon="download"])');
if (downloadBtn) downloadBtn.click();
```

---

## Supported Formats

| Format | Quality | Use Case |
|--------|---------|----------|
| MP3 | 320kbps | Review, streaming |
| WAV | Lossless | Final master, distribution |
| FLAC | Lossless compressed | Archive |

Note: Suno may only offer MP3. For WAV, may need external converter.

---

## Error Handling

| Error | Action |
|-------|--------|
| Track not found | Report, skip |
| Download failed | Retry once |
| File already exists | Prompt to overwrite |
| Disk space low | Warning, abort |

---

## State Updates

After successful download:
```json
{
  "stages": {
    "audio": {
      "status": "complete",
      "file": "track_02_patrao_do_bairro_final.mp3",
      "format": "mp3",
      "size": "8.7 MB",
      "duration": "3:42",
      "date": "2026-01-01"
    }
  }
}
```

---

## Audio File Storage

IMPORTANT: Audio files are stored locally but NOT committed to git.

```
03_audio_exports/           # Local only, in .gitignore
├── track_01_*.mp3
├── track_02_*.mp3
└── ...
```

For backup, upload finals to cloud storage or distribution platform.
