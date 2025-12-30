
import React, { useState, useRef, memo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, Wand2, Hash, LayoutTemplate, X, Tag, ChevronDown, ChevronUp, Mic2, Music, Layers, Sparkles } from 'lucide-react';
import { rewriteLyricFragment } from '../../../services/ai/tools';
import { structureLyrics, StructureType } from '../utils/lyricsFormatter';
import { lintStructure, LintResult } from '../utils/structureLinter';
import { useSyntaxHighlighter } from '../hooks/useSyntaxHighlighter';
import { cn } from '../../../lib/utils';
import { Language } from '../../../types';
import RhymeAssistant from './RhymeAssistant';
import { PIANO_KEYS } from '../data/musicTheory';
import { sfx } from '../../../lib/audio';
import { translations } from '../../../translations';
import { extendVowel, optimizeTags } from '../utils/lyricalTechniques';
import ThemedButton from '../../../components/shared/ThemedButton';

interface SmartLyricEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isPyriteMode?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  context?: string;
  genre?: string;
  lang: Language;
}

const QUICK_TAGS = [
    '[Intro]', '[Verse]', '[Pre-Chorus]', '[Chorus]', '[Bridge]', 
    '[Build-up]', '[Drop]', '[Breakdown]', 
    '[Solo]', '[Instrumental]', '[Outro]', '[End]'
];

const SmartLyricEditor: React.FC<SmartLyricEditorProps> = memo(({
  value,
  onChange,
  placeholder,
  className = '',
  isPyriteMode = false,
  onFocus,
  context = '',
  genre = '',
  lang
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selection, setSelection] = useState<{ start: number, end: number, text: string } | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [lintResults, setLintResults] = useState<LintResult[]>([]);
  
  // Tools State
  const [chordType, setChordType] = useState<'maj' | 'min' | '7'>('maj');
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [vowelLevel, setVowelLevel] = useState(2);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const t = translations[lang].builder.editor; // Access editor translations

  // Auto-focus on fullscreen toggle
  useEffect(() => {
    if (textareaRef.current) {
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 50);
    }
  }, [isFullscreen]);

  // --- LINTING LOGIC ---
  useEffect(() => {
    const handler = setTimeout(() => {
      if (value) {
        const results = lintStructure(value, lang);
        setLintResults(results);
      } else {
        setLintResults([]);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [value, lang]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleSelect = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    
    if (el.selectionStart !== el.selectionEnd) {
      const start = Math.min(el.selectionStart, el.selectionEnd);
      const end = Math.max(el.selectionStart, el.selectionEnd);
      const text = el.value.substring(start, end);

      if (text.trim().length > 0) {
        setSelection({ start, end, text });
      } else {
        setSelection(null);
      }
    } else {
      setSelection(null);
    }
  }, []);

  // --- TEXT INSERTION LOGIC ---
  const handleInsert = useCallback((text: string, replaceSelection = false) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentValue = el.value;
    
    let newValue = '';
    
    if (replaceSelection) {
        newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    } else {
        let insertText = text;
        // Formatting logic for tags vs words
        if (text.startsWith('[') && start > 0) {
            const prevChar = currentValue[start - 1];
            if (prevChar !== '\n') insertText = `\n\n${text}\n`;
            else insertText = `\n${text}\n`;
        } else if (text.startsWith('[')) {
            insertText = `${text}\n`;
        } else {
            const prefix = currentValue.substring(0, start);
            const suffix = currentValue.substring(end);
            const needsSpaceBefore = prefix.length > 0 && !prefix.endsWith(' ') && !prefix.endsWith('\n') && !prefix.endsWith('(');
            const needsSpaceAfter = suffix.length > 0 && !suffix.startsWith(' ') && !suffix.startsWith('\n') && !suffix.startsWith(')');
            insertText = `${needsSpaceBefore ? ' ' : ''}${text}${needsSpaceAfter ? ' ' : ''}`;
        }
        newValue = currentValue.substring(0, start) + insertText + currentValue.substring(end);
    }
    
    onChange(newValue);
    
    setTimeout(() => {
        el.focus();
        // If replacing, cursor at end of replacement. If inserting, cursor at end of insertion.
        const newCursorPos = start + (replaceSelection ? text.length : text.length); 
    }, 0);
    
    sfx.play('light');
  }, [onChange]);

  const handleToolAction = (action: 'extend' | 'background' | 'optimize') => {
      const el = textareaRef.current;
      if (!el) return;
      
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const text = el.value.substring(start, end);
      
      if (!text && action !== 'optimize') return; // Optimize can work on full text

      let result = '';
      if (action === 'extend') {
          result = extendVowel(text, vowelLevel);
      } else if (action === 'background') {
          result = `(${text})`;
      } else if (action === 'optimize') {
          result = optimizeTags(text || el.value);
          if (!text) {
              // Full replace
              onChange(result);
              sfx.play('success');
              return;
          }
      }

      if (result) {
          handleInsert(result, true);
          sfx.play('success');
      }
  };

  const handleChordClick = (note: string) => {
      let suffix = '';
      if (chordType === 'min') suffix = 'm';
      if (chordType === '7') suffix = '7';
      handleInsert(`(${note}${suffix})`);
  };

  const handleRewrite = useCallback(async (mode: 'flow' | 'edgy' | 'rhyme' | 'extend' | 'chords') => {
    const el = textareaRef.current;
    if (!selection || isRewriting || !el) return;
    setIsRewriting(true);
    sfx.play('click');
    
    try {
        const currentValue = el.value;
        const rewritten = await rewriteLyricFragment(selection.text, context, mode, isPyriteMode);
        const newValue = currentValue.substring(0, selection.start) + rewritten + currentValue.substring(selection.end);
        onChange(newValue);
        setSelection(null);
        sfx.play('success');
    } catch (e) {
        console.error("Rewrite failed", e);
        sfx.play('error');
    } finally {
        setIsRewriting(false);
    }
  }, [selection, isRewriting, context, isPyriteMode, onChange]);

  const handleFormat = useCallback((type: StructureType | 'auto') => {
      const el = textareaRef.current;
      if (!el) return;
      
      let targetType = type;
      if (type === 'auto') {
          const lowerGenre = (genre || '').toLowerCase();
          if (lowerGenre.includes('rap') || lowerGenre.includes('hip')) targetType = 'hiphop';
          else if (lowerGenre.includes('elect') || lowerGenre.includes('edm')) targetType = 'electronic';
          else if (lowerGenre.includes('ballad')) targetType = 'ballad';
          else targetType = 'pop';
      }

      const formatted = structureLyrics(el.value, targetType as StructureType);
      if (formatted) {
          onChange(formatted);
          setShowFormats(false);
          sfx.play('success');
      }
  }, [genre, onChange]);

  const highlightedText = useSyntaxHighlighter(value, placeholder, isPyriteMode);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    sfx.play('toggle');
  }, []);

  const baseStyles = "w-full h-full p-5 font-mono text-sm leading-7 whitespace-pre-wrap break-words transition-opacity duration-200";
  const colors = isPyriteMode 
    ? "bg-zinc-950/40 caret-purple-500 selection:bg-purple-500/30 text-transparent" 
    : "bg-zinc-900/40 caret-yellow-500 selection:bg-yellow-500/30 text-transparent";
  
  const containerClass = cn(
    "relative group rounded-xl border transition-all duration-300 flex flex-col overflow-hidden shadow-inner",
    isPyriteMode 
      ? "border-purple-500/20 bg-zinc-950" 
      : "border-zinc-700 bg-zinc-900",
    isFocused && (isPyriteMode 
      ? "ring-1 ring-purple-500/30 border-purple-500/50" 
      : "ring-1 ring-yellow-500/30 border-yellow-500/50"),
    isFullscreen 
      ? "flex-1 w-full h-full border-none ring-0 bg-transparent" 
      : "h-80 md:h-[450px]",
    className
  );

  const headerClass = cn(
    "flex justify-between items-center px-4 py-2 border-b z-20 shrink-0 select-none",
    isPyriteMode ? "bg-purple-900/10 border-purple-500/20" : "bg-white/5 border-white/5",
    isFullscreen && (isPyriteMode ? "bg-purple-950/50" : "bg-zinc-900")
  );

  const activeBtnClass = isPyriteMode ? "text-purple-200 hover:bg-purple-500/20" : "text-zinc-200 hover:bg-white/10";
  const tagBtnClass = isPyriteMode 
    ? "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40" 
    : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:border-white/20";

  const EditorContent = (
    <div ref={containerRef} className={containerClass}>
      {/* HEADER */}
      <div className={headerClass}>
          <div className="flex items-center min-h-[32px] overflow-hidden">
              {selection ? (
                  <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 whitespace-nowrap overflow-x-auto scrollbar-hide">
                      <div className={cn(
                          "px-2 py-1 text-[9px] font-bold uppercase tracking-wider border-r mr-1 flex items-center rounded-l-md",
                          isPyriteMode ? "text-purple-300 border-purple-500/30 bg-purple-500/10" : "text-yellow-500 border-white/10 bg-white/5"
                      )}>
                          <Wand2 className="w-3 h-3 mr-1.5" />
                          AI Rewrite
                      </div>
                      <button onClick={() => handleRewrite('flow')} disabled={isRewriting} className={cn("px-2 py-1 rounded-md text-[10px] transition-colors font-medium", activeBtnClass)}>{t.flow}</button>
                      <button onClick={() => handleRewrite('edgy')} disabled={isRewriting} className={cn("px-2 py-1 rounded-md text-[10px] transition-colors font-medium", activeBtnClass)}>{t.edgy}</button>
                      <button onClick={() => handleRewrite('rhyme')} disabled={isRewriting} className={cn("px-2 py-1 rounded-md text-[10px] transition-colors font-medium", activeBtnClass)}>{t.rhyme}</button>
                      <button onClick={() => handleRewrite('extend')} disabled={isRewriting} className={cn("px-2 py-1 rounded-md text-[10px] transition-colors font-medium", activeBtnClass)} title="AI Extend">{t.extend}</button>
                      <div className="w-px h-3 bg-white/10 mx-1" />
                      <button onClick={() => setSelection(null)} className="p-1 hover:text-red-400 text-zinc-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
              ) : (
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center">
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-2 transition-colors", isFocused ? (isPyriteMode ? "bg-purple-500 shadow-[0_0_8px_#a855f7]" : "bg-yellow-500 shadow-[0_0_8px_#eab308]") : "bg-zinc-700")} />
                      {isFullscreen ? t.fullscreen : t.title}
                  </span>
              )}
          </div>

          <div className="flex gap-2 ml-2">
             <div className="relative group/menu">
                 <button onClick={() => setShowFormats(!showFormats)} className={cn("p-2 rounded-md transition-colors", activeBtnClass, "text-zinc-400")} title={t.formatMenu}>
                    <LayoutTemplate className="w-4 h-4" />
                 </button>
                 {showFormats && (
                     <div className={cn("absolute right-0 top-full mt-2 w-32 border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95", isPyriteMode ? "bg-zinc-950 border-purple-500/30" : "bg-zinc-900 border-zinc-700")}>
                         <button onClick={() => handleFormat('auto')} className="w-full text-left px-3 py-2 text-[10px] hover:bg-white/10 text-yellow-400 font-bold border-b border-white/5">{t.autoDetect}</button>
                         {['pop', 'hiphop', 'electronic', 'ballad'].map(fmt => (
                             <button key={fmt} onClick={() => handleFormat(fmt as any)} className="w-full text-left px-3 py-2 text-[10px] hover:bg-white/10 text-zinc-300 capitalize">{fmt}</button>
                         ))}
                     </div>
                 )}
             </div>
             <button onClick={toggleFullscreen} type="button" className={cn("p-2 rounded-md transition-colors", activeBtnClass, "text-zinc-400")} title={isFullscreen ? "Minimize" : "Maximize"}>
               {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
             </button>
          </div>
      </div>

      {/* QUICK TAG TOOLBAR */}
      <div className={cn(
          "flex items-center gap-2 px-4 py-2 border-b overflow-x-auto scrollbar-hide flex-shrink-0 bg-opacity-30",
          isPyriteMode ? "border-purple-500/10 bg-purple-900/5" : "border-white/5 bg-black/10"
      )}>
          <Tag className="w-3 h-3 text-zinc-500 flex-shrink-0" />
          {QUICK_TAGS.map(tag => (
              <button
                  key={tag}
                  onClick={() => handleInsert(tag)}
                  className={cn("px-2 py-1 rounded text-[10px] font-mono font-medium border transition-all whitespace-nowrap flex-shrink-0", tagBtnClass)}
              >
                  {tag}
              </button>
          ))}
          <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />
          <button 
            onClick={() => handleFormat('auto')} 
            className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap flex-shrink-0 flex items-center", isPyriteMode ? "text-purple-400 hover:text-purple-200" : "text-yellow-500 hover:text-yellow-300")}
          >
            {t.autoFormat}
          </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Syntax Highlight Layer */}
        <div ref={backdropRef} className={cn("absolute inset-0 z-0 pointer-events-none overflow-auto custom-scrollbar", baseStyles)} aria-hidden="true">
            {highlightedText}
        </div>

        {/* Editing Layer */}
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onSelect={handleSelect}
            onFocus={(e) => { setIsFocused(true); if(onFocus) onFocus(e); }}
            onBlur={() => setIsFocused(false)}
            className={cn("absolute inset-0 z-10 block resize-none outline-none placeholder:text-zinc-600 custom-scrollbar bg-transparent", baseStyles, colors)}
            spellCheck={false}
            placeholder={!value ? placeholder : ''}
        />
      </div>
      
      {/* Tools Section */}
      <div className={cn(
          "border-t transition-colors",
          isPyriteMode ? "border-purple-500/20 bg-purple-900/5" : "border-white/10 bg-white/5"
      )}>
        <button 
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className="w-full px-4 py-2 flex justify-between items-center text-[10px] font-mono font-medium tracking-wide hover:bg-white/5 transition-colors text-left"
        >
            <div className="flex items-center gap-1.5 text-zinc-400">
                <Wand2 className="w-3 h-3 opacity-70" />
                <span className="font-bold opacity-70">{t.toolsTitle}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-zinc-500">
                    <Hash className="w-3 h-3 opacity-50" />
                    <span>{value.length} / 5000</span>
                </div>
                {isToolsOpen ? <ChevronUp className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
            </div>
        </button>
        
        {isToolsOpen && (
            <div className="p-4 animate-in fade-in slide-in-from-top-2 border-t border-white/5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Lyrics */}
                    <div className="space-y-4">
                        {/* 1. Rhyme Assistant */}
                        <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                            <div className="text-[9px] font-bold uppercase text-zinc-500 mb-2">{t.rhymes}</div>
                            <RhymeAssistant context={context} lang={lang} isPyriteMode={isPyriteMode} onCopy={handleInsert} />
                        </div>
                        
                        {/* 2. Formatting Tools */}
                        <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                           <div className="text-[9px] font-bold uppercase text-zinc-500 mb-2">Lyric Formatter</div>
                           <div className="grid grid-cols-2 gap-3">
                               {/* Vowel Extension */}
                               <div>
                                   <label className="text-[9px] text-zinc-400 block mb-1">Vowel Extension</label>
                                   <div className="flex items-center gap-2">
                                       <input 
                                           type="range" 
                                           min="1" max="5" 
                                           value={vowelLevel} 
                                           onChange={e => setVowelLevel(parseInt(e.target.value))}
                                           className={cn("w-16 h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-700", isPyriteMode ? 'accent-purple-500' : 'accent-yellow-500')}
                                       />
                                       <ThemedButton onClick={() => handleToolAction('extend')} variant="zinc" className="px-2 py-1 text-[9px] h-auto">Extend</ThemedButton>
                                   </div>
                               </div>
                               {/* Background Vocals */}
                               <div>
                                   <label className="text-[9px] text-zinc-400 block mb-1">Background Layer</label>
                                   <ThemedButton onClick={() => handleToolAction('background')} variant="zinc" className="px-2 py-1 text-[9px] w-full h-auto flex items-center justify-center gap-1">
                                       <Layers className="w-3 h-3" /> Wrap ( )
                                   </ThemedButton>
                               </div>
                           </div>
                        </div>
                    </div>

                    {/* Right Column: Music */}
                    <div className="space-y-4">
                        {/* 3. Chord Alchemy */}
                        <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[9px] font-bold uppercase text-zinc-500 flex items-center gap-1.5"><Music className="w-3 h-3" />{t.chordAlchemy}</div>
                                <div className="flex gap-1">
                                    {(['maj', 'min', '7'] as const).map(type => (
                                        <button 
                                            key={type} 
                                            onClick={() => setChordType(type)} 
                                            className={cn(
                                                "px-2 py-0.5 text-[9px] rounded font-bold border transition-colors", 
                                                chordType === type 
                                                    ? (isPyriteMode ? "bg-purple-600 text-white border-purple-500" : "bg-yellow-500 text-black border-yellow-600") 
                                                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative h-12 bg-black/30 rounded-lg p-1 flex select-none border border-white/5">
                                {PIANO_KEYS.map(({ note, type }) => (
                                    type === 'white' ? (
                                        <button 
                                            key={note} 
                                            onClick={() => handleChordClick(note)} 
                                            className="h-full flex-1 bg-zinc-200 hover:bg-white rounded-sm active:bg-zinc-400 transition-colors relative group border border-zinc-300"
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
                                                onClick={() => handleChordClick(note)} 
                                                style={{ left: `${(i - 0.5) * (100 / 12)}%` }} 
                                                className="absolute top-0 w-[5%] h-[60%] bg-black border border-zinc-700 rounded-b-sm pointer-events-auto active:bg-zinc-800 hover:bg-zinc-900 transition-colors z-10"
                                            />
                                        ) : null
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 4. Optimizer */}
                        <div className="p-3 rounded-lg bg-black/20 border border-white/5 flex justify-between items-center">
                            <div className="text-[9px] font-bold uppercase text-zinc-500">Tag Optimizer</div>
                            <ThemedButton 
                                onClick={() => handleToolAction('optimize')} 
                                variant={isPyriteMode ? 'pyrite' : 'default'} 
                                className="px-3 py-1.5 text-[9px] h-auto flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3 h-3" />
                                Convert to Tags
                            </ThemedButton>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );

  return isFullscreen ? createPortal(
    <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-300">
        {EditorContent}
    </div>,
    document.body
  ) : EditorContent;
});

export default SmartLyricEditor;
