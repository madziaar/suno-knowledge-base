
import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Loader2, Music2, Wand2, Settings2, Sliders, Layers, Mic2, Cpu, ToggleLeft, ToggleRight, Radio, BrainCircuit, ChevronDown, ChevronRight } from 'lucide-react';
import { BuilderTranslation, GeneratorState, ToastTranslation, SongSection } from '../../../types';
import ExpertGlobalPanel from './ExpertGlobalPanel';
import StructureBuilder from './StructureBuilder';
import { usePromptState } from '../../../contexts/PromptContext';
import { usePromptActions } from '../hooks/usePromptActions';
import ThemedButton from '../../../components/shared/ThemedButton';
import { cn } from '../../../lib/utils';
import { StyleComponents } from '../utils/styleBuilder';
import VocalStyleDesigner from './inputs/VocalStyleDesigner';
import InstrumentDesigner from './inputs/InstrumentDesigner';
import AtmosphereDesigner from './inputs/AtmosphereDesigner';
import SpecialTechniquesPanel from './inputs/SpecialTechniquesPanel';
import SmartLyricEditor from './SmartLyricEditor';
import { sfx } from '../../../lib/audio';
import { motion, AnimatePresence } from 'framer-motion';

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
type RackSection = 'instruments' | 'atmosphere' | 'vocals';

const StudioPanel: React.FC<StudioPanelProps> = ({ t, toast, isPyriteMode, showToast, onGenerate, state }) => {
  const { expertInputs, inputs } = usePromptState();
  const { updateExpertInput, updateInput, setState } = usePromptActions();
  const [activeTab, setActiveTab] = useState<StudioTab>('rack');
  
  // Mobile Accordion State for Rack
  const [mobileRackSection, setMobileRackSection] = useState<RackSection | null>('instruments');
  const [isMobile, setIsMobile] = useState(false);

  // New Studio-Specific State Handling
  const isRawMode = expertInputs.isRawMode || false;
  const aiModel = expertInputs.aiModel || 'gemini-3-pro';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const toggleRackSection = (section: RackSection) => {
      if (mobileRackSection === section) {
          setMobileRackSection(null);
      } else {
          setMobileRackSection(section);
          sfx.play('click');
      }
  };

  // Helper to trigger generation with Expert context
  const handleGenerateClick = () => {
      // In Studio mode, we construct the style components fully from the expert inputs
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

  // Colors
  const tabActive = isPyriteMode ? 'bg-purple-600/20 text-purple-300 border-purple-500/50' : 'bg-blue-600/20 text-blue-400 border-blue-500/50';
  const tabInactive = 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border-transparent';

  const AccordionHeader = ({ section, label, icon: Icon }: { section: RackSection, label: string, icon: React.ElementType }) => (
      <button 
        onClick={() => toggleRackSection(section)}
        className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl border transition-all mb-2",
            mobileRackSection === section 
                ? (isPyriteMode ? "bg-purple-900/20 border-purple-500/40 text-purple-200" : "bg-blue-900/20 border-blue-500/40 text-blue-200")
                : "bg-zinc-900/50 border-white/5 text-zinc-400"
        )}
      >
          <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
          </div>
          {mobileRackSection === section ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
  );

  return (
    <div className="flex flex-col h-full relative bg-zinc-950/50 rounded-2xl border border-white/5 overflow-hidden">
      
      {/* Studio Header & Global Controls */}
      <div className="p-4 border-b border-white/5 bg-black/20 shrink-0">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg border", isPyriteMode ? "bg-purple-900/20 border-purple-500/30 text-purple-400" : "bg-blue-900/20 border-blue-500/30 text-blue-400")}>
                    <Settings2 className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-1">{t.studio.title}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{t.studio.subtitle}</p>
                </div>
            </div>
            
            {/* Logic Switches */}
            <div className="flex gap-2">
                <button 
                    onClick={toggleModel}
                    className={cn("px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[10px] font-bold uppercase transition-all", 
                        aiModel === 'gemini-3-pro' 
                            ? (isPyriteMode ? "bg-purple-900/30 border-purple-500/50 text-purple-300" : "bg-blue-900/30 border-blue-500/50 text-blue-300")
                            : "bg-zinc-900 border-zinc-700 text-zinc-500"
                    )}
                    title={t.studio.toggles.modelSwitch}
                >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    {aiModel === 'gemini-3-pro' ? t.studio.toggles.pro : t.studio.toggles.flash}
                </button>

                <button 
                    onClick={toggleRawMode}
                    className={cn("px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[10px] font-bold uppercase transition-all", 
                        isRawMode 
                            ? "bg-red-900/30 border-red-500/50 text-red-300"
                            : "bg-zinc-900 border-zinc-700 text-zinc-500"
                    )}
                    title={t.studio.toggles.bypass}
                >
                    <Cpu className="w-3.5 h-3.5" />
                    {isRawMode ? t.studio.toggles.raw : t.studio.toggles.smart}
                </button>
            </div>
        </div>

        {/* Global Panel (Always Visible) */}
        <ExpertGlobalPanel 
            expertInputs={expertInputs}
            setExpertInputs={(fnOrVal) => {
                const newVal = typeof fnOrVal === 'function' ? fnOrVal(expertInputs) : fnOrVal;
                updateExpertInput(newVal);
            }}
            isPyriteMode={isPyriteMode}
            t={t}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/40">
          <button 
            onClick={() => setActiveTab('rack')}
            className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all", activeTab === 'rack' ? tabActive : tabInactive)}
          >
            <Sliders className="w-3.5 h-3.5" /> {t.studio.tabs.rack}
          </button>
          <button 
            onClick={() => setActiveTab('structure')}
            className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all", activeTab === 'structure' ? tabActive : tabInactive)}
          >
            <Layers className="w-3.5 h-3.5" /> {t.studio.tabs.sequencer}
          </button>
          <button 
            onClick={() => setActiveTab('lyrics')}
            className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all", activeTab === 'lyrics' ? tabActive : tabInactive)}
          >
            <Mic2 className="w-3.5 h-3.5" /> {t.studio.tabs.lyrics}
          </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 custom-scrollbar bg-black/10">
        <Suspense fallback={<LoadingFallback />}>
            <div className="p-4 space-y-6">
                
                {/* RACK TAB */}
                {activeTab === 'rack' && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        {isMobile ? (
                            // Mobile Accordion View
                            <div className="space-y-1">
                                <AccordionHeader section="instruments" label={t.expert.categories.instrumentation} icon={Music2} />
                                <AnimatePresence>
                                    {mobileRackSection === 'instruments' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                                            <InstrumentDesigner
                                                value={expertInputs.instrumentStyle || ''}
                                                onChange={(newValue) => updateExpertInput({ instrumentStyle: newValue })}
                                                genre={expertInputs.genre}
                                                isPyriteMode={isPyriteMode}
                                                t={t}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AccordionHeader section="atmosphere" label={t.expert.categories.tech} icon={Wand2} />
                                <AnimatePresence>
                                    {mobileRackSection === 'atmosphere' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                                            <AtmosphereDesigner
                                                value={expertInputs.atmosphereStyle || ''}
                                                onChange={(newValue) => updateExpertInput({ atmosphereStyle: newValue })}
                                                isPyriteMode={isPyriteMode}
                                                t={t}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AccordionHeader section="vocals" label={t.expert.categories.vocals} icon={Mic2} />
                                <AnimatePresence>
                                    {mobileRackSection === 'vocals' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                                            <VocalStyleDesigner 
                                                value={expertInputs.vocalStyle || ''}
                                                onChange={(newValue) => updateExpertInput({ vocalStyle: newValue })}
                                                genre={expertInputs.genre}
                                                isPyriteMode={isPyriteMode}
                                                t={t}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            // Desktop Stacked View
                            <div className="space-y-6">
                                <InstrumentDesigner
                                    value={expertInputs.instrumentStyle || ''}
                                    onChange={(newValue) => updateExpertInput({ instrumentStyle: newValue })}
                                    genre={expertInputs.genre}
                                    isPyriteMode={isPyriteMode}
                                    t={t}
                                />
                                <AtmosphereDesigner
                                    value={expertInputs.atmosphereStyle || ''}
                                    onChange={(newValue) => updateExpertInput({ atmosphereStyle: newValue })}
                                    isPyriteMode={isPyriteMode}
                                    t={t}
                                />
                                <VocalStyleDesigner 
                                    value={expertInputs.vocalStyle || ''}
                                    onChange={(newValue) => updateExpertInput({ vocalStyle: newValue })}
                                    genre={expertInputs.genre}
                                    isPyriteMode={isPyriteMode}
                                    t={t}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* SEQUENCER TAB */}
                {activeTab === 'structure' && (
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                        <StructureBuilder 
                            sections={expertInputs.structure}
                            setSections={(newSections: SongSection[] | ((prev: SongSection[]) => SongSection[])) => {
                                updateExpertInput({ 
                                    structure: typeof newSections === 'function' ? newSections(expertInputs.structure) : newSections 
                                });
                            }}
                            t={t}
                            isPyriteMode={isPyriteMode}
                            lyrics={inputs.lyricsInput}
                        />
                        <SpecialTechniquesPanel isPyriteMode={isPyriteMode} />
                    </div>
                )}

                {/* LYRICS TAB */}
                {activeTab === 'lyrics' && (
                    <div className="animate-in fade-in slide-in-from-right-4 h-[500px]">
                        <SmartLyricEditor 
                            value={inputs.lyricsInput}
                            onChange={(val) => updateInput({ lyricsInput: val })}
                            placeholder="Enter lyrics..."
                            isPyriteMode={isPyriteMode}
                            context={inputs.intent}
                            genre={expertInputs.genre}
                            lang={'en'} // Should be dynamic
                        />
                    </div>
                )}
            </div>
        </Suspense>
      </div>

      {/* Sticky Action Bar */}
      <div className={cn(
          "sticky bottom-0 z-20 pb-4 pt-4 px-4 bg-zinc-950 border-t border-white/5",
          isPyriteMode ? 'shadow-[0_-10px_40px_rgba(168,85,247,0.1)]' : 'shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
      )}>
        <ThemedButton 
            onClick={handleGenerateClick}
            isLoading={isGenerating}
            variant={isPyriteMode ? 'pyrite' : 'default'}
            className={cn(
                "w-full py-4 text-base shadow-xl font-mono tracking-widest",
                isRawMode && "border-red-500 shadow-red-900/20"
            )}
            icon={isGenerating ? null : <Cpu className="w-5 h-5" />}
        >
            {isGenerating 
            ? (state === GeneratorState.RESEARCHING ? t.studio.generate.scanning : t.studio.generate.compiling) 
            : (isRawMode ? t.studio.generate.raw : t.studio.generate.studio)
            }
        </ThemedButton>
      </div>
    </div>
  );
};

export default StudioPanel;
