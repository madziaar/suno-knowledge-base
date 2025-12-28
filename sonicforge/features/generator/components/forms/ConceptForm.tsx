
import React, { memo, useCallback } from 'react';
import { Mic2, Music, Layers, Sparkles, Wand2, Globe, Command, UserCog, Zap, MinusCircle } from 'lucide-react';
import { BuilderTranslation, ProducerPersona } from '../../../../types';
import DraftHealth from '../DraftHealth';
import ConceptInput from '../inputs/ConceptInput';
import SmartSuggestions from '../SmartSuggestions';
import SmartLyricEditor from '../SmartLyricEditor';
import MetaControls from '../ConfigForm/MetaControls';
import { usePromptState } from '../../../../contexts/PromptContext';
import { useSettings } from '../../../../contexts/SettingsContext';
import { usePromptActions } from '../../hooks/usePromptActions';
import { Suggestion } from '../../utils/suggestionEngine';
import { cn } from '../../../../lib/utils';
import { Switch } from '../../../../components/ui/Switch';
import { sfx } from '../../../../lib/audio';
import MoodSelector from '../inputs/MoodSelector';
import InstrumentPicker from '../inputs/InstrumentPicker';
import VocalPicker from '../inputs/VocalPicker';
import NegativePromptInput from '../inputs/NegativePromptInput';
import PersonaSelector from '../../../../components/shared/PersonaSelector';

interface ConceptFormProps {
  t: BuilderTranslation;
  isPyriteMode: boolean;
}

const ConceptForm: React.FC<ConceptFormProps> = memo(({ t, isPyriteMode }) => {
  const { inputs, expertInputs, lyricSource } = usePromptState();
  const { lang, setIsPyriteMode } = useSettings();
  const { updateInput, updateExpertInput, setLyricSource } = usePromptActions();

  const handleAddSuggestion = useCallback((suggestion: Suggestion) => {
      if (suggestion.type === 'instrument') {
          const current = inputs.instruments ? inputs.instruments.split(', ').filter(Boolean) : [];
          if (!current.includes(suggestion.value)) {
              updateInput({ instruments: [...current, suggestion.value].join(', ') });
          }
      } else if (suggestion.type === 'mood') {
          const current = inputs.mood ? inputs.mood.split(', ').filter(Boolean) : [];
          if (!current.includes(suggestion.value)) {
              updateInput({ mood: [...current, suggestion.value].join(', ') });
          }
      } else if (suggestion.type === 'meta') {
          updateInput({ lyricsInput: (inputs.lyricsInput || '') + '\n' + suggestion.value });
          if (inputs.mode === 'custom') setLyricSource('user'); 
      } else if (suggestion.type === 'general') {
          updateInput({ intent: (inputs.intent || '') + ', ' + suggestion.value });
      }
  }, [inputs, updateInput, setLyricSource]);

  const handlePersonaChange = useCallback((persona: ProducerPersona) => {
      updateInput({ producerPersona: persona });
      if (persona === 'pyrite' && !isPyriteMode) setIsPyriteMode(true);
      if (persona === 'standard' && isPyriteMode) setIsPyriteMode(false);
      if ((persona === 'shin' || persona === 'twin_flames') && !isPyriteMode) setIsPyriteMode(true);
  }, [updateInput, setIsPyriteMode, isPyriteMode]);

  const showLyricsEditor = (inputs.mode === 'custom' && lyricSource === 'user') || inputs.mode === 'instrumental';
  const showTechniqueRack = (inputs.mode === 'custom' || inputs.mode === 'general') && lyricSource === 'ai';

  const editorLabel = inputs.mode === 'instrumental' 
    ? (lang === 'pl' ? "Struktura / Wskazówki" : "Structure / Guidance") 
    : (t.output.lyricsLabel || "Lyrics");

  const tt = t.aiLyricOptions.techniques;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* STAGE 1: NEURAL IDENTITY & HEALTH */}
        <div className="space-y-4">
            <StageHeader icon={UserCog} title="Neural Identity" version="v4.5_ID" isPyrite={isPyriteMode} />
            <div className="grid grid-cols-1 gap-4">
                <PersonaSelector 
                    value={inputs.producerPersona || 'standard'} 
                    onChange={handlePersonaChange}
                    className="w-full"
                />
                <DraftHealth 
                    inputs={inputs} 
                    expertInputs={expertInputs} 
                    isPyriteMode={isPyriteMode} 
                />
            </div>
        </div>

        {/* STAGE 2: CONCEPTUAL SPARK */}
        <div className="space-y-4 pt-6 border-t border-white/5">
            <StageHeader icon={Wand2} title="Conceptual Spark" version="Intent_Core" isPyrite={isPyriteMode} color={isPyriteMode ? "text-purple-400" : "text-yellow-500"} />
            <ConceptInput t={t} isPyriteMode={isPyriteMode} />
        </div>

        {/* STAGE 3: SONIC ARCHITECTURE */}
        <div className="space-y-6 pt-6 border-t border-white/5">
            <StageHeader icon={Music} title="Sonic Architecture" version="DNA_Synth" isPyrite={isPyriteMode} color={isPyriteMode ? "text-pink-400" : "text-blue-400"} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MoodSelector 
                    mood={inputs.mood}
                    setMood={(val) => updateInput({ mood: val })}
                    t={t}
                    isPyriteMode={isPyriteMode}
                    genre={expertInputs.genre}
                />
                <InstrumentPicker 
                    instruments={inputs.instruments}
                    setInstruments={(val) => updateInput({ instruments: val })}
                    t={t}
                    isPyriteMode={isPyriteMode}
                    genre={expertInputs.genre}
                />
            </div>

            <VocalPicker 
                vocals={expertInputs.vocalStyle || ''}
                setVocals={(val) => updateExpertInput({ vocalStyle: val })}
                t={t}
                isPyriteMode={isPyriteMode}
                genre={expertInputs.genre}
            />
            
            <NegativePromptInput 
                value={inputs.negativePrompt || ''}
                onChange={(val) => updateInput({ negativePrompt: val })}
                isPyriteMode={isPyriteMode}
                t={t}
            />
        </div>
        
        {/* STAGE 4: META CONFIGURATION */}
        <div className="space-y-4 pt-6 border-t border-white/5">
            <StageHeader icon={Globe} title="Meta Configuration" version="Engine_Vars" isPyrite={isPyriteMode} color={isPyriteMode ? "text-blue-400" : "text-green-400"} />
            
            <div className="grid grid-cols-1 gap-6">
                <MetaControls t={t} isPyriteMode={isPyriteMode} />

                {showTechniqueRack && (
                    <div className={cn(
                        "p-4 rounded-2xl border bg-black/40",
                        isPyriteMode ? "border-purple-500/20" : "border-white/5"
                    )}>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural Enhancements</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { id: 'useVowelExtension', label: tt.vowels, icon: Mic2, color: "text-pink-400" },
                                { id: 'useBackingVocals', label: tt.backing, icon: Layers, color: "text-blue-400" },
                                { id: 'useChords', label: tt.chords, icon: Music, color: "text-yellow-500" }
                            ].map(tech => (
                                <label key={tech.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-2">
                                        <tech.icon className={cn("w-3.5 h-3.5", tech.color)} />
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase group-hover:text-zinc-300">{tech.label}</span>
                                    </div>
                                    <Switch 
                                        checked={!!(inputs as any)[tech.id]} 
                                        onChange={(val) => { updateInput({ [tech.id]: val }); sfx.play('click'); }} 
                                        isPyrite={isPyriteMode} 
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* STAGE 5: LYRICAL ARCHITECT */}
        {showLyricsEditor && (
            <div className="space-y-4 pt-6 border-t border-white/5">
                <StageHeader icon={Command} title="Lyrical Forge" version="Lyrics_v4" isPyrite={isPyriteMode} />
                <SmartLyricEditor 
                    value={inputs.lyricsInput}
                    onChange={(val) => updateInput({ lyricsInput: val })}
                    isPyriteMode={isPyriteMode}
                    lang={lang}
                    genre={expertInputs.genre}
                    className="h-96"
                />
            </div>
        )}

        <div className="pt-4">
            <SmartSuggestions 
                genres={expertInputs.genre ? expertInputs.genre.split(',').map(g => g.trim()) : []}
                mood={inputs.mood}
                instruments={inputs.instruments}
                vocals={expertInputs.vocalStyle || ''}
                intent={inputs.intent}
                onAddSuggestion={handleAddSuggestion}
                isPyriteMode={isPyriteMode}
                mode={inputs.mode}
            />
        </div>
    </div>
  );
});

const StageHeader: React.FC<{ icon: any, title: string, version: string, isPyrite: boolean, color?: string }> = ({ icon: Icon, title, version, isPyrite, color }) => (
    <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
            <div className={cn(
                "p-2 rounded-xl transition-all duration-500",
                isPyrite ? "bg-purple-950/40 border border-purple-500/20" : "bg-zinc-900 border border-white/5"
            )}>
                <Icon className={cn("w-4 h-4", color || (isPyrite ? "text-purple-400" : "text-zinc-400"))} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">{title}</h3>
        </div>
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter opacity-50">{version}</span>
    </div>
);

export default ConceptForm;
