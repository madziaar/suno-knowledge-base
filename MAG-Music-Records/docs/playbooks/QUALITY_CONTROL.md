# Quality Control Playbook

Kill list checklist and pass/fail criteria for track approval.

## QC Command

```
@qc Track [N]
```

## Kill List Checklist

### Audio Quality
- [ ] No clipping/distortion
- [ ] Bass sits properly in mix
- [ ] Vocals are clear and audible
- [ ] No unwanted artifacts or glitches
- [ ] Consistent volume throughout

### Lyrics Quality
- [ ] All words are intelligible
- [ ] No awkward AI mispronunciations
- [ ] Flow matches beat
- [ ] Hook is memorable and repeatable
- [ ] No unintended offensive content (unless explicit track)

### Prompt Accuracy
- [ ] Generated audio matches intended genre
- [ ] BPM is correct (±5 tolerance)
- [ ] Mood/energy matches track concept
- [ ] Instrumentation is appropriate

### Structure
- [ ] Intro is appropriate length (4-8 bars)
- [ ] Verses are complete (16-32 bars)
- [ ] Chorus hits hard and is distinct
- [ ] Outro doesn't cut off abruptly
- [ ] Total length: 2:30-4:00

### Club Readiness (if applicable)
- [ ] Bass drops hit at expected points
- [ ] Energy builds appropriately
- [ ] Hook is strip-club-friendly length
- [ ] No dead spots that kill momentum

## Pass/Fail Criteria

### PASS Requirements
- All audio quality checks pass
- At least 80% of other checks pass
- No critical failures

### FAIL Triggers (Instant)
- Clipping or distortion
- Wrong genre/BPM
- Unintelligible vocals
- Track cuts off early
- Unintended content issues

## Grading Scale

| Grade | Criteria | Action |
|-------|----------|--------|
| A | All checks pass | Ready for release |
| B | Minor issues | Polish and re-export |
| C | Multiple issues | Regenerate in Suno |
| F | Critical failure | Full restart |

## QC Report Template

```
TRACK: [Track Name]
DATE: [YYYY-MM-DD]
VERSION: [v1/v2/final]

AUDIO: [PASS/FAIL]
LYRICS: [PASS/FAIL]
STRUCTURE: [PASS/FAIL]
CLUB: [PASS/FAIL/N/A]

GRADE: [A/B/C/F]

NOTES:
- [Issue 1]
- [Issue 2]

DECISION: [APPROVED/REVISE/REJECT]
```

## Common Issues & Fixes

### "Muddy Bass"
- Regenerate with "clean 808" in prompt
- Add "sub bass, punchy kick" tags

### "Weak Hook"
- Simplify chorus lyrics
- Add repetition markers in lyrics

### "Wrong Energy"
- Adjust mood tags in prompt
- Specify energy curve: "builds to drop"

### "AI Voice Artifacts"
- Try different voice style
- Simplify complex word sequences

## Review Cadence

1. **First Pass:** Immediate listen after generation
2. **Second Pass:** 1 hour later, fresh ears
3. **Final Pass:** Next day before approval

## Sign-Off

Track approved for release requires:
- [ ] Self QC complete
- [ ] Grade B or higher
- [ ] All critical checks pass
- [ ] Sign-off recorded in `release_tracker.md`
