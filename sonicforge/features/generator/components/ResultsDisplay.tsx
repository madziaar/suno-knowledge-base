
import React, { useState, memo, useMemo } from 'react';
import { BrainCircuit, Copy, Send, Star, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Terminal, Sparkles, MessageSquare, Globe, ExternalLink, Activity, Target, ShieldCheck, Cpu, Music } from 'lucide-react';
import { GeneratedPrompt, GeneratorState, BuilderTranslation, ToastTranslation, BatchConstraints, GroundingChunk } from '../../../types';
import GlassPanel from '../../../components/shared/GlassPanel';
import BatchGenerator from './BatchGenerator';
import { cn } from '../../../lib/utils';
import { scorePrompt } from '../utils/promptAnalysis';
import { sfx } from '../../../lib/audio';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralSpinner from '../../../components/shared/NeuralSpinner';

const QualityBadge = memo(({ score, grade, status }: { score: number, grade: string, status: string }) => {
    const isOptimal = status === 'optimal' || status === 'good';
    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono transition-all",
            isOptimal ? "bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.1)]" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        )}>
            <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-black leading-none opacity-50 mb-0.5 tracking-tighter">FIDELITY</span>
                <span className="text-sm font-black leading-none">{grade}</span>
            </div>
            <div className="w-px h-6 bg-current opacity-20" />
            <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-black leading-none opacity-50 mb-0.5 tracking-tighter">AUDIT</span>
                <span className="text-sm font-black leading-none">{score}%</span>
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
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
  variations?: GeneratedPrompt[]; 
  isGeneratingVariations?: boolean;
  onGenerateVariations: (count: number, level: 'light' | 'medium' | 'heavy', constraints: BatchConstraints, evolutionPath?: string) => void;
  onApplyVariation: (variation: GeneratedPrompt) => void;
  onExportBatch: (selected: number[]) => void;
  researchData?: { text: string; sources: GroundingChunk[] } | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  result, state, showLyrics, onEnhance, onRefine, onOpenExport, onUpdateResult,
  t, toast, isPyriteMode = false, showToast,
  variations = [], isGeneratingVariations = false, onGenerateVariations, onApplyVariation, onExportBatch,
  researchData
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false); // Default closed to focus on outputs
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

  const handleCopy = (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      showToast?.(`${label} Copied`, 'success');
      sfx.play('light');
  };

  const outputT = t?.output || { 
      waiting: "Awaiting Synthesis", 
      waitingDesc: "Input intent to initiate neural cascade", 
      titleLabel: "Composition Title", 
      exportSuno: "Copy Blueprint",
      analysisTitle: "Deep Reasoning Trace"
  };

  const isWorking = state === GeneratorState.RESEARCHING || state === GeneratorState.ANALYZING || state === GeneratorState.GENERATING || state === GeneratorState.OPTIMIZING;

  if (!result && state !== GeneratorState.COMPLETE) {
    return (
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} layer="surface" className="h-full min-h-[600px] flex flex-col items-center justify-center text-zinc-600 p-8 text-center border-dashed border-2 border-white/5 relative group overflow-hidden">
        <AnimatePresence mode="wait">
          {isWorking ? (
            <motion.div 
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center"
            >
              <NeuralSpinner 
                isPyriteMode={isPyriteMode} 
                size="lg" 
                label={state === GeneratorState.RESEARCHING ? "Neural DNA Search" : state === GeneratorState.ANALYZING ? "Architectural Logic" : "Synthesizing Core"} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <Target className="w-16 h-16 mb-4 opacity-20 group-hover:scale-110 transition-transform text-white" />
              <h3 className="text-xl font-black text-zinc-400 tracking-[0.2em] uppercase">{outputT.waiting}</h3>
              <p className="text-xs max-w-xs mt-3 font-mono leading-relaxed">{outputT.waitingDesc}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <svg width="100%" height="100%">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
              <div className={cn("p-2.5 rounded-2xl border bg-black/40", isPyriteMode ? "border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]")}>
                  <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] leading-none mb-1.5">{result.title || "Untitled Blueprint"}</h3>
                  <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">
                        {result?.modelUsed || 'Neural_Core_v5.0'}
                      </p>
                  </div>
              </div>
          </div>
          {quality && (
              <QualityBadge score={quality.totalScore} grade={quality.grade} status={quality.status} />
          )}
      </div>

      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} layer="surface" noPadding className="flex-1 flex flex-col overflow-hidden border-white/10 bg-zinc-950/80 shadow-2xl relative min-h-[700px]">
        
        {/* REFINEMENT BAR */}
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <div className="relative flex items-center">
                <MessageSquare className="absolute left-4 w-4 h-4 text-zinc-500" />
                <input 
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                    placeholder={isPyriteMode ? "Whisper your desires, Darling..." : "Instruct the Refiner Agent..."}
                    disabled={isRefining}
                    className={cn(
                        "w-full bg-black/60 border rounded-xl pl-12 pr-12 py-3 text-xs md:text-sm text-white outline-none focus:ring-1 transition-all font-medium",
                        isPyriteMode ? "border-purple-500/30 focus:border-purple-500 focus:ring-purple-500/20" : "border-white/10 focus:border-white/30 focus:ring-white/10"
                    )}
                />
                <button 
                    onClick={handleRefineSubmit}
                    disabled={!refinementInput.trim() || isRefining}
                    className="absolute right-3 p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                    {isRefining ? <span className="animate-spin text-xs">⟳</span> : <Send className="w-4 h-4" />}
                </button>
            </div>
        </div>

        {/* RESULTS FEED */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Field 1: Style of Music (The Style Prompt) */}
            <div className="group space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-400">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    Field 1: Style of Music
                </span>
                <button 
                    onClick={() => result?.style && handleCopy(result.style, 'Style Prompt')} 
                    className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
                >
                    <Copy className="w-3 h-3" />
                    Copy
                </button>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 text-blue-100/90 font-mono text-xs md:text-sm leading-relaxed select-all relative group-hover:border-blue-500/30 transition-colors shadow-inner">
                {result?.style}
              </div>
            </div>

            {/* Field 2: Lyrics (The Structured Content) */}
            {showLyrics && (
              <div className="group space-y-3 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-400">
                      <Music className="w-3.5 h-3.5 text-purple-400" />
                      Field 2: Lyrics
                  </span>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => result?.lyrics && handleCopy(result.lyrics, 'Lyrics')} 
                        className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
                    >
                        <Copy className="w-3 h-3" />
                        Copy
                    </button>
                  </div>
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/10 text-zinc-300 font-mono text-xs md:text-sm leading-[1.8] whitespace-pre-wrap select-all relative shadow-inner group-hover:border-purple-500/30 transition-colors max-h-[500px] overflow-y-auto custom-scrollbar">
                    {result?.lyrics}
                </div>
              </div>
            )}

            {/* Tags (Supplemental) */}
            <div className="group animate-in fade-in slide-in-from-left-4 duration-500 delay-200 pt-4 border-t border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-600 mb-3">
                  <Terminal className="w-3.5 h-3.5" />
                  Meta Tags Detected
              </span>
              <div className="flex flex-wrap gap-2">
                  {result?.tags?.split(',').map((tag, i) => (
                      <span key={i} className="px-2 py-1 text-[10px] font-mono font-medium rounded border border-white/5 bg-white/5 text-zinc-500 uppercase">
                          {tag.trim()}
                      </span>
                  ))}
              </div>
            </div>

            {/* Reasoning Trace (Collapsible) */}
            {result?.analysis && (
                <div className="pt-4 border-t border-white/5">
                     <button 
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
                     >
                        {showAnalysis ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                        {outputT.analysisTitle || "Deep Reasoning Trace"}
                     </button>
                     <AnimatePresence>
                        {showAnalysis && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-3"
                            >
                                <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-[10px] font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                    {result.analysis}
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
                </div>
            )}

            {/* BATCH GENERATOR */}
            <div className="pt-8 border-t border-white/5">
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

        {/* ACTION BAR */}
        <div className="p-6 border-t border-white/10 bg-black/60 flex items-center gap-4 shrink-0">
            <button 
                onClick={onOpenExport}
                className={cn(
                    "flex-1 py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn",
                    isPyriteMode ? "bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]" : "bg-white text-black shadow-xl"
                )}
            >
                <span className="relative z-10">{outputT.exportSuno}</span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            </button>
            <button 
                onClick={() => {
                    navigator.clipboard.writeText(`${result?.title}\n\nStyle: ${result?.style}\n\nTags: ${result?.tags}\n\n${result?.lyrics}`);
                    showToast?.("Full Composite Copied", "success");
                    sfx.play('light');
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95"
                title="Full Composite Copy"
            >
                <Copy className="w-6 h-6" />
            </button>
        </div>
      </GlassPanel>
    </div>
  );
};

export default memo(ResultsDisplay);
