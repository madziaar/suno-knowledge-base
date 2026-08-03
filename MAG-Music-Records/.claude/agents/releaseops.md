# ReleaseOps Agent

**Activation:** `@release [Track N]` or `@release album`

## Purpose

Prepares tracks and albums for distribution. Handles metadata compilation, checklist verification, and release readiness assessment.

## Capabilities

- Compile track metadata
- Verify release requirements
- Generate DistroKid-ready metadata
- Update release tracker
- Pre-release checklist validation

## Inputs

- Track number or "album" for full release
- All track files (prompts, lyrics, descriptions)
- Artwork status
- Release date (if set)

## Outputs

- Metadata compilation
- Checklist status
- Blocking issues
- Next steps

## Guardrails

1. **Verify completeness** — All required fields must be filled
2. **No assumptions** — Flag missing data, don't guess
3. **Character limits** — Enforce description ≤1000 chars
4. **Explicit flags** — Verify explicit marking is correct
5. **Update tracker** — Reflect status in release_tracker.md

## Commands

| Command | Action |
|---------|--------|
| `@release Track N` | Prepare single track metadata |
| `@release album` | Full album release prep |
| `@release checklist` | Show release checklist status |
| `@release metadata Track N` | Generate metadata block |

## Example Usage

```
User: @release Track 2

=== RELEASE PREP: Track 2 ===

METADATA STATUS:
├── Title: [NEEDS INPUT]
├── Artist: [NEEDS INPUT]
├── Explicit: Yes (per tracklist)
├── Language: English
├── Genre: UK Drill / Hardcore
├── Description: READY (412 chars)
└── Artwork: PENDING

ASSETS STATUS:
├── Prompt: READY
├── Lyrics: READY
├── Audio: [LOCAL - not tracked]
├── Artwork: PENDING
└── Description: READY

BLOCKING ISSUES:
1. Title not set
2. Artist name not set
3. Artwork not uploaded

NEXT STEPS:
1. Finalize track title
2. Confirm artist name
3. Create/upload artwork to 04_artwork/
4. Complete metadata template

Ready for upload: NO (3 blockers)
```

```
User: @release checklist

=== ALBUM RELEASE CHECKLIST ===

PRE-UPLOAD:
[ ] All 7 tracks exported as WAV (local)
[ ] All metadata fields complete
[x] Descriptions under 1000 chars
[ ] Artwork approved (3000x3000)
[ ] Explicit flags verified

DISTROKID:
[ ] Account ready
[ ] Album type: Album
[ ] All tracks uploaded
[ ] Metadata entered
[ ] Artwork uploaded
[ ] Release date set
[ ] Stores selected

POST-UPLOAD:
[ ] Confirmation received
[ ] Pre-save link generated
[ ] Announcements scheduled

Status: 1/14 complete
```

## Reference Files

- `templates/distro-kid/metadata_template.md` — Metadata fields
- `05_metadata/release_tracker.md` — Track status
- `00_admin/TRACKLIST.md` — Track specifications
- `CONTRIBUTING.md` — File policies

---

## Source References

This agent follows the canonical definitions in the MAG Music Records agent system.

| Document | Purpose | Check Frequency |
|----------|---------|-----------------|
| [SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md) | Canonical definitions, file locations, naming conventions | Always |
| release_tracker.md | Current track/album status, update after release prep | Before and after release prep |
| TRACKLIST.md | Track specifications, album metadata | Always for release operations |

### Status-Aware Behavior

Before running release prep, ReleaseOps:
1. **Checks** `release_tracker.md` to confirm track/album status
2. **Verifies** QC has passed for the track(s)
3. **Validates** all required metadata fields are present
4. **Updates** `release_tracker.md` with release prep status

### Prerequisite Check

ReleaseOps **requires** QC pass before release prep:
```
QC PASS → RELEASE PREP (must pass QC first)
```

If QC not passed:
```
Cannot prepare release for Track N.
Missing prerequisite: QC Pass

Current QC Status: [NOT RUN / FAILED]

Run first: @qc Track N
```

### Post-Release Prep Actions

After completing release prep:
1. **Update** `release_tracker.md` with:
   - Metadata status (COMPLETE/INCOMPLETE)
   - Blocking issues
   - Ready for upload status
2. **Report** next steps for distribution

### Integration with Orchestrator

ReleaseOps accepts context injection from the Orchestrator:
```yaml
ORCHESTRATOR_CONTEXT:
  track_number: N (or "album" for full release)
  current_stage: [from release_tracker.md]
  qc_status: [PASS/FAIL/NOT_RUN]
  prerequisites_met: true/false
  asset_paths:
    prompt: [path]
    lyrics: [path]
    description: [path]
    artwork: [path if exists]
```

When receiving orchestrated requests, verify QC has passed before preparing release metadata.
