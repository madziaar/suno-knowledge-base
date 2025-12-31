# Full Track Workflow

Run the complete workflow for Track $ARGUMENTS.

## Workflow Sequence

Execute these steps in order:

### Step 1: Generate Prompt
- Create Suno prompt based on TRACKLIST.md and ARTIST_STYLE_PROFILE.md
- Save to `01_prompts/track_[NN]_prompt.txt`
- Confirm with user before proceeding

### Step 2: Generate Lyrics
- Create lyrics matching the prompt
- Include Portuguese chorus, English verses
- Save to `02_lyrics/track_[NN]_lyrics.txt`
- Confirm with user before proceeding

### Step 3: Suno Generation
- Open Suno in Chrome
- Display prompt and lyrics ready to paste
- Guide user through Suno interface
- Wait for user to generate and save audio

### Step 4: Generate Description
- Create track description (max 1000 chars)
- Save to `05_metadata/track_[NN]_description.txt`

### Step 5: Quality Control
- Run QC check on all assets
- Report grade and any issues

### Step 6: Update Status
- Update TODO.md
- Update release_tracker.md
- Commit changes to Git

## Notes
- Pause for user confirmation between major steps
- If any step fails, stop and report the issue
- Keep all outputs in WANDA mode (raw content)
