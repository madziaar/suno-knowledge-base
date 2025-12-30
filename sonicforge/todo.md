
# 🛠️ MASTER WORKPLAN: OPERATION SINGULARITY

> **Status**: INITIATED
> **Objective**: Total System Refinement & Expansion
> **Protocol**: V13.0

---

## 🟥 PRIORITY 1: SANITIZATION & TECHNICAL DEBT
*Immediate actions to stabilize the codebase and reduce bundle size.*

- [x] **Exorcise Ghosts (Delete Legacy Files)**
    - [x] `components/PromptBuilder.tsx`
    - [x] `components/ReferenceGuide.tsx`
    - [x] `components/History.tsx`
    - [x] `services/gemini.ts`
    - [x] `features/generator/api.ts`
    - [x] `features/generator/components/ResultsDisplay/index.tsx`
    - [x] `features/generator/components/StatusLog.tsx`
- [x] **Type Mitosis** (`types.ts` Refactor)
    - [x] Extract `BuilderTranslation`, `ToastTranslation` -> `types/i18n.ts`
    - [x] Extract `SongConcept`, `ExpertInputs`, `GeneratedPrompt` -> `types/generator.ts`
    - [x] Extract `HistoryItem`, `Preset` -> `types/persistence.ts`
    - [x] Keep `types.ts` as an aggregator/barrel file.
- [ ] **Strict Import Audit**
    - [ ] Scan `App.tsx` and `PromptBuilder.tsx` to ensure no imports remain from `components/` root (except `shared/`).

## 🟪 PRIORITY 2: RIFFUSION REFINEMENT (PHASE 2)
*Polishing the new features added in Protocol V12.*

- [ ] **Smart Validator UI**
    - [ ] Update `ResultsDisplay.tsx`: Add "Auto-Fix" button next to critical Riffusion warnings (e.g., "Append 128 BPM").
- [ ] **Ghostwriter Context**
    - [ ] Update `services/ai/tools.ts`: Inject `artistReference` into `generateGhostLyrics` prompt for better genre matching.
- [ ] **Spectrogram Visuals**
    - [ ] Update `AudioVisualizer.tsx`: Create a "Riffusion Mode" (Blue/Pink scrolling heatmap) to mimic spectrogram generation when platform is Riffusion.

## 🟨 PRIORITY 3: SUNO V5 ARCHITECTURE
*Preparing for the next generation of Suno features.*

- [ ] **Expert Mode Expansion**
    - [ ] Add "Story Arc" templates to `ExpertDrawerContent.tsx` (e.g., "Hero's Journey", "Club Banger").
    - [ ] Add "Time Signature" input (3/4, 4/4, 6/8) to `ExpertInputs`.
- [ ] **Negative Prompting**
    - [ ] Add `negativePrompt` field to `ConfigForm.tsx` (Advanced toggle).
    - [ ] Inject into `services/ai/prompts/system.ts`.

## 🟦 PRIORITY 4: THE NEURAL CHAT (2.0)
*Making the chat assistant context-aware and powerful.*

- [ ] **Context Injection**
    - [ ] Pass the current `result` (GeneratedPrompt) into `sendChatMessage` context.
    - [ ] Allow user to say "Rewrite the second verse" or "Make the title darker".
- [ ] **Direct Mutation Tools**
    - [ ] Add `mutate_output` tool to `features/chat/api.ts` allowing the chat to directly modify the JSON result state.
- [ ] **History Integration**
    - [ ] Allow Chat to "Load the last generated song" from history.

## 🟩 PRIORITY 5: PERFORMANCE & PWA
*Speed is key.*

- [ ] **Draft Debounce Optimization**
    - [ ] Refactor `useAutoSave.ts`: Replace `setInterval` with `useEffect` + debounce on inputs change.
- [ ] **Lazy Loading**
    - [ ] Implement `React.lazy` for `ReferenceGuide`, `DocsViewer`, and `PyriteChat`.
- [ ] **Offline Assets**
    - [ ] Update `service-worker.js` to cache `Space Grotesk` font and `noise.svg` locally.

## ⬜ PRIORITY 6: DOCUMENTATION & UX
*Knowledge is power.*

- [ ] **Interactive Guide**
    - [ ] Update `ReferenceGuide.tsx`: Make tags clickable (copies tag to clipboard).
- [ ] **Video Tutorials**
    - [ ] Add placeholder links in `DocsViewer` for future video content.
- [ ] **Preset Thumbnails**
    - [ ] Add small genre icons/colors to `PresetSelector` dropdown items.

---

**Execution Order**: Red -> Purple -> Yellow -> Blue -> Green -> White.
