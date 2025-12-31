# Quality Control Check

Run quality control on Track $ARGUMENTS.

## Instructions

1. Check if prompt exists in `01_prompts/`
2. Check if lyrics exist in `02_lyrics/`
3. Check if description exists in `05_metadata/`
4. Validate all files against ARTIST_STYLE_PROFILE.md
5. Check description is under 1000 characters
6. Verify lyrics have proper section markers
7. Grade the track (A/B/C/F)

## QC Checklist

### Prompt Quality
- [ ] Genre tags present (UK Drill, etc.)
- [ ] BPM specified (140)
- [ ] Mood matches tracklist
- [ ] Portuguese hook mentioned

### Lyrics Quality
- [ ] Section markers present
- [ ] Flow matches 140 BPM
- [ ] Hook is catchy and repetitive
- [ ] Portuguese in chorus
- [ ] London slang in verses

### Description Quality
- [ ] Under 1000 characters
- [ ] Captures vibe
- [ ] Mentions unique sound

## Output Format
```
=== QC REPORT: Track N ===
Grade: [A/B/C/F]
Status: [PASS/FAIL]
Issues: [list]
Recommendations: [list]
```
