
# THE PULSE: STATE MANAGEMENT

This document details how the application manages state, ensuring a responsive user interface and data persistence across sessions. The core strategy is built on React's Context API, splitting state by domain to optimize re-renders and maintain a clean data flow.

---

## 1. THE CONTEXT HIERARCHY

The application is wrapped in a series of providers in `index.tsx`, creating a hierarchy of state available to all child components.

**Hierarchy:**
- `AudioProvider` (Lowest Level - Global FX)
- `SettingsProvider` (User Preferences)
- `UIProvider` (Visual State)
- `HistoryProvider` (Past Generations)
- `PromptProvider` (Current Working Draft - Highest Level)

---

## 2. CONTEXT DOMAINS

### `PromptContext.tsx`
- **Purpose**: Manages the *current state of the song being created*. This is the most frequently updated and complex piece of state.
- **Key Features**:
    - **Undo/Redo**: Implemented with a `useReducer` that maintains `past`, `present`, and `future` states. This allows users to step backward and forward through their changes to the prompt form.
    - **State**: Holds `inputs`, `expertInputs`, `isExpertMode`, `lyricSource`, and the final `result`.
    - **Actions**: Provides memoized dispatch actions (`updateInput`, `updateExpertInput`, `reset`, `undo`, `redo`).

### `HistoryContext.tsx`
- **Purpose**: Manages the archive of past generations.
- **Key Features**:
    - **Persistence**: Uses `useLocalStorage` to save the user's history in their browser.
    - **State**: Holds the `history` array, `loadedItem` (when loading from history), and `loadedTemplate`.
    - **Actions**: `addToHistory`, `deleteFromHistory`, `toggleFavorite`, `clearHistory`, `exportHistory`.
    - **Cloud Sync**: Manages Supabase configuration and status for cloud backup.

### `UIContext.tsx`
- **Purpose**: Controls the global user interface state that is not directly related to the prompt itself.
- **State**:
    - `activeTab`: The current main view (`forge`, `guide`, `history`, etc.).
    - `generatorState`: The current status of the AI generation process (`idle`, `researching`, `complete`, etc.).
    - `toast`: The state for the global notification system.
    - `isSettingsModalOpen`: Visibility of the settings panel.

### `SettingsContext.tsx`
- **Purpose**: Manages user preferences that persist across sessions.
- **Key Features**:
    - **Persistence**: Uses `useLocalStorage` for all its state.
    - **State**:
        - `lang`: Interface language ('en' or 'pl').
        - `isPyriteMode`: The application theme.
        - `performanceMode`: Visual performance tier ('low', 'medium', 'high').
    - **Side Effects**: An effect in this context is responsible for toggling the `pyrite-mode` class on the `<body>` element.

### `AudioContext.tsx`
- **Purpose**: A singleton wrapper for the `AudioEngine` class (`lib/audio.ts`).
- **Key Features**:
    - Provides access to UI sound effects (`sfx.play(...)`).
    - Manages the master mute state.
    - Provides the `AnalyserNode` for the audio visualizer component.
