
import React, { useState, memo, useMemo } from 'react';
import { BrainCircuit, Copy, Send, Star, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Terminal, Sparkles, MessageSquare } from 'lucide-react';
import { GeneratedPrompt, GeneratorState, BuilderTranslation, ToastTranslation, BatchConstraints } from '../../../types';
import GlassPanel from '../../../components/shared/GlassPanel';
import BatchGenerator from './BatchGenerator';
import { cn } from '../../../lib/utils';
import { scorePrompt } from '../utils/promptAnalysis';
import { sfx } from '../../../lib/audio';
import { motion, AnimatePresence } from 'framer-motion';

const QualityBadge = memo(({ score, grade, status }: { score: number, grade: string, status: string }) => {
    const isOptimal = status === 'optimal' || status === 'good';
    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono transition-all",
            isOptimal ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        )}>
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold leading-none opacity-50 mb-0.5">Grade</span>
                <span className="text-sm font-bold leading-none">{grade}</span>
            </div>
            <div className="w-px h-6 bg-current opacity-20" />
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold leading-none opacity-50 mb-0.5">Audit</span>
                <span className="text-sm font-bold leading-none">{score}%</span>
            </div>
        </div>
    );
});

interface ResultsDisplayProps {
  result: GeneratedPrompt | null;
  state: GeneratorState;
  showLyrics: boolean;
  onEnhance: (field: 'tags' | 'style', input: string) => void;
  onRefine: (instruction: string) => void;
  onOpenExport: () => void;
  onUpdateResult: (partial: Partial<GeneratedPrompt>) => void;
  t: BuilderTranslation;
  toast: ToastTranslation;
  isPyriteMode?: boolean;
  showToast?: (msg: string, type?: 'success' | 'info') => void;
  variations?: GeneratedPrompt[]; 
  isGeneratingVariations?: boolean;
  onGenerateVariations: (count: number, level: 'light' | 'medium' | 'heavy', constraints: BatchConstraints, evolutionPath?: string) => void;
  onApplyVariation: (variation: GeneratedPrompt) => void;
  onExportBatch: (selected: number[]) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  result, state, showLyrics, onEnhance, onRefine, onOpenExport, onUpdateResult,
  t, toast, isPyriteMode = false, showToast,
  variations = [], isGeneratingVariations = false, onGenerateVariations, onApplyVariation, onExportBatch
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false); 
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const quality = useMemo(() => {
      if (!result || state !== GeneratorState.COMPLETE) return null;
      return scorePrompt(result, 'suno');
  }, [result, state]);

  const handleRefineSubmit = async () => {
      if (!refinementInput.trim()) return;
      setIsRefining(true);
      sfx.play('click');
      await onRefine(refinementInput);
      setRefinementInput('');
      setIsRefining(false);
  };

  const handleQuickFix = (fixType: 'end' | 'pipe' | 'vocal') => {
      if (!result) return;
      sfx.play('success');
      
      let updated = { ...result };
      if (fixType === 'end') {
          updated.lyrics = (result.lyrics || '') + "\n[Instrumental Fade Out]\n[End]";
      } else if (fixType === 'pipe') {
          updated.lyrics = (result.lyrics || '').replace(/\[([^\]|]+)\]/g, (match, p1) => `[${p1.trim()} | High Energy]`);
      } else if (fixType === 'vocal') {
          updated.style = "Sassy Female Vocals, Mature Timbre, " + result.style;
      }
      
      onUpdateResult(updated);
      showToast?.("Quick-Fix Applied", "success");
  };

  const outputT = t?.output || { 
      waiting: "Awaiting Synthesis", 
      waitingDesc: "Input intent to initiate neural cascade", 
      titleLabel: "Composition Title", 
      exportSuno: "Copy Blueprint",
      analysisTitle: "Deep Reasoning Trace"
  };

  if (!result && state !== GeneratorState.COMPLETE) {
    return (
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} layer="surface" className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-600 p-8 text-center border-dashed border-2 border-white/5 relative group">
        <Sparkles className="w-12 h-12 mb-4 opacity-20 group-hover:scale-110 transition-transform" />
        <h3 className="text-lg font-bold text-zinc-400 tracking-widest uppercase">{outputT.waiting}</h3>
        <p className="text-xs max-w-xs mt-2 font-mono">{outputT.waitingDesc}</p>
      </GlassPanel>
    );
  }

  const issues = quality?.issues || [];

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* HEADER SECTION WITH QUALITY AUDIT */}
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl", isPyriteMode ? "bg-purple-600/20 text-purple-400" : "bg-blue-600/20 text-blue-400")}>
                  <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest leading-none mb-1">Blueprint Finalized</h3>
                  <p className="text-[9px] text-zinc-500 font-mono">
                      {result?.modelUsed ? `ENGINE: ${result.modelUsed.toUpperCase()}` : 'ENCRYPTED_STREAM_V45'}
                  </p>
              </div>
          </div>
          {quality && (
              <QualityBadge score={quality.totalScore} grade={quality.grade} status={quality.status} />
          )}
      </div>

      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} layer="surface" noPadding className="flex-1 flex flex-col overflow-hidden border-white/10 bg-zinc-950/80 shadow-2xl relative">
        
        {/* Quick-Fix Terminal */}
        {issues.length > 0 && (
            <div className="px-5 py-3 border-b border-white/5 bg-amber-500/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9px] font-bold text-amber-500/80 uppercase">Detected structural weaknesses ({issues.length})</span>
                </div>
                <div className="flex gap-2">
                    {issues.some(i => i.includes('ending')) && (
                        <button onClick={() => handleQuickFix('end')} className="text-[9px] font-bold text-amber-200 hover:text-white bg-amber-500/20 px-2 py-1 rounded border border-amber-500/30 transition-all">Fix Ending</button>
                    )}
                    {issues.some(i => i.includes('Vocal')) && (
                        <button onClick={() => handleQuickFix('vocal')} className="text-[9px] font-bold text-amber-200 hover:text-white bg-amber-500/20 px-2 py-1 rounded border border-amber-500/30 transition-all">Lock Voice</button>
                    )}
                </div>
            </div>
        )}

        {/* REFINEMENT BAR (New) */}
        <div className="p-3 border-b border-white/5 bg-white/[0.02]">
            <div className="relative flex items-center">
                <MessageSquare className="absolute left-3 w-4 h-4 text-zinc-500" />
                <input 
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                    placeholder={isPyriteMode ? "Give me an order, darling... (e.g. 'Make it faster')" : "Enter refinement instruction... (e.g. 'Add more bass')"}
                    disabled={isRefining}
                    className={cn(
                        "w-full bg-black/40 border rounded-lg pl-10 pr-10 py-2.5 text-xs text-white outline-none focus:ring-1 transition-all",
                        isPyriteMode ? "border-purple-500/30 focus:border-purple-500 focus:ring-purple-500/20" : "border-white/10 focus:border-white/30 focus:ring-white/10"
                    )}
                />
                <button 
                    onClick={handleRefineSubmit}
                    disabled={!refinementInput.trim() || isRefining}
                    className="absolute right-2 p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    {isRefining ? <span className="animate-spin">⟳</span> : <Send className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>

        {/* NEURAL LOGIC CORE (Reasoning Display) */}
        {result?.analysis && (
            <div className="border-b border-white/5 shrink-0 bg-black/40">
                <button 
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className={cn(
                        "w-full flex items-center justify-between px-5 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors",
                        isPyriteMode ? "text-purple-400" : "text-blue-400"
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" />
                        {outputT.analysisTitle || "Deep Reasoning Trace"}
                    </span>
                    {showAnalysis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <AnimatePresence>
                    {showAnalysis && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 pb-4">
                                <div className={cn(
                                    "p-4 rounded-lg border text-xs font-mono leading-relaxed whitespace-pre-wrap relative overflow-hidden",
                                    isPyriteMode ? "bg-purple-950/20 border-purple-500/20 text-purple-100/90" : "bg-blue-950/20 border-blue-500/20 text-blue-100/90"
                                )}>
                                    <div className="absolute top-0 left-0 px-2 py-1 bg-white/5 text-[8px] font-bold uppercase tracking-wider rounded-br-lg text-white/50">
                                        Logic Core Output
                                    </div>
                                    <div className="pt-4 opacity-90">
                                        {result.analysis}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <div className="group">
              <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-zinc-500 mb-2"><Star className="w-3 h-3" />{outputT.titleLabel}</span>
              <div className="font-mono text-xl md:text-2xl font-bold text-white tracking-tight">{result?.title}</div>
            </div>
            
            <div className="group">
              <div className="flex justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-zinc-500">Style DNA</span>
                <button onClick={() => result?.style && onEnhance('style', result.style)} className="text-[9px] text-purple-400 hover:underline">Auto-Refine</button>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-black/40 text-blue-100/90 font-mono text-xs leading-relaxed select-all">
                {result?.style}
              </div>
            </div>

            <div className="group">
              <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-zinc-500 mb-2">Meta Tags</span>
              <div className="flex flex-wrap gap-2">
                  {result?.tags?.split(',').map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-md border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors cursor-default">
                          {tag.trim()}
                      </span>
                  ))}
              </div>
            </div>

            {showLyrics && (
              <div className="group pt-4 border-t border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-zinc-500 mb-3">Structural Lyrics</span>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5 text-zinc-300 font-mono text-xs leading-loose whitespace-pre-wrap select-all relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-purple-500/5 to-transparent h-6 top-1/2 -mt-3 opacity-20" />
                    {result?.lyrics}
                </div>
              </div>
            )}

            {/* BATCH GENERATOR INTEGRATION */}
            <div className="pt-6 border-t border-white/5">
                <BatchGenerator 
                    basePrompt={result!}
                    variations={variations}
                    onGenerate={onGenerateVariations}
                    onApply={onApplyVariation}
                    onExport={onExportBatch}
                    isGenerating={isGeneratingVariations}
                    isPyriteMode={isPyriteMode}
                    t={t}
                />
            </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center gap-3 shrink-0">
            <button 
                onClick={onOpenExport}
                className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                    isPyriteMode ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "bg-zinc-800 text-white"
                )}
            >
                {outputT.exportSuno}
            </button>
            <button 
                onClick={() => {
                    navigator.clipboard.writeText(`${result?.title}\n\n${result?.style}\n\n${result?.tags}\n\n${result?.lyrics}`);
                    showToast?.("Architecture Copied", "success");
                    sfx.play('light');
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors"
            >
                <Copy className="w-5 h-5" />
            </button>
        </div>
      </GlassPanel>
    </div>
  );
};

export default memo(ResultsDisplay);
