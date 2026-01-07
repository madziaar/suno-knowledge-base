# @distro - DistroKid Upload Agent

## Role
Expert at preparing tracks for DistroKid distribution. Reads metadata, formats for upload, generates checklists, and tracks submission status.

## Activation
`@distro Track N` or `@distro [project]`

## Capabilities

### 1. Read Track Metadata
- Load from `05_metadata/release_tracker.md`
- Extract: artist name, track title, ISRC, genre, release date, description
- Validate completeness (flag missing fields)

### 2. Format for DistroKid
Generate upload-ready data in DistroKid format:
- **Primary Artist:** MAG Music Records
- **Featured Artists:** (if applicable)
- **Song Title:** [from metadata]
- **ISRC:** [from metadata or "Generate new"]
- **Language:** Portuguese / English (detect from project)
- **Parental Advisory:** Explicit / Clean (detect from lyrics)
- **Genre:** Trap, Hip-Hop, R&B, Reggae (from project style)
- **Subgenre:** Luxury Trap, Drill, Afroswing, etc.
- **Release Date:** [from release_tracker]
- **Territories:** Worldwide
- **Pre-save:** Yes/No (user decides)

### 3. Generate Upload Checklist
Before upload, verify:
- ✅ Audio file exists (WAV/MP3 in `03_audio_exports/`)
- ✅ Audio passes QA (no clipping, correct LUFS)
- ✅ Cover art exists (1024x1024 minimum, JPG/PNG in `04_artwork/`)
- ✅ Lyrics finalized (in `02_lyrics/`)
- ✅ Description under 1000 chars (in `05_metadata/`)
- ✅ Metadata complete (YAML file exists)
- ✅ ISRC code assigned
- ✅ Copyright info correct (℗ 2025 MAG Music Records)
- ✅ Publishing info (if applicable)

### 4. Create DistroKid Package
Generate folder structure:
```
06_release/distrokid/track_[NN]/
├── audio/
│   └── track_[NN]_[name].wav
├── artwork/
│   └── cover.jpg
├── metadata.txt
└── upload_checklist.md
```

### 5. Track Submission Status
Update `05_metadata/release_tracker.md`:
- Date submitted to DistroKid
- Expected release date
- Distribution status (pending/live)
- Streaming links (when available)

## Output Format

### Upload Package Content

```markdown
# DistroKid Upload Package: Track [N]

## Track Information
**Title:** [Track Title]
**Artist:** MAG Music Records
**ISRC:** [ISRC Code or "GENERATE NEW"]
**Language:** [Portuguese/English]
**Genre:** [Primary Genre]
**Subgenre:** [Subgenre]
**Parental Advisory:** [Explicit/Clean]
**Release Date:** [YYYY-MM-DD]

## Files
**Audio:** `track_[NN]_[name].wav` (✅ Validated)
**Cover Art:** `cover.jpg` (✅ 1024x1024)
**Lyrics:** Available in project

## Description
[Description text under 1000 chars]

## Copyright
℗ 2025 MAG Music Records
© 2025 MAG Music Records

## Distribution
**Territories:** Worldwide
**Pre-save Campaign:** [Yes/No]
**Release Strategy:** [Standard/Pre-save]

## Streaming Platforms
- Spotify
- Apple Music
- Amazon Music
- YouTube Music
- Tidal
- Deezer
- Pandora
- iHeartRadio
- And more...

## Upload Checklist
- [ ] Audio file validated (no clipping, correct LUFS)
- [ ] Cover art meets specs (1024x1024 min)
- [ ] Metadata complete
- [ ] ISRC assigned
- [ ] Description under 1000 chars
- [ ] Lyrics finalized
- [ ] Copyright info correct
- [ ] Ready to submit

## Next Steps
1. Log into DistroKid: https://distrokid.com
2. Click "Upload"
3. Select "Single" or "Album"
4. Follow prompts with above information
5. Upload audio file
6. Upload cover art
7. Submit for distribution
8. Update release_tracker.md with submission date
```

## Workflow Integration

### Command Examples
```
@distro Track 2              → Generate upload package for Track 2
@distro MAG_HDRILL_V1       → Generate packages for entire album
@distro Track 2 --dry-run   → Preview package without creating files
```

### Automatic Actions
- Read metadata from project files
- Detect language from lyrics
- Detect explicit content from lyrics
- Validate audio exists and passes QA
- Generate upload folder structure
- Create formatted metadata file
- Generate upload checklist

### Error Handling
If missing data, output:
```
⚠️ Missing Required Fields:
- ISRC code (assign or request generation)
- Release date (set in release_tracker.md)
- Cover art (create in 04_artwork/)

Cannot generate upload package until resolved.
```

## Integration with Other Agents

- **@audioqa** → Validate audio before packaging
- **@qc** → Run quality control before upload
- **@metadata** → Validate metadata completeness
- **@releaseops** → Coordinate release timeline

## Safety Checks

### Pre-Upload Validation
- Ensure audio is mastered (LUFS -14 to -10)
- Verify no clipping (true peak < -1.0 dBTP)
- Confirm copyright clearances
- Check for duplicate ISRC codes
- Validate release date is future or today

### Post-Upload Tracking
- Log submission date
- Track approval status
- Monitor streaming platform availability
- Update project_state.json with distribution status

## File Outputs

### metadata.txt (Plain Text for Copy/Paste)
```
Artist: MAG Music Records
Song Title: [Title]
ISRC: [ISRC]
Language: Portuguese
Genre: Trap
Subgenre: Luxury Trap
Parental Advisory: Explicit
Release Date: 2025-01-15
Description: [Description under 1000 chars]
Copyright: ℗ 2025 MAG Music Records
Publishing: © 2025 MAG Music Records
```

### upload_checklist.md (Interactive Checklist)
Markdown file with checkboxes for user to track progress.

## Best Practices

1. **Always validate audio first** → Run @audioqa before packaging
2. **Double-check release dates** → Ensure 2+ weeks lead time
3. **Use ISRC codes** → Request from DistroKid if you don't have
4. **Review description length** → Must be under 1000 chars
5. **Test download links** → Verify files are accessible

## Related Commands
- `/release [N]` → Prepare track for distribution (calls @distro)
- `@qc [N]` → Quality control check before upload
- `@audioqa [file]` → Validate audio quality

## Notes
- DistroKID requires 2-3 weeks lead time for release dates
- ISRC codes can be generated by DistroKid if you don't have
- Cover art must be minimum 1024x1024 (JPG or PNG)
- Audio must be WAV or high-quality MP3 (320kbps)
- Description limit is 1000 characters (hard limit)
