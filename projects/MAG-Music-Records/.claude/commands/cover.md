# Generate Track Cover Art

**Command:** `/cover [TRACK_NUMBER]`
**Example:** `/cover 2`

---

## Purpose

Generate single cover artwork for a track using AI image generation. Creates visual that matches the track's mood and theme.

---

## Prerequisites

- Track prompt and lyrics should exist (for context)
- Leonardo.ai, Midjourney, or DALL-E access in browser
- Write access to `04_artwork/` folder

---

## Workflow

### Step 1: Analyze Track
```
1. Read track prompt from 01_prompts/
2. Read track lyrics from 02_lyrics/
3. Extract key themes, mood, imagery
4. Identify visual elements to include
```

### Step 2: Generate Art Prompt
```
1. Create image generation prompt based on:
   - Track mood (boss energy, reflective, hard)
   - Key lyrical themes
   - MAG visual identity (luxury, power, urban)
2. Apply MAG visual style guidelines
3. Output WANDA-style (copy-paste ready)
```

### Step 3: Generate Image
```
1. Navigate to Leonardo.ai/create
2. Enter image prompt
3. Configure settings:
   - Model: Leonardo Phoenix or Kino XL
   - Size: 1024x1024 (square for single covers)
   - Style: Cinematic, high contrast
4. Generate (4 variations)
5. Screenshot results
```

### Step 4: Download & Save
```
1. Select best variation
2. Download high-res version
3. Rename to convention:
   track_[NN]_[short_name]_cover.png
4. Save to 04_artwork/
5. Update project state
```

### Step 5: Report
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ COVER ART GENERATED                                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Track: 2 - "Patrão do Bairro"                                   ║
║                                                                   ║
║  Image Prompt Used:                                               ║
║  "Cinematic portrait of a powerful boss figure silhouetted       ║
║  against golden city lights, luxury aesthetic, dark moody        ║
║  atmosphere, high contrast, professional photography style"       ║
║                                                                   ║
║  Saved: 04_artwork/track_02_patrao_do_bairro_cover.png           ║
║  Size: 1024x1024 px                                              ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  • /upload-cover 2 - Upload to Suno                              ║
║  • /cover 3 - Generate next track cover                          ║
║  • /cover-album - Generate album cover                           ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## MAG Visual Identity

### Core Elements
- **Colors:** Black, gold, deep purple, burgundy
- **Mood:** Luxury, power, sophistication, urban
- **Imagery:** Silhouettes, city lights, gold accents, shadows
- **Style:** Cinematic, high contrast, professional

### Forbidden Elements
- Explicit violence or weapons
- Copyrighted characters or logos
- Real celebrity faces
- Overly bright/happy aesthetics

---

## Image Prompt Template

```
[Subject/Scene], [Mood], luxury aesthetic, cinematic lighting,
[Color palette], high contrast, professional photography style,
urban atmosphere, [Special elements], 8K quality
```

### Example Prompts by Track Type

**Boss/Power Track:**
```
Powerful silhouette of a man overlooking city skyline at night,
gold and black color scheme, luxury penthouse atmosphere,
cinematic lighting, high contrast shadows, 8K quality
```

**Emotional/Reflective Track:**
```
Solitary figure in rain-soaked city street, neon reflections
on wet pavement, moody blue and purple tones, cinematic
atmosphere, melancholic beauty, professional photography
```

**Hard/Street Track:**
```
Dark urban alley with dramatic lighting, smoke and shadows,
gritty luxury aesthetic, gold chain details visible,
high contrast, cinematic street photography style
```

**Celebratory Track:**
```
Champagne toast silhouette against fireworks and city lights,
gold and black luxury aesthetic, celebration atmosphere,
cinematic party scene, high-end nightlife vibe
```

---

## Leonardo.ai Settings

| Setting | Value |
|---------|-------|
| Model | Leonardo Phoenix / Kino XL |
| Size | 1024x1024 |
| Guidance | 7-9 |
| Steps | 30-50 |
| Negative Prompt | blurry, low quality, distorted, text, watermark |

---

## Browser Automation Details

### Entering Prompt
```javascript
// Find prompt textarea
const promptInput = document.querySelector('textarea[placeholder*="prompt"], textarea[name="prompt"]');
if (promptInput) {
  promptInput.value = `[IMAGE_PROMPT]`;
  promptInput.dispatchEvent(new Event('input', { bubbles: true }));
}
```

### Triggering Generation
```javascript
// Find generate button
const generateBtn = document.querySelector('button:contains("Generate"), [data-testid="generate"]');
if (generateBtn) generateBtn.click();
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Track not found | Abort, suggest /track N first |
| Generation failed | Retry with modified prompt |
| Download failed | Manual download instructions |
| NSFW filter triggered | Modify prompt, retry |

---

## State Updates

After successful generation:
```json
{
  "stages": {
    "artwork": {
      "status": "complete",
      "file": "track_02_patrao_do_bairro_cover.png",
      "prompt": "[image prompt used]",
      "date": "2026-01-01"
    }
  }
}
```

---

## Artwork Specifications

| Use Case | Size | Format |
|----------|------|--------|
| Suno single cover | 1024x1024 | PNG/JPG |
| Distribution (DistroKid) | 3000x3000 | PNG/JPG |
| Social media | 1080x1080 | PNG/JPG |

For distribution, upscale to 3000x3000 using Leonardo upscaler or external tool.
