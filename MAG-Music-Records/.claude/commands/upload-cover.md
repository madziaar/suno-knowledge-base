# Upload Cover to Suno

**Command:** `/upload-cover [TRACK_NUMBER]` or `/upload-cover album`
**Example:** `/upload-cover 2` or `/upload-cover album`

---

## Purpose

Upload generated cover artwork to Suno.ai for a specific track or the album workspace.

---

## Prerequisites

- Cover artwork must exist in `04_artwork/`
- User logged into Suno
- Track must be generated in Suno

---

## Workflow

### Step 1: Verify Artwork Exists
```
1. Check 04_artwork/ for cover file
2. For track: track_[NN]_*_cover.png
3. For album: album_cover_main.png
4. Verify file format (PNG/JPG)
5. Verify minimum size (1024x1024)
```

### Step 2: Navigate to Suno
```
1. Open suno.com/library or workspace
2. Find the track by title
3. Click to open track details
4. Take screenshot to verify correct track
```

### Step 3: Upload Cover
```
1. Find cover/thumbnail upload area
2. Click upload or drag-drop zone
3. Select file from 04_artwork/
4. Wait for upload to complete
5. Verify thumbnail updated
```

### Step 4: Report
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ COVER UPLOADED TO SUNO                                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Track: 2 - "Patrão do Bairro"                                   ║
║  File:  track_02_patrao_do_bairro_cover.png                      ║
║  Size:  1024x1024 px                                             ║
║                                                                   ║
║  Status: ✓ Successfully uploaded                                 ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  • /upload-cover 3 - Upload next track cover                     ║
║  • /download 2 - Download with cover included                    ║
║  • /release 2 - Prepare for distribution                         ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Upload All Covers

To upload covers for all tracks:
```
/upload-cover all
```

This uploads covers sequentially:
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ BATCH COVER UPLOAD COMPLETE                                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Uploaded: 12/12 track covers                                    ║
║                                                                   ║
║  RESULTS                                                          ║
║  ─────────────────────────────────────────────────────────────── ║
║  Track │ Title              │ Status                             ║
║  ──────┼────────────────────┼─────────────────────────────────── ║
║  1     │ Abertura           │ ✓ Uploaded                         ║
║  2     │ Patrão do Bairro   │ ✓ Uploaded                         ║
║  3     │ Ouro dos Anos 80   │ ✓ Uploaded                         ║
║  ...                                                              ║
║  12    │ Enxofre            │ ✓ Uploaded                         ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Browser Automation Details

### Finding Upload Area
```javascript
// Method 1: File input
const fileInput = document.querySelector('input[type="file"][accept*="image"]');

// Method 2: Upload button
const uploadBtn = document.querySelector('[aria-label="Upload cover"], [data-testid="upload-thumbnail"]');

// Method 3: Drag-drop zone
const dropZone = document.querySelector('.upload-zone, [data-dropzone]');
```

### Uploading File
```javascript
// Create file from path (requires file system access)
// This is typically handled by the browser automation tool
// using drag-drop or file input methods

// After upload, verify by checking for new image
const coverImg = document.querySelector('.track-cover img, .thumbnail img');
if (coverImg && coverImg.src.includes('user-uploaded')) {
  console.log('Upload successful');
}
```

---

## File Requirements

| Requirement | Value |
|-------------|-------|
| Format | PNG or JPG |
| Minimum Size | 1024x1024 px |
| Maximum Size | 10 MB |
| Aspect Ratio | 1:1 (square) |
| Color Space | RGB |

---

## Error Handling

| Error | Action |
|-------|--------|
| File not found | Abort, suggest /cover N first |
| Wrong format | Convert to PNG/JPG |
| Too small | Suggest upscaling |
| Too large | Compress file |
| Upload failed | Retry once |
| Track not found in Suno | Search by title |

---

## State Updates

After successful upload:
```json
{
  "stages": {
    "artwork": {
      "status": "complete",
      "file": "track_02_patrao_do_bairro_cover.png",
      "uploadedToSuno": true,
      "uploadDate": "2026-01-01"
    }
  }
}
```

---

## Troubleshooting

### Cover not appearing
1. Refresh the Suno page
2. Check if upload completed
3. Try re-uploading

### Wrong size uploaded
1. Suno may resize automatically
2. For best quality, upload at 1024x1024 minimum
3. Original file preserved in 04_artwork/

### Upload button not found
1. Suno UI may have changed
2. Try clicking on existing cover image
3. Look for "Edit" or pencil icon
4. Report if consistently failing
