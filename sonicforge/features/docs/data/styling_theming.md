
# THE AEGIS: STYLING & THEMING

This document explains the styling architecture, theming system (Standard vs. Pyrite Protocol), and performance-tiered visuals of Sonic Forge V5.

---

## 1. CORE TECHNOLOGY

-   **Tailwind CSS**: The application is styled exclusively with Tailwind CSS utility classes. This allows for rapid prototyping and a consistent design system.
-   **`clsx` & `tailwind-merge`**: The `cn` utility function (`lib/utils.ts`) is used throughout the application to intelligently merge and deduplicate Tailwind classes, especially when dealing with conditional styles.
-   **CSS Variables**: Global theme colors are defined as CSS variables in the `<head>` of `index.html`. This allows for easy theme switching without re-rendering React components.

---

## 2. THE PYRITE PROTOCOL (THEMING)

The application has two primary themes: Standard (Yellow/Order) and Pyrite (Purple/Chaos).

**Mechanism:**
1.  The `isPyriteMode` boolean is stored in `SettingsContext`.
2.  An effect in `SettingsContext.tsx` toggles a `pyrite-mode` class on the `<body>` element.
3.  CSS styles in `index.html` use this class to override the default CSS variables:
    ```css
    :root {
      --std-primary: 234, 179, 8; /* Yellow */
    }
    .pyrite-mode {
      --std-primary: 168, 85, 247; /* Purple */
    }
    ```
4.  Components that require more complex stylistic changes (beyond simple color swaps) receive an `isPyriteMode` prop and use `cn` to apply conditional classes. Example from `ThemedButton.tsx`:
    ```javascript
    const variants = {
      primary: isPyrite 
        ? "bg-purple-600 text-white ..." 
        : "bg-yellow-500 text-black ...",
    };
    ```

---

## 3. PERFORMANCE TIERS (VISUAL FIDELITY)

To ensure a smooth experience on all devices, the application implements three visual performance modes, managed in `SettingsContext`.

**Modes:**
-   **`high` (Ultra)**: Full visual fidelity. Includes `backdrop-blur`, complex animations, audio visualizers, and shader-like effects.
-   **`medium` (Balanced)**: Disables expensive animations and reduces the intensity of some effects.
-   **`low` (Fast)**: Disables all `backdrop-blur` effects, animations, and the audio visualizer. This significantly reduces GPU load, making the app usable on older or low-power devices.

**Mechanism:**
-   A `perf-low`, `perf-medium`, or `perf-high` class is applied to the `<body>` element.
-   Key components, such as `GlassPanel.tsx` and `Background.tsx`, check this class or the context value to conditionally render expensive visual features.
    ```javascript
    // Example from GlassPanel.tsx
    const isLowPerf = performanceMode === 'low';
    const baseClasses = isLowPerf
      ? "relative rounded-xl bg-zinc-950 ..." // No blur
      : "relative rounded-2xl backdrop-blur-md ..."; // With blur
    ```

---

## 4. KINETIC & AUDIO-REACTIVE DESIGN

The UI is designed to feel alive and responsive.

-   **Haptics (`lib/haptics.ts`)**: On supported mobile devices, `navigator.vibrate` is used to provide physical feedback for button presses and key actions.
-   **UI Sound Effects (`lib/audio.ts`)**: A custom `AudioEngine` class generates synthesized sounds for clicks, toggles, success, and error states, providing an audible layer of feedback.
-   **Audio Visualizer (`components/layout/AudioVisualizer.tsx`)**: Taps into the `AudioEngine`'s `AnalyserNode` to render a real-time frequency spectrum on the application background, reacting to UI sounds.
-   **Framer Motion**: Used for layout animations (e.g., reordering in `StructureBuilder`), page transitions, and micro-interactions on buttons and modals.
