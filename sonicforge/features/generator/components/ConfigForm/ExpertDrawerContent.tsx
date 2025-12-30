
import React, { memo, useState, useCallback, useMemo } from 'react';
import { Layers, BookOpen, UserCog, Save } from 'lucide-react';
import { ExpertInputs, SongConcept, BuilderTranslation, SongSection, Persona, ToastTranslation, DialogTranslation } from '../../../../types';
import ExpertGlobalPanel from '../ExpertGlobalPanel';
import StructureBuilder from '../StructureBuilder';
import { cn } from '../../../../lib/utils';
import { STORY_ARCS } from '../../data/storyArcs';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import PersonaManager from './PersonaManager';
import { sfx } from '../../../../lib/audio';
import VocalStyleDesigner from '../inputs/VocalStyleDesigner';
import SpecialTechniquesPanel from '../inputs/SpecialTechniquesPanel';
import InstrumentDesigner from '../inputs/InstrumentDesigner';
import AtmosphereDesigner from '../inputs/AtmosphereDesigner';
import CustomSelect, { SelectOption } from '../../../../components/shared/CustomSelect';
import { useSettings } from '../../../../contexts/SettingsContext';

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
  const [savedPersonas, setSavedPersonas] = useLocalStorage<Persona[]>('pyrite_personas', []);
  const [isPersonaManagerOpen, setIsPersonaManagerOpen] = useState(false);
  const { lang } = useSettings();

  const activeBorder = isPyriteMode ? 'focus:border-purple-500' : 'focus:border-yellow-500';

  const handleApplyArc = (arcId: string) => {
    const arc = STORY_ARCS.find(a => a.id === arcId);
    if (arc) {
      // Deep copy to ensure new IDs
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
      showToast(tToast.personaEmpty || "Persona prompt is empty.", 'info');
      return;
    }
    const name = window.prompt(tDialog.savePersonaName || "Enter a name for this persona:");
    if (name && name.trim()) {
      const newPersona: Persona = {
        id: crypto.randomUUID(),
        name: name.trim(),
        prompt: prompt
      };
      setSavedPersonas(prev => [...prev, newPersona]);
      showToast(tToast.personaSaved || "Persona Saved", 'success');
      sfx.play('success');
    }
  }, [expertInputs.customPersona, setSavedPersonas, showToast, tDialog.savePersonaName, tToast.personaSaved, tToast.personaEmpty]);
  
  const handleLoadPersona = useCallback((prompt: string) => {
    setExpertInputs(p => ({ ...p, customPersona: prompt }));
    setIsPersonaManagerOpen(false);
    showToast(tToast.personaLoaded || "Persona Loaded", 'success');
    sfx.play('success');
  }, [setExpertInputs, showToast, tToast.personaLoaded]);

  const handleDeletePersona = useCallback((id: string) => {
    if (window.confirm(tDialog.deletePersona || "Delete this persona? This cannot be undone.")) {
      setSavedPersonas(prev => prev.filter(p => p.id !== id));
      showToast(tToast.personaDeleted || "Persona Deleted", 'info');
      sfx.play('click');
    }
  }, [setSavedPersonas, showToast, tToast.personaDeleted, tDialog.deletePersona]);

  // Transform Story Arcs to Select Options using localized names
  const arcOptions: SelectOption[] = useMemo(() => {
      return STORY_ARCS.map(arc => ({
          label: lang === 'pl' ? arc.name.pl : arc.name.en,
          value: arc.id
      }));
  }, [lang]);

  return (
    <div className="space-y-6">
      <ExpertGlobalPanel 
        expertInputs={expertInputs}
        setExpertInputs={setExpertInputs}
        isPyriteMode={isPyriteMode}
        t={t}
      />
      
      <VocalStyleDesigner 
        value={expertInputs.vocalStyle || ''}
        onChange={(newValue) => setExpertInputs(p => ({...p, vocalStyle: newValue}))}
        genre={expertInputs.genre}
        isPyriteMode={isPyriteMode}
      />

      <InstrumentDesigner
        value={expertInputs.instrumentStyle || ''}
        onChange={(newValue) => setExpertInputs(p => ({...p, instrumentStyle: newValue}))}
        genre={expertInputs.genre}
        isPyriteMode={isPyriteMode}
      />
      
      <AtmosphereDesigner
        value={expertInputs.atmosphereStyle || ''}
        onChange={(newValue) => setExpertInputs(p => ({...p, atmosphereStyle: newValue}))}
        isPyriteMode={isPyriteMode}
      />

      <SpecialTechniquesPanel isPyriteMode={isPyriteMode} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t.conceptLabel}</label>
            <textarea
              value={inputs.intent}
              onChange={(e) => setInputs(p => ({ ...p, intent: e.target.value }))}
              className={cn(
                "w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-zinc-200 outline-none h-24 resize-none text-sm placeholder:text-zinc-600",
                activeBorder
              )}
              placeholder={t.conceptPlaceholder}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2 flex items-center justify-between">
                <span className="flex items-center">
                    <UserCog className="w-3 h-3 mr-1.5" />
                    {t.expert.customPersona}
                </span>
                <div className="flex gap-1">
                    <button onClick={handleSavePersona} title={t.expert.savePersona} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                        <Save className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsPersonaManagerOpen(true)} title={t.expert.loadPersona} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                        <BookOpen className="w-3.5 h-3.5" />
                    </button>
                </div>
            </label>
            <textarea
              value={expertInputs.customPersona || ''}
              onChange={(e) => setExpertInputs(p => ({ ...p, customPersona: e.target.value }))}
              className={cn(
                "w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-zinc-200 outline-none h-24 resize-none text-sm font-mono placeholder:text-zinc-600",
                activeBorder
              )}
              placeholder={t.expert.customPersonaPlaceholder}
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
                    placeholder={lang === 'pl' ? "Wybierz Szablon..." : "Apply Template..."}
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
        personas={savedPersonas}
        onLoad={handleLoadPersona}
        onDelete={handleDeletePersona}
        isPyriteMode={isPyriteMode}
        t={t}
      />
    </div>
  );
};

export default React.memo(ExpertDrawerContent);
    