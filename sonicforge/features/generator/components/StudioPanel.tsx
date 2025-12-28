
import React, { Suspense, useState, useCallback } from 'react';
import { Loader2, Settings2, Sliders, Layers, Mic2, Cpu, BrainCircuit } from 'lucide-react';
import { BuilderTranslation, GeneratorState, ToastTranslation, SongSection, ProducerPersona } from '../../../types';
import ExpertGlobalPanel from './ExpertGlobalPanel';
import StructureBuilder from './StructureBuilder';
import DraftHealth from './DraftHealth';
import { usePromptBuilder } from '../../../contexts/PromptContext';
import ThemedButton from '../../../components/shared/ThemedButton';
import { cn } from '../../../lib/utils';
import { StyleComponents, assembleStylePrompt } from '../utils/styleBuilder';
import VocalStyleDesigner from './inputs/VocalStyleDesigner';
import InstrumentDesigner from './inputs/InstrumentDesigner';
import AtmosphereDesigner from './inputs/AtmosphereDesigner';
import SpecialTechniquesPanel from './inputs/SpecialTechniquesPanel';
import LyricalArchitect from './Studio/LyricalArchitect';
import SignalChain from './Studio/SignalChain';
import { sfx } from '../../../lib/audio';
import { useGenerationWorkflow } from '../hooks/useGenerationWorkflow';
import PersonaSelector from '../../../components/shared/PersonaSelector';

interface StudioPanelProps {
  t: BuilderTranslation;
  toast: ToastTranslation;
  isPyriteMode: boolean;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onGenerate: (structuredStyle?: StyleComponents) => void;
  state: GeneratorState;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
  </div>
);

type StudioTab = 'rack' | 'structure' | 'lyrics';

const StudioPanel: React.FC<StudioPanelProps> = ({ t, toast, isPyriteMode, showToast, onGenerate, state }) => {
  const { expertInputs, inputs, updateExpertInput, updateInput } = usePromptBuilder();
  const { optimizeDraft } = useGenerationWorkflow('studio');
  const [activeTab, setActiveTab] = useState<StudioTab>('rack');
  
  const aiModel = expertInputs.aiModel || 'gemini-3-pro';
  const isRawMode = expertInputs.isRawMode || false;

  const toggleRawMode = () => {
      updateExpertInput({ isRawMode: !isRawMode });
      sfx.play('toggle');
      showToast(!isRawMode ? t.studio.toggles.raw : t.studio.toggles.smart, 'info');
  };

  const toggleModel = () => {
      const newModel = aiModel === 'gemini-3-pro' ? 'gemini-2.5-flash' : 'gemini-3-pro';
      updateExpertInput({ aiModel: newModel });
      sfx.play('click');
  };

  const handlePersonaChange = (persona: ProducerPersona, customPrompt?: string) => {
      updateInput({ producerPersona: persona });
      if (customPrompt) {
          updateExpertInput({ customPersona: customPrompt });
      }
      sfx.play('click');
  };

  const currentStylePrompt = assembleStylePrompt({
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
  });

  const handleGenerateClick = () => {
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
  };

  const isGenerating = state === GeneratorState.RESEARCHING || state === GeneratorState.ANALYZING;

  const tabActive = isPyriteMode ? 'bg-purple-600/20 text-purple-300 border-purple-500/50' : 'bg-blue-600/20 text-blue-400 border-blue-500/50';
  const tabInactive = 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-transparent';

  return (
    <div className="flex flex-col h-full relative bg-zinc-950/50 rounded-2xl border border-white/5 overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 border-b border-white/5 bg-black/20 shrink-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg border", isPyriteMode ? "bg-purple-900/20 border-purple-500/30 text-purple-400" : "bg-blue-900/20 border-blue-500/30 text-blue-400")}>
                    <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                    <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest leading-none mb-1">{t.studio.title}</h3>
                    <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono">{t.studio.subtitle}</p>
                </div>
            </div>
            
            <div className="flex gap-1.5 md:gap-2">
                <PersonaSelector value={inputs.producerPersona || 'standard'} onChange={handlePersonaChange} />
                <button onClick={toggleModel} className={cn("px-2 md:px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase transition-all", aiModel === 'gemini-3-pro' ? (isPyriteMode ? "bg-purple-900/30 border-purple-500/50 text-purple-300" : "bg-blue-900/30 border-blue-500/50 text-blue-300") : "bg-zinc-900 border-zinc-700 text-zinc-500")}>
                    <BrainCircuit className="w-3 h-3" />
                    {aiModel === 'gemini-3-pro' ? "Pro" : "Flash"}
                </button>
                <button onClick={toggleRawMode} className={cn("px-2 md:px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase transition-all", isRawMode ? "bg-red-900/30 border-red-500/50 text-red-300" : "bg-zinc-900 border-zinc-700 text-zinc-500")}>
                    <Cpu className="w-3 h-3" />
                    {isRawMode ? "Raw" : "Smart"}
                </button>
            </div>
        </div>

        <DraftHealth 
          isPyriteMode={isPyriteMode} 
          onOptimize={optimizeDraft}
          isLoading={state === GeneratorState.OPTIMIZING}
        />

        <ExpertGlobalPanel 
            expertInputs={expertInputs}
            setExpertInputs={(val: any) => updateExpertInput(typeof val === 'function' ? val(expertInputs) : val)}
            isPyriteMode={isPyriteMode}
            t={t}
        />
      </div>

      {/* Signal Chain Visualizer */}
      <div className="bg-black/40 border-b border-white/5 p-2">
          <SignalChain stylePrompt={currentStylePrompt} isPyriteMode={isPyriteMode} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/40 shrink-0">
          <button onClick={() => setActiveTab('rack')} className={cn("flex-1 py-3 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all", activeTab === 'rack' ? tabActive : tabInactive)}><Sliders className="w-3.5 h-3.5" /> {t.studio.tabs.rack}</button>
          <button onClick={() => setActiveTab('structure')} className={cn("flex-1 py-3 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all", activeTab === 'structure' ? tabActive : tabInactive)}><Layers className="w-3.5 h-3.5" /> {t.studio.tabs.sequencer}</button>
          <button onClick={() => setActiveTab('lyrics')} className={cn("flex-1 py-3 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all", activeTab === 'lyrics' ? tabActive : tabInactive)}><Mic2 className="w-3.5 h-3.5" /> {t.studio.tabs.lyrics}</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-48 md:pb-32 custom-scrollbar bg-black/10">
        <Suspense fallback={<LoadingFallback />}>
            <div className="p-4 space-y-6">
                {activeTab === 'rack' && (
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                        <InstrumentDesigner value={expertInputs.instrumentStyle || ''} onChange={(newValue) => updateExpertInput({ instrumentStyle: newValue })} genre={expertInputs.genre} isPyriteMode={isPyriteMode} t={t} />
                        <AtmosphereDesigner value={expertInputs.atmosphereStyle || ''} onChange={(newValue) => updateExpertInput({ atmosphereStyle: newValue })} isPyriteMode={isPyriteMode} t={t} />
                        <VocalStyleDesigner value={expertInputs.vocalStyle || ''} onChange={(newValue) => updateExpertInput({ vocalStyle: newValue })} genre={expertInputs.genre} isPyriteMode={isPyriteMode} t={t} />
                    </div>
                )}
                {activeTab === 'structure' && (
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                        <StructureBuilder sections={expertInputs.structure} setSections={(newSections: SongSection[] | ((prev: SongSection[]) => SongSection[])) => { updateExpertInput({ structure: typeof newSections === 'function' ? newSections(expertInputs.structure) : newSections }); }} t={t} isPyriteMode={isPyriteMode} lyrics={inputs.lyricsInput} />
                        <SpecialTechniquesPanel isPyriteMode={isPyriteMode} />
                    </div>
                )}
                {activeTab === 'lyrics' && (
                    <div className="animate-in fade-in slide-in-from-right-4 h-[500px]">
                        <LyricalArchitect 
                            value={inputs.lyricsInput} 
                            onChange={(val) => updateInput({ lyricsInput: val })} 
                            isPyriteMode={isPyriteMode} 
                            genre={expertInputs.genre}
                            targetLyricsLang={inputs.lyricsLanguage}
                        />
                    </div>
                )}
            </div>
        </Suspense>
      </div>

      <div className={cn(
          "sticky bottom-0 z-20 pb-20 pt-4 px-4 bg-zinc-950 border-t border-white/5 md:pb-4",
          isPyriteMode ? 'shadow-[0_-10px_40px_rgba(168,85,247,0.1)]' : 'shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
      )}>
        <ThemedButton 
            onClick={handleGenerateClick}
            isLoading={isGenerating}
            variant={isPyriteMode ? 'pyrite' : 'default'}
            className={cn("w-full py-4 text-sm md:text-base shadow-xl font-mono tracking-widest", isRawMode && "border-red-500 shadow-red-900/20")}
            icon={isGenerating ? null : <Cpu className="w-5 h-5" />}
        >
            {isGenerating ? (state === GeneratorState.RESEARCHING ? "SCANNING..." : "COMPILING...") : (isRawMode ? "EXECUTE RAW" : "RENDER STUDIO")}
        </ThemedButton>
      </div>
    </div>
  );
};

export default StudioPanel;
