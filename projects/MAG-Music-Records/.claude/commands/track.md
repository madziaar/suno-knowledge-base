# Full Track Workflow

**Command:** `/track [TRACK_NUMBER]`
**Example:** `/track 2`

---

## Purpose

Generate complete track package: prompt + lyrics + description in one workflow.

---

## Workflow

### Step 1: Identify Project
```
1. Check current working directory for active project
2. Or ask user which project (MAG_Hood_Boss_Vol_1, MAG_Hood_Boss_UK_Vol_1, etc.)
3. Load project_state.json if exists, or create new
```

### Step 2: Load Track Info
```
1. Read TRACKLIST.md for track $ARGUMENTS details:
   - Title, BPM, mood, energy, hook concept
2. Read MASTER_STYLE_GUIDE.md for sound foundation
3. Read variation spec if applicable (e.g., UK_ENGLISH.md)
4. Read ARTIST_STYLE_PROFILE.md for vocal style
```

### Step 3: Generate Prompt (WANDA Mode)
```
Output ONLY the Suno prompt - no preamble, no explanation.
Save to: 01_prompts/track_[NN]_[shortname]_prompt.txt
```

### Step 4: Generate Lyrics (WANDA Mode)
```
Output ONLY the lyrics with section markers - no preamble.
Include: [Intro], [Verse], [Hook], [Bridge], [Outro]
Include: Ad-libs (UGH!, MAG)
Save to: 02_lyrics/track_[NN]_[shortname]_lyrics.txt
```

### Step 5: Generate Description (WANDA Mode)
```
Output ONLY the description - max 1000 characters.
For DistroKid/streaming platforms.
Save to: 05_metadata/track_[NN]_[shortname]_description.txt
```

### Step 6: Update State
```
Update project_state.json:
- Mark prompt: complete
- Mark lyrics: complete
- Mark description: complete
- Update timestamp
```

### Step 7: Report
```
=== TRACK $ARGUMENTS COMPLETE ===
Title: [Track Title]
Files Created:
  ✓ 01_prompts/track_[NN]_[name]_prompt.txt
  ✓ 02_lyrics/track_[NN]_[name]_lyrics.txt
  ✓ 05_metadata/track_[NN]_[name]_description.txt

Next: /suno to generate in Suno, or /track [N+1] for next track
```

---

## WANDA Mode Rules

1. **No preamble** - Skip "Here's the..." or "I've created..."
2. **No explanation** - No commentary before/after content
3. **Copy-paste ready** - Output pastes directly into Suno
4. **Save files** - Write to correct locations automatically

---

## File Naming Convention

```
track_[NN]_[short_name]_[type].txt

Examples:
- track_02_hood_boss_prompt.txt
- track_02_hood_boss_lyrics.txt
- track_02_hood_boss_description.txt
```

---

## References

| Document | Path |
|----------|------|
| Track Details | `00_admin/TRACKLIST.md` |
| Style Guide | `docs/MASTER_STYLE_GUIDE.md` |
| Variation | `docs/ALBUM_FACTORY/VARIATIONS/[ID].md` |
| Artist Profile | `ARTIST_STYLE_PROFILE.md` |
| Project State | `project_state.json` |
