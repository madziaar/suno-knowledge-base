
import React, { memo, useState, useCallback, useMemo } from 'react';
import { Layers, BookOpen, UserCog, Save, Terminal, Zap } from 'lucide-react';
import { ExpertInputs, SongConcept, BuilderTranslation, SongSection, ToastTranslation, DialogTranslation, ProducerPersona } from '../../../types';
import ExpertGlobalPanel from './ExpertGlobalPanel';
import StructureBuilder from './StructureBuilder';
import { cn } from '../../../lib/utils';
import { STORY_ARCS } from '../data/storyArcs';
import PersonaManager from './PersonaManager';
import { sfx } from '../../../lib/audio';
import VocalStyleDesigner from './inputs/VocalStyleDesigner';
import SpecialTechniquesPanel from './inputs/SpecialTechniquesPanel';
import InstrumentDesigner from './inputs/InstrumentDesigner';
import AtmosphereDesigner from './inputs/AtmosphereDesigner';
// Fix: Import missing GlassPanel component used in the layout
import GlassPanel from '../../../components/shared/GlassPanel';
import CustomSelect, { SelectOption } from '../../../components/shared/CustomSelect';
import { useSettings } from '../../../contexts/SettingsContext';
import { usePersonas } from '../../../hooks/usePersonas';
import Tooltip from '../../../components/Tooltip';
import PersonaSelector from '../../../components/shared/PersonaSelector';

interface ExpertDrawerContentProps {
  expertInputs: ExpertInputs;
  setExpertInputs: React.Dispatch<React.SetStateAction<ExpertInputs>>;
  inputs: SongConcept & { lyricsInput: string };
  setInputs: React.Dispatch<React.SetStateAction<SongConcept & { lyricsInput: string }>>;
  isPyriteMode: boolean;
  t: BuilderTranslation;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  tToast: ToastTranslation;
  tDialog: DialogTranslation;
}

const ExpertDrawerContent: React.FC<ExpertDrawerContentProps> = ({
  expertInputs,
  setExpertInputs,
  inputs,
  setInputs,
  isPyriteMode,
  t,
  showToast,
  tToast,
  tDialog
}) => {
  const { savePersona } = usePersonas();
  const [isPersonaManagerOpen, setIsPersonaManagerOpen] = useState(false);
  const { lang } = useSettings();

  const activeBorder = isPyriteMode ? 'focus:border-purple-500' : 'focus:border-yellow-500';

  const handleApplyArc = (arcId: string) => {
    const arc = STORY_ARCS.find(a => a.id === arcId);
    if (arc) {
      const newStructure = arc.structure.map(s => ({
        ...s,
        id: crypto.randomUUID()
      }));
      setExpertInputs(prev => ({ ...prev, structure: newStructure }));
      sfx.play('success');
    }
  };

  const handleSavePersona = useCallback(() => {
    const prompt = expertInputs.customPersona?.trim();
    if (!prompt) {
      showToast(tToast.personaEmpty || "Instruction matrix is empty.", 'info');
      return;
    }
    const name = window.prompt(tDialog.savePersonaName || "Name this specialized intelligence:");
    if (name && name.trim()) {
      savePersona(name.trim(), prompt);
      showToast(tToast.personaSaved || "Agent Committed to Archive", 'success');
      sfx.play('success');
    }
  }, [expertInputs.customPersona, savePersona, showToast, tDialog.savePersonaName, tToast.personaSaved, tToast.personaEmpty]);
  
  const handleLoadPersona = useCallback((prompt: string) => {
    setExpertInputs(p => ({ ...p, customPersona: prompt }));
    showToast(tToast.personaLoaded || "Neural Sync Established", 'success');
    sfx.play('secret');
  }, [setExpertInputs, showToast, tToast.personaLoaded]);

  const handlePersonaChange = useCallback((persona: ProducerPersona, customPrompt?: string) => {
      setInputs(prev => ({ ...prev, producerPersona: persona }));
      if (customPrompt) {
          setExpertInputs(prev => ({ ...prev, customPersona: customPrompt }));
      }
      sfx.play('click');
  }, [setInputs, setExpertInputs]);

  const arcOptions: SelectOption[] = useMemo(() => {
      return STORY_ARCS.map(arc => ({
          label: lang === 'pl' ? arc.name.pl : arc.name.en,
          value: arc.id
      }));
  }, [lang]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
              <ExpertGlobalPanel 
                expertInputs={expertInputs}
                setExpertInputs={setExpertInputs}
                isPyriteMode={isPyriteMode}
                t={t}
              />
          </div>
          <div className="md:w-64 space-y-4">
              <GlassPanel layer="card" variant={isPyriteMode ? 'pyrite' : 'default'} className="p-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Active Producer</label>
                  <PersonaSelector 
                    value={inputs.producerPersona || 'standard'} 
                    onChange={handlePersonaChange}
                    className="w-full"
                  />
              </GlassPanel>
          </div>
      </div>
      
      <VocalStyleDesigner 
        value={expertInputs.vocalStyle || ''}
        onChange={(newValue) => setExpertInputs(p => ({...p, vocalStyle: newValue}))}
        genre={expertInputs.genre}
        isPyriteMode={isPyriteMode}
        t={t}
      />

      <InstrumentDesigner
        value={expertInputs.instrumentStyle || ''}
        onChange={(newValue) => setExpertInputs(p => ({...p, instrumentStyle: newValue}))}
        genre={expertInputs.genre}
        isPyriteMode={isPyriteMode}
        t={t}
      />
      
      <AtmosphereDesigner
        value={expertInputs.atmosphereStyle || ''}
        onChange={(newValue) => setExpertInputs(p => ({...p, atmosphereStyle: newValue}))}
        isPyriteMode={isPyriteMode}
        t={t}
      />

      <SpecialTechniquesPanel isPyriteMode={isPyriteMode} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t.conceptLabel}</label>
            <textarea
              value={inputs.intent}
              onChange={(e) => setInputs(p => ({ ...p, intent: e.target.value }))}
              className={cn(
                "w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-zinc-200 outline-none h-32 resize-none text-sm placeholder:text-zinc-600 font-mono",
                activeBorder
              )}
              placeholder={t.conceptPlaceholder}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3" />
                    Behavioral Instruction Matrix
                    <Tooltip content="Directly overrides the system prompt for the generation engine. Define specialized logic here." />
                </span>
                <div className="flex gap-1">
                    <button 
                        onClick={handleSavePersona} 
                        title="Archive Current Logic" 
                        className={cn(
                            "p-1.5 rounded-lg border border-white/5 transition-all hover:border-white/10",
                            isPyriteMode ? "text-purple-400 hover:text-purple-200" : "text-yellow-500 hover:text-yellow-200"
                        )}
                    >
                        <Save className="w-3.5 h-3.5" />
                    </button>
                    <button 
                        onClick={() => setIsPersonaManagerOpen(true)} 
                        title="Open Identity Archive" 
                        className="p-1.5 rounded-lg border border-white/5 transition-all hover:bg-white/5 text-zinc-400 hover:text-white"
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                    </button>
                </div>
            </label>
            <textarea
              value={expertInputs.customPersona || ''}
              onChange={(e) => setExpertInputs(p => ({ ...p, customPersona: e.target.value }))}
              className={cn(
                "w-full bg-black/40 border border-zinc-800 rounded-xl p-4 text-xs md:text-sm text-zinc-300 outline-none flex-1 min-h-[128px] resize-none font-mono placeholder:text-zinc-700 leading-relaxed",
                activeBorder
              )}
              placeholder="e.g. You are a cynical industrial rock producer who hates commercial pop..."
            />
          </div>
      </div>

      <div className={cn(
        "p-4 rounded-xl border shadow-lg",
        isPyriteMode ? "border-blue-500/40 bg-blue-900/10" : "border-blue-500/30 bg-blue-900/10"
      )}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-500/20">
            <div className="flex items-center">
                <Layers className="w-4 h-4 mr-2 text-blue-400" />
                <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">{t.structure}</label>
            </div>
            
            <div className="w-48">
                <CustomSelect
                    value=""
                    onChange={handleApplyArc}
                    options={arcOptions}
                    placeholder={t.expert.applyTemplate}
                    variant={isPyriteMode ? 'pyrite' : 'default'}
                    className="z-20"
                />
            </div>
        </div>

        <StructureBuilder 
          sections={expertInputs.structure}
          setSections={(newSections: SongSection[] | ((prev: SongSection[]) => SongSection[])) => {
             setExpertInputs(p => ({
               ...p, 
               structure: typeof newSections === 'function' ? newSections(p.structure) : newSections
             }));
          }}
          t={t}
          isPyriteMode={isPyriteMode}
          lyrics={inputs.lyricsInput}
        />
      </div>

      <PersonaManager
        isOpen={isPersonaManagerOpen}
        onClose={() => setIsPersonaManagerOpen(false)}
        onLoad={handleLoadPersona}
        isPyriteMode={isPyriteMode}
        t={t}
      />
    </div>
  );
};

export default React.memo(ExpertDrawerContent);
