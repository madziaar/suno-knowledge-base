
# SYSTEM ARCHITECTURE: THE CONSTRUCT

## DESIGN PATTERNS
- **Agentic Orchestration**: Multi-step AI pipeline (Researcher -> Artist -> Critic -> Refiner) with a sequential model fallback cascade (Pro -> Flash -> Lite) for reliability.
- **Modular Feature Folders**: Encapsulated logic for Generator, Chat, History, and Docs.
- **Contextual State**: Undoable prompt state using useReducer and Context API.
- **Visual Performance Tiers**: Scaling CSS/Canvas effects based on device capabilities.

## DIRECTORY STRUCTURE
- `features/generator/`: The primary Sound Rack and Sequencing engine.
- `features/chat/`: The Pyrite Alpha conversational interface.
- `features/docs/`: The Memory Core viewer and its data sources.
  - `data/`: Markdown files containing system documentation.
    - `architecture.md`
    - `state_management.md`
    - `ai_core.md`
    - `ui_components.md`
    - `styling_theming.md`
    - `pwa_workers.md`
- `services/ai/`: Modular Gemini API integrations and prompt engineering blocks.
- `lib/`: Kinetic audio engine, sharing worker, and export utilities.

## KEY INTERFACES
- `SongConcept`: Input parameters for simple generation.
- `ExpertInputs`: Granular control over structure, era, and technical anchors.
- `GeneratedPrompt`: The final Suno-ready JSON output.