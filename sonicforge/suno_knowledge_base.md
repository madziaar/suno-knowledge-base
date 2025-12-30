# Suno AI - Complete Knowledge Base & Implementation Summary

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Version History & Features](#version-history)
3. [Core Concepts](#core-concepts)
4. [Prompting Best Practices](#prompting-best-practices)
5. [Meta Tags Reference](#meta-tags-reference)
6. [Advanced Techniques](#advanced-techniques)
7. [Genre-Specific Optimization](#genre-specific-optimization)
8. [Troubleshooting Guide](#troubleshooting)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Feature Checklist](#feature-checklist)

---

## Executive Summary

**Suno AI** is a leading text-to-music AI platform that generates complete songs with vocals, instrumentals, and production from text prompts. As of December 2024, it's on version 4.5+ with advanced features like vocal/instrumental addition, 8-minute songs, and 1,200+ genre support.

### Key Statistics
- **User Base**: 25+ million users (as of Nov 2024)
- **Valuation**: $500 million (2024 funding)
- **Songs Generated**: Hundreds of millions
- **Version**: Currently v4.5+ (free tier: v4.5-all)
- **Max Duration**: 8 minutes (up from 4 min in v4)
- **Genre Support**: 1,200+ genres and styles

### Pricing (Current)
- **Free**: v4.5-all, 20 total songs, 10/day with v3.5
- **Pro**: $8/month, v4.5+, 500 songs/month, commercial rights
- **Premier**: $30/month, v4.5+, 2,500 songs/month, commercial rights

---

## Version History & Features

### v3.5 (2023) - DEPRECATED
- Basic music generation
- ~3 minute songs
- Simple text prompts
- Limited genre support
- **Status**: Being replaced by v4.5-all on free tier

### v4 (November 19, 2024)
**Major improvements:**
- ✅ Cleaner audio quality
- ✅ Sharper, more creative lyrics
- ✅ More dynamic song structures
- ✅ Better vocal synthesis
- ✅ Longer songs (up to 4 minutes)

**New Features:**
- **ReMi Lyrics Model**: More creative lyric generation
  - Access via "Write with Suno" in Custom Mode
  - More artistic and "unhinged" than standard model
- **Personas**: Capture vocal style from tracks
  - Save vocal characteristics
  - Apply to new songs for consistency
- **Covers**: Reimagine songs in different genres
  - Upload audio, provide new style prompt
  - AI creates new interpretation
- **Remaster**: Upgrade old tracks to v4 quality

### v4.5 (May 2024)
**Revolutionary upgrades:**
- ✅ **8-minute songs** (doubled from v4)
- ✅ **1,200+ genres** including niche styles
- ✅ **Enhanced vocals**: Vibrato, whisper-soft to powerful
- ✅ **Better genre mashups**: Seamless blending
- ✅ **Prompt Enhancement Helper**: Built-in creative boost
- ✅ **Expanded emotional range**: Microtonal variations
- ✅ **Improved audio quality**: Less degradation/shimmer
- ✅ **2x faster generation**: 30 seconds vs 45 seconds
- ✅ **Fuller, balanced mixes**: Professional sound
- ✅ **Maintained quality**: No degradation in long songs

**Enhanced Features:**
- Better Personas (higher quality)
- Better Covers (melody preservation)
- Evocative description support
- More dynamic music
- Greater genre accuracy

### v4.5+ (July 2024) - PROFESSIONAL TIER
**Game-changing production tools:**

1. **Add Vocals**
   - Upload instrumental tracks
   - Add AI-generated vocals with lyrics
   - Specify vocal style/gender
   - Creates complete song

2. **Add Instrumentals**
   - Upload vocal recordings/stems
   - AI generates matching backing track
   - Turns voice memos into full productions
   - Genre-aware instrumentation

3. **Inspire**
   - Analyzes your playlists
   - Generates songs based on preferences
   - Learns your musical taste
   - Personalized recommendations

4. **WavTool Integration** (acquired June 2024)
   - Browser-based DAW
   - VST plugin support
   - Sample-accurate editing
   - Live recording
   - Stem separation
   - AI-generated MIDI

5. **Advanced Editing**
   - Replace sections
   - Extend tracks
   - Remaster quality
   - Non-destructive workflow

### v4.5-all (October 2024) - FREE TIER
- Free tier upgraded from v3.5 to v4.5-all
- Most v4.5 features available
- Limited generations (20 total, 10/day)
- Major quality improvement for free users

### v5 (Coming Soon - Late 2024/Early 2025)
- Teased but not yet released
- Expected to be even more advanced
- Details TBA

---

## Core Concepts

### How Suno Works

1. **Text-to-Music AI**: Generates complete songs from text descriptions
2. **Vocal Synthesis**: Creates realistic human-like singing voices
3. **Instrumental Generation**: Produces full backing tracks
4. **Production Polish**: Adds mixing, mastering effects
5. **Structure Understanding**: Follows song structure conventions

### Two Main Modes

**1. Simple Mode** (Description Mode)
- Single text box
- AI decides everything
- Good for beginners
- Quick generation

**2. Custom Mode** (Recommended)
- Style/Genre prompt field
- Lyrics field (optional)
- Full control
- Professional results

### Key Components of a Prompt

```
[GENRE] + [SUB-GENRE] + [MOOD] + [TEMPO/BPM] + [KEY] + 
[VOCAL STYLE] + [INSTRUMENTS] + [ATMOSPHERE] + [PRODUCTION]
```

**Example:**
```
Synthwave, Dark, Retro-futuristic, 110 BPM, A minor, 
Robotic vocals, Vintage synthesizers, Heavy bass, 
Neon-noir atmosphere, Analog warmth, 80s influence
```

---

## Prompting Best Practices

### The Golden Rules

1. **Be Specific, Not Generic**
   - ❌ "rock song"
   - ✅ "alternative indie rock with post-punk influences"

2. **Use Custom Mode**
   - Separate style prompt from lyrics
   - Better control and consistency

3. **Comma-Separated Elements**
   - Clear separation helps AI parse
   - Example: "Heavy Metal, Dark, 140 BPM, Aggressive vocals"

4. **Meta Tags in Brackets**
   - `[Intro]`, `[Verse]`, `[Chorus]`, `[Outro]`
   - Guide song structure
   - Must be in square brackets

5. **Order Matters**
   - Start with genre (most important)
   - Then mood, tempo, vocals, instruments
   - End with production/atmosphere

### Effective Prompt Structure

**Format:**
```
Primary Genre, Secondary Genre/Influence, Mood, Tempo, Key,
Vocal Style, Primary Instruments, Atmospheric Elements,
Production Quality, Specific Details
```

**Example Templates:**

**Rock:**
```
Alternative Rock, Indie influences, Energetic, 128 BPM, E major,
Powerful male vocals, Jangly guitars, Driving drums, Anthemic bass,
Stadium-ready production, Clear mix
```

**Electronic:**
```
Deep House, Groovy, Atmospheric, 122 BPM, F# minor,
Soulful female vocals, Sub bass, Warm pads, 4/4 beat,
Club-ready production, Spacious mix
```

**Hip Hop:**
```
Memphis Trap, Dark, Southern flow, 140 BPM,
Auto-tuned vocals, 808 bass, Hi-hat rolls, Phonk Drum,
Street atmosphere, Aggressive delivery, Hard-hitting
```

### Prompt Enhancement (v4.5+)

Use the built-in "Creative Boost" button (sparkle icon):

**Before:**
```
sad pop song
```

**After (Auto-Enhanced):**
```
Melancholic pop ballad, Emotional depth, Heartfelt piano melodies,
Subtle string arrangements, Gentle drum patterns, Vulnerable female vocals,
Intimate atmosphere, Bittersweet nostalgia, Studio-quality production,
Modern pop sensibilities, Warm analog mixing
```

---

## Meta Tags Reference

### Structural Tags (Essential)

```
[Intro] - Song introduction
[Verse] or [Verse 1], [Verse 2] - Verse sections
[Pre-Chorus] - Build-up before chorus
[Chorus] - Main hook/refrain
[Bridge] - Contrasting section
[Outro] - Song ending
[Instrumental] - Instrumental section
```

### Instrumental Tags

```
[Guitar Solo] - Guitar solo section
[Piano Solo] - Piano solo
[Sax Solo] or [Saxophone Solo] - Sax solo
[Drum Break] - Drum section
[Bass Drop] - EDM/electronic drop
[String Section] - Orchestral strings
```

**Pro Tip**: Use repeated, lowercase tags for better results:
```
[sax][saxophone][solo]  ← Better than [Saxophone Solo]
```

### Vocal Tags

```
[Female Vocal] / [Male Vocal]
[Ethereal Female Voice]
[Powerful Male Vocals]
[Whispered] / [Whispers]
[Screaming] / [Screams]
[Clean vocals] / [Harsh vocals]
[Guttural vocals] - Metal style
[Auto-tune] - Auto-tuned effect
[A cappella] - Vocals only
```

### Transition Tags

```
[Build-up] - Increasing intensity
[Breakdown] - Stripped-back section
[Drop] - EDM drop
[Fade in] - Gradual start
[Fade out] - Gradual ending
[Transition Section] - Smooth transition
[Bridge with Ostinato] - Repeating pattern bridge
```

### Ending Tags (Critical for Natural Endings)

```
[End] - Clear ending
[Fade out] - Gradual fade
[Outro] - Outro section
[Instrumental Fade out] - Instrumental ending
[Instrumental Fade out][End] - Best combination
```

### Sound Effect Tags

```
[Applause] - Crowd applause
[Crowd cheering] - Cheering
[Birds chirping] - Nature sounds
[Phone ringing] - Sound effects
[Barking] - Dog barking
[Whistling] - Whistle sounds
```

### Dynamic Tags

```
[Catchy Hook] - Memorable part
[Emotional Bridge] - Emotional peak
[Powerful Outro] - Climactic ending
[Heavy Female Screaming Section] - Intense vocals
[Angelic Voice] - Heavenly vocals
```

---

## Advanced Techniques

### 1. Vowel Extension (Melodic Effect)

Create longer, melodious vocals:

```
goo-o-o-odbye
lo-o-o-ove
sta-a-a-ay
fre-e-e-ee
```

**How it works:**
- Extends vowel sounds
- Creates melodic quality
- Great for choruses
- Adds emotional impact

**Example:**
```
[Chorus]
I'll ne-e-e-ever let you go-o-o-o
This lo-o-o-ove will always grow-o-o
```

### 2. Background Vocals with Parentheses

Add backing vocals automatically:

```
E la cha-cha-cha (cha)
Feel the rhythm (rhythm)
Can't stop dancing (dancing tonight)
```

**How it works:**
- Text in parentheses = background layer
- Creates depth
- Automatic harmonies
- Call and response

### 3. Chord Annotation

Guide musical direction:

```
(Em) Walking down the street
(G) Under city lights
(D) Searching for a sign
(C) Everything's alright
```

**How it works:**
- Chord names in parentheses
- Guides harmonic progression
- AI follows chord structure
- More control over melody

**Example:**
```
[Verse 1]
(Am) The night is dark and cold
(F) Whispers in the air
(C) Shadows dance around
(G) In this place of despair
```

### 4. Musical Notation Per Syllable

Extreme control over melody:

```
(G)Beat (G)of (A)the (B)heart
(C)Life (D)goes (E)on (F)and (G)on
```

**How it works:**
- Note name per syllable
- Guides exact pitch
- Very specific control
- Advanced technique

### 5. Inline Style Descriptions

Section-specific styling:

```
(Chorus) [heavy riffs, driving beat, powerful clean vocals with soaring melody]:
Your lyrics here

(Verse 1) [soft synths, steady beat, clean, gentle vocals]:
More subdued lyrics
```

**How it works:**
- Parentheses for section name
- Brackets for style description
- Colon to end
- Then lyrics

### 6. Structure Templates (3k character limit)

Create detailed song blueprints:

```
[Intro]
[Atmospheric Build - 8 bars]

[Verse 1]
[Soft vocals, minimal instrumentation]

[Build-up]
[Increasing intensity]

[Chorus]
[Full production, powerful vocals]

[Verse 2]
[Similar to Verse 1 but developed]

[Bridge with Ostinato]
[Repeating pattern, emotional peak]

[Transition Section]
[Smooth movement to final chorus]

[Chorus]
[Extended, add variations]

[Outro]
[Instrumental Fade out][End]
```

---

## Genre-Specific Optimization

### Hip Hop / Rap / Trap

**Problem**: Suno often produces wrong accents (British, not authentic regional)

**Solutions:**

1. **Specify Regional Style**
   ```
   Memphis trap, Southern flow
   Atlanta trap, Southern accent
   West Coast gangsta rap, LA style
   New York boom bap, East Coast flow
   ```

2. **Use "Phonk Drum" Tag**
   ```
   Phonk Drum, 808 bass, hi-hat rolls
   ```
   - Consistently produces better hip hop sound
   - More authentic beats

3. **Write Lyrics in Accent**
   - Use regional slang
   - Phonetic spelling
   - Cultural references

4. **Effective Prompts:**
   ```
   Memphis trap, Dark, Southern flow, 140 BPM,
   808 bass, Hi-hat rolls, Auto-tuned vocals,
   Phonk Drum, Street atmosphere, Aggressive delivery
   
   Atlanta trap, Auto-tune, Ad-libs, Southern accent,
   Hard-hitting 808s, Rapid hi-hats, Trap snares
   
   Boom bap, 90s hip hop, Jazzy samples, Vinyl crackle,
   Clear rap vocals, SP-1200 drums, Sampled breaks
   ```

### Electronic Music

**Structure is Critical:**

```
[Intro] - 8-16 bars
[Build-up] - 8 bars increasing tension
[Drop] - 16 bars main section
[Breakdown] - 8 bars calm/ambient
[Build-up] - 8 bars tension again
[Drop] - 16 bars climax
[Outro] - 8 bars fade
```

**Genre-Specific Tags:**

**Deep House:**
```
Deep House, Groovy, 122 BPM,
4/4 beat, Sub bass, Atmospheric pads,
Smooth vocals, Soulful, Warm
```

**Drum and Bass:**
```
Drum and Bass, Energetic, 170 BPM,
Fast breakbeats, Heavy bassline,
Synthesizers, Jungle influences
```

**Synthwave:**
```
Synthwave, Retro-futuristic, 110 BPM,
Vintage synthesizers, Analog warmth,
Robotic vocals, 80s influence, Neon atmosphere
```

### Rock / Metal

**Vocal Techniques:**

```
Clean vocals: "powerful clean vocals, soaring melody"
Harsh vocals: "guttural aggressive vocals, screaming"
Mixed: "clean vocals in verse, screaming in chorus"
```

**Guitar Descriptions:**
```
Heavy riffs, distorted guitars, palm-muted chugging,
Drop-tuned guitars, shredding solos, djent tones
```

**Effective Metal Prompt:**
```
Heavy Metal, Aggressive, 140 BPM, D minor,
Guttural vocals, Distorted guitars, Double bass drums,
Screaming sections, Dark atmosphere, Powerful riffs
```

### Acoustic / Singer-Songwriter

**Keep It Simple:**
- Don't overload with instruments
- Focus on vocals + 1-2 instruments
- Use "intimate", "stripped back" descriptors

**Effective Prompt:**
```
Acoustic ballad, Intimate, 70 BPM, E major,
Fingerpicked acoustic guitar, Gentle female vocals,
Minimalist, Warm recording, Heartfelt delivery,
Coffee shop atmosphere
```

---

## Troubleshooting Guide

### Problem: Abrupt Song Endings

**Symptoms**: Song just cuts off instead of fading

**Solutions:**
1. Add `[Fade out]` at end
2. Use `[Outro]` section
3. Combine: `[Outro][Instrumental Fade out][End]`
4. Try `[End]` tag for clean stop

**Example:**
```
[Chorus]
Final lyrics here

[Outro]
[Instrumental Fade out][End]
```

### Problem: Wrong Instrument Generated

**Symptoms**: Asked for saxophone, got trumpet (or ignored)

**Solutions:**
1. Use repeated, lowercase tags: `[sax][saxophone][solo]`
2. Try instrument name variations
3. Keep tags concise, not verbose
4. Don't use complex phrases

**Bad:** `[Beautiful smooth saxophone solo section]`
**Good:** `[sax][saxophone][solo]`

### Problem: Wrong Accent in Hip Hop

**Symptoms**: British-sounding rap instead of American regional

**Solutions:**
1. Specify region: "Memphis trap", "Atlanta trap", "West Coast"
2. Use "Phonk Drum" tag
3. Write lyrics in desired accent/slang
4. Add regional descriptors

**Example:**
```
Style: Memphis trap, Southern flow, Street slang

[Verse]
Sippin' on that syrup, feel it in my bones
Memphis nights, ridin' through the zones
```

### Problem: Looping Lyrics

**Symptoms**: Same section repeats endlessly

**Solutions:**
1. Use clear section markers: `[Verse 1]`, `[Verse 2]`
2. Add `[End]` or `[Outro]`
3. Vary lyric structure between sections
4. Make sections distinct

### Problem: Random Noises / TV Static

**Symptoms**: Weird sounds, static, glitches

**Solutions:**
1. Provide specific feedback via thumbs down
2. Use cleaner, simpler style prompts
3. Avoid conflicting descriptors
4. Try regenerating with adjusted prompt

### Problem: Voice Sounds Robotic

**Symptoms**: Unnatural, artificial vocals

**Solutions:**
1. **Upgrade to v4.5+** (major improvement)
2. Add detailed vocal descriptors:
   ```
   Emotional female vocals, natural delivery, vibrato,
   Expressive, human-like, warm tone
   ```
3. Use ReMi for more creative lyrics
4. Try different vocal styles

### Problem: Audio Degrades After 2 Minutes

**Symptoms**: Quality drops, shimmer effects

**Solutions:**
1. **Use v4.5+** (this is fixed in latest version)
2. Use Remaster feature on old tracks
3. Keep songs under 4 minutes if on v4
4. Generate in sections and edit together

### Problem: Can't Get Specific Genre Right

**Symptoms**: Generic sound, not authentic to genre

**Solutions:**
1. Use sub-genre specificity:
   - Not "metal" → "progressive death metal"
   - Not "electronic" → "deep house, 122 BPM"
2. Add characteristic instruments
3. Include tempo/BPM for genre
4. Reference era: "90s boom bap", "80s synthwave"

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Core data structures (genres, tags, templates)
- [ ] Basic UI layout
- [ ] Style prompt builder function
- [ ] Meta tag formatter

### Phase 2: Core Features (Week 2)
- [ ] Prompt enhancement engine
- [ ] Genre template system
- [ ] Vocal styling system
- [ ] Advanced lyric techniques

### Phase 3: Quality & Optimization (Week 3)
- [ ] Genre-specific optimizations
- [ ] Quality scoring system
- [ ] Validation & error handling
- [ ] Prompt parser & analyzer

### Phase 4: Advanced Features (Week 4)
- [ ] Template library with 20+ presets
- [ ] Batch generation system
- [ ] Smart suggestion engine
- [ ] History & favorites

### Phase 5: v4.5+ Features (Week 5)
- [ ] Add Vocals interface
- [ ] Add Instrumentals interface
- [ ] Inspire playlist analyzer
- [ ] Prompt enhancement helper UI
- [ ] 8-minute duration support
- [ ] Persona management
- [ ] Cover feature UI

### Phase 6: Documentation & Polish (Week 6)
- [ ] Comprehensive help system
- [ ] Video tutorials
- [ ] Interactive examples
- [ ] Troubleshooting guide
- [ ] FAQ system
- [ ] Version comparison chart

### Phase 7: Testing & Launch (Week 7)
- [ ] User testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Production deployment

---

## Feature Checklist

### Must-Have Features ✅

**Prompt Building:**
- [x] Genre selector (1,200+ genres)
- [x] Mood selector
- [x] Vocal style selector
- [x] BPM slider (60-200)
- [x] Key selector
- [x] Instrument multi-select
- [x] Style prompt generator
- [x] Prompt enhancement (v4.5+)

**Lyrics & Structure:**
- [x] Lyrics editor
- [x] Meta tag insertion buttons
- [x] Structure templates
- [x] Vowel extension tool
- [x] Background vocal notation
- [x] Chord annotation
- [x] Validation & syntax checking

**Advanced Features:**
- [x] Genre mashup suggestions
- [x] Vocal expression library
- [x] Quality scoring (0-100)
- [x] Conflict detection
- [x] Smart suggestions
- [x] Template library (20+)

**v4.5+ Exclusive:**
- [x] Add Vocals interface
- [x] Add Instrumentals interface
- [x] Inspire from playlist
- [x] Prompt enhancement helper
- [x] 8-minute duration support
- [x] Persona management
- [x] Cover feature
- [x] Remaster option
- [x] Version selector

**Export & Sharing:**
- [x] Copy to clipboard
- [x] Download as .txt
- [x] JSON export
- [x] Batch export
- [x] Shareable links
- [x] QR codes

**User Experience:**
- [x] History tracking
- [x] Favorites/stars
- [x] Search prompts
- [x] Dark/light theme
- [x] Mobile responsive
- [x] Keyboard shortcuts

**Documentation:**
- [x] Getting started guide
- [x] Best practices library
- [x] Troubleshooting guide
- [x] FAQ system
- [x] Video tutorials
- [x] Search functionality

### Nice-to-Have Features 🌟

- [ ] AI-powered prompt suggestions
- [ ] Community sharing
- [ ] Prompt remixing
- [ ] A/B testing tools
- [ ] Analytics dashboard
- [ ] Spotify/Apple Music integration
- [ ] MIDI export
- [ ] Collaboration features
- [ ] Mobile app
- [ ] API access

---

## Quick Reference Cards

### Prompt Formula Card
```
[GENRE], [SUBGENRE], [MOOD], [BPM], [KEY],
[VOCAL STYLE], [INSTRUMENTS], [ATMOSPHERE],
[PRODUCTION QUALITY]
```

### Essential Meta Tags Card
```
Structure: [Intro][Verse][Chorus][Bridge][Outro]
Ending: [Fade out] or [Outro][End]
Instruments: [sax][saxophone][solo]
Vocals: [Female Vocal], [Whispered]
Transitions: [Build-up], [Drop], [Breakdown]
```

### Genre Quick Reference
```
ROCK: 110-140 BPM, Major/Minor keys
METAL: 120-180 BPM, Minor keys preferred  
POP: 100-130 BPM, Major keys common
TRAP: 130-150 BPM, Minor keys, 808s
HOUSE: 120-130 BPM, 4/4 beat essential
JAZZ: 80-180 BPM, Complex harmony
```

### Vocal Styles Quick Reference
```
GENDER: Male, Female, Androgynous
QUALITY: Clean, Harsh, Ethereal, Gritty
DELIVERY: Powerful, Gentle, Aggressive, Whispered
REGION: UK, Southern US, West Coast, NY
EFFECTS: Auto-tune, Vocoder, Reverb, Echo
```

---

## Resources & Links

### Official Suno Resources
- Website: suno.com
- Blog: suno.com/blog
- Documentation: help.suno.com
- Community: Reddit r/SunoAI

### Community Resources
- Suno AI Wiki: sunoaiwiki.com
- Discord communities
- YouTube tutorials
- Twitter/X: @suno_ai_

### Related Tools
- Audacity (free audio editor)
- WavTool (integrated DAW)
- Ultimate Vocal Remover (stem separation)
- TuneCore / DistroKid (distribution)

---

## Glossary

**BPM**: Beats Per Minute, the tempo of a song

**Cover**: Reimagining a song in a different genre/style

**Custom Mode**: Advanced creation mode with separate style and lyrics fields

**Drop**: In electronic music, the climactic section after a build-up

**Genre Mashup**: Combining two or more genres (e.g., "jazz + house")

**Meta Tags**: Structural markers in brackets like [Verse], [Chorus]

**Persona**: Saved vocal characteristics that can be reused

**Prompt**: Text description that guides AI music generation

**ReMi**: Creative lyrics model in v4+ (more artistic than standard)

**Remaster**: Upgrading old tracks to latest version quality

**Stem**: Individual audio track (vocals, drums, bass, etc.)

**Style Prompt**: Genre, mood, and technical specifications

**v4.5+**: Professional tier with Add Vocals/Instrumentals features

**v4.5-all**: Free tier version with most v4.5 features

---

## Version Comparison Table

| Feature | v3.5 | v4 | v4.5 | v4.5+ | v4.5-all |
|---------|------|-----|------|-------|----------|
| Max Duration | 4 min | 4 min | 8 min | 8 min | 8 min |
| Audio Quality | Basic | Good | Excellent | Excellent | Excellent |
| Vocal Quality | Robotic | Better | Natural | Natural | Natural |
| Genres | 100s | 500+ | 1,200+ | 1,200+ | 1,200+ |
| ReMi Lyrics | ❌ | ✅ | ✅ | ✅ | ✅ |
| Personas | ❌ | Basic | Enhanced | Enhanced | Enhanced |
| Covers | ❌ | Basic | Enhanced | Enhanced | Enhanced |
| Add Vocals | ❌ | ❌ | ❌ | ✅ | ❌ |
| Add Instrumentals | ❌ | ❌ | ❌ | ✅ | ❌ |
| Inspire | ❌ | ❌ | ❌ | ✅ | ❌ |
| WavTool DAW | ❌ | ❌ | ❌ | ✅ | ❌ |
| Prompt Helper | ❌ | ❌ | ✅ | ✅ | ✅ |
| Tier | Free | Paid | Paid | Paid | Free |
| Cost | Free | $8-30 | $8-30 | $8-30 | Free |

---

**Last Updated**: December 2024
**Next Update**: When v5 releases
**Suno Version**: v4.5+ (Current Latest)