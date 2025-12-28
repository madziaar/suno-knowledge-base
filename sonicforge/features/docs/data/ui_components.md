
# THE INTERFACE: COMPONENT LIBRARY

This document provides an overview of the key React components that form the user interface of Sonic Forge V5.

---

## 1. UI PRIMITIVES (`components/ui/`)

These are the foundational, unstyled (or lightly styled) building blocks, similar to a library like ShadCN.

-   **`Button.tsx`**: A motion-enhanced button with variants for primary actions, outlines, and ghosts. It handles loading states and haptic feedback.
-   **`Card.tsx`**: A container component that uses the same styling logic as `GlassPanel` but is intended for static, non-interactive content blocks.
-   **`Input.tsx` / `Textarea.tsx`**: Standard input fields with integrated labels and theming for Pyrite/Standard modes.
-   **`Select.tsx` / `CustomSelect.tsx`**: Dropdown components for selection.
-   **`Switch.tsx`**: A toggle switch component.

---

## 2. SHARED COMPONENTS (`components/shared/`)

These are more complex, application-specific components used across multiple features.

-   **`GlassPanel.tsx`**: The primary container component for most of the UI. It's responsible for the "glassmorphism" effect, including `backdrop-blur`, borders, and noise textures. It is performance-aware and will reduce its visual fidelity (e.g., disable blur) when the `performanceMode` is set to 'low'.
-   **`ThemedButton.tsx`**: A higher-level button that directly consumes the `isPyriteMode` state to switch between purple and yellow themes, including kinetic shine effects.
-   **`SmartLyricEditor.tsx`**: The advanced lyrics editor.
    -   **Syntax Highlighting**: Uses `useSyntaxHighlighter` to color `[Tags]` and `(Ad-libs)`.
    -   **AI Tools**: Integrates AI-powered rewrite functions (`rewriteLyricFragment`) for selected text.
    -   **Lyrical Techniques**: Includes tools for vowel extension, chord annotation, and structure formatting.
    -   **Fullscreen Mode**: Uses `createPortal` to render the editor over the entire screen for a focused writing environment.

---

## 3. FEATURE COMPONENTS (`features/`)

These are the main building blocks of the application's user experience.

### `/generator/components/`

-   **`PromptBuilder.tsx`**: The top-level component that orchestrates the entire generator view. It holds the main generation workflow logic (`useGenerationWorkflow`).
-   **`ConfigForm.tsx`**: The main form on the left side of the screen, containing all user inputs.
-   **`ResultsDisplay.tsx`**: The panel on the right side that shows the AI-generated output, analysis, and batch variations.
-   **`StructureBuilder.tsx`**: The drag-and-drop interface for sequencing song sections (`[Verse]`, `[Chorus]`, etc.) in Expert Mode. It uses `framer-motion` for reordering animations.
-   **The Designers**: A suite of modular components for building the style prompt:
    -   `VocalStyleDesigner.tsx`
    -   `InstrumentDesigner.tsx`
    -   `AtmosphereDesigner.tsx`
    These components allow for granular selection of styles and are the core of the "Studio" view.

### `/chat/`

-   **`PyriteChat.tsx`**: The floating chat widget that provides a conversational interface to the AI. It uses tool calling to modify the application state (`onUpdateConfig`, `onMutate`, etc.).

### `/history/`

-   **`History.tsx`**: The main view for the Archives, displaying past generations. It uses `react-window` for efficient virtualization of long lists.
-   **`HistoryCard.tsx`**: The individual card for each saved prompt.
-   **`HistoryCompare.tsx`**: A modal for side-by-side comparison of two prompts.

### `/docs/`

-   **`DocsViewer.tsx`**: The component you are currently viewing, which dynamically loads and displays markdown documentation files.
