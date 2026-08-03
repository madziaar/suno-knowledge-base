
import React from 'react';
import StudioPanel from '../components/StudioPanel';
import StatusLog from '../components/StatusLog/index';
import ResultsDisplay from '../components/ResultsDisplay';
import { usePromptState } from '../../../contexts';
import { GeneratorState, GeneratedPrompt, BatchConstraints, BuilderTranslation, ToastTranslation, AgentType, GroundingChunk } from '../../../types';
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
  const { inputs, result, variations, isGeneratingVariations } = usePromptState();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 relative">
      <div className="space-y-6">
        <StudioPanel
            t={t}
            toast={toast}
            isPyriteMode={isPyriteMode}
            showToast={showToast}
            onGenerate={onGenerate}
            state={state}
        />

        <StatusLog 
            state={state}
            activeAgent={activeAgent}
            researchData={researchData}
            processingStep={0} 
            steps={['analyzing', 'structuring', 'adlibs', 'tags', 'finalizing']}
            t={t}
            isPyriteMode={isPyriteMode}
            errorMessage={error}
            lastSaved={null} 
        />
      </div>

      <div className="space-y-6">
        <ResultsDisplay 
            result={result}
            state={state}
            showLyrics={true} // Studio always shows full data
            onEnhance={onEnhance}
            onRefine={onRefine}
            onOpenExport={onOpenExport}
            onUpdateResult={onUpdateResult}
            t={t}
            toast={toast}
            isPyriteMode={isPyriteMode}
            showToast={showToast}
            platform={inputs.platform}
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
