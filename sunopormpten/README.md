# SUNO AI Song Construction System Reference Guide

## Introduction

This system provides a standardized format for constructing songs using a tag-based markup language. Think of it as a domain-specific programming language for song structure, where tags act as operators and lyrics serve as data.

### Basic Principles

- Tags define song sections and their characteristics
- Tags follow the format: `[<optional_modifier> <section_type>]`
- Section types include Verse, Chorus, Bridge, etc.
- Instrumental sections can be notated with punctuation patterns

### Core Syntax Rules

- All tags must be enclosed in square brackets `[]`
- Tags must start each new section
- Modifiers are optional but must precede section type
- Line breaks separate sections

## Tag System Reference

### Base Tags

**Primary Section Tags:**
- `[Verse]` - Main story/content sections
- `[Chorus]` - Repeated, memorable sections
- `[Bridge]` - Transitional or contrasting sections
- `[Break]` - Brief instrumental pause
- `[Build]` - Increasing intensity section
- `[Outro]` - Closing section

**Instrumental Tags:**
- `[Instrumental Interlude]`
- `[Melodic Interlude]`
- `[<instrument> Solo]` (e.g., `[Guitar Solo]`)
- `[Build]`

### Modifier Syntax

Modifiers can be applied to any base tag:
```
[<adjective> <base_tag>]
Example: [Gentle Verse], [Epic Chorus]
```

**Valid Modifiers:**
- Intensity: Gentle, Heavy, Epic, Soft
- Character: Dreamy, Ethereal, Psychedelic, Resonant
- Style: Melodic, Soaring, Clean, Distorted
- Dynamic: Building, Fading, Rising, Falling

### Instrumental Notation

Use periods and exclamation marks to indicate rhythmic patterns:
```
. . . ! . .    // Basic rhythm
. ! . . . !    // Syncopated pattern
. . ! . .      // Short pattern
```

## Song Structure Grammar

### Required Components
- At least one `[Verse]`
- Clear section transitions
- Defined ending (either `[Outro]` or final section)

### Optional Components
- Multiple verses with modifiers
- Instrumental sections
- Bridges and breaks
- Build sections
- Multiple movements

### Valid Section Ordering
```
[Intro] (optional)
[<modifier> Verse]
[Break] or [Interlude] (optional)
[<modifier> Verse] or [Chorus]
[Bridge] (optional)
[Build] (optional)
[Outro] (optional)
```

## Style Declaration

Style is declared at the beginning of the song as a space-separated string of descriptors:

```
STYLE: <genre> <tempo> <characteristics> <instruments> <effects>
```

Example:
```
STYLE: stoner space rock shoegaze slow build epic crescendos psychedelic riffing soaring solos pensive interludes
```

### Components can include:
- Genre terms
- Tempo indicators
- Sound characteristics
- Instrumental elements
- Effect descriptions

## Example Implementation

Here's a fully annotated example of a complex multi-movement song:

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

[Fingerstyle Guitar Solo]

[Resonant Verse]
I dissolve into starlight
I am stardust in flight
I dissolve into starlight
I become infinite night

[Build]
. ! . . !
. . ! . !

[Soaring Guitar Solo]

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

This example demonstrates:
- Multiple movements
- Various modifier combinations
- Instrumental notations
- Complex song structure
- Dynamic progression

## Best Practices

1. Use consistent modifier terminology
2. Place instrumental notations on separate lines
3. Maintain clear section transitions
4. Build intensity gradually
5. Use modifiers to indicate dynamic changes
6. Keep style declarations comprehensive but focused
