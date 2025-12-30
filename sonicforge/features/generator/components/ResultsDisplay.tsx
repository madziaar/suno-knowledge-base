
import React, { useState, memo, useMemo } from 'react';
import { BrainCircuit, Copy, Zap, Send, Sparkles, Cpu, Activity, CheckCircle2, Download, RefreshCcw, FileText, Music, Hash, Server } from 'lucide-react';
import { GeneratedPrompt, GeneratorState, BuilderTranslation, ToastTranslation, Platform, BatchConstraints } from '../../../types';
import GlassPanel from '../../../components/shared/GlassPanel';
import { exportAsSunoText, exportAsTextFile } from '../../../lib/export-utils';
import { cn } from '../../../lib/utils';
import { LIMITS } from '../../../lib/constants';
import { useTypewriter } from '../../../hooks/useTypewriter';
import { scorePrompt } from '../utils/promptAnalysis'; 
import ThemedButton from '../../../components/shared/ThemedButton';
import BatchGenerator from './BatchGenerator';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENT: Analysis Block ---
const AnalysisBlock = memo(({ analysis, isPyriteMode, t }: { analysis: string | undefined, isPyriteMode: boolean, t: any }) => {
    const displayedAnalysis = useTypewriter(analysis, 5);
    
    if (!analysis) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
        >
            <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} layer="card" className="p-5 relative overflow-hidden group border-opacity-50">
               <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-10 ${isPyriteMode ? 'bg-pink-600' : 'bg-blue-600'}`} />
               
               <h3 className={`${isPyriteMode ? 'text-pink-400' : 'text-blue-400'} font-bold mb-3 flex items-center text-[10px] uppercase tracking-widest`}>
                 <BrainCircuit className="w-3.5 h-3.5 mr-2" />
                 {t.output.analysisTitle}
               </h3>
               <p className="text-zinc-300 text-xs md:text-sm leading-relaxed whitespace-pre-line font-medium font-mono min-h-[40px] opacity-90">
                 {displayedAnalysis}
                 <span className="animate-pulse inline-block w-1.5 h-4 bg-current ml-1 align-middle opacity-50" />
               </p>
            </GlassPanel>
        </motion.div>
    );
});

interface ResultsDisplayProps {
  result: GeneratedPrompt | null;
  state: GeneratorState;
  showLyrics: boolean;
  onEnhance: (field: 'tags' | 'style', input: string) => void;
  onRefine?: (instruction: string) => void;
  onOpenExport: () => void;
  onUpdateResult?: (partial: Partial<GeneratedPrompt>) => void;
  t: BuilderTranslation;
  toast: ToastTranslation;
  isPyriteMode?: boolean;
  showToast?: (msg: string, type?: 'success' | 'info') => void;
  platform?: Platform;
  variations: GeneratedPrompt[];
  isGeneratingVariations: boolean;
  onGenerateVariations: (count: number, level: 'light' | 'medium' | 'heavy', constraints: BatchConstraints) => void;
  onApplyVariation: (variation: GeneratedPrompt) => void;
  onExportBatch: (selectedIndices: number[]) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  result, 
  state, 
  showLyrics, 
  onEnhance, 
  onRefine, 
  onOpenExport,
  t, 
  toast, 
  isPyriteMode = false, 
  showToast,
  platform = 'suno',
  variations,
  isGeneratingVariations,
  onGenerateVariations,
  onApplyVariation,
  onExportBatch
}) => {
  const [refineInput, setRefineInput] = useState('');
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    if (showToast) showToast(toast.copied || 'Copied', 'success');
  };

  const handleDownload = () => {
      if (!result) return;
      exportAsTextFile(exportAsSunoText(result), `${result.title || 'suno-prompt'}.txt`);
      if (showToast) showToast(toast.downloaded || 'Downloaded', 'success');
  };

  const handleRefineSubmit = () => {
      if (!refineInput.trim() || !onRefine) return;
      onRefine(refineInput);
      setRefineInput('');
  };

  const handleQuickRemix = (level: 'light' | 'medium' | 'heavy') => {
      onGenerateVariations(3, level, { keepGenre: true, keepStructure: false, randomizeMood: false, randomizeVocals: false });
  };

  const hoverColor = isPyriteMode ? 'hover:text-purple-400' : 'hover:text-yellow-400';
  const labelColor = 'text-zinc-500';

  const promptQualityScore = useMemo(() => {
      if (!result || state !== GeneratorState.COMPLETE) return null;
      return scorePrompt(result, platform as Platform);
  }, [result, platform, state]);

  // --- LOADING STATE ---
  if (!result && state !== GeneratorState.COMPLETE && !(state === GeneratorState.ANALYZING && result)) {
    return (
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} layer="surface" className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-600 p-8 text-center border-dashed border-2 border-white/5 relative overflow-hidden group transition-all duration-500 hover:border-white/10">
        <div className={`p-8 rounded-full mb-6 relative z-10 transition-all duration-700 ${isPyriteMode ? 'bg-purple-900/10 group-hover:bg-purple-900/20' : 'bg-zinc-900 group-hover:bg-zinc-800'}`}>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isPyriteMode ? 'bg-purple-500' : 'bg-yellow-500'}`} style={{ animationDuration: '3s' }} />
            <Cpu className={`w-12 h-12 animate-pulse ${isPyriteMode ? 'text-purple-500 opacity-80' : 'text-zinc-500'}`} />
        </div>
        <h3 className={`text-xl font-bold tracking-tight mb-2 ${isPyriteMode ? 'text-purple-100' : 'text-zinc-300'}`}>
            {t.output.waiting || "System Ready"}
        </h3>
        <p className="text-xs opacity-50 max-w-xs mt-2 leading-relaxed font-mono">
            {t.output.waitingDesc || "Awaiting neural input..."}
        </p>
        {isPyriteMode && (
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/50 via-transparent to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
        )}
      </GlassPanel>
    );
  }

  const tagsLength = result?.tags?.length || 0;
  const styleLength = result?.style?.length || 0;
  const tagsOverLimit = tagsLength > LIMITS.TAGS;
  const styleOverLimit = styleLength > LIMITS.STYLE;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-safe">
      
      {/* --- STATUS HEADER --- */}
      <div className={`flex flex-wrap items-center justify-between text-xs font-mono mb-2 gap-2 shrink-0`}>
          <div className="flex gap-2 items-center">
             <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded border uppercase font-bold tracking-wider text-[9px]", isPyriteMode ? "border-purple-500/30 text-purple-300 bg-purple-900/20" : "border-green-500/30 text-green-400 bg-green-900/10")}>
                <Server className="w-3 h-3" />
                <span>COMPLETE</span>
             </div>
             <span className="text-[10px] font-bold text-zinc-500">V4.5 Optimized</span>
          </div>
          
          {promptQualityScore && (
              <div className={cn(
                  "flex items-center px-2 py-1 rounded border font-bold uppercase tracking-wider transition-colors cursor-help group relative text-[10px]",
                  promptQualityScore.status === 'optimal' || promptQualityScore.status === 'good' ? 'border-green-500/30 text-green-400 bg-green-900/10' : 
                  promptQualityScore.status === 'warning' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-900/10' : 
                  'border-red-500/30 text-red-400 bg-red-900/10'
              )}>
                  <Activity className="w-3 h-3 mr-1.5" />
                  Score: {promptQualityScore.totalScore}
              </div>
          )}
      </div>

      <AnalysisBlock analysis={result?.analysis} isPyriteMode={isPyriteMode} t={t} />

      {/* --- MAIN ARTIFACT CARD --- */}
      <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} layer="surface" noPadding className="flex-1 flex flex-col overflow-hidden h-full border border-white/10 bg-zinc-950/80 shadow-2xl relative">
        {/* Decor: Technical Grid */}
        <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-20">
           <div className="grid grid-cols-4 gap-1">
              {[...Array(16)].map((_, i) => <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />)}
           </div>
        </div>

        {/* Toolbar Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/[0.02] shrink-0 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className={cn("p-2 rounded-xl shadow-lg", isPyriteMode ? "bg-purple-500/20 text-purple-300" : "bg-yellow-500/20 text-yellow-400")}>
                <FileText className="w-4 h-4" />
             </div>
             <div>
                 <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-0.5">{t.output.genTitle}</h3>
                 <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Digital Artifact</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" title="Download .txt">
                <Download className="w-4 h-4" />
             </button>
             <div className="h-4 w-px bg-white/10 mx-1" />
             <button onClick={() => copyToClipboard(exportAsSunoText(result || {} as any))} className="text-[10px] font-bold font-mono px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 hover:text-white transition-colors text-zinc-400 flex items-center gap-2">
                <Copy className="w-3 h-3" />
                COPY ALL
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* 1. TITLE */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${labelColor}`}>
                    <Hash className="w-3 h-3" />
                    {t.output.titleLabel}
                </span>
                <button onClick={() => copyToClipboard(result?.title || '')} className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-zinc-400 ${hoverColor}`}>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="font-mono text-xl md:text-2xl font-bold text-white select-all tracking-tight leading-tight">
                {result?.title}
              </div>
            </div>

            {/* 2. STYLE PROMPT */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${labelColor}`}>
                    <Music className="w-3 h-3" />
                    {t.output.styleDescLabel} <span className={`ml-1 font-mono opacity-50 ${styleOverLimit ? 'text-red-500 opacity-100' : ''}`}>({styleLength}/{LIMITS.STYLE})</span>
                </span>
                <button onClick={() => copyToClipboard(result?.style || '')} className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-zinc-400 ${hoverColor}`}>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-black/40 text-blue-100/90 font-mono text-xs leading-relaxed shadow-inner select-all relative overflow-hidden">
                {isPyriteMode && <div className="absolute inset-0 bg-purple-900/5 pointer-events-none" />}
                {result?.style}
              </div>
            </div>

            {/* 3. TAGS (Chips) */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${labelColor}`}>
                    <Hash className="w-3 h-3" />
                    {t.output.tagsLabel} 
                    <span className={`ml-1 font-mono opacity-50 ${tagsOverLimit ? 'text-red-500 opacity-100' : ''}`}>({tagsLength}/{LIMITS.TAGS})</span>
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => result?.tags && onEnhance('tags', result.tags)} className={`p-1 rounded text-zinc-400 ${hoverColor}`} title="Enhance Tags">
                        <Zap className="w-3 h-3" />
                    </button>
                    <button onClick={() => copyToClipboard(result?.tags || '')} className={`p-1 rounded text-zinc-400 ${hoverColor}`}>
                        <Copy className="w-3 h-3" />
                    </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                  {result?.tags?.split(',').map((tag, i) => {
                    const t = tag.trim();
                    if (!t) return null;
                    return (
                      <span key={i} className={cn(
                        "px-2.5 py-1 text-[10px] font-mono font-medium rounded-md border transition-colors cursor-default",
                        isPyriteMode 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-200 hover:bg-purple-500/20' 
                        : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-200 hover:bg-yellow-500/10'
                      )}>
                        {t}
                      </span>
                    );
                  })}
              </div>
            </div>

            {/* 4. LYRICS */}
            {showLyrics && (
              <div className="group flex-1 flex flex-col min-h-0 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-3 mt-2">
                  <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${labelColor}`}>
                      <FileText className="w-3 h-3" />
                      {t.output.lyricsLabel}
                  </span>
                  <button onClick={() => copyToClipboard(result?.lyrics || '')} className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-zinc-400 ${hoverColor}`}>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="bg-black/40 p-6 rounded-xl border border-white/5 text-zinc-300 font-mono text-xs leading-loose whitespace-pre-wrap overflow-y-auto custom-scrollbar shadow-inner min-h-[300px]">
                  {result?.lyrics}
                  {!result?.lyrics && state === GeneratorState.ANALYZING && <span className="opacity-30 italic animate-pulse">Encoding lyrical matrix...</span>}
                </div>
              </div>
            )}
        </div>

        {/* ACTION FOOTER */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] shrink-0 flex flex-col gap-3">
            
            {/* Quick Remix (If Complete) */}
            {state === GeneratorState.COMPLETE && variations.length === 0 && (
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                        <RefreshCcw className="w-3 h-3" />
                        Quick Remix
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => handleQuickRemix('light')} className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">
                            Light
                        </button>
                        <button onClick={() => handleQuickRemix('heavy')} className={cn("px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-colors flex items-center gap-1.5", isPyriteMode ? "border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20")}>
                            <Sparkles className="w-3 h-3" /> Heavy
                        </button>
                    </div>
                </div>
            )}

            {/* Refine Input */}
            {state === GeneratorState.COMPLETE && onRefine && (
                <div className="relative">
                    <Sparkles className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isPyriteMode ? 'text-purple-400' : 'text-yellow-500'}`} />
                    <input 
                        value={refineInput}
                        onChange={(e) => setRefineInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                        placeholder={isPyriteMode ? "Demand changes..." : "Refine result..."}
                        className={cn(
                            "w-full bg-black/40 border rounded-lg pl-9 pr-10 py-2.5 text-xs text-white focus:outline-none transition-all font-mono",
                            isPyriteMode ? 'border-purple-500/30 focus:border-purple-500 placeholder:text-purple-300/30' : 'border-zinc-700 focus:border-yellow-500 placeholder:text-zinc-600'
                        )}
                    />
                    <button 
                        onClick={handleRefineSubmit}
                        disabled={!refineInput.trim()}
                        className="absolute right-1.5 top-1.5 p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <ThemedButton 
                onClick={onOpenExport}
                variant={isPyriteMode ? 'outline' : 'zinc'}
                className="w-full py-3 text-xs font-mono tracking-widest border-dashed hover:border-solid"
            >
                OPEN EXPORT HUB
            </ThemedButton>
        </div>
      </GlassPanel>

      {/* BATCH PANEL */}
      {state === GeneratorState.COMPLETE && result && (
        <BatchGenerator
          basePrompt={result}
          variations={variations}
          onGenerate={onGenerateVariations}
          onApply={onApplyVariation}
          onExport={onExportBatch}
          isGenerating={isGeneratingVariations}
          isPyriteMode={isPyriteMode}
          t={t}
        />
      )}
    </div>
  );
};

export default memo(ResultsDisplay);
