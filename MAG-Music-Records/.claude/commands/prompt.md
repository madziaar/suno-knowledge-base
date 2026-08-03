# Generate Suno Prompt

**Command:** `/prompt [TRACK_NUMBER]`
**Example:** `/prompt 2`

---

## Purpose

Generate ONLY the Suno AI prompt for a track. WANDA mode - no preamble, no explanation, just the prompt.

---

## Workflow

### Step 1: Identify Project
```
1. Detect current project from working directory
2. Or use most recent active project
3. Load project variation (EUROPEAN_PT, UK_ENGLISH, etc.)
```

### Step 2: Load Track Info
```
1. Read TRACKLIST.md for track $ARGUMENTS:
   - Title, BPM, mood, energy
2. Read docs/MASTER_STYLE_GUIDE.md for production elements
3. Read variation spec if project uses one
```

### Step 3: Generate Prompt
```
Build prompt using template:
[Language] Luxury Trap, Cinematic Hip-Hop, [BPM] BPM, [Instruments], [Vocal Style], [Mood], [Special Elements], Professional Mix
```

### Step 4: Output (WANDA Mode)
```
Output ONLY the prompt text.
NO "Here's the prompt..."
NO explanation
NO markdown code blocks
JUST the raw prompt text
```

### Step 5: Save File
```
Save to: 01_prompts/track_[NN]_[shortname]_prompt.txt
Update project_state.json if exists
```

---

## Prompt Template (Rick Ross Luxury Trap Style)

```
[Language] Luxury Trap, Cinematic Hip-Hop, [BPM] BPM, Grand Orchestral Strings, Brass Fanfare, Deep Commanding Male Vocals, Heavy 808 Bass, [Mood/Energy], [Track-Specific Elements], "UGH" Ad-libs, Professional Mix
```

---

## Examples by Track Type

**Intro Track (85-90 BPM):**
```
Portuguese Luxury Trap, Cinematic Hip-Hop, 85-90 BPM, Grand Orchestral Strings, Brass Fanfare, Deep Commanding Male Vocals, Heavy 808 Bass, Epic Introduction, Boss Arrival Energy, Dramatic Buildup, "UGH" Ad-libs, Professional Mix
```

**Boss Anthem (88-92 BPM):**
```
Portuguese Luxury Trap, Cinematic Hip-Hop, 88-92 BPM, Grand Orchestral Strings, Brass Fanfare, Deep Commanding Male Vocals, Heavy 808 Bass, Triumphant Boss Energy, Anthemic Hook, "UGH" Ad-libs, Professional Mix
```

**Emotional/Reflective (78-82 BPM):**
```
Portuguese Luxury Trap, Soulful Hip-Hop, 78-82 BPM, Piano-Driven Beat, Lush Atmospheric Pads, Deep Commanding Male Vocals, Potential Female Hook, Emotional Storytelling, Vulnerable But Powerful, Professional Mix
```

**Hard Banger (90-94 BPM):**
```
Portuguese Luxury Trap, Heavy Bass Music, 90-94 BPM, DEEP 808 Sub Bass, Minimal Orchestration, Deep Commanding Male Vocals, Speaker-Knocking Production, Aggressive Energy, "UGH" Ad-libs, Professional Mix
```

**Spiritual Closer (74-78 BPM):**
```
Portuguese Luxury Trap, Gospel Fusion, 74-78 BPM, Choir Samples, Piano, Orchestral Strings, Deep Commanding Male Vocals, Contemplative Energy, Grateful Testimony, Spiritual Reflection, Professional Mix
```

---

## BPM Reference (NEVER EXCEED 96)

| Track Type | BPM Range |
|------------|-----------|
| Slow/Reflective | 74-82 |
| Standard | 83-90 |
| Energetic | 91-96 |

---

## Quality Checklist

- [ ] BPM within range (74-96, NEVER faster)
- [ ] Deep commanding vocals specified
- [ ] Heavy 808s included
- [ ] Orchestral/cinematic elements present
- [ ] Language specified correctly
- [ ] Mood matches track concept
- [ ] "UGH" ad-libs mentioned

---

## References

| Document | Path |
|----------|------|
| Master Style | `docs/MASTER_STYLE_GUIDE.md` |
| Track Details | `00_admin/TRACKLIST.md` |
| Variation | `docs/ALBUM_FACTORY/VARIATIONS/[ID].md` |
