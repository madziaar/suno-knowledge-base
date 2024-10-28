# AI Song Construction System: Complete Reference

## Overview
This document defines the syntax, rules, and patterns for constructing songs using a tag-based markup system. This reference is designed to help AI assistants guide humans in creating structured song compositions.

## Basic Syntax

### Core Rules
- All section tags must be enclosed in square brackets `[]`
- Tags must start each new section
- Line breaks separate sections
- Language is auto-detected, no special language tags needed

### Tag Format
```
[<optional_modifier> <section_type>]
```

Example:
```
[Gentle Verse]
[Heavy Chorus]
[Psychedelic Bridge]
```

## Valid Tags

### Primary Section Tags
- `[Verse]`
- `[Chorus]`
- `[Bridge]`
- `[Pre-Chorus]`
- `[Break]`
- `[Build]`
- `[Outro]`
- `[Intro]`

### Instrumental Section Tags
- `[Instrumental Interlude]`
- `[Melodic Interlude]`
- `[<instrument> Solo]` - e.g., `[Guitar Solo]`, `[Bass Solo]`
- `[Percussion Break]`
- `[Syncopated Bass]`
- `[Build]`
- `[Bass Drop]` (EDM-specific)

### Voice Control Tags
- `[Female Narrator]`
- `[Diva Solo]`
- `[Gospel Choir]`
- `[Primal Scream]`
- `[Rap Verse]`

### Ending Tags
- `[Outro]`
- `[End]`
- `[Fade Out]`
- `[Fade to End]`
- `[Big Finish]`
- `[Refrain]`

## Valid Modifiers

### Intensity Modifiers
- Gentle
- Heavy
- Epic
- Soft

### Character Modifiers
- Dreamy
- Ethereal
- Psychedelic
- Resonant

### Style Modifiers
- Melodic
- Soaring
- Clean
- Distorted

### Dynamic Modifiers
- Building
- Fading
- Rising
- Falling

### Emotional Modifiers
- Shout
- Whimsical
- Melancholy

## Voice Styles
Can be used in style declaration or as modifiers:
- Gregorian chant
- Melismatic
- Narration
- Spoken Word
- Sprechgesang
- Emotional
- Sultry
- Resonant
- Ethereal
- Lounge Singer
- Vocaloid

## Instrumental Notation

### Basic Patterns
Use periods and exclamation marks for rhythmic patterns:
```
. . . ! . .    // Basic rhythm
. ! . . . !    // Syncopated pattern
. . ! . .      // Short pattern
!! ... ! ! !   // Complex rhythm
```

### Onomatopoeia Patterns
Can be used to suggest specific instruments:
```
[chugging guitar]
chuka-chuka-chuka-chuka

[sad trombone]
waah-Waaah-WAAH
```

## Song Structure Rules

### Required Elements
- At least one `[Verse]` or `[Chorus]`
- Clear section transitions
- Defined ending

### Optional Elements
- Multiple verses with modifiers
- Instrumental sections
- Bridges and breaks
- Build sections
- Multiple movements

### Valid Section Ordering
```
[Intro] (optional)
[<modifier> Verse]
[Pre-Chorus] (optional)
[<modifier> Chorus]
[Bridge] (optional)
[Build] (optional)
[Outro] (optional)
```

## Style Declaration

### Format
```
STYLE: <genre> <tempo> <characteristics> <instruments> <effects>
```

### Example
```
STYLE: stoner space rock shoegaze slow build epic crescendos psychedelic riffing soaring solos pensive interludes
```

## Version-Specific Behaviors

### v3.5 Specifics
- May ignore standard end prompts
- Use `[ending]` tag
- Can create false endings

### v3 Specifics
For reliable endings:
1. Clear style prompt
2. Add "end, short" to style
3. Use simple `[end]` tag

## Common Patterns

### Basic Verse/Chorus Pattern
```
[Verse]
First verse content
[Chorus]
Memorable hook
[Verse 2]
Second verse content
[Chorus]
Repeat hook
```

### Progressive Build Pattern
```
[Gentle Verse]
Opening content
[Build]
. . . ! . .
[Heavy Verse]
Intensified content
[Epic Chorus]
Climactic hook
```

### Multi-Movement Structure
```
[Clean Intro]
[Melodic Verse]
[Build]
[Heavy Bridge]
[Psychedelic Interlude]
[Final Crescendo]
[Fading Outro]
```

## Example Implementations

### Example 1: Simple Repeating Structure
```
[Verse]
Gravity's lost hold again
Floating in the endless dark
Stars blinking out one by one
Silent whispers in the void

[Chorus]
Spiral through the cosmic haze
Feel the universe embrace
Echoes from the edge of time
Lost in space without a trace
```

### Example 2: Complex Multi-Movement Song
```
STYLE: stoner space rock shoegaze slow build epic crescendos psychedelic riffing soaring solos pensive interludes

[Long Instrumental Intro]
. . . ! . .

[Gentle Verse]
Watching stars unfold
In ancient patterns told
Through endless time they glow
Above, below

[Melodic Interlude]
. . . . !

[Dreamy Verse]
Stars are falling through my mind
Stars are calling through time
Stars are falling through my mind
Into cosmic design

[Break]
. . . . !
. . ! . .

[Heavy Verse]
I dissolve into starlight
I dissolve into starlight
Through the void I will fly
Through the void I will fly

[Psychedelic Interlude]
. ! . . . !

[Ethereal Bridge]
Constellations flow through me
Constellations set me free
I am stardust, I am light
I am stardust in the night

[Build]
. ! . . !
. . ! . !

[Epic Chorus]
Stars are falling through my mind
I dissolve into starlight
Stars are calling through time
I become infinite light

[Fading Outro]
Into cosmic design...
Into cosmic design...
Into cosmic design...
```

## Best Practices

1. Maintain consistent modifier usage throughout song
2. Place instrumental notations on separate lines
3. Use clear section transitions
4. Build intensity gradually with appropriate modifiers
5. Label pre-chorus sections explicitly
6. Consider version-specific ending strategies
7. Match voice tags to genre expectations
8. Test instrumental notations in context
9. Keep style declarations focused
10. Use emotional modifiers to guide vocal delivery

## Common Issues and Solutions

### Endless Loops
- Add explicit end tags
- Use version-specific ending strategies
- Consider "end, short" in style

### Meter Issues
- Label pre-chorus sections explicitly
- Maintain consistent syllable counts within sections
- Use appropriate tags for intentional metric changes

### Voice Control
- Match voice tags to genre
- Use consistent modifiers throughout
- Consider language/accent implications

### Section Transitions
- Use builds and breaks strategically
- Maintain logical progression
- Label all sections clearly
