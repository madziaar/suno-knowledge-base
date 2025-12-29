
import React, { useState, useRef, memo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, Wand2, ShieldCheck, ShieldAlert, Info, AlertTriangle, Languages, Sparkles, Loader2, LayoutGrid, Check, Type, Music, Mic2, ArrowRight } from 'lucide-react';
import { translateLyrics, refineLyrics } from '../../../services/ai/tools';
import { structureLyrics, autoFormatLyrics } from '../utils/lyricsFormatter';
import { lintStructure, LintResult } from '../utils/structureLinter';
import { useSyntaxHighlighter } from '../hooks/useSyntaxHighlighter';
import { cn } from '../../../lib/utils';
import { Language } from '../../../types';
import { sfx } from '../../../lib/audio';
import { translations } from '../../../translations';
import { useUI } from '../../../contexts/UIContext';
import MetaTagToolbar from './MetaTagToolbar'; // New component
import Tooltip from '../../../components/Tooltip';

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
  const [isFormatted, setIsFormatted] = useState(false);
  
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

  // Insert tag at cursor or replace selection
  const handleInsertTag = useCallback((tag: string) => {
      const el = textareaRef.current;
      if (!el) return;
      
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const text = el.value;
      
      // Ensure newline spacing for structural tags
      const isStructure = tag.startsWith('[') && !tag.includes('solo') && !tag.includes('vocal');
      let insertion = tag;
      
      if (isStructure) {
          const hasNewlineBefore = start > 0 && text[start - 1] === '\n';
          const hasNewlineAfter = end < text.length && text[end] === '\n';
          insertion = `${hasNewlineBefore ? '' : '\n'}${tag}${hasNewlineAfter ? '' : '\n'}`;
      } else {
          insertion = ` ${tag} `; // Space padding for inline tags
      }

      const newValue = text.substring(0, start) + insertion + text.substring(end);
      onChange(newValue);
      sfx.play('click');
      
      // Restore focus and cursor
      setTimeout(() => {
          el.focus();
          const newCursorPos = start + insertion.length;
          el.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
  }, [onChange]);

  const handleAutoFormat = useCallback(() => {
    if (!value) return;
    sfx.play('success');
    const formatted = autoFormatLyrics(value);
    onChange(formatted);
    setIsFormatted(true);
    showToast("Structure Standardized", "success");
    setTimeout(() => setIsFormatted(false), 2000);
  }, [value, onChange, showToast]);

  const handleApplyStructure = useCallback((type: string) => {
      if (!value) {
          // If empty, generate a skeleton
          const skeleton = structureLyrics("", type as any);
          onChange(skeleton);
      } else {
          // If content exists, try to restructure it
          const structured = structureLyrics(value, type as any);
          onChange(structured);
      }
      sfx.play('secret');
      showToast(`${type} Structure Applied`, 'success');
  }, [value, onChange, showToast]);

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
      isFullscreen ? "fixed inset-0 z-[100] h-screen w-screen border-none rounded-none" : "h-[500px]",
      isFocused && (isPyriteMode ? "border-purple-500/50 ring-1 ring-purple-500/20" : "border-yellow-500/50 ring-1 ring-yellow-500/20"),
      className
    )}>
      {/* TOOLBAR */}
      <div className={cn(
        "flex flex-col border-b shrink-0 bg-black/40",
        isPyriteMode ? "border-purple-500/10" : "border-white/5"
      )}>
        {/* Row 1: Actions */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-white/5">
             <div className="flex items-center gap-2">
                <div className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-help flex items-center gap-2",
                    hasErrors ? "bg-red-500/20 text-red-400" : hasWarnings ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                )}>
                    {hasErrors ? <ShieldAlert className="w-3.5 h-3.5" /> : hasWarnings ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold uppercase hidden md:inline">
                        {hasErrors ? "Issues Found" : hasWarnings ? "Improvements" : "Structure Valid"}
                    </span>
                </div>
                
                {/* Structure Presets */}
                <div className="h-4 w-px bg-white/10 mx-1" />
                <div className="flex gap-1">
                   {['Pop', 'HipHop', 'EDM'].map(s => (
                       <button 
                         key={s}
                         onClick={() => handleApplyStructure(s.toLowerCase())}
                         className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold uppercase tracking-tighter text-zinc-400 transition-all border border-transparent hover:border-white/10"
                         title={`Apply ${s} Structure`}
                       >
                           {s}
                       </button>
                   ))}
                </div>
             </div>

             <div className="flex items-center gap-1">
                <button 
                    onClick={handleAutoFormat}
                    className={cn(
                        "p-1.5 rounded hover:bg-white/10 transition-colors text-zinc-400 hover:text-white",
                        isFormatted && "text-green-400"
                    )}
                    title="Auto-Format Syntax"
                >
                    {isFormatted ? <Check className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </button>
                <button 
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
             </div>
        </div>

        {/* Row 2: Meta Tag Toolbar */}
        <MetaTagToolbar onInsert={handleInsertTag} isPyriteMode={isPyriteMode} />
      </div>

      {/* LINTING DRAWER */}
      {lintResults.length > 0 && (
          <div className={cn(
              "px-3 py-1.5 border-b flex items-center gap-3 overflow-x-auto custom-scrollbar whitespace-nowrap",
              isPyriteMode ? "bg-purple-900/10 border-purple-500/10" : "bg-black/20 border-white/5"
          )}>
              {lintResults.map((res, i) => (
                  <div key={i} className="flex items-center gap-1.5 animate-in slide-in-from-left-2">
                      <Info className={cn("w-3 h-3", res.severity === 'error' ? "text-red-400" : "text-yellow-400")} />
                      <p className="text-[9px] font-mono text-zinc-400">
                          <span className={cn("font-bold uppercase mr-1", res.severity === 'error' ? "text-red-400" : "text-yellow-400")}>
                             {res.severity}:
                          </span>
                          {res.message}
                      </p>
                  </div>
              ))}
          </div>
      )}

      {/* EDITOR AREA */}
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
      
      {/* FOOTER INFO */}
      <div className="px-4 py-1.5 border-t border-white/5 bg-black/20 flex justify-between items-center text-[9px] font-mono text-zinc-600">
          <div className="flex gap-3">
              <span>{value.length} chars</span>
              <span>{value.split('\n').filter(Boolean).length} lines</span>
              <span>~{Math.ceil(value.length / 20)}s est.</span>
          </div>
          <span className="uppercase tracking-widest">{targetLyricsLang && targetLyricsLang !== 'auto' ? `Target: ${targetLyricsLang}` : 'Language: Auto'}</span>
      </div>
    </div>
  );

  return isFullscreen ? createPortal(editorContent, document.body) : editorContent;
});

export default SmartLyricEditor;
