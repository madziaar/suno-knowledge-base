
import React, { useCallback } from 'react';
import StudioPanel from '../components/StudioPanel';
import ResultsDisplay from '../components/ResultsDisplay';
import StemTerminal from '../components/Studio/StemTerminal';
import TapeMachine from '../../../components/shared/TapeMachine';
import { usePromptState } from '../../../contexts';
import { usePromptActions } from '../hooks/usePromptActions';
import { GeneratorState, GeneratedPrompt, BatchConstraints, BuilderTranslation, ToastTranslation, AgentType, GroundingChunk, StemWeights } from '../../../types';
import { StyleComponents } from '../utils/styleBuilder';

interface StudioLayoutProps {
  state: GeneratorState;
  activeAgent: AgentType;
  researchData: { text: string; sources: GroundingChunk[] } | null;
  error: string;
  
  onGenerate: (structuredStyle?: StyleComponents) => void;
  
  onEnhance: (field: 'tags' | 'style', inputStr: string) => void;
  onRefine: (instruction: string) => void;
  onUpdateResult: (partial: Partial<GeneratedPrompt>) => void;
  onOpenExport: () => void;
  
  onGenerateVariations: (count: number, level: 'light' | 'medium' | 'heavy', constraints: BatchConstraints) => void;
  onApplyVariation: (variation: GeneratedPrompt) => void;
  onExportBatch: (selectedIndices: number[]) => void;
  
  t: BuilderTranslation;
  toast: ToastTranslation;
  isPyriteMode: boolean;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  state, activeAgent, researchData, error,
  onGenerate,
  onEnhance, onRefine, onUpdateResult, onOpenExport,
  onGenerateVariations, onApplyVariation, onExportBatch,
  t, toast, isPyriteMode, showToast
}) => {
  const { result, variations, isGeneratingVariations, expertInputs } = usePromptState();
  const { updateExpertInput } = usePromptActions();
  
  const isGenerating = state === GeneratorState.RESEARCHING || state === GeneratorState.ANALYZING || state === GeneratorState.GENERATING;

  const handleWeightChange = useCallback((weights: StemWeights) => {
      updateExpertInput({ stemWeights: weights });
  }, [updateExpertInput]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 relative">
      <div className="space-y-6">
        <TapeMachine isActive={isGenerating} isPyriteMode={isPyriteMode} />

        <StudioPanel
            t={t}
            toast={toast}
            isPyriteMode={isPyriteMode}
            showToast={showToast}
            onGenerate={onGenerate}
            state={state}
        />

        <StemTerminal 
            isPyriteMode={isPyriteMode} 
            weights={expertInputs.stemWeights}
            onWeightChange={handleWeightChange} 
        />
      </div>

      <div className="space-y-6">
        <ResultsDisplay 
            result={result}
            state={state}
            showLyrics={true}
            onEnhance={onEnhance}
            onRefine={onRefine}
            onOpenExport={onOpenExport}
            onUpdateResult={onUpdateResult}
            t={t}
            toast={toast}
            isPyriteMode={isPyriteMode}
            showToast={showToast}
            variations={variations}
            isGeneratingVariations={isGeneratingVariations}
            onGenerateVariations={onGenerateVariations}
            onApplyVariation={onApplyVariation}
            onExportBatch={onExportBatch}
        />
      </div>
    </div>
  );
};
