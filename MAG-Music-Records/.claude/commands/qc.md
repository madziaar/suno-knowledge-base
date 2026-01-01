# Quality Control Check

**Command:** `/qc [TRACK_NUMBER]` or `/qc all`
**Example:** `/qc 2` or `/qc all`

---

## Purpose

Run comprehensive quality control on track(s) against MAG Music Records standards.

---

## Workflow

### Step 1: Load Track Assets
```
1. Read prompt from 01_prompts/
2. Read lyrics from 02_lyrics/
3. Read description from 05_metadata/
4. Load MASTER_STYLE_GUIDE.md for standards
5. Load variation spec if applicable
```

### Step 2: Run Checks
```
For each asset, verify against quality standards
Score each category
Calculate overall grade
```

### Step 3: Output Report
```
Display formatted QC report with:
- Overall grade (A/B/C/F)
- Pass/Fail status
- Category scores
- Issues found
- Recommendations
```

---

## QC Checklist

### Prompt Quality (25 points)

| Check | Points | Criteria |
|-------|--------|----------|
| BPM Range | 5 | Within 74-96 BPM |
| Vocal Style | 5 | Deep commanding specified |
| 808s | 5 | Heavy bass mentioned |
| Orchestration | 5 | Strings/brass/piano present |
| Language | 5 | Correct language specified |

### Lyrics Quality (40 points)

| Check | Points | Criteria |
|-------|--------|----------|
| Section Markers | 5 | Proper [Intro], [Verse], etc. |
| Structure | 5 | Complete song structure |
| Ad-libs | 5 | UGH!, MAG included |
| Hook Quality | 10 | Memorable, repeatable |
| Theme Alignment | 5 | Matches track concept |
| Language/Slang | 5 | Correct for variation |
| Flow | 5 | Measured, not rushed |

### Description Quality (20 points)

| Check | Points | Criteria |
|-------|--------|----------|
| Character Count | 5 | Under 1000 chars |
| Album Mention | 5 | Album name included |
| Vibe Capture | 5 | Accurately describes track |
| Professional | 5 | No errors, clean |

### Consistency (15 points)

| Check | Points | Criteria |
|-------|--------|----------|
| Prompt-Lyrics Match | 5 | Mood/energy aligned |
| Lyrics-Desc Match | 5 | Description reflects lyrics |
| Style Guide Compliance | 5 | Follows master standards |

---

## Grading Scale

| Grade | Score | Status | Action |
|-------|-------|--------|--------|
| A | 90-100 | PASS | Ready for Suno |
| B | 80-89 | PASS | Minor improvements optional |
| C | 70-79 | CONDITIONAL | Fix issues before generating |
| F | Below 70 | FAIL | Major revision required |

---

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║                    QC REPORT: Track 2                            ║
║                    "Patrão do Bairro"                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  OVERALL GRADE: A (94/100)                                       ║
║  STATUS: ✓ PASS                                                  ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  CATEGORY SCORES                                                  ║
║  ─────────────────────────────────────────────────────────────── ║
║  Prompt Quality:      24/25  ████████████████████████░           ║
║  Lyrics Quality:      38/40  ███████████████████████████████████░║
║  Description Quality: 18/20  ██████████████████████████████████░ ║
║  Consistency:         14/15  █████████████████████████████████░  ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  ISSUES FOUND                                                     ║
║  • Minor: BPM range could be more specific (88-92 vs 85-95)     ║
║  • Minor: Hook could use one more repetition                     ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  RECOMMENDATIONS                                                  ║
║  • Consider tightening BPM to 88-92 for boss anthem energy      ║
║  • Add hook repeat at bridge section                             ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  VERDICT: Ready for Suno generation                              ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Batch QC (`/qc all`)

```
╔══════════════════════════════════════════════════════════════════╗
║                    QC REPORT: All Tracks                         ║
║                    MAG Hood Boss Vol. 1                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  #  │ Title              │ Grade │ Status │ Issues               ║
║  ───┼────────────────────┼───────┼────────┼───────────────────── ║
║  1  │ Abertura           │  A    │  PASS  │ None                 ║
║  2  │ Patrão do Bairro   │  A    │  PASS  │ Minor (1)            ║
║  3  │ Ouro dos Anos 80   │  B    │  PASS  │ Minor (2)            ║
║  4  │ Amor de Rua        │  A    │  PASS  │ None                 ║
║  ...                                                              ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  SUMMARY                                                          ║
║  • Passed: 12/12                                                 ║
║  • Average Grade: A (91.5)                                       ║
║  • Total Issues: 5 minor, 0 major                                ║
║                                                                   ║
║  VERDICT: Album ready for Suno generation                        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Critical Failures (Auto-Fail)

These issues automatically fail QC:

- [ ] BPM over 100 (too fast for Rick Ross style)
- [ ] Missing section markers in lyrics
- [ ] Description over 1000 characters
- [ ] Wrong language for variation
- [ ] No hook/chorus present
- [ ] Aggressive/shouting vocal style specified
