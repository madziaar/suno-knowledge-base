
import React, { memo, useRef, useEffect } from 'react';
import { Activity, Loader2, Check, CircleDashed, AlertTriangle, Save, Terminal, Code, Globe, UserCog, Search, ScanLine, PenTool } from 'lucide-react';
import { GeneratorState, GroundingChunk, BuilderTranslation, AgentType } from '../../../../types';
import GlassPanel from '../../../../components/shared/GlassPanel';
import { cn } from '../../../../lib/utils';

// Helper type for translation keys
type StepKey = keyof BuilderTranslation['steps'];

interface StatusLogProps {
  state: GeneratorState;
  activeAgent?: AgentType; // New Prop
  researchData: { text: string; sources: GroundingChunk[] } | null;
  processingStep: number;
  steps: readonly string[]; // Keeping as string[] for compatibility, but we cast safely
  t: BuilderTranslation;
  isPyriteMode?: boolean;
  errorMessage?: string;
  lastSaved?: string | null;
}

const AgentBadge: React.FC<{ type: AgentType, isPyriteMode: boolean }> = ({ type, isPyriteMode }) => {
    if (type === 'idle') return null;

    let label = 'Unknown Agent';
    let icon = UserCog;
    let color = 'text-zinc-400 border-zinc-500/50 bg-zinc-900/50';

    switch(type) {
        case 'researcher':
            label = 'The Researcher';
            icon = Search;
            color = isPyriteMode ? 'text-blue-300 border-blue-500/50 bg-blue-900/30' : 'text-cyan-400 border-cyan-500/50 bg-cyan-900/30';
            break;
        case 'generator':
            label = 'The Artist';
            icon = PenTool;
            color = isPyriteMode ? 'text-purple-300 border-purple-500/50 bg-purple-900/30' : 'text-yellow-400 border-yellow-500/50 bg-yellow-900/30';
            break;
        case 'critic':
            label = 'The Inquisitor';
            icon = ScanLine;
            color = isPyriteMode ? 'text-red-300 border-red-500/50 bg-red-900/30' : 'text-orange-400 border-orange-500/50 bg-orange-900/30';
            break;
        case 'refiner':
            label = 'The Refiner';
            icon = Code;
            color = isPyriteMode ? 'text-green-300 border-green-500/50 bg-green-900/30' : 'text-emerald-400 border-emerald-500/50 bg-emerald-900/30';
            break;
    }

    const Icon = icon;

    return (
        <div className={cn("flex items-center gap-3 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest animate-in fade-in zoom-in-95 shadow-sm", color)}>
            <Icon className="w-4 h-4 animate-pulse" />
            <span>Active Agent: {label}</span>
        </div>
    );
};

const StatusLog: React.FC<StatusLogProps> = memo(({ state, activeAgent = 'idle', researchData, processingStep, steps, t, isPyriteMode = false, errorMessage, lastSaved }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on updates
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [state, processingStep, researchData, activeAgent]);

  if (state === GeneratorState.ERROR && errorMessage) {
     return (
        <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} className="p-5 bg-red-950/50 border-red-500/40 shadow-lg shadow-red-900/20">
            <h3 className="text-red-400 text-sm font-bold mb-3 flex items-center tracking-wide">
                <AlertTriangle className="w-4 h-4 mr-2" />
                SYSTEM CRITICAL
            </h3>
            <p className="text-red-200 text-xs font-mono border-l-2 border-red-500/30 pl-3 leading-relaxed">
                {errorMessage}
            </p>
        </GlassPanel>
     );
  }

  // Always show if we have research data OR are analyzing OR just have a save status
  if (!researchData && state !== GeneratorState.ANALYZING && !lastSaved) return null;

  const accentColor = isPyriteMode ? 'text-purple-400' : 'text-blue-400';
  const headerBg = isPyriteMode ? 'bg-purple-900/10 border-purple-500/20' : 'bg-white/5 border-white/5';
  const dotActive = isPyriteMode ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]';
  const dotInactive = 'bg-zinc-700 border border-zinc-600';

  return (
    <GlassPanel variant={isPyriteMode ? 'pyrite' : 'default'} noPadding className="overflow-hidden relative flex flex-col max-h-[300px]">
      {/* Decorative Scanline for Pyrite Mode */}
      {isPyriteMode && <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none scanline opacity-20" />}

      {/* Header */}
      <div className={cn("flex items-center justify-between px-5 py-3 border-b backdrop-blur-md sticky top-0 z-20", headerBg)}>
         <h3 className={cn("text-xs font-bold uppercase tracking-widest flex items-center", accentColor)}>
            <Terminal className="w-3.5 h-3.5 mr-2" />
            {t.logs.title}
         </h3>
         <div className="flex gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", state !== GeneratorState.IDLE ? "bg-green-500 animate-pulse" : "bg-zinc-700")} />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
         </div>
      </div>

      <div ref={scrollRef} className="p-5 text-xs font-mono space-y-6 overflow-y-auto custom-scrollbar relative">
        {/* AGENT VISUALIZATION */}
        {activeAgent !== 'idle' && (
            <div className="mb-6 flex justify-center">
                <AgentBadge type={activeAgent} isPyriteMode={isPyriteMode} />
            </div>
        )}

        {/* Research Status */}
        {state === GeneratorState.RESEARCHING && (
            <div className="flex items-start gap-3 animate-pulse px-2">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                <span className="text-zinc-400">{t.logs.access}</span>
            </div>
        )}
        
        {/* Research Result */}
        {researchData && (
           <div className="animate-in fade-in slide-in-from-left-2 duration-500 relative z-10 pl-4 border-l-2 border-white/10 ml-1">
             <p className="text-green-400 font-bold mb-2 flex items-center uppercase tracking-wider text-[10px]">
                 <Check className="w-3 h-3 mr-2" /> 
                 {t.logs.complete}
             </p>
             <p className="text-zinc-300 opacity-90 leading-relaxed mb-3">{researchData.text}</p>
             
             {researchData.sources.length > 0 && (
               <div className="flex flex-wrap gap-2 mt-3">
                 {researchData.sources.slice(0, 3).map((s, i) => (
                   <a key={i} href={s.web?.uri} target="_blank" rel="noreferrer" className="px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 hover:border-white/30 text-[10px] text-zinc-300 hover:text-white transition-colors truncate max-w-[200px] flex items-center group">
                     <Globe className="w-3 h-3 mr-1.5 opacity-50 group-hover:opacity-100" />
                     {s.web?.title}
                   </a>
                 ))}
               </div>
             )}
           </div>
        )}

        {/* Processing Timeline */}
        {state === GeneratorState.ANALYZING && (
          <div className="relative z-10 pt-2 px-2">
            <p className={cn("mb-6 font-bold flex items-center animate-pulse tracking-wide", accentColor)}>
                <Code className="w-4 h-4 mr-2" />
                {t.logs.thinking}
            </p>
            
            <div className="relative pl-3 ml-1 space-y-6">
              {/* Vertical Line */}
              <div className="absolute top-2 bottom-4 left-[4px] w-[2px] bg-zinc-800" />

              {steps.map((stepKey, index) => {
                const isComplete = processingStep > index;
                const isCurrent = processingStep === index;
                // Safe cast since we know STEPS matches translation keys
                const stepLabel = t.steps[stepKey as StepKey] || stepKey;
                
                return (
                  <div key={stepKey} className={cn(
                      "flex items-center relative pl-8 transition-all duration-300",
                      isCurrent ? "scale-105 origin-left" : "opacity-60"
                  )}>
                    {/* Timeline Dot */}
                    <div className={cn(
                        "absolute left-[-3px] w-4 h-4 rounded-full border-2 border-zinc-900 flex items-center justify-center transition-all duration-300 z-10",
                        isComplete ? "bg-green-500 border-green-500" : isCurrent ? dotActive : dotInactive
                    )}>
                        {isComplete && <Check className="w-2.5 h-2.5 text-black" />}
                        {isCurrent && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                    </div>

                    <span className={cn(
                        "text-[11px] uppercase tracking-wide font-bold",
                        isComplete ? "text-green-400" : isCurrent ? "text-white" : "text-zinc-600"
                    )}>
                        {stepLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {lastSaved && (
        <div className="bg-white/5 px-5 py-2 border-t border-white/5 flex justify-end">
            <div className="flex items-center text-[10px] text-zinc-500 font-mono tracking-tight">
                <Save className="w-3 h-3 mr-1.5 opacity-50" />
                {t.logs.autosaved} <span className="ml-1 text-zinc-400">{lastSaved}</span>
            </div>
        </div>
      )}
    </GlassPanel>
  );
});

export default StatusLog;
