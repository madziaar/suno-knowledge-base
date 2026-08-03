# Workflow: MAG Hardcore Drill Vol. 1

Complete production workflow from concept to release.

## Phase 1: Pre-Production

### 1.1 Tracklist Finalization
- [ ] Review `00_admin/TRACKLIST.md`
- [ ] Confirm 7 tracks with language assignments
- [ ] Identify Track 2 as lead single
- [ ] Assign voice types and club tags

### 1.2 Template Setup
- [ ] Verify templates exist in `templates/`
- [ ] Customize genre tags for hardcore drill

## Phase 2: Track Production (Per Track)

### 2.1 Prompt Generation
```
WANDA: Prompt Track [N]
```
- Save to: `01_prompts/track_[NN]_[name]_prompt.txt`
- Review for genre accuracy, BPM, mood tags

### 2.2 Lyrics Writing
```
WANDA: Lyrics Track [N]
```
- Save to: `02_lyrics/track_[NN]_[name]_lyrics.txt`
- Verify section markers: [Intro], [Verse], [Chorus], [Bridge], [Outro]
- Check language mix matches tracklist

### 2.3 Suno Generation
1. Open Suno
2. Paste prompt from `01_prompts/`
3. Paste lyrics from `02_lyrics/`
4. Generate 2-4 variations
5. Select best take

### 2.4 Audio Export
- Export to: `03_audio_exports/track_[NN]_[name]_v[N].mp3`
- Final version: `track_[NN]_[name]_final.wav`
- **DO NOT commit audio files**

### 2.5 Quality Control
```
@qc Track [N]
```
- Run kill list checklist
- Verify against `QUALITY_CONTROL.md`
- Pass/fail decision

### 2.6 Description
```
WANDA: Description Track [N]
```
- Save to: `05_metadata/track_[NN]_[name]_description.txt`
- Verify ≤1000 characters

## Phase 3: Artwork

### 3.1 Cover Art
- [ ] Create/commission 3000x3000 artwork
- [ ] Save to `04_artwork/cover_main.png`
- [ ] Create variants if needed

### 3.2 Social Assets
- [ ] Square format for Instagram
- [ ] Banner for YouTube
- [ ] Story format for TikTok

## Phase 4: Metadata Prep

### 4.1 Per-Track Metadata
For each track, complete in `05_metadata/`:
- Title (exact)
- Contributing artists
- Explicit flag (Y/N)
- Language(s)
- Genre tags

### 4.2 Release Metadata
- Album title: MAG Hardcore Drill Vol. 1
- Primary artist: [Your artist name]
- Release date: [TBD]
- Copyright: [Year] [Entity]
- UPC: [From distributor]

## Phase 5: Distribution

### 5.1 DistroKid Upload
- [ ] Upload audio files
- [ ] Enter metadata from templates
- [ ] Upload artwork
- [ ] Set release date
- [ ] Select stores

### 5.2 Pre-Save Campaign
- [ ] Generate pre-save link
- [ ] Create social posts
- [ ] Schedule announcements

## Phase 6: Release

### 6.1 Release Day
- [ ] Verify live on all platforms
- [ ] Post announcements
- [ ] Update `release_tracker.md` status to LIVE

### 6.2 Post-Release
- [ ] Monitor streams
- [ ] Collect feedback
- [ ] Plan promotion

## Track Order

| # | Track | Status |
|---|-------|--------|
| 1 | Intro | Pending |
| 2 | **Lead Single** | **START HERE** |
| 3 | Track 3 | Pending |
| 4 | Track 4 | Pending |
| 5 | Track 5 | Pending |
| 6 | Track 6 | Pending |
| 7 | Outro | Pending |

## Completion Checklist

- [ ] All 7 prompts finalized
- [ ] All 7 lyrics finalized
- [ ] All 7 audio exports approved
- [ ] All 7 descriptions written
- [ ] Cover artwork approved
- [ ] All metadata complete
- [ ] DistroKid upload complete
- [ ] Release live on platforms
