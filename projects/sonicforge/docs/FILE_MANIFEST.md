
# PROJECT FILE MANIFEST (V56)

## Root
- `index.html`: Entry point.
- `index.tsx`: React Root.
- `App.tsx`: Main Layout.
- `translations.ts`: i18n Data.
- `metadata.json`: Frame metadata.
- `manifest.json`: PWA manifest.
- `service-worker.js`: Offline caching.

## Lib (Global Utilities)
- `lib/audio.ts`: Web Audio API Engine.
- `lib/constants.ts`: Global constants.
- `lib/export-utils.ts`: Export logic.
- `lib/haptics.ts`: Haptic feedback.
- `lib/json-repair.ts`: JSON fixer.
- `lib/keyboard-shortcuts.ts`: Hotkey hooks.
- `lib/sharing.ts`: State compression.
- `lib/utils.ts`: Helpers.

## Types
- `types/index.ts`: Barrel file.
- `types/core.ts`, `types/generator.ts`, `types/audio.ts`, `types/persistence.ts`, `types/chat.ts`, `types/i18n.ts`.

## Services (AI)
- `services/ai/orchestrator.ts`, `agents.ts`, `generators.ts`, `analysis.ts`, `research.ts`, `tools.ts`, `classifier.ts`, `calibration.ts`, `config.ts`, `validators.ts`, `utils.ts`.
- `services/ai/prompts/`: `system.ts`, `tasks.ts`, `examples.ts`.
- `services/ai/client.ts`: Gemini Client Factory.

## Features

### Generator (The Core Forge)
- `features/generator/PromptBuilder.tsx`: Main container.
- `features/generator/hooks/`: `usePromptGenerator`, `useAutoSave`, `useFormSync`, `useSyntaxHighlighter`, `useTypewriter`, `usePromptActions`, `useHistoryActions`, `useGenerationWorkflow`.
- `features/generator/utils/`:
    - `styleBuilder.ts`, `promptParser.ts`, `lyricsFormatter.ts`
    - `sunoValidator.ts`: Advanced scoring logic.
    - `lyricalTechniques.ts`: Vowel extension, chord formatting.
    - `promptDiff.ts`: Text diffing logic.
    - `promptAnalysis.ts`: Quality grading.
    - `genreOptimizer.ts`: Tip generation logic.
    - `suggestionEngine.ts`: Smart autocomplete logic.
    - `riffusionValidator.ts`, `syllableCounter.ts`, `randomizer.ts`, `templateManager.ts`.
- `features/generator/data/`: `presets.ts`, `sunoMetaTags.ts`, `genreDatabase.ts`, `genreTemplates.ts`, `vocalDatabase.ts`, `instrumentDatabase.ts`, `sfxDatabase.ts`, `musicTheory.ts`, `storyArcs.ts`, `autocompleteData.ts`, `descriptorBank.ts`, `expertOptions.ts`, `optimizationRules.ts`, `studioModels.ts`.
- `features/generator/components/`:
    - `ConfigForm.tsx`, `ResultsDisplay.tsx`, `ExportPanel.tsx`, `SmartLyricEditor.tsx`, `StructureBuilder.tsx`, `BatchResultCard.tsx`, `RhymeAssistant.tsx`, `ExpertGlobalPanel.tsx`, `StudioPanel.tsx`.
    - `StatusLog/index.tsx`: Status log component.
    - `BatchGenerator.tsx`: Batch variations UI.
    - `DraftHealth.tsx`: Real-time quality monitor.
    - `GenreOptimizationTips.tsx`: Contextual advice.
    - `SmartSuggestions.tsx`: Quick-add chips.
    - `AudioUploader.tsx`: Audio analysis UI.
    - `inputs/`: `MoodSelector`, `InstrumentPicker`, `ConceptInput`, `GenrePicker`, `VocalStyleDesigner`, `InstrumentDesigner`, `AtmosphereDesigner`, `NegativePromptInput`, `SpecialTechniquesPanel`.
    - `ConfigForm/`: Sub-components (`PresetSelector`, `ModeSelector`, `PromptImporter`, `PersonaManager`).
    - `layouts/`: `ForgeLayout.tsx`, `StudioLayout.tsx`.

### History
- `features/history/History.tsx`: Main view.
- `features/history/components/HistoryCard.tsx`: Card item.
- `features/history/components/HistoryCompare.tsx`: Diff modal.

### Other Features
- `features/guide/ReferenceGuide.tsx`
- `features/guide/components/`: Guide components.
- `features/templates/GenreExplorer.tsx`
- `features/templates/components/TemplateCard.tsx`
- `features/onboarding/OnboardingTour.tsx`
- `features/chat/PyriteChat.tsx`
- `features/docs/DocsViewer.tsx`

## Shared UI & State
- `components/layout/`: `Navbar`, `MobileDock`, `Background`, `AudioVisualizer`.
- `components/shared/`: `GlassPanel`, `ThemedButton`, `Drawer`, `Toast`, `Logo`, `Tooltip`, `SuggestionInput`, `BpmTapper`, `ErrorBoundary`, `SettingsModal`, `CustomSelect`, `ContextMenu`.
- `components/ui/`: `Button`, `Card`, `Input`, `Select`, `Switch`, `Slider`.
- `contexts/`: `AudioContext`, `SettingsContext`, `UIContext`, `HistoryContext`, `PromptContext`.

## Hooks & Workers
- `hooks/useLocalStorage.ts`, `useTypewriter.ts`, `useKonamiCode.ts`, `useDebounce.ts`, `usePWA.ts`, `useCloudSync.ts`.
- `workers/audio.worker.js`, `lz.worker.js`.
