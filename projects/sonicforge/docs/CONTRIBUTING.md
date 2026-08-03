
# Contributing to Pyrite's Sonic Forge (AETHER DOCTRINE)

> **Standard**: V7.0 (Strict Mode)
> **Compliance**: Mandatory

## 1. Core Principles (The Aether Doctrine)

### strict-mode-always
We do not use `any`. Ever. All data structures, especially those from the AI, must be strictly typed via `types.ts` and validated via Zod schemas in `services/ai/validators.ts`.

### modularity-first
Do not add logic to `App.tsx` or `PromptBuilder.tsx`.
- **Business Logic** -> `features/generator/hooks/`
- **AI Interactions** -> `services/ai/`
- **UI Components** -> `components/` or `features/*/components/`

### performance-obsessed
- **Heavy Math/Parsing** -> Offload to Web Workers (`workers/`).
- **Lists** -> Virtualize with `react-window` if > 50 items.
- **Components** -> Use `React.memo` for anything that re-renders frequently (like the Visualizer or History Cards).

## 2. Directory Structure

```text
.
├── features/           # Domain-specific logic (Generator, Chat, History)
├── services/           # External integrations (AI, Analysis)
├── components/         # Shared UI (Buttons, Panels)
├── hooks/              # Global hooks (LocalStorage)
├── lib/                # Utilities (Audio, Constants)
└── workers/            # Background threads
```

## 3. Development Guidelines

### Styling & Visuals (Protocol V10)
- **Tailwind CSS Only**: No CSS files (except global overrides).
- **Theming**: Use the `isPyriteMode` boolean prop.
- **Glass Components**: Always use `GlassPanel` with the appropriate layer:
  - `layer="surface"`: For base containers.
  - `layer="card"`: For interactive elements (hover states).
  - `layer="overlay"`: For modals/popups.
- **Micro-Interactions**:
  - Buttons must use `ThemedButton` for built-in haptics and press scales.
  - Inputs should use `SuggestionInput` for focus rings and dropdown animations.

### AI Integration
- **Model Selection**:
  - `gemini-3-pro-preview`: Complex generation, thinking.
  - `gemini-2.5-flash`: Fast tasks, research, audio analysis.
- **Safety**: Never hardcode API keys. Use `process.env.API_KEY`.
- **Error Handling**: All `try/catch` blocks wrapping AI calls **MUST** catch `(e: unknown)` and pass the error to `parseError` from `services/ai/utils.ts` for standardized error messaging.

### Audio
- **Web Audio API**: Do not use `<audio>` tags. Use the `AudioContext` provided in `lib/audio.ts`.
- **Muting**: Respect the global `isMuted` flag.

## 4. Documentation
If you change logic, you **MUST** update the corresponding file in `docs/`.
- `API_REFERENCE.md`: For service changes.
- `ARCHITECTURE.md`: For component structure changes.
- `ROADMAP.md`: For tracking progress.