# Album Template

**Copy this entire folder structure when creating a new album.**

## Usage

1. Copy `ALBUM_TEMPLATE/` to `projects/mixtapes/MAG_[Album_Name]_Vol_N/`
2. Rename placeholder files
3. Fill in track-specific content
4. Update metadata

## Folder Structure

```
MAG_[Album_Name]_Vol_N/
├── 00_admin/           # Planning and tracklist
├── 01_prompts/         # Suno AI prompts
├── 02_lyrics/          # Song lyrics
├── 03_audio_exports/   # Generated audio (NOT committed)
├── 04_artwork/         # Cover art and visuals
├── 05_metadata/        # Release tracking
├── 06_release/         # Final release packages
├── 07_archive/         # Old versions
└── 08_decisions/       # Decision log
```

## Files to Create

For each track, create:
- `01_prompts/track_NN_[name]_prompt.txt`
- `02_lyrics/track_NN_[name]_lyrics.txt`

## Naming Convention

```
track_[NN]_[short_name]_[type].txt
```

Examples:
- `track_01_intro_prompt.txt`
- `track_01_intro_lyrics.txt`
- `track_02_hood_boss_prompt.txt`
- `track_02_hood_boss_lyrics.txt`
