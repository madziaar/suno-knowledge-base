# Generate Track Description

**Command:** `/desc [TRACK_NUMBER]`
**Example:** `/desc 2`

---

## Purpose

Generate ONLY the track description for streaming platforms. WANDA mode - max 1000 characters, no preamble.

---

## Workflow

### Step 1: Load Context
```
1. Identify active project
2. Read track lyrics from 02_lyrics/
3. Read TRACKLIST.md for track concept
4. Read project info for album context
```

### Step 2: Generate Description
```
Requirements:
- MAX 1000 characters (HARD LIMIT)
- No hashtags
- No emojis (unless requested)
- Professional tone
- Describe track's vibe and message
- Mention album name
```

### Step 3: Output (WANDA Mode)
```
Output ONLY the description text.
NO "Here's the description..."
NO character count in output
NO explanation
JUST the raw description
```

### Step 4: Save File
```
Save to: 05_metadata/track_[NN]_[shortname]_description.txt
Update project_state.json if exists
```

---

## Description Template

```
"[Track Title]" [brief vibe in 3-5 words].

[1-2 sentences about the track's message/story/theme]

[1 sentence about the sound/production style]

From [Album Name] by MAG Music Records.
```

---

## Example Descriptions

### Boss Anthem (Track 2)
```
"Patrão do Bairro" is a powerful declaration of arrival. This luxury trap anthem combines cinematic orchestration with thundering 808s, delivering a commanding message about rising from nothing to claim your throne. Deep vocals and dramatic brass create an atmosphere of triumph and authority.

From MAG Hood Boss Vol. 1 by MAG Music Records.
```
*Characters: 387*

### Emotional Track (Track 6)
```
"Se Soubessem" reveals the hidden struggles behind success. This soulful trap ballad features piano-driven production and vulnerable storytelling, exposing the scars and sacrifices that shaped the boss. A rare glimpse behind the armor, where strength meets humanity.

From MAG Hood Boss Vol. 1 by MAG Music Records.
```
*Characters: 352*

### Hard Banger (Track 5)
```
"Graves Profundos" hits with seismic force. Built on speaker-destroying 808s and minimal orchestration, this track is pure sonic dominance. Every bass drop is a statement, every bar a declaration of power. Turn it up and feel the presence.

From MAG Hood Boss Vol. 1 by MAG Music Records.
```
*Characters: 312*

### Spiritual Closer (Track 12)
```
"Enxofre" is a testament to survival. The album's contemplative closer blends gospel-influenced production with grateful reflection, acknowledging the fire walked through to reach this moment. Heavy yet hopeful, it closes the chapter with earned wisdom.

From MAG Hood Boss Vol. 1 by MAG Music Records.
```
*Characters: 328*

---

## Character Guidelines

| Length | Characters | Use Case |
|--------|------------|----------|
| Short | 250-400 | Quick, punchy |
| Medium | 400-600 | Standard |
| Full | 600-900 | Detailed |
| Maximum | 1000 | Never exceed |

---

## Platform Requirements

| Platform | Limit | Notes |
|----------|-------|-------|
| DistroKid | 1000 | Hard limit |
| Spotify | 1000 | Displays ~300 initially |
| Apple Music | 4000 | But keep concise |
| YouTube Music | 5000 | But keep concise |

**Always target 1000 max for universal compatibility**

---

## Quality Checklist

- [ ] Under 1000 characters
- [ ] No hashtags (unless requested)
- [ ] No emojis (unless requested)
- [ ] Professional tone
- [ ] Describes track vibe accurately
- [ ] Mentions album name
- [ ] Copy-paste ready for DistroKid
- [ ] No typos or errors
