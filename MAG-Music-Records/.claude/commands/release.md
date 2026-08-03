# Release Preparation

**Command:** `/release [TRACK_NUMBER]` or `/release album`
**Example:** `/release 2` or `/release album`

---

## Purpose

Prepare track(s) or full album for distribution. Verify all assets, generate metadata, and create release checklist.

---

## Workflow

### Single Track (`/release 2`)
```
1. Check all assets exist for track
2. Verify QC passed
3. Generate release metadata
4. Create distribution checklist
```

### Full Album (`/release album`)
```
1. Check all tracks ready
2. Verify all QC passed
3. Generate album metadata
4. Create full distribution checklist
```

---

## Prerequisites Check

| Requirement | Location | Required |
|-------------|----------|----------|
| Prompt | `01_prompts/track_[NN]_prompt.txt` | Yes |
| Lyrics | `02_lyrics/track_[NN]_lyrics.txt` | Yes |
| Description | `05_metadata/track_[NN]_description.txt` | Yes |
| Audio (final) | `03_audio_exports/track_[NN]_final.*` | Yes |
| Artwork | `04_artwork/track_[NN]_cover.png` | Yes |
| QC Pass | Grade B or higher | Yes |

---

## Release Checklist

### Audio Requirements

| Spec | Requirement | Notes |
|------|-------------|-------|
| Format | WAV | Preferred for distribution |
| Sample Rate | 44.1 kHz | Standard |
| Bit Depth | 16 or 24-bit | 24-bit preferred |
| Loudness | -14 LUFS | Spotify target |
| True Peak | -1 dB | Headroom |

### Artwork Requirements

| Spec | Requirement |
|------|-------------|
| Size | 3000x3000 px minimum |
| Format | PNG or JPG |
| Color | RGB |
| Content | No explicit imagery unless flagged |

### Metadata Requirements

| Field | Example | Required |
|-------|---------|----------|
| Title | Patrão do Bairro | Yes |
| Artist | MAG | Yes |
| Album | MAG Hood Boss Vol. 1 | Yes |
| Genre | Hip-Hop/Rap | Yes |
| Subgenre | Trap | Optional |
| Language | Portuguese | Yes |
| Explicit | Yes | Yes |
| ISRC | Auto-generated | Optional |
| UPC | Auto-generated | For album |
| Copyright | 2026 MAG Music Records | Yes |
| Release Date | YYYY-MM-DD | Yes |

---

## Output Format - Single Track

```
╔══════════════════════════════════════════════════════════════════╗
║                    RELEASE PREP: Track 2                         ║
║                    "Patrão do Bairro"                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  STATUS: ✓ READY FOR RELEASE                                     ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  ASSETS CHECK                                                     ║
║  ─────────────────────────────────────────────────────────────── ║
║  ✓ Prompt:      track_02_patrao_do_bairro_prompt.txt             ║
║  ✓ Lyrics:      track_02_patrao_do_bairro_lyrics.txt             ║
║  ✓ Description: track_02_patrao_do_bairro_description.txt        ║
║  ✓ Audio:       track_02_patrao_do_bairro_final.wav              ║
║  ✓ Artwork:     track_02_patrao_do_bairro_cover.png              ║
║  ✓ QC:          Grade A (94/100)                                 ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  METADATA                                                         ║
║  ─────────────────────────────────────────────────────────────── ║
║  Title:         Patrão do Bairro                                 ║
║  Artist:        MAG                                               ║
║  Album:         MAG Hood Boss Vol. 1                             ║
║  Track #:       2                                                 ║
║  Genre:         Hip-Hop/Rap                                      ║
║  Language:      Portuguese                                       ║
║  Explicit:      Yes                                               ║
║  Duration:      3:42                                              ║
║  Copyright:     2026 MAG Music Records                           ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  DISTRIBUTION CHECKLIST                                           ║
║  ─────────────────────────────────────────────────────────────── ║
║  [ ] Upload to DistroKid                                         ║
║  [ ] Select stores (Spotify, Apple, etc.)                        ║
║  [ ] Set release date                                            ║
║  [ ] Submit for review                                           ║
║  [ ] Create pre-save link                                        ║
║  [ ] Schedule social media posts                                 ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Output Format - Full Album

```
╔══════════════════════════════════════════════════════════════════╗
║                    ALBUM RELEASE PREP                            ║
║                    MAG Hood Boss Vol. 1                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  STATUS: ⚠ NOT READY (2 items missing)                          ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  TRACK STATUS                                                     ║
║  ─────────────────────────────────────────────────────────────── ║
║  #  │ Title              │ Audio │ Art │ Desc │ QC  │ Ready      ║
║  ───┼────────────────────┼───────┼─────┼──────┼─────┼─────────── ║
║  1  │ Abertura           │  ✓    │  ✓  │  ✓   │  A  │ ✓          ║
║  2  │ Patrão do Bairro   │  ✓    │  ✓  │  ✓   │  A  │ ✓          ║
║  3  │ Ouro dos Anos 80   │  ✓    │  ○  │  ✓   │  B  │ ○          ║
║  ...                                                              ║
║  12 │ Enxofre            │  ✓    │  ○  │  ✓   │  A  │ ○          ║
║                                                                   ║
║  Legend: ✓ Ready | ○ Missing | ✗ Failed                          ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  BLOCKERS                                                         ║
║  ─────────────────────────────────────────────────────────────── ║
║  • Track 3: Missing artwork                                      ║
║  • Track 12: Missing artwork                                     ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT STEPS                                                       ║
║  ─────────────────────────────────────────────────────────────── ║
║  1. Generate artwork: /cover 3 and /cover 12                     ║
║  2. Run /release album again to verify                           ║
║  3. Upload to DistroKid                                          ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Distribution Platforms

| Platform | Via DistroKid | Notes |
|----------|---------------|-------|
| Spotify | Yes | Largest streaming |
| Apple Music | Yes | High audio quality |
| YouTube Music | Yes | Video integration |
| Amazon Music | Yes | Alexa integration |
| Tidal | Yes | Hi-Fi quality |
| Deezer | Yes | Europe popular |
| TikTok | Yes | Promo clips |
| Instagram | Yes | Stories/Reels |

---

## Post-Release Checklist

- [ ] Verify tracks appear on all platforms
- [ ] Check artwork displays correctly
- [ ] Test playback on different devices
- [ ] Share links on social media
- [ ] Monitor first-day streams
- [ ] Respond to comments/feedback
