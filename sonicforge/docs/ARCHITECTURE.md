# Architecture Overview

## Tech Stack

- **Framework**: React 19 (via ESM imports in `index.html`)
- **Styling**: Tailwind CSS (Script-injected)
- **AI Integration**: `@google/genai` SDK
- **Icons**: Lucide React
- **Typography**: Space Grotesk (Google Fonts)
- **Concurrency**: Web Workers (Binary Processing & State Compression)

## Core Data Flow & State Management (Protocol V50)

As of Protocol V50, the application's state management has been modularized using React's Context API to improve scalability and maintainability, and to reduce prop drilling.

### State Contexts (`contexts/`)
1.  **`SettingsContext`**: Manages and persists global user settings like theme (`isPyriteMode`) and language (`lang`). Persisted to `localStorage`.
2.  **`UIContext`**: Manages ephemeral global UI state, including the active tab, loading/generator states, and toast notifications.
3.  **`HistoryContext`**: Manages the user's generation history, including saving, loading, and deleting items. Persisted to `localStorage`.
4.  **`PromptContext`**: Manages the entire state of the active prompt being built in the Forge. This includes all user inputs, expert settings, results, and variations. It also contains the logic for **Undo/Redo** functionality.

### The Neural Pathway
1.  **User Input**: Data is collected in `features/generator/components/` and dispatched to `PromptContext`.
2.  **Orchestration**: The `AgentOrchestrator` (`services/ai/orchestrator.ts`) is triggered by an action in `PromptBuilder`.
    - **Parallel Intel**: Runs `IntentClassifier` and `ResearchAgent` (if needed) concurrently.
    - **Context Injection**: Merges research data and intent profile into the System Prompt.
3.  **Generation Cascade**: 
    - **Tier 1**: Gemini 3 Pro (Thinking) attempts generation.
    - **Tier 2**: Gemini 2.5 Flash (Standard) fallback.
    - **Tier 3**: Gemini 2.5 Flash-Lite (Emergency) fallback.
4.  **State Update**: The final result is dispatched to `PromptContext`, which then updates the `ResultsDisplay.tsx` component. The generation is also dispatched to `HistoryContext` to be archived.

## Visual Architecture (Protocol V10)

### The Glass Engine
The UI is built on a 3-tier depth system managed by `GlassPanel.tsx`:
1.  **Surface**: Base container, lowest opacity, subtle borders.
2.  **Card**: Interactive elements, higher opacity, distinct borders, hover lift.
3.  **Overlay**: Modals/Drawers, highest opacity, heavy blur.

All glass components inherit a global SVG noise texture defined in CSS variables to prevent color banding and add tactile "grit".

## Error Handling & Resilience

The system employs a multi-layered approach to ensure high availability and graceful degradation:
- **Typed Errors**: All `catch` blocks in the service layer are strictly typed with `(e: unknown)` and processed by a centralized `parseError` utility for consistent user feedback.
- **Retry with Exponential Backoff**: Network-related or rate-limiting errors (429, 503) automatically trigger a retry mechanism to handle transient API issues without failing immediately.
- **Circuit Breaker**: A global circuit breaker (`services/ai/utils.ts`) monitors the rate of critical failures. If a threshold is exceeded, it "trips" and prevents further API calls for a cooldown period, stopping cascading failures and protecting the API from being overwhelmed.
- **Model Cascade**: If the primary `gemini-3-pro` model fails, the system automatically falls back to `gemini-2.5-flash` and then `gemini-2.5-flash-lite`, ensuring a response is generated if possible.

## Performance Optimization

### Thread Offloading
- **State Compression (`workers/lz.worker.js`)**: Encodes massive state JSON into URL strings.
- **Audio Processing (`workers/audio.worker.js`)**: Handles ArrayBuffer -> Base64 conversion for the "Sonic Mirror".

### Memoization Strategy
- **Heavy Components**: `StructureBuilder`, `StatusLog`, and `ConfigForm` sub-sections are wrapped in `React.memo`.
- **Reference Stability**: Context values and dispatch functions are stabilized via `useMemo` and `useCallback` to prevent wasted renders.

## Directory Structure

```text
.
├── contexts/               # STATE MANAGEMENT (Prompt, UI, History, Settings)
│   ├── SettingsContext.tsx
│   ├── UIContext.tsx
│   ├── HistoryContext.tsx
│   └── PromptContext.tsx    
├── features/
│   ├── generator/           # CORE GENERATOR (The Forge)
│   │   ├── PromptBuilder.tsx# Feature Container
│   │   ├── components/      # UI Components (ConfigForm, ResultsDisplay, SmartLyricEditor etc.)
│   │   ├── hooks/           # Business Logic hooks
│   │   ├── utils/           # Utilities (styleBuilder, promptParser, lyricsFormatter, etc.)
│   │   └── data/            # Datasets (presets, genreDatabase, vocalDatabase, etc.)
│   ├── chat/                # NEURAL CHAT
│   ├── docs/                # INTERNAL KNOWLEDGE BASE
│   ├── guide/               # USER MANUAL
│   ├── history/             # ARCHIVES
│   ├── onboarding/          # FIRST-TIME EXPERIENCE
│   └── templates/           # TEMPLATE LIBRARY
├── services/
│   ├── ai/                  # AI SERVICE LAYER
│   │   ├── orchestrator.ts  # Task Manager
│   │   ├── agents.ts        # Agentic Logic (Critic, Refiner, Researcher)
│   │   ├── generators.ts    # LLM Interaction
│   │   ├── analysis.ts      # Audio Analysis
│   │   ├── research.ts      # Grounding/Search
│   │   ├── tools.ts         # Helper AI Tools (Enhance, Rewrite, Rhyme, Variations)
│   │   ├── classifier.ts    # Intent Detection
│   │   ├── calibration.ts   # System Diagnostics
│   │   ├── config.ts        # System Prompt Assembly
│   │   ├── validators.ts    # Zod Schemas & Sanitization
│   │   └── utils.ts         # Error Parsing
│   └── gemini.ts            # Base Gemini Client
├── components/              # SHARED UI (Buttons, Panels)
│   ├── layout/              # Nav, MobileDock, Background, Visualizer
│   └── shared/              # GlassPanel, ThemedButton, Toast, Drawer, Tooltip, SettingsModal (NEW)
├── hooks/                   # GLOBAL HOOKS (LocalStorage, Typewriter)
├── lib/                     # UTILITIES (Audio, Constants, Export, Haptics, JSON Repair, Keyboard Shortcuts, Sharing, Utils)
├── workers/                 # BACKGROUND THREADS
│   ├── audio.worker.js
│   └── lz.worker.js
└── translations.ts          # i18n Data