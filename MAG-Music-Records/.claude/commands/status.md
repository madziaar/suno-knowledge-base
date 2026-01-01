# Project Status

**Command:** `/status`
**Example:** `/status` or `/status MAG_Hood_Boss_UK_Vol_1`

---

## Purpose

Show comprehensive status of current project or specified project.

---

## Workflow

### Step 1: Identify Project
```
1. If argument provided, use that project
2. Otherwise, detect from current directory
3. Or list all available projects and ask
```

### Step 2: Load State
```
1. Read project_state.json if exists
2. Or scan folders to build status:
   - 01_prompts/ for prompt files
   - 02_lyrics/ for lyrics files
   - 03_audio_exports/ for audio files
   - 04_artwork/ for cover art
   - 05_metadata/ for descriptions
```

### Step 3: Display Status
```
Show formatted status table with progress indicators
```

---

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║                    MAG HOOD BOSS VOL. 1                          ║
║                    Status: IN PROGRESS                           ║
╠══════════════════════════════════════════════════════════════════╣
║  Variation: EUROPEAN_PT                                          ║
║  Credits Used: 1,200 | Remaining: 1,590                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  TRACK PROGRESS                                                   ║
║  ─────────────────────────────────────────────────────────────── ║
║  #  │ Title              │ Prompt │ Lyrics │ Audio │ Art │ QC    ║
║  ───┼────────────────────┼────────┼────────┼───────┼─────┼────── ║
║  1  │ Abertura           │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  2  │ Patrão do Bairro   │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  3  │ Ouro dos Anos 80   │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  4  │ Amor de Rua        │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  5  │ Graves Profundos   │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  6  │ Se Soubessem       │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  7  │ Essência Pura      │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  8  │ Continua Assim     │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  9  │ Pedra Angular      │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  10 │ Laços de Sangue    │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  11 │ Chamas             │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║  12 │ Enxofre            │   ✓    │   ✓    │  ✓✓   │  ○  │  ○    ║
║                                                                   ║
║  Legend: ✓ Complete | ○ Pending | ✗ Failed | ✓✓ 2 versions       ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  SUMMARY                                                          ║
║  • Prompts: 12/12 (100%)                                         ║
║  • Lyrics: 12/12 (100%)                                          ║
║  • Audio Generated: 12/12 (100%)                                 ║
║  • Audio Extended: 0/12 (0%)                                     ║
║  • Artwork: 0/12 (0%)                                            ║
║  • QC Passed: 0/12 (0%)                                          ║
╠══════════════════════════════════════════════════════════════════╣
║  NEXT ACTIONS                                                     ║
║  1. Listen and select best versions for each track               ║
║  2. Extend selected versions to full length                      ║
║  3. Generate cover artwork (/cover)                              ║
║  4. Run QC on all tracks (/qc)                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Multiple Projects View

```
╔══════════════════════════════════════════════════════════════════╗
║                    MAG MUSIC RECORDS - ALL PROJECTS              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  PROJECT                          │ STATUS      │ PROGRESS       ║
║  ─────────────────────────────────┼─────────────┼─────────────── ║
║  MAG_Hood_Boss_Vol_1              │ IN PROGRESS │ ████████░░ 80% ║
║  MAG_Hood_Boss_UK_Vol_1           │ NOT STARTED │ ░░░░░░░░░░  0% ║
║  MAG_Hardcore_Drill_Vol_1         │ PAUSED      │ ██░░░░░░░░ 20% ║
║  MAG_Afro_Spiritual_Gospel_Vol_1  │ COMPLETE    │ ██████████100% ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝

Use: /status [PROJECT_NAME] for detailed view
```

---

## Data Sources

| Data | Source |
|------|--------|
| Track list | `00_admin/TRACKLIST.md` |
| Prompts | `01_prompts/*.txt` |
| Lyrics | `02_lyrics/*.txt` |
| Audio | `03_audio_exports/*.mp3` |
| Artwork | `04_artwork/*.png` |
| Descriptions | `05_metadata/*.txt` |
| State | `project_state.json` |
