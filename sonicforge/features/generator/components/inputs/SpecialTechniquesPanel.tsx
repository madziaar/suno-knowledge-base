
import React, { useState } from 'react';
import { Wand2, Mic2, Music, Copy, Check, Layers, ArrowRight, Tag, Keyboard, Edit3, LayoutTemplate, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { sfx } from '../../../../lib/audio';
import { extendVowel, formatBackgroundVocals, formatChordLine, optimizeTags, interleaveNotes } from '../../utils/lyricalTechniques';
import { generateStructureSkeleton, StructureType } from '../../utils/lyricsFormatter';
import { PIANO_KEYS } from '../../data/musicTheory';
import { sunoMetaTags } from '../../data/sunoMetaTags';
import CustomSelect from '../../../../components/shared/CustomSelect';
import { useSettings } from '../../../../contexts/SettingsContext';
import { translations } from '../../../../translations';
import Tooltip from '../../../../components/Tooltip';

interface SpecialTechniquesPanelProps {
  isPyriteMode: boolean;
}

const CHORD_PROGRESSIONS = [
  { label: 'Pop Anthem (I-V-vi-IV)', value: 'C G Am F' },
  { label: 'Emotional (vi-IV-I-V)', value: 'Am F C G' },
  { label: 'Jazz Turn (ii-V-I)', value: 'Dm7 G7 Cmaj7' },
  { label: 'Epic (vi-VII-i)', value: 'Fm G Cm' },
  { label: 'Blues (I-IV-I-V)', value: 'C7 F7 C7 G7' },
  { label: 'Sad Ballad (i-VII-VI-V)', value: 'Cm Bb Ab G' }
];

const STRUCTURE_TYPES = [
  { label: 'Pop Structure', value: 'pop' },
  { label: 'Hip Hop / Trap', value: 'hiphop' },
  { label: 'Electronic / EDM', value: 'electronic' },
  { label: 'Ballad', value: 'ballad' },
  { label: 'Progressive', value: 'progressive' }
];

const SpecialTechniquesPanel: React.FC<SpecialTechniquesPanelProps> = ({ isPyriteMode }) => {
  const [activeTab, setActiveTab] = useState<'melodic' | 'structure' | 'arrange'>('melodic');
  const { lang } = useSettings();
  const t = translations[lang].builder.techniques;
  
  // Melodic State
  const [vowelWord, setVowelWord] = useState('love');
  const [vowelLevel, setVowelLevel] = useState(2);
  const [copiedVowel, setCopiedVowel] = useState(false);
  const [noteType, setNoteType] = useState<'maj' | 'min' | '7'>('maj');
  
  const [syllabicText, setSyllabicText] = useState('Beat of the heart');
  const [syllabicNotes, setSyllabicNotes] = useState('G G A B');
  const [copiedSyllabic, setCopiedSyllabic] = useState(false);

  // Arrangement State
  const [mainLine, setMainLine] = useState('She walks away');
  const [bgLine, setBgLine] = useState('walks away');
  const [bgType, setBgType] = useState<'echo' | 'harmony' | 'call' | 'layer'>('echo');
  const [copiedBg, setCopiedBg] = useState(false);
  
  const [chordProg, setChordProg] = useState('Am G F E');
  const [copiedChords, setCopiedChords] = useState(false);

  // Structure State
  const [customTag, setCustomTag] = useState('');
  const [copiedTag, setCopiedTag] = useState(false);
  const [skeletonType, setSkeletonType] = useState<StructureType>('pop');
  const [copiedSkeleton, setCopiedSkeleton] = useState(false);

  // Previews
  const vowelPreview = extendVowel(vowelWord, vowelLevel);
  const bgPreview = formatBackgroundVocals(mainLine, bgLine, bgType);
  const chordPreview = formatChordLine(mainLine, chordProg.split(' '));
  const optimizedTag = optimizeTags(customTag);
  const syllabicPreview = interleaveNotes(syllabicText, syllabicNotes);

  const handleCopy = (text: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(text);
    setter(true);
    sfx.play('light');
    setTimeout(() => setter(false), 1500);
  };

  const handlePianoClick = (note: string) => {
    let suffix = '';
    if (noteType === 'min') suffix = 'm';
    if (noteType === '7') suffix = '7';
    const notation = `(${note}${suffix})`;
    navigator.clipboard.writeText(notation);
    sfx.play('click');
  };
  
  const handleCopySkeleton = () => {
    const skel = generateStructureSkeleton(skeletonType);
    handleCopy(skel, setCopiedSkeleton);
  };

  const endingTags = sunoMetaTags.filter(t => t.category === 'ending').slice(0, 6);
  const effectTags = sunoMetaTags.filter(t => t.category === 'fx' || t.category === 'sound_effect' || t.category === 'dynamic').slice(0, 8);
  const transitionTags = sunoMetaTags.filter(t => t.category === 'transition').slice(0, 6);

  const accentText = isPyriteMode ? 'text-indigo-300' : 'text-teal-300';
  const activeTabClass = isPyriteMode ? 'bg-indigo-500/20 text-indigo-100 border-indigo-500/50' : 'bg-teal-500/20 text-teal-800 border-teal-500/50';
  const inputClass = cn("w-full px-3 py-2 text-xs rounded-lg border transition-colors outline-none", isPyriteMode ? 'bg-black/40 border-indigo-500/30 focus:border-indigo-400 text-white' : 'bg-white/10 border-teal-500/30 focus:border-teal-400 text-white');

  return (
    <div className={cn("rounded-xl border overflow-hidden shadow-2xl", isPyriteMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-teal-900/10 border-teal-500/20')}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
        <div className="flex items-center">
          <Wand2 className={cn("w-4 h-4 mr-2", accentText)} />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.title}</h3>
        </div>
        <Tooltip content="Master Suno V4.5 logic with advanced syllable and structural engineering tools." />
      </div>

      <div className="flex border-b border-white/5 bg-white/5">
        {[
          { id: 'melodic', label: t.tabs.melodic, icon: Mic2 },
          { id: 'arrange', label: t.tabs.arrange, icon: Layers },
          { id: 'structure', label: t.tabs.structure, icon: LayoutTemplate }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center justify-center gap-2", 
              activeTab === tab.id ? `${activeTabClass} border-current` : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 min-h-[300px]">
        {activeTab === 'melodic' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-yellow-400" /> {t.labels.vowel}
              </label>
              <div className="flex gap-3 items-center">
                <input type="text" value={vowelWord} onChange={e => setVowelWord(e.target.value)} className={inputClass} placeholder={t.placeholders.word} />
                <div className="flex flex-col flex-1 gap-1">
                  <input type="range" min="1" max="5" value={vowelLevel} onChange={e => setVowelLevel(parseInt(e.target.value))} className={cn("w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer", isPyriteMode ? 'accent-indigo-500' : 'accent-teal-500')} />
                  <div className="flex justify-between text-[8px] font-mono text-zinc-600"><span>Short</span><span>Melisma Depth</span><span>Long</span></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5 group relative overflow-hidden">
                <span className="text-xs font-mono text-zinc-200">{vowelPreview}</span>
                <button onClick={() => handleCopy(vowelPreview, setCopiedVowel)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                  {copiedVowel ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Keyboard className="w-3 h-3" /> Note-per-Syllable Control
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input value={syllabicText} onChange={e => setSyllabicText(e.target.value)} className={inputClass} placeholder={t.placeholders.lyricLine} />
                <input value={syllabicNotes} onChange={e => setSyllabicNotes(e.target.value)} className={inputClass} placeholder={t.placeholders.notes} />
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-xs font-mono text-zinc-200 truncate mr-2">{syllabicPreview}</span>
                <button onClick={() => handleCopy(syllabicPreview, setCopiedSyllabic)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                  {copiedSyllabic ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3 h-3" /> Rapid Chord Matrix
                </label>
                <div className="flex gap-1">
                  {['maj', 'min', '7'].map(t => (
                    <button key={t} onClick={() => setNoteType(t as any)} className={cn("px-2 py-0.5 text-[9px] font-bold rounded uppercase transition-colors", noteType === t ? (isPyriteMode ? "bg-indigo-600 text-white" : "bg-teal-600 text-white") : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="relative h-14 bg-black/30 rounded-lg p-1 flex select-none">
                {PIANO_KEYS.map(({ note, type }) => (
                  type === 'white' ? (
                    <button key={note} onClick={() => handlePianoClick(note)} className="h-full flex-1 bg-zinc-200 hover:bg-white rounded-sm active:bg-zinc-400 transition-colors border border-zinc-300 relative group">
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] text-black font-bold opacity-30 group-hover:opacity-100">{note}</span>
                    </button>
                  ) : null
                ))}
                <div className="absolute inset-0 p-1 flex pointer-events-none">
                  {PIANO_KEYS.map(({ note, type }, i) => (
                    type === 'black' ? (
                      <button key={note} onClick={() => handlePianoClick(note)} style={{ left: `${(i - 0.5) * (100 / 12)}%` }} className="absolute top-0 w-[5%] h-[60%] bg-black border border-zinc-700 rounded-b-sm pointer-events-auto active:bg-zinc-800 hover:bg-zinc-900 transition-colors z-10" />
                    ) : null
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'arrange' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3 h-3" /> {t.labels.backing}
                </label>
                <div className="flex bg-zinc-800 rounded-lg p-0.5 border border-white/5">
                  {['echo', 'harmony', 'call', 'layer'].map(type => (
                    <button key={type} onClick={() => setBgType(type as any)} className={cn("px-2 py-1 rounded text-[8px] font-bold uppercase transition-all", bgType === type ? (isPyriteMode ? "bg-indigo-600 text-white" : "bg-teal-600 text-white") : "text-zinc-500 hover:text-zinc-300")}>{type}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={mainLine} onChange={e => setMainLine(e.target.value)} className={inputClass} placeholder={t.placeholders.mainLyric} />
                <input value={bgLine} onChange={e => setBgLine(e.target.value)} className={inputClass} placeholder={t.placeholders.backingLyric} />
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-xs font-mono text-zinc-200 whitespace-pre-line leading-relaxed">{bgPreview}</span>
                <button onClick={() => handleCopy(bgPreview, setCopiedBg)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                  {copiedBg ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3 h-3" /> Chord Notation Assistant
                </label>
                <CustomSelect value={""} onChange={(val) => setChordProg(val)} options={CHORD_PROGRESSIONS} placeholder="Presets..." variant={isPyriteMode ? 'pyrite' : 'default'} className="w-28 h-8" />
              </div>
              <input value={chordProg} onChange={e => setChordProg(e.target.value)} className={inputClass} placeholder={t.placeholders.chords} />
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-xs font-mono text-zinc-200 leading-relaxed">{chordPreview}</span>
                <button onClick={() => handleCopy(chordPreview, setCopiedChords)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                  {copiedChords ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Meta Tag Formatter
              </label>
              <div className="flex gap-2">
                <input value={customTag} onChange={e => setCustomTag(e.target.value)} className={inputClass} placeholder="e.g., solo saxophone" />
                <button onClick={() => handleCopy(optimizedTag, setCopiedTag)} className={cn("px-3 rounded-lg font-bold text-xs flex items-center transition-all shadow-lg", isPyriteMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white')}>
                  {copiedTag ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[10px] text-zinc-500 bg-black/20 p-2 rounded flex items-center gap-2 border border-white/5 font-mono">
                <span className="text-zinc-600 uppercase">Normalized:</span> <span className="text-zinc-300 font-bold">{optimizedTag}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutTemplate className="w-3 h-3" /> Structure Presets
              </label>
              <div className="flex gap-2">
                <CustomSelect value={skeletonType} onChange={(val) => setSkeletonType(val as any)} options={STRUCTURE_TYPES} placeholder="Template..." variant={isPyriteMode ? 'pyrite' : 'default'} className="flex-1" />
                <button onClick={handleCopySkeleton} className={cn("px-4 rounded-lg font-bold text-xs flex items-center transition-all whitespace-nowrap", isPyriteMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white')}>
                  {copiedSkeleton ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copiedSkeleton ? "Synced" : "Copy Frame"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-red-500" /> Termination Protocol</label>
                <div className="flex flex-wrap gap-1.5">
                  {endingTags.map(tag => (
                    <button key={tag.id} onClick={() => { navigator.clipboard.writeText(`[${tag.name}]`); sfx.play('click'); }} className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[9px] text-zinc-400 hover:text-white transition-colors">[{tag.name}]</button>
                  ))}
                  <button onClick={() => { navigator.clipboard.writeText('[Instrumental Fade Out]\n[End]'); sfx.play('secret'); }} className="px-2 py-1 bg-yellow-950/20 hover:bg-yellow-900/40 border border-yellow-500/20 rounded text-[9px] text-yellow-500 font-bold transition-all shadow-lg">[Power Ending]</button>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase mb-2 block tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-purple-500" /> Dynamics</label>
                <div className="flex flex-wrap gap-1.5">
                  {effectTags.slice(0, 5).map(tag => (
                    <button key={tag.id} onClick={() => { navigator.clipboard.writeText(`[${tag.name}]`); sfx.play('click'); }} className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[9px] text-zinc-400 hover:text-white transition-colors">[{tag.name}]</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialTechniquesPanel;
