# Generate Album Cover Art

**Command:** `/cover-album`
**Example:** `/cover-album`

---

## Purpose

Generate the main album cover artwork. Creates a cohesive visual identity for the entire project.

---

## Prerequisites

- Tracklist should exist (for album theme context)
- At least a few track prompts/lyrics for mood reference
- Leonardo.ai or similar AI image tool access
- Write access to `04_artwork/` folder

---

## Workflow

### Step 1: Analyze Album Theme
```
1. Read TRACKLIST.md for album overview
2. Sample 3-4 track prompts for mood
3. Identify overarching themes:
   - Power, luxury, boss mentality
   - Street credibility, authenticity
   - Portuguese/UK cultural elements
4. Define visual direction
```

### Step 2: Generate Art Prompt
```
1. Create album cover prompt based on:
   - Overall album mood
   - MAG visual identity
   - Cultural elements (Portuguese/UK)
2. Apply album cover composition rules
3. Output WANDA-style (copy-paste ready)
```

### Step 3: Generate Image
```
1. Navigate to Leonardo.ai/create
2. Enter image prompt
3. Configure for album cover:
   - Model: Leonardo Phoenix
   - Size: 1024x1024 (will upscale)
   - Style: Cinematic, iconic
4. Generate multiple variations
5. Screenshot results
```

### Step 4: Select & Upscale
```
1. Choose best variation
2. Upscale to 3000x3000 for distribution
3. Download high-res version
```

### Step 5: Save & Organize
```
1. Save as: album_cover_[album_name].png
2. Store in 04_artwork/
3. Create variations if needed:
   - album_cover_main.png (3000x3000)
   - album_cover_social.png (1080x1080)
   - album_cover_banner.png (1500x500)
```

### Step 6: Report
```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ ALBUM COVER GENERATED                                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Album: MAG Hood Boss Vol. 1                                     ║
║                                                                   ║
║  Image Prompt Used:                                               ║
║  "Iconic album cover, powerful male silhouette centered          ║
║  against luxury cityscape, gold and black color scheme,          ║
║  cinematic composition, crown subtle in shadows, premium         ║
║  hip-hop aesthetic, no text, 8K quality"                         ║
║                                                                   ║
║  FILES CREATED                                                    ║
║  ─────────────────────────────────────────────────────────────── ║
║  04_artwork/album_cover_main.png        (3000x3000)              ║
║  04_artwork/album_cover_social.png      (1080x1080)              ║
║  04_artwork/album_cover_banner.png      (1500x500)               ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  • Review and approve artwork                                    ║
║  • /cover 1 - Generate individual track covers                   ║
║  • /release album - Include in release package                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Album Cover Composition Rules

### DO:
- Center focal point (silhouette, symbol)
- Leave space for text overlay (title, artist)
- Use iconic, memorable imagery
- Keep it simple but impactful
- Use MAG color palette (black, gold, purple)

### DON'T:
- Include text in AI generation (add in post)
- Overcrowd with details
- Use copyrighted imagery
- Make it too busy or chaotic
- Use faces that could be mistaken for real people

---

## Album Cover Prompt Templates

### Portuguese Luxury Trap (Hood Boss Vol. 1)
```
Iconic hip-hop album cover, powerful silhouette of a boss figure
centered against Lisbon cityscape at golden hour, black and gold
luxury aesthetic, dramatic cinematic lighting, crown motif subtle
in shadows, premium quality, no text, 8K masterpiece
```

### UK Roadman Luxury Trap
```
Iconic UK hip-hop album cover, silhouette overlooking London skyline
at night, Big Ben and city lights in background, black and gold
color scheme, grime meets luxury aesthetic, fog and streetlights,
cinematic atmosphere, no text, premium quality
```

---

## Size Specifications

| Purpose | Size | Notes |
|---------|------|-------|
| Distribution (DistroKid) | 3000x3000 | Required minimum |
| Suno workspace | 1024x1024 | Square format |
| Spotify canvas | 1080x1920 | Vertical loop video |
| Social square | 1080x1080 | Instagram posts |
| Twitter/X banner | 1500x500 | Profile header |
| YouTube thumbnail | 1280x720 | Video thumbnails |

---

## Upscaling Workflow

If generated at 1024x1024:
```
1. Use Leonardo upscaler (if available)
2. Or use external tool:
   - Topaz Gigapixel AI
   - Real-ESRGAN online
   - Upscale.media
3. Target 3000x3000 for distribution
4. Verify quality after upscale
```

---

## Post-Processing Checklist

After AI generation:
- [ ] Upscale to required sizes
- [ ] Color correct if needed
- [ ] Add text overlay (album title, artist name)
- [ ] Create parental advisory version if explicit
- [ ] Export in RGB color space
- [ ] Verify file size under 20MB

---

## Text Overlay Guidelines

When adding text in post-production:

| Element | Font Style | Placement |
|---------|------------|-----------|
| Artist Name | Bold, clean sans-serif | Top or bottom |
| Album Title | Stylized, matches vibe | Center or bottom |
| Parental Advisory | Standard logo | Bottom right |

Recommended fonts:
- Bebas Neue (bold headers)
- Montserrat (clean modern)
- Oswald (strong presence)

---

## State Updates

After successful album cover generation:
```json
{
  "album": {
    "artwork": {
      "status": "complete",
      "files": [
        "album_cover_main.png",
        "album_cover_social.png",
        "album_cover_banner.png"
      ],
      "prompt": "[prompt used]",
      "date": "2026-01-01"
    }
  }
}
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Generation failed | Retry with simplified prompt |
| Upscale failed | Use alternative upscaler |
| Wrong aspect ratio | Regenerate or crop |
| NSFW filter | Modify prompt language |
