# Add Creative Idea

**Command:** `/idea [DESCRIPTION]`
**Example:** `/idea track about loyalty to the crew` or `/idea`

---

## Purpose

Quickly capture creative ideas for future tracks, production notes, or workflow improvements.

---

## Workflow

### With Argument (`/idea [description]`)
```
1. Parse the idea description
2. Categorize automatically (track, production, marketing, etc.)
3. Add to IDEAS.md with timestamp
4. Confirm saved
```

### Without Argument (`/idea`)
```
1. Ask what type of idea
2. Prompt for description
3. Add to IDEAS.md with timestamp
4. Confirm saved
```

---

## Idea Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Track Concepts** | New song ideas, themes | "track about betrayal" |
| **Production Notes** | Sound design, mixing | "try choir sample on hooks" |
| **Lyrics Ideas** | Hooks, verses, phrases | "hook: ainda aqui, sempre forte" |
| **Marketing** | Promotion, campaigns | "TikTok challenge for Track 2" |
| **Workflow** | Process improvements | "batch generate all prompts first" |
| **Reference** | Songs to study | "check out Giggs - Landlord" |
| **Parking Lot** | Quick thoughts for later | "collab with UK artist?" |

---

## Auto-Categorization

The system will auto-categorize based on keywords:

| Keywords | Category |
|----------|----------|
| track, song, concept, about | Track Concepts |
| sound, mix, bass, drum, sample | Production Notes |
| hook, verse, line, lyrics, phrase | Lyrics Ideas |
| promo, social, release, campaign | Marketing |
| workflow, automate, faster, process | Workflow |
| check, listen, study, reference | Reference |
| maybe, later, think about, consider | Parking Lot |

---

## Ideas File Format

### Location
```
projects/mixtapes/[ACTIVE_PROJECT]/IDEAS.md
```

Or global:
```
IDEAS.md (root)
```

### Format
```markdown
# Creative Ideas

## Track Concepts
- **2026-01-01**: Track about crew loyalty - "blood ties never break"
- **2026-01-01**: Intro with orchestral build, spoken word over it

## Production Notes
- **2026-01-01**: Try adding choir samples to Track 12 (Enxofre)
- **2026-01-01**: Layer 808s with sine sub for extra weight

## Lyrics Ideas
- **2026-01-01**: Hook concept: "Ainda aqui, sempre forte, nunca paro"
- **2026-01-01**: Verse opener: "Started in the shadows..."

## Marketing
- **2026-01-01**: TikTok challenge for "Patrão do Bairro" hook

## Workflow
- **2026-01-01**: Generate all prompts in batch before lyrics

## Reference Tracks
- **2026-01-01**: Study Giggs "Landlord" for boss delivery

## Parking Lot
- **2026-01-01**: Consider UK artist collab for Vol. 2
- **2026-01-01**: Album cover concept: silhouette against city
```

---

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║  ✓ IDEA SAVED                                                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Category:  Track Concepts                                       ║
║  Added:     2026-01-01                                           ║
║  Idea:      Track about loyalty to the crew                      ║
║                                                                   ║
║  File:      projects/mixtapes/MAG_Hood_Boss_Vol_1/IDEAS.md       ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝

Use /idea to add another, or /ideas to view all.
```

---

## View Ideas (`/ideas`)

```
╔══════════════════════════════════════════════════════════════════╗
║                    CREATIVE IDEAS                                 ║
║                    MAG Hood Boss Vol. 1                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  TRACK CONCEPTS (3)                                              ║
║  • Track about crew loyalty                                      ║
║  • Intro with orchestral build                                   ║
║  • Diss track concept for enemies                                ║
║                                                                   ║
║  PRODUCTION NOTES (2)                                            ║
║  • Try choir samples on Track 12                                 ║
║  • Layer 808s with sine sub                                      ║
║                                                                   ║
║  LYRICS IDEAS (1)                                                ║
║  • Hook: "Ainda aqui, sempre forte"                              ║
║                                                                   ║
║  Total Ideas: 6                                                  ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```
