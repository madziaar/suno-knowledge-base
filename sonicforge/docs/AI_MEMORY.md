
# PYRITE SYSTEM MEMORY [v8.5]

> **SYSTEM STATUS**: ONLINE
> **VERSION**: 8.5 (The Etheric Link)
> **FRAMEWORK**: React 19 / TypeScript / Tailwind / Google GenAI SDK
> **PERSONA**: Pyrite (Chaotic/Flirty/Unfiltered)

## 1. CORE ARCHITECTURE

### Logic Centers
- **Prompt Logic**: `services/ai/generators.ts`
  - *Engine*: Gemini 3 Pro (Thinking Budget: 32k)
  - *Backup*: Gemini 2.5 Flash
- **Optimizer Logic**: `features/generator/utils/genreOptimizer.ts`
  - *Database*: `optimizationRules.ts` containing Suno KB best practices.
- **Validation Logic**: `features/generator/utils/sunoValidator.ts`
  - *Scoring*: Completeness, Specificity, Balance, Coherence.

## 2. FEATURE MANIFEST (v8.5)

### A. The Forge (Text-to-Audio)
- **Draft Health**: Real-time quality scoring (`DraftHealth.tsx`).
- **Smart Suggestions**: Context-aware autocomplete (`SmartSuggestions.tsx`).
- **Expert Mode**: Drag-and-drop song sections.
- **Lyrical Alchemy**: Advanced vocal/arrangement tools (`SpecialTechniquesPanel.tsx`).

### B. The Alchemy Engine (Audio-to-Audio)
- **Add Vocals**: Focuses on generating lyrics and vocal style for an existing instrumental.
- **Add Instrumentals**: Focuses on backing track style for existing vocals.
- **Covers**: Reimagines a song in a new genre.
- **Inspire**: Generates prompts based on playlist vibes.

### C. The Archives (History)
- **Comparator**: Side-by-side diff of two prompts (`HistoryCompare.tsx`).
- **Favorites**: Persistence of best generations.
- **Quality Badges**: Historical quality scores on cards.

### D. The Interface
- **Theme Engine**: Standard (Yellow) vs Pyrite (Purple/Glitch).
- **Components**: GlassPanel, SuggestionInput, StatusLog.
- **Unified Architecture**: Auto-optimizes for v4.5+ / v5.

## 3. SUNO V4.5+ CONSTRAINTS (HARD RULES)

### Character Limits & Quota Strategy
The AI is instructed to be extremely verbose to maximize the available character quota.
- **Title**: 80 chars
- **Tags**: 1000 chars (Target: 950-990, Strictly Lowercase)
- **Style**: 1000 chars (Target: 950-990)
- **Lyrics**: 5000 chars

### Tag Hierarchy (Priority)
1. **Genre & Era** (e.g., "1980s Synthpop")
2. **Subgenre** (e.g., "Darkwave")
3. **Vocals** (e.g., "Female Vocals, Ethereal")
4. **Instruments** (e.g., "Analog Synths, Gated Reverb")
5. **Mood** (e.g., "Melancholic")
6. **Production** (e.g., "Wide Stereo, Tape Saturation")

### Syntax Protocol
- **[Square Brackets]**: SILENT instructions.
- **(Parentheses)**: AUDIBLE vocals.
