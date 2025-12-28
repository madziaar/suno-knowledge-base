
import React, { useCallback, useMemo, Suspense, useState } from 'react';
import { GeneratorState } from '../../types';
import { translations } from '../../translations';
import { exportBatchAsText } from '../../lib/export-utils';
import { useSettings, useUI, useHistory, usePrompt } from '../../contexts';
import ExportPanel from './components/ExportPanel';
import { ForgeLayout } from './layouts/ForgeLayout';
import { StudioLayout } from './layouts/StudioLayout';
import StatusLog from './StatusLog/index';
import { useKeyboardShortcuts } from '../../lib/utils';
import { generateRandomConcept } from './utils';
import { usePromptActions, useGenerationWorkflow, useHistoryActions } from './hooks';

const PyriteChat = React.lazy(() => import('../chat/PyriteChat'));

interface PromptBuilderProps {
    viewMode?: 'forge' | 'studio';
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({ viewMode = 'forge' }) => {
  const { lang, isPyriteMode } = useSettings();
  const { showToast, setGeneratorState, generatorState: globalGeneratorState } = useUI();
  const { history } = useHistory();
  
  const { inputs, expertInputs, isExpertMode, result, variations } = usePrompt();
  const { updateInput, updateExpertInput, reset } = usePromptActions();

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
  
  const { loadFromHistory } = useHistoryActions();

  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);

  // Use safer translation lookup with explicit fallbacks
  const currentTranslations = useMemo(() => translations[lang] || translations['en'], [lang]);
  const t = currentTranslations?.builder || translations['en'].builder;
  const tToast = currentTranslations?.toast || translations['en'].toast;
  const tDialog = currentTranslations?.dialogs || translations['en'].dialogs;

  const handleClear = useCallback(() => {
    const msg = tDialog?.resetWorkflow || "Reset workflow?";
    if (window.confirm(msg)) {
      reset();
      setChatSessionId(prev => prev + 1);
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

  useKeyboardShortcuts([
    { 
      key: 'Enter', 
      ctrlKey: true, 
      handler: () => { generate(); }, 
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

  const currentGeneratorState = globalGeneratorState;

  return (
    <>
      <StatusLog 
          state={currentGeneratorState}
          activeAgent={activeAgent}
          researchData={researchData}
          t={t}
          isPyriteMode={isPyriteMode}
          errorMessage={error}
          producerPersona={inputs.producerPersona}
      />

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
           tDialog={tDialog}
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
