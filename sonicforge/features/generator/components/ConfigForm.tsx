
import React, { useCallback, useState, useMemo } from 'react';
import { Layers, Scan, Workflow } from 'lucide-react';
import { BuilderTranslation, GeneratorState, ToastTranslation } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Textarea } from '../../../components/ui/Input';
import { sfx } from '../../../lib/audio';
import { cn } from '../../../lib/utils';
import { StyleComponents } from '../utils/styleBuilder';
import { usePromptState } from '../../../contexts/PromptContext';
import { usePromptActions, useGenerationWorkflow } from '../hooks';
import AudioUploader from './AudioUploader';
import AlchemyScanner from './Alchemy/AlchemyScanner';
import GenreOptimizationTips from './GenreOptimizationTips';

import ControlBar from './forms/ControlBar';
import ConceptForm from './forms/ConceptForm';

interface ConfigFormProps {
  state: GeneratorState;
  onGenerate: (structuredStyle?: StyleComponents) => void;
  onClear: () => void;
  t: BuilderTranslation;
  toast: ToastTranslation;
  isPyriteMode: boolean;
  lang: 'en' | 'pl';
  onPresetLoad: (name: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  richLyricContext: string;
  onRandomize?: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  state, onGenerate, onClear,
  t, toast, isPyriteMode, lang, onPresetLoad, showToast,
  richLyricContext,
  onRandomize
}) => {
  const { inputs, expertInputs } = usePromptState();
  const { updateInput, setWorkflow } = usePromptActions();
  const { performAlchemyAnalysis, performYouTubeAnalysis } = useGenerationWorkflow('forge');

  const [alchemyFileName, setAlchemyFileName] = useState<string | null>(null);
  
  const workflow = inputs.workflow || 'forge';
  const alchemyMode = inputs.alchemyMode || 'vocals';

  const handleSetWorkflow = (newWorkflow: 'forge' | 'alchemy') => {
      setWorkflow(newWorkflow);
      sfx.play('click');
  };

  const handleSetAlchemyMode = (newMode: any) => {
      updateInput({ alchemyMode: newMode });
      sfx.play('light');
  };

  const handleAudioSelected = (base64: string, mimeType: string, name: string) => {
      setAlchemyFileName(name);
      performAlchemyAnalysis(base64, mimeType);
  };

  const handleUrlSelected = (url: string) => {
      setAlchemyFileName("YouTube Interception");
      performYouTubeAnalysis(url);
  };

  const handleGenerateClick = useCallback(() => {
      const structuredStyle: StyleComponents = {
          genres: expertInputs.genre ? expertInputs.genre.split(',').map(g => g.trim()) : [],
          subGenres: [],
          moods: inputs.mood ? inputs.mood.split(',').map(s=>s.trim()) : [],
          vocals: [],
          vocalStyle: expertInputs.vocalStyle,
          bpm: expertInputs.bpm,
          key: expertInputs.key,
          era: expertInputs.era,
          instruments: (expertInputs.instrumentStyle || inputs.instruments || '').split(',').map(s=>s.trim()).filter(Boolean),
          atmosphere: (expertInputs.atmosphereStyle || '').split(',').map(s=>s.trim()).filter(Boolean),
          production: (expertInputs.techAnchor || '').split(',').map(s=>s.trim()).filter(Boolean),
          influences: inputs.artistReference ? [inputs.artistReference] : []
      };
      onGenerate(structuredStyle);
  }, [inputs, expertInputs, onGenerate]);

  const isGenerating = state === GeneratorState.GENERATING || state === GeneratorState.RESEARCHING || state === GeneratorState.ANALYZING || state === GeneratorState.OPTIMIZING;

  return (
    <div className="relative flex flex-col h-full space-y-8 pb-32">
      {/* GLOBAL WORKFLOW SWITCHER */}
      <div className="flex p-1.5 bg-zinc-950/80 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
          <button 
              onClick={() => handleSetWorkflow('forge')}
              className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-xs font-bold uppercase transition-all duration-500",
                  workflow === 'forge' 
                      ? (isPyriteMode ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "bg-yellow-500 text-black")
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
          >
              <Layers className="w-4 h-4" />
              Forge
          </button>
          <button 
              onClick={() => handleSetWorkflow('alchemy')}
              className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-xs font-bold uppercase transition-all duration-500",
                  workflow === 'alchemy' 
                      ? (isPyriteMode ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "bg-blue-600 text-white")
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
          >
              <Scan className="w-4 h-4" />
              Alchemy
          </button>
      </div>

      {workflow === 'forge' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
              <ControlBar 
                onPresetLoad={onPresetLoad} 
                onClear={onClear} 
                onRandomize={onRandomize || (() => {})} 
                onShare={() => {}} 
                onUserPresetLoad={() => {}} 
                onPresetChange={() => {}} 
                t={t} 
                isPyriteMode={isPyriteMode} 
                lang={lang} 
                showToast={showToast} 
              />
              
              <ConceptForm t={t} isPyriteMode={isPyriteMode} />
          </div>
      ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex gap-1.5 justify-center p-1 bg-black/40 rounded-xl border border-white/5">
                  {['vocals', 'instrumental', 'inspire', 'cover', 'mashup'].map((m) => (
                      <button
                          key={m}
                          onClick={() => handleSetAlchemyMode(m)}
                          className={cn(
                              "flex-1 px-2 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border",
                              alchemyMode === m 
                                  ? (isPyriteMode ? "bg-purple-600 text-white border-purple-500 shadow-md" : "bg-blue-600 text-white border-blue-500 shadow-md")
                                  : "bg-transparent text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300"
                          )}
                      >
                          {m}
                      </button>
                  ))}
              </div>

              <AlchemyScanner isAnalyzing={state === GeneratorState.ANALYZING} fileName={alchemyFileName} isPyriteMode={isPyriteMode} />
              
              {alchemyMode === 'mashup' ? (
                  <div className="space-y-6">
                      <Card variant={isPyriteMode ? 'pyrite' : 'default'} className="p-4 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                              <Workflow className="w-4 h-4 text-purple-400" />
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Collider Sources</span>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                              <Textarea 
                                  value={inputs.mashupSourceA || ''}
                                  onChange={(e) => updateInput({ mashupSourceA: e.target.value })}
                                  placeholder="Source Track A DNA..."
                                  className="h-24 text-xs font-mono"
                                  isPyrite={isPyriteMode}
                              />
                              <Textarea 
                                  value={inputs.mashupSourceB || ''}
                                  onChange={(e) => updateInput({ mashupSourceB: e.target.value })}
                                  placeholder="Source Track B DNA..."
                                  className="h-24 text-xs font-mono"
                                  isPyrite={isPyriteMode}
                              />
                          </div>
                      </Card>
                      <Card variant={isPyriteMode ? 'pyrite' : 'default'} className="p-4 space-y-4 border-dashed">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Transformation</span>
                          <Textarea 
                              value={inputs.intent}
                              onChange={(e) => updateInput({ intent: e.target.value })}
                              placeholder="Describe the collision vibe..."
                              className="h-24 text-xs font-mono"
                              isPyrite={isPyriteMode}
                          />
                      </Card>
                  </div>
              ) : (
                  <div className="space-y-6">
                      <AudioUploader 
                          onAudioSelected={(base64, mime) => handleAudioSelected(base64, mime, "Spectral Signal")} 
                          onUrlSelected={handleUrlSelected}
                          onClear={() => { setAlchemyFileName(null); onClear(); }} 
                          isAnalyzing={state === GeneratorState.ANALYZING} 
                          t={t} 
                          isPyriteMode={isPyriteMode} 
                      />

                      <Card variant={isPyriteMode ? 'pyrite' : 'default'} className="p-4 space-y-4">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Transformation Intent</span>
                          <Textarea 
                              value={inputs.intent}
                              onChange={(e) => updateInput({ intent: e.target.value })}
                              placeholder="How shall we re-architect this signal?"
                              className="h-24 text-xs font-mono"
                              isPyrite={isPyriteMode}
                          />
                      </Card>
                  </div>
              )}
          </div>
      )}

      {/* STICKY FOOTER ACTION */}
      <div className={cn(
          "fixed bottom-24 md:bottom-6 left-0 right-0 z-50 px-4 md:px-6 pointer-events-none transition-all duration-500",
          "lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:px-0 lg:translate-y-0"
      )}>
        <div className="max-w-4xl mx-auto pointer-events-auto">
            <Button 
                onClick={handleGenerateClick}
                isLoading={isGenerating}
                variant="primary"
                isPyrite={isPyriteMode}
                className="w-full py-5 text-sm md:text-base shadow-2xl font-mono tracking-widest rounded-2xl group border-t border-white/10"
                icon={isGenerating ? null : <Workflow className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
            >
                {isGenerating ? "NEURAL_CASCADE_ACTIVE..." : (workflow === 'alchemy' ? "INITIATE TRANSMUTATION" : t.buttons?.forge)}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConfigForm);
