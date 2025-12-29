# Suno AI Style & Lyrics Generator - Implementation Prompts

## 🎯 FOCUS: Style Prompt + Lyrics Generation (Suno WebUI Core)

**This guide focuses on the two main input fields in Suno's Custom Mode:**
1. **Style of Music** field (genre, mood, instruments, vocals)
2. **Lyrics** field (with meta tags and structure)

We're building a prompt generator that creates optimized content for these two fields.

---

## Quick Start

### The Perfect Formula
```
[GENRE] + [MOOD] + [TEMPO] + [VOCALS] + [INSTRUMENTS] + [PRODUCTION]
```

### Essential Meta Tags
- **Structure**: `[Intro]`, `[Verse]`, `[Chorus]`, `[Bridge]`, `[Outro]`
- **Ending**: `[Instrumental Fade Out][End]` (Prevents abrupt cutoffs)
- **Vocal**: `[Female Vocal]`, `[Male Vocal]`, `[Whispered]`
- **Instrumental**: `[Guitar Solo]`, `[Drop]`, `[Bassline]`

---

## Style Prompt Mastery

### Element Priority Order

**1. Genre (REQUIRED)** - Most important
- Be specific: "Synthwave" not "electronic"
- Use sub-genres: "Memphis trap" not "trap"
- Examples: Heavy Metal, Deep House, Indie Rock, Boom Bap

**2. Mood (HIGHLY RECOMMENDED)** - 1-3 descriptors
- Dark, Upbeat, Melancholic, Energetic, Chill, Aggressive
- Layer compatible moods: "dark, atmospheric, brooding"

**3. Tempo (OPTIONAL BUT HELPFUL)**
- Match genre conventions:
  - Trap: 130-150 BPM
  - House: 120-130 BPM  
  - Metal: 120-180 BPM
  - Lo-fi: 80-95 BPM

**4. Vocals (HIGHLY RECOMMENDED)**
- Gender: Male, Female, Androgynous
- Quality: Clean, Harsh, Ethereal, Gritty, Smooth
- Delivery: Powerful, Gentle, Aggressive, Whispered

**5. Instruments (RECOMMENDED)** - 3-5 key ones
- Be specific: "Jangly guitars" not "guitars"
- For electronic: "808 bass", "vintage synthesizers"
- For rock: "distorted guitars", "driving drums"

**6. Production (OPTIONAL)** - 1-2 keywords
- Studio-quality, Mastered, Lo-fi, Raw
- Example: "Studio-quality production, clear mix"

---

## Advanced Lyric Techniques

### 1. Vowel Extension (Melodic Vocals)
**Creates longer, more melodious vocal lines**
Syntax: Extend vowel with hyphens
```
goodbye → goo-o-o-odbye
love → lo-o-o-ove
stay → sta-a-a-ay
```

### 2. Background Vocals (Parentheses)
**Adds backing vocals automatically**
Syntax: Put background text in parentheses
```
E la cha-cha-cha (cha)
Feel the rhythm (feel it)
```

### 3. Chord Annotations
**Guides harmonic structure**
Syntax: Chord names in parentheses before words
```
(Em) Walking down the street
(G) Under city lights
```

### 4. Musical Notation Per Syllable
**Extreme melodic control**
Syntax: Note name before each syllable
```
(G)Beat (G)of (A)the (B)heart (C)goes (D)on
```

---

## Genre-Specific Optimization

### Hip Hop / Rap / Trap
**Problem**: Suno often produces wrong accents (British, not authentic regional)
**Solutions**:
1. **Specify Regional Style**: "Memphis trap", "Atlanta trap", "West Coast"
2. **Use "Phonk Drum" Tag**: Consistently produces better hip hop sound
3. **Write Lyrics in Accent**: Use regional slang and phonetic spelling

### Electronic Music
**Structure is Critical**:
```
[Intro] -> [Build-up] -> [Drop] -> [Breakdown] -> [Build-up] -> [Drop] -> [Outro]
```

### Rock / Metal
**Vocal Techniques**:
- Clean vocals: "powerful clean vocals, soaring melody"
- Harsh vocals: "guttural aggressive vocals, screaming"
- Mixed: "clean vocals in verse, screaming in chorus"

### Acoustic
**Keep It Simple**:
- Don't overload with instruments
- Focus on vocals + 1-2 instruments
- Use "intimate", "stripped back" descriptors

---

## Troubleshooting Guide

### Abrupt Song Endings
**Solution**: Use the "Termination Protocol":
```
[Outro]
[Instrumental Fade out][End]
```

### Wrong Instrument
**Solution**: Use repeated, lowercase tags for emphasis:
```
[sax][saxophone][solo]
```

### Voice Sounds Robotic
**Solution**: 
1. Upgrade to v4.5+ model
2. Add descriptors: "Emotional, natural delivery, vibrato"
3. Use ReMi for creative lyrics

---

**Guide Version**: 2.1
**Optimized For**: Suno V4.5+ & V5
