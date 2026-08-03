# Performance Optimization Workflow (Protocol V20)

> **Objective**: Systemic elimination of latency and inefficiency.
> **Tools**: Chrome DevTools, React Profiler, Lighthouse, Bundle Analyzer.

This document outlines the standard operating procedure for analyzing and optimizing the Sonic Forge V5 architecture.

---

## 1. Performance Baseline Assessment
*Before optimizing, we must measure the pain.*

### Tools
- **Lighthouse (Chrome DevTools)**: Overall health score.
- **Web Vitals Extension**: Real-time LCP/CLS metrics.

### Protocol
1.  **Cold Start Test**: Hard refresh (`Ctrl+Shift+R`) on `PromptBuilder`.
    -   *Target*: LCP < 1.2s.
    -   *Metric*: Time to Interactive (TTI).
2.  **Interaction Latency**: Click "Initiate Sequence".
    -   *Metric*: Input Delay (INP).
    -   *Target*: < 50ms for UI feedback (Spinner/Toast).
3.  **Memory Leak Check**: Open Task Manager.
    -   *Action*: Switch tabs 20 times.
    -   *Target*: Heap usage should remain stable (< 100MB increase).

---

## 2. Bottleneck Identification
*Locating the clog in the neural pathways.*

### Tools
- **Chrome Performance Tab**: CPU throttling (4x slowdown) simulation.

### Protocol
1.  **Record a Session**:
    -   Start recording.
    -   Type in the `LyricsInput`.
    -   Switch Mode to `Expert`.
    -   Stop recording.
2.  **Analyze "Long Tasks"**:
    -   Look for red triangles.
    -   Identify scripts taking > 50ms.
    -   *Common Culprits*: JSON parsing on main thread, heavy regex in syntax highlighters.

---

## 3. React Component Analysis
*Preventing the UI from hallucinating unnecessarily.*

### Tools
- **React DevTools (Profiler)**
- **React DevTools (Highlight Updates)**

### Protocol
1.  **Render Counting**:
    -   Enable "Highlight updates when components render".
    -   Type in `ConceptInput`.
    -   *Observation*: Does the entire `ConfigForm` flash? Or just the input?
    -   *Fix*: Apply `React.memo` to parent containers or `useCallback` to handlers.
2.  **Commit Cost**:
    -   Profile a "Generate" action.
    -   Check `SmartLyricEditor`. Is syntax highlighting running on every keystroke?
    -   *Fix*: Debounce the highlighter logic.

---

## 4. AI Integration Efficiency
*Optimizing the brain.*

### Metrics
- **Token Usage**: Input vs Output tokens.
- **Latency**: Time to First Token (TTFT).

### Protocol
1.  **Payload Audit**:
    -   Check `services/ai/orchestrator.ts`.
    -   Are we sending the entire history context when not needed?
    -   *Action*: Prune context window to last 5 messages + summary.
2.  **Caching Strategy**:
    -   Check `services/ai/research.ts`.
    -   Are repeated queries for the same Artist hitting the API?
    -   *Action*: Implement `sessionStorage` caching for research results.
3.  **Model Selection**:
    -   Use `gemini-2.5-flash-lite` for simple tasks (Rhyme, Classify).
    -   Reserve `gemini-3-pro-preview` ONLY for the main generation.

---

## 5. Bundle Size Optimization
*Trimming the fat.*

### Tools
- `source-map-explorer` (or equivalent visualizer)

### Protocol
1.  **Lazy Loading Audit**:
    -   Ensure `PyriteChat`, `DocsViewer`, and `History` are lazy loaded.
    -   Verify chunks are generated in the build output.
2.  **Dependency Review**:
    -   Check for large libraries (e.g., `lodash`).
    -   *Action*: Replace with native ES6 or lightweight alternatives (`radash`).
3.  **Asset Optimization**:
    -   Ensure `noise.svg` and fonts are cached by the Service Worker.
    -   Check if icons are tree-shaken (Lucide React handles this well, but verify).

---

## 6. Implementation Recommendations (Action Plan)

### High Priority (Immediate)
- [ ] **Virtualize Lyrics Editor**: If lyrics > 100 lines, switch to windowed rendering.
- [ ] **Worker Offloading**: Move all JSON parsing from AI streams to `json.worker.ts`.
- [ ] **Image Optimization**: Ensure the background noise texture is optimized or CSS-generated.

### Medium Priority
- [ ] **WASM Rewrite**: Convert the Audio Engine signal processing to WebAssembly for lower latency on mobile.
- [ ] **Prefetching**: Prefetch the "Expert Mode" chunk when the user hovers the toggle button.

### Low Priority
- [ ] **Critical CSS**: Inline critical styles for the loading skeleton to improve FCP.
