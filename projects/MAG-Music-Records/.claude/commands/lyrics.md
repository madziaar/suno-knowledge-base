# Generate Lyrics

**Command:** `/lyrics [TRACK_NUMBER]`
**Example:** `/lyrics 2`

---

## Purpose

Generate ONLY the lyrics for a track. WANDA mode - no preamble, no explanation, just the lyrics with section markers.

---

## Workflow

### Step 1: Load Context
```
1. Identify active project and variation
2. Read track prompt from 01_prompts/ (if exists)
3. Read TRACKLIST.md for track concept, mood, hook idea
4. Read docs/MASTER_STYLE_GUIDE.md for lyrical themes
5. Read variation spec for language/slang (if applicable)
```

### Step 2: Generate Lyrics
```
Structure:
[Intro] - 4-8 lines, set the mood, include ad-libs
[Verse 1] - 12-16 lines, establish narrative
[Hook/Chorus] - 4-8 lines, memorable and repeatable
[Verse 2] - 12-16 lines, develop story
[Hook/Chorus]
[Bridge] - 4-8 lines (optional), contrast
[Verse 3] - 8-12 lines (optional)
[Hook/Chorus]
[Outro] - 4-8 lines, closing statement
```

### Step 3: Output (WANDA Mode)
```
Output ONLY the lyrics with section markers.
NO "Here are the lyrics..."
NO explanation
NO commentary
JUST the raw lyrics
```

### Step 4: Save File
```
Save to: 02_lyrics/track_[NN]_[shortname]_lyrics.txt
Update project_state.json if exists
```

---

## Section Markers (Suno Compatible)

### Structure Tags
```
[Intro]
[Verse 1]
[Pre-Chorus]
[Chorus] or [Hook]
[Verse 2]
[Bridge]
[Verse 3]
[Outro]
```

### Performance Tags
```
[Male Vocal]
[Female Vocal]
[Spoken Word]
[Whispered]
[Ad-lib]
```

### Sound/Instruction Tags
```
(Instrumental)
(Bass drops)
(Orchestra swells)
(Drums fade)
(Build up)
```

---

## Required Elements

### Ad-Libs (Include Throughout)
- "UGH!" — Primary signature
- "Yeah..." — Reflective moments
- "MAG" — Brand callout (intro/outro)
- "Boss!" — Power moments

### Hook Requirements
- 4-8 lines maximum
- Memorable and singable
- Contains track's core message
- Repeatable (appears 2-3 times)

### Flow Style
- Measured, deliberate pacing
- Strategic pauses
- NOT rushed or choppy
- Confident, boss-like rhythm

---

## Core Themes (From Master Style Guide)

| Theme | Description |
|-------|-------------|
| Success | Rags to riches, came from nothing |
| Boss Mentality | Leadership, power, authority |
| Luxury | Cars, watches, champagne |
| Street Credibility | Authentic roots, real experiences |
| Loyalty | Family, crew, blood ties |
| Resilience | Survival, overcoming obstacles |

---

## Language Variations

### European Portuguese (EUROPEAN_PT)
- European Portuguese slang
- Lisbon/Porto references
- Keep section markers in English

### UK English (UK_ENGLISH)
- Roadman/MLE slang (mandem, fam, ends, etc.)
- London/UK references
- Natural slang integration (not forced)

---

## Quality Checklist

- [ ] Section markers present and correct
- [ ] Ad-libs included (UGH!, MAG)
- [ ] Hook is memorable and repeatable
- [ ] Language/slang matches variation
- [ ] Themes align with track concept
- [ ] Flow is measured, not rushed
- [ ] Structure follows template
