
import React, { useCallback, useMemo, Suspense, useState } from 'react';
import { GeneratorState } from '../../types';
import { translations } from '../../translations';
import { exportBatchAsText } from '../../lib/export-utils';
import { useSettings, useUI, useHistory, usePrompt } from '../../contexts';
import ExportPanel from './components/ExportPanel';
import { generateRandomConcept } from './utils/randomizer';
import { usePromptActions } from './hooks/usePromptActions';
import { useGenerationWorkflow } from './hooks/useGenerationWorkflow';
import { useHistoryActions } from './hooks/useHistoryActions';
import { ForgeLayout } from './layouts/ForgeLayout';
import { StudioLayout } from './layouts/StudioLayout';
import { useKeyboardShortcuts } from '../../lib/keyboard-shortcuts';

// Lazy Load Chat
const PyriteChat = React.lazy(() => import('../chat/PyriteChat'));

interface PromptBuilderProps {
    viewMode?: 'forge' | 'studio';
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ viewMode = 'forge' }) => {
  const { lang, isPyriteMode } = useSettings();
  const { showToast, setGeneratorState, generatorState: globalGeneratorState } = useUI();
  const { history } = useHistory();
  const { loadFromHistory } = useHistoryActions();
  
  // Use state from context
  const {
    inputs,
    expertInputs,
    isExpertMode,
    result,
    variations,
  } = usePrompt();

  // Use actions from hook
  const { updateInput, updateExpertInput, reset } = usePromptActions();

  // Generation Workflow Hook
  const { 
    generate, 
    refine, 
    enhance, 
    updateResult, 
    generateVariations, 
    applyVariation, 
    state: workflowState, 
    error, 
    activeAgent, 
    researchData 
  } = useGenerationWorkflow(viewMode as 'forge' | 'studio');

  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0); // Tracks chat lifecycle for clearing

  const t = translations[lang].builder;
  const tToast = translations[lang].toast;
  const tDialog = translations[lang].dialogs;

  const handleClear = useCallback(() => {
    if (window.confirm(tDialog.resetWorkflow)) {
      reset();
      setChatSessionId(prev => prev + 1); // Force chat remount to clear context cache
      setGeneratorState(GeneratorState.IDLE);
      showToast(tToast.cleared, 'info');
    }
  }, [tDialog, reset, showToast, tToast, setGeneratorState]);

  const handleRandomize = useCallback(() => {
      const random = generateRandomConcept();
      updateInput({
          intent: random.intent,
          mood: random.mood,
          instruments: random.instruments
      });
      updateExpertInput({ genre: random.genre });
      showToast(tToast.creativeBoost, 'success');
  }, [updateInput, updateExpertInput, showToast, tToast]);

  const handleExportBatch = useCallback((selectedIndices: number[]) => {
    const selected = variations.filter((_, i) => selectedIndices.includes(i));
    if (selected.length > 0 && result) {
      exportBatchAsText(selected, result.title || 'variations');
      showToast(`${selected.length} variations exported.`, 'success');
    }
  }, [variations, result, showToast]);

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    { 
      key: 'Enter', 
      ctrlKey: true, 
      handler: () => {
        // Trigger generation. The hook's `generate` function handles inputs from context internally.
        generate();
      }, 
      allowInInput: true 
    }
  ]);

  const historySummary = useMemo(() => {
      return history.slice(0, 5).map((h, i) => `${i}: ${h.result.title || "Untitled"} [${h.inputs.platform || 'suno'}]`).join('\n');
  }, [history]);

  const richLyricContext = useMemo(() => {
      const parts = [];
      if (inputs.intent) parts.push(`Topic: ${inputs.intent}`);
      if (inputs.mood) parts.push(`Mood: ${inputs.mood}`);
      if (expertInputs.genre) parts.push(`Genre: ${expertInputs.genre}`);
      if (expertInputs.era) parts.push(`Era: ${expertInputs.era}`);
      if (expertInputs.key) parts.push(`Key: ${expertInputs.key}`);
      return parts.join('. ');
  }, [inputs.intent, inputs.mood, expertInputs.genre, expertInputs.era, expertInputs.key]);
  
  const handlePresetLoad = useCallback((name: string) => {
    showToast(`${tToast.presetLoaded} ${name}`, 'success');
  }, [showToast, tToast.presetLoaded]);

  // Use the global generator state from UIContext for rendering status
  const currentGeneratorState = globalGeneratorState;

  return (
    <>
      {viewMode === 'forge' ? (
        <ForgeLayout 
            state={currentGeneratorState}
            activeAgent={activeAgent}
            researchData={researchData}
            error={error}
            onGenerate={generate}
            onClear={handleClear}
            onRandomize={handleRandomize}
            onPresetLoad={handlePresetLoad}
            onEnhance={enhance}
            onRefine={refine}
            onUpdateResult={updateResult}
            onOpenExport={() => setIsExportPanelOpen(true)}
            onGenerateVariations={generateVariations}
            onApplyVariation={applyVariation}
            onExportBatch={handleExportBatch}
            t={t}
            toast={tToast}
            isPyriteMode={isPyriteMode}
            lang={lang}
            showToast={showToast}
            richLyricContext={richLyricContext}
        />
      ) : (
        <StudioLayout 
            state={currentGeneratorState}
            activeAgent={activeAgent}
            researchData={researchData}
            error={error}
            onGenerate={generate}
            onEnhance={enhance}
            onRefine={refine}
            onUpdateResult={updateResult}
            onOpenExport={() => setIsExportPanelOpen(true)}
            onGenerateVariations={generateVariations}
            onApplyVariation={applyVariation}
            onExportBatch={handleExportBatch}
            t={t}
            toast={tToast}
            isPyriteMode={isPyriteMode}
            showToast={showToast}
        />
      )}

      <Suspense fallback={null}>
        <PyriteChat 
           key={chatSessionId}
           isPyriteMode={isPyriteMode}
           t={t}
           onUpdateConfig={(config: any) => {
               updateInput(config);
               updateExpertInput(config);
           }}
           onReset={handleClear}
           onMutate={(field, content) => updateResult({ [field]: content })}
           onLoadHistory={(index) => { 
                const item = history[index];
                if (item) {
                    loadFromHistory(item);
                    showToast(`Loaded "${item.result.title || 'Untitled'}"`, 'success');
                } else {
                    showToast("History item not found.", 'error');
                }
           }}
           onAutoFixRiffusion={() => {}}
           currentResult={result}
           historySummary={historySummary}
           validationReport={""}
           inputs={inputs} 
           expertInputs={expertInputs}
        />
      </Suspense>

      {isExportPanelOpen && result && (
          <ExportPanel
            isOpen={isExportPanelOpen}
            onClose={() => setIsExportPanelOpen(false)}
            result={result}
            inputs={inputs}
            expertInputs={expertInputs}
            isExpertMode={isExpertMode}
            isPyriteMode={isPyriteMode}
            t={t}
            toast={tToast}
            showToast={showToast}
          />
      )}
    </>
  );
};

export default PromptBuilder;
