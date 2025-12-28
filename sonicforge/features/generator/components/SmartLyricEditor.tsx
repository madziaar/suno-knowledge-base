
import React, { useState, useRef, memo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, Wand2, ShieldCheck, ShieldAlert, Info, AlertTriangle, Languages, Sparkles, Loader2 } from 'lucide-react';
import { translateLyrics, refineLyrics } from '../../../services/ai/tools';
import { structureLyrics, StructureType } from '../utils/lyricsFormatter';
import { lintStructure, LintResult } from '../utils/structureLinter';
import { useSyntaxHighlighter } from '../hooks/useSyntaxHighlighter';
import { cn } from '../../../lib/utils';
import { Language } from '../../../types';
import { sfx } from '../../../lib/audio';
import { translations } from '../../../translations';
import { useUI } from '../../../contexts/UIContext';

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
  targetLyricsLang?: string;
}

const SmartLyricEditor: React.FC<SmartLyricEditorProps> = memo(({
  value,
  onChange,
  placeholder,
  className = '',
  isPyriteMode = false,
  onFocus,
  context = '',
  genre = '',
  lang,
  targetLyricsLang
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selection, setSelection] = useState<{ start: number, end: number, text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lintResults, setLintResults] = useState<LintResult[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const { showToast } = useUI();

  // --- LINTING LOGIC ---
  useEffect(() => {
    const handler = setTimeout(() => {
      if (value) {
        setLintResults(lintStructure(value, lang));
      } else {
        setLintResults([]);
      }
    }, 300);
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
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      setSelection({ start, end, text: el.value.substring(start, end) });
    } else {
      setSelection(null);
    }
  }, []);

  const handleTranslate = async () => {
      if (!value || !targetLyricsLang || targetLyricsLang.toLowerCase() === 'auto') {
          showToast("Select a target language in Meta Controls first.", "info");
          return;
      }
      setIsProcessing(true);
      sfx.play('click');
      try {
          const translated = await translateLyrics(value, targetLyricsLang, !!isPyriteMode);
          onChange(translated);
          showToast(`Translated to ${targetLyricsLang}`, "success");
      } catch (e) {
          showToast("Translation failed", "error");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleRefine = async () => {
      if (!value) return;
      setIsProcessing(true);
      sfx.play('success');
      try {
          const langToUse = (targetLyricsLang && targetLyricsLang !== 'auto') ? targetLyricsLang : (lang === 'pl' ? 'Polish' : 'English');
          const refined = await refineLyrics(value, genre || "General", !!isPyriteMode, langToUse);
          onChange(refined);
          showToast("Lyrics Refined with Dynamic Detail", "success");
      } catch (e) {
          showToast("Refinement failed", "error");
      } finally {
          setIsProcessing(false);
      }
  };

  const highlightedText = useSyntaxHighlighter(value, placeholder, isPyriteMode);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    sfx.play('toggle');
  }, []);

  const hasErrors = lintResults.some(r => r.severity === 'error');
  const hasWarnings = lintResults.some(r => r.severity === 'warning');

  const editorContent = (
    <div className={cn(
      "relative group rounded-xl border transition-all duration-300 flex flex-col overflow-hidden shadow-inner",
      isPyriteMode ? "border-purple-500/20 bg-zinc-950" : "border-zinc-700 bg-zinc-900",
      isFullscreen ? "fixed inset-0 z-[100] h-screen w-screen border-none rounded-none" : "h-80 md:h-[450px]",
      isFocused && (isPyriteMode ? "border-purple-500/50 ring-1 ring-purple-500/20" : "border-yellow-500/50 ring-1 ring-yellow-500/20"),
      className
    )}>
      {/* HEADER / TOOLBAR */}
      <div className={cn(
        "flex justify-between items-center px-4 py-2 border-b shrink-0 bg-black/40",
        isPyriteMode ? "border-purple-500/10" : "border-white/5"
      )}>
        <div className="flex items-center gap-3">
            <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                hasErrors ? "bg-red-500/20 text-red-400" : hasWarnings ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
            )}>
                {hasErrors ? <ShieldAlert className="w-4 h-4" /> : hasWarnings ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {isFullscreen ? "Full-Scale Lyrical Architect" : "Lyrical Forge"}
            </span>
        </div>

        <div className="flex items-center gap-1">
           {/* Neural Tools */}
           <div className="flex items-center gap-1 mr-4 border-r border-white/10 pr-4">
              <button 
                onClick={handleTranslate} 
                disabled={isProcessing || !value}
                className={cn(
                    "p-2 rounded-lg hover:bg-white/5 transition-all group flex items-center gap-2",
                    isPyriteMode ? "text-purple-400" : "text-zinc-400"
                )}
                title="Auto-Translate to Target Language"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4 group-hover:scale-110" />}
                <span className="text-[9px] font-bold uppercase hidden md:inline">Translate</span>
              </button>
              
              <button 
                onClick={handleRefine} 
                disabled={isProcessing || !value}
                className={cn(
                    "p-2 rounded-lg hover:bg-white/5 transition-all group flex items-center gap-2",
                    isPyriteMode ? "text-pink-400" : "text-zinc-400"
                )}
                title="Dynamic Lyrical Refinement"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:scale-110" />}
                <span className="text-[9px] font-bold uppercase hidden md:inline">Refine</span>
              </button>
           </div>

           <button onClick={toggleFullscreen} className="p-2 rounded-md hover:bg-white/5 text-zinc-400">
             {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
           </button>
        </div>
      </div>

      {/* LINTING DRAWER */}
      {lintResults.length > 0 && (
          <div className={cn(
              "px-4 py-1.5 border-b flex items-center gap-3 overflow-x-auto custom-scrollbar",
              isPyriteMode ? "bg-purple-900/10" : "bg-black/20"
          )}>
              {lintResults.slice(0, 1).map((res, i) => (
                  <div key={i} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                      <Info className={cn("w-3 h-3", res.severity === 'error' ? "text-red-400" : "text-yellow-400")} />
                      <p className="text-[9px] font-mono text-zinc-300 uppercase tracking-tighter whitespace-nowrap">
                          {res.message}
                      </p>
                  </div>
              ))}
          </div>
      )}

      <div className="relative flex-1 overflow-hidden">
        <div 
            ref={backdropRef} 
            className="absolute inset-0 z-0 pointer-events-none p-5 font-mono text-sm leading-7 whitespace-pre-wrap break-words overflow-hidden pr-6"
        >
            {highlightedText}
        </div>
        
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onSelect={handleSelect}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 z-10 block w-full h-full p-5 bg-transparent font-mono text-sm leading-7 text-transparent caret-zinc-100 outline-none resize-none selection:bg-purple-500/30 overflow-auto custom-scrollbar"
            spellCheck={false}
            placeholder={placeholder}
        />
      </div>
      
      {/* Footer Info */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-black/20 flex justify-between items-center text-[9px] font-mono text-zinc-600">
          <span>{value.length} chars | {value.split('\n').filter(Boolean).length} lines</span>
          <span className="uppercase tracking-widest">{targetLyricsLang && targetLyricsLang !== 'auto' ? `Target: ${targetLyricsLang}` : 'Language: Auto'}</span>
      </div>
    </div>
  );

  return isFullscreen ? createPortal(editorContent, document.body) : editorContent;
});

export default SmartLyricEditor;
