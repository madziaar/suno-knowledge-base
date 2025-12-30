
import React, { useState } from 'react';
import { Wand2, Mic2, Music, Copy, Check, Layers, ArrowRight, Tag, Keyboard, Edit3, LayoutTemplate, ShieldAlert } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { sfx } from '../../../../lib/audio';
import { extendVowel, formatBackgroundVocals, formatChordLine, optimizeTags, formatInlineStyle, interleaveNotes } from '../../utils/lyricalTechniques';
import { generateStructureSkeleton, StructureType } from '../../utils/lyricsFormatter';
import { PIANO_KEYS } from '../../data/musicTheory';
import { sunoMetaTags } from '../../data/sunoMetaTags';
import CustomSelect from '../../../../components/shared/CustomSelect';
import { useSettings } from '../../../../contexts/SettingsContext';
import { translations } from '../../../../translations';

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
  const [bgType, setBgType] = useState<'echo' | 'harmony' | 'call'>('echo');
  const [copiedBg, setCopiedBg] = useState(false);
  
  const [chordProg, setChordProg] = useState('Am G F E');
  const [copiedChords, setCopiedChords] = useState(false);

  // Inline Style State
  const [inlineSection, setInlineSection] = useState('Chorus');
  const [inlineStyle, setInlineStyle] = useState('Heavy riffs, driving beat');
  const [inlineContent, setInlineContent] = useState('Lyrics go here...');
  const [copiedInline, setCopiedInline] = useState(false);

  // Structure State
  const [customTag, setCustomTag] = useState('');
  const [copiedTag, setCopiedTag] = useState(false);
  const [skeletonType, setSkeletonType] = useState<StructureType>('pop');
  const [copiedSkeleton, setCopiedSkeleton] = useState(false);

  // Previews
  const vowelPreview = extendVowel(vowelWord, vowelLevel);
  const bgPreview = formatBackgroundVocals(mainLine, bgLine, bgType);
  const chordPreview = formatChordLine(mainLine, chordProg.split(' '));
  const inlinePreview = formatInlineStyle(inlineSection, inlineStyle, inlineContent);
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

  // Filter tags for quick access based on Knowledge Base
  const endingTags = sunoMetaTags.filter(t => t.category === 'ending').slice(0, 6);
  const effectTags = sunoMetaTags.filter(t => t.category === 'fx' || t.category === 'sound_effect' || t.category === 'dynamic').slice(0, 8);
  const transitionTags = sunoMetaTags.filter(t => t.category === 'transition').slice(0, 6);

  const panelBg = isPyriteMode ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-teal-900/10 border-teal-500/20';
  const accentText = isPyriteMode ? 'text-indigo-300' : 'text-teal-300';
  const activeTabClass = isPyriteMode ? 'bg-indigo-500/20 text-indigo-100 border-indigo-500/50' : 'bg-teal-500/20 text-teal-800 border-teal-500/50';
  const inputClass = cn("w-full px-3 py-2 text-xs rounded-lg border transition-colors outline-none", isPyriteMode ? 'bg-black/40 border-indigo-500/30 focus:border-indigo-400 text-white' : 'bg-white/10 border-teal-500/30 focus:border-teal-400 text-white');

  return (
    <div className={cn("rounded-xl border overflow-hidden", panelBg)}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-white/5 bg-black/20">
        <Wand2 className={cn("w-4 h-4 mr-2", accentText)} />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.title}</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-white/5">
          <button 
            onClick={() => setActiveTab('melodic')}
            className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2", activeTab === 'melodic' ? `${activeTabClass} border-current` : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            {t.tabs.melodic}
          </button>
          <button 
            onClick={() => setActiveTab('arrange')}
            className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2", activeTab === 'arrange' ? `${activeTabClass} border-current` : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            {t.tabs.arrange}
          </button>
          <button 
            onClick={() => setActiveTab('structure')}
            className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2", activeTab === 'structure' ? `${activeTabClass} border-current` : "border-transparent text-zinc-500 hover:text-zinc-300")}
          >
            {t.tabs.structure}
          </button>
      </div>

      <div className="p-4 space-y-4 min-h-[280px]">
        {/* --- MELODIC TAB --- */}
        {activeTab === 'melodic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {/* Vowel Extension */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mic2 className="w-3 h-3" /> {t.labels.vowel}
                    </label>
                    <div className="flex gap-2 items-center">
                        <input type="text" value={vowelWord} onChange={e => setVowelWord(e.target.value)} className={inputClass} placeholder={t.placeholders.word} />
                        <input type="range" min="1" max="5" value={vowelLevel} onChange={e => setVowelLevel(parseInt(e.target.value))} className={cn("w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer", isPyriteMode ? 'accent-indigo-500' : 'accent-teal-500')} />
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-xs font-mono text-zinc-300">{vowelPreview}</span>
                        <button onClick={() => handleCopy(vowelPreview, setCopiedVowel)} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            {copiedVowel ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {/* Syllabic Pitch */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Music className="w-3 h-3" /> {t.labels.pitch}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <input value={syllabicText} onChange={e => setSyllabicText(e.target.value)} className={inputClass} placeholder={t.placeholders.lyricLine} />
                        <input value={syllabicNotes} onChange={e => setSyllabicNotes(e.target.value)} className={inputClass} placeholder={t.placeholders.notes} />
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-xs font-mono text-zinc-300 truncate mr-2">{syllabicPreview}</span>
                        <button onClick={() => handleCopy(syllabicPreview, setCopiedSyllabic)} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            {copiedSyllabic ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {/* Piano Notation */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Keyboard className="w-3 h-3" /> {t.labels.keypad}
                        </label>
                        <div className="flex gap-1">
                            {['maj', 'min', '7'].map(t => (
                                <button key={t} onClick={() => setNoteType(t as any)} className={cn("px-2 py-0.5 text-[9px] font-bold rounded uppercase", noteType === t ? (isPyriteMode ? "bg-indigo-600 text-white" : "bg-teal-600 text-white") : "bg-zinc-800 text-zinc-400")}>{t}</button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative h-16 bg-black/30 rounded-lg p-1 flex select-none">
                        {PIANO_KEYS.map(({ note, type }) => (
                            type === 'white' ? (
                                <button 
                                    key={note} 
                                    onClick={() => handlePianoClick(note)} 
                                    className="h-full flex-1 bg-zinc-200 hover:bg-white rounded-sm active:bg-zinc-400 transition-colors relative group border border-zinc-300"
                                    title={`Copy (${note}${noteType === 'maj' ? '' : noteType === 'min' ? 'm' : '7'})`}
                                >
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-black font-bold opacity-30 group-hover:opacity-100">{note}</span>
                                </button>
                            ) : null
                        ))}
                        <div className="absolute inset-0 p-1 flex pointer-events-none">
                            {PIANO_KEYS.map(({ note, type }, i) => (
                                type === 'black' ? (
                                    <button 
                                        key={note} 
                                        onClick={() => handlePianoClick(note)} 
                                        style={{ left: `${(i - 0.5) * (100 / 12)}%` }} 
                                        className="absolute top-0 w-[5%] h-[60%] bg-black border border-zinc-700 rounded-b-sm pointer-events-auto active:bg-zinc-800 hover:bg-zinc-900 transition-colors z-10"
                                        title={`Copy (${note}${noteType === 'maj' ? '' : noteType === 'min' ? 'm' : '7'})`}
                                    />
                                ) : null
                            ))}
                        </div>
                    </div>
                    <p className="text-[9px] text-zinc-500 italic text-center">Click keys to insert chords e.g. (C#m)</p>
                </div>
            </div>
        )}

        {/* --- ARRANGEMENT TAB --- */}
        {activeTab === 'arrange' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {/* Background Vocals */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3 h-3" /> {t.labels.backing}
                        </label>
                        <select 
                            value={bgType} 
                            onChange={(e) => setBgType(e.target.value as any)}
                            className="bg-zinc-800 text-[9px] text-zinc-300 rounded px-2 py-1 border-none outline-none cursor-pointer"
                        >
                            <option value="echo">Echo (End)</option>
                            <option value="harmony">Harmony (Pre)</option>
                            <option value="call">Call & Response</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input value={mainLine} onChange={e => setMainLine(e.target.value)} className={inputClass} placeholder={t.placeholders.mainLyric} />
                        <input value={bgLine} onChange={e => setBgLine(e.target.value)} className={inputClass} placeholder={t.placeholders.backingLyric} />
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-xs font-mono text-zinc-300 whitespace-pre-line">{bgPreview}</span>
                        <button onClick={() => handleCopy(bgPreview, setCopiedBg)} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            {copiedBg ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {/* Inline Style */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Edit3 className="w-3 h-3" /> {t.labels.inline}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <input value={inlineSection} onChange={e => setInlineSection(e.target.value)} className={inputClass} placeholder={t.placeholders.section} />
                        <input value={inlineStyle} onChange={e => setInlineStyle(e.target.value)} className={inputClass} placeholder={t.placeholders.style} />
                    </div>
                    <textarea 
                        value={inlineContent} 
                        onChange={e => setInlineContent(e.target.value)} 
                        className={cn(inputClass, "h-16 resize-none")} 
                        placeholder="Lyrics for this section..." 
                    />
                    <div className="flex justify-between items-start p-3 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-xs font-mono text-zinc-300 whitespace-pre-line">{inlinePreview}</span>
                        <button onClick={() => handleCopy(inlinePreview, setCopiedInline)} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            {copiedInline ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {/* Chord Overlay */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Music className="w-3 h-3" /> {t.labels.chords}
                        </label>
                        <CustomSelect 
                            value={""} 
                            onChange={(val) => setChordProg(val)} 
                            options={CHORD_PROGRESSIONS} 
                            placeholder="Progs..." 
                            variant={isPyriteMode ? 'pyrite' : 'default'}
                            className="w-24"
                        />
                    </div>
                    <input value={chordProg} onChange={e => setChordProg(e.target.value)} className={inputClass} placeholder={t.placeholders.chords} />
                    <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-xs font-mono text-zinc-300">{chordPreview}</span>
                        <button onClick={() => handleCopy(chordPreview, setCopiedChords)} className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                            {copiedChords ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- STRUCTURE TAB --- */}
        {activeTab === 'structure' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {/* Tag Optimizer */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> {t.labels.optimizer}
                    </label>
                    <div className="flex gap-2">
                        <input 
                            value={customTag} 
                            onChange={e => setCustomTag(e.target.value)} 
                            className={inputClass} 
                            placeholder={t.placeholders.optimizer} 
                        />
                        <button 
                            onClick={() => handleCopy(optimizedTag, setCopiedTag)}
                            className={cn("px-3 rounded-lg font-bold text-xs flex items-center transition-colors", isPyriteMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white')}
                        >
                            {copiedTag ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                    {customTag && (
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                            Optimized: <span className="text-zinc-300 font-mono">{optimizedTag}</span>
                        </div>
                    )}
                </div>

                {/* Skeleton Generator */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <LayoutTemplate className="w-3 h-3" /> {t.labels.skeleton}
                    </label>
                    <div className="flex gap-2">
                        <CustomSelect 
                            value={skeletonType}
                            onChange={(val) => setSkeletonType(val as any)}
                            options={STRUCTURE_TYPES}
                            placeholder="Type..."
                            variant={isPyriteMode ? 'pyrite' : 'default'}
                        />
                        <button 
                            onClick={handleCopySkeleton}
                            className={cn("px-4 rounded-lg font-bold text-xs flex items-center transition-colors whitespace-nowrap", isPyriteMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white')}
                        >
                            {copiedSkeleton ? t.actions.copied : t.actions.copySkeleton}
                        </button>
                    </div>
                </div>

                {/* Quick Insert Grid */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase mb-2 block">{t.labels.transitions}</label>
                        <div className="flex flex-wrap gap-2">
                            {transitionTags.map(tag => (
                                <button 
                                    key={tag.id}
                                    onClick={() => { navigator.clipboard.writeText(`[${tag.name}]`); sfx.play('click'); }}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-zinc-300 transition-colors"
                                >
                                    [{tag.name}]
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase mb-2 block">{t.labels.effects}</label>
                        <div className="flex flex-wrap gap-2">
                            {effectTags.map(tag => (
                                <button 
                                    key={tag.id}
                                    onClick={() => { navigator.clipboard.writeText(`[${tag.name}]`); sfx.play('click'); }}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-zinc-300 transition-colors"
                                >
                                    [{tag.name}]
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase mb-2 block">{t.labels.endings}</label>
                        <div className="flex flex-wrap gap-2">
                            {endingTags.map(tag => (
                                <button 
                                    key={tag.id}
                                    onClick={() => { navigator.clipboard.writeText(`[${tag.name}]`); sfx.play('click'); }}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-zinc-300 transition-colors"
                                >
                                    [{tag.name}]
                                </button>
                            ))}
                            {/* Special Power Ending Button */}
                            <button 
                                onClick={() => { navigator.clipboard.writeText('[Instrumental Fade Out]\n[End]'); sfx.play('click'); }}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] text-yellow-300 transition-colors flex items-center gap-1"
                                title="Recommended V4.5 Ending"
                            >
                                <ShieldAlert className="w-3 h-3" />
                                [Power Ending]
                            </button>
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
