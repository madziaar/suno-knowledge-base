
import React from 'react';
import ConfigForm from '../components/ConfigForm';
import ResultsDisplay from '../components/ResultsDisplay';
import { usePromptState } from '../../../contexts';
import { GeneratorState, GeneratedPrompt, BatchConstraints, BuilderTranslation, ToastTranslation, AgentType, GroundingChunk } from '../../../types';
import { StyleComponents } from '../utils/styleBuilder';
import { cn } from '@/lib/utils';
import StatusLog from '../components/StatusLog/index';

interface ForgeLayoutProps {
  state: GeneratorState;
  activeAgent: AgentType;
  researchData: { text: string; sources: GroundingChunk[] } | null;
  error: string;
  
  onGenerate: (structuredStyle?: StyleComponents) => void;
  onClear: () => void;
  onRandomize: () => void;
  onPresetLoad: (name: string) => void;
  
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
  lang: 'en' | 'pl';
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  
  richLyricContext: string;
}

export const ForgeLayout: React.FC<ForgeLayoutProps> = ({
  state, activeAgent, researchData, error,
  onGenerate, onClear, onRandomize, onPresetLoad,
  onEnhance, onRefine, onUpdateResult, onOpenExport,
  onGenerateVariations, onApplyVariation, onExportBatch,
  t, toast, isPyriteMode, lang, showToast, richLyricContext
}) => {
  const { inputs, result, variations, isGeneratingVariations } = usePromptState();

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* FORM SIDE: The Brain */}
      <div className="w-full lg:w-[45%] sticky top-24 space-y-6">
        <ConfigForm
            state={state}
            onGenerate={onGenerate}
            onClear={onClear}
            t={t}
            toast={toast}
            isPyriteMode={isPyriteMode}
            lang={lang}
            onPresetLoad={onPresetLoad}
            showToast={showToast}
            richLyricContext={richLyricContext}
            onRandomize={onRandomize}
        />
        
        {/* Integrated Status Feed (Forge Only) */}
        <div className="hidden lg:block">
           <StatusLog 
              state={state}
              activeAgent={activeAgent}
              researchData={researchData}
              t={t}
              isPyriteMode={isPyriteMode}
              errorMessage={error}
              producerPersona={inputs.producerPersona}
           />
        </div>
      </div>

      {/* RESULTS SIDE: The Output */}
      <div className="w-full lg:w-[55%] min-h-[600px]">
        <ResultsDisplay 
            result={result}
            state={state}
            showLyrics={inputs.mode === 'custom' || inputs.mode === 'instrumental'}
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
