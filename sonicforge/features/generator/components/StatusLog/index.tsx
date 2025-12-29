
import React, { memo, useEffect, useRef, useState } from 'react';
import { Loader2, Zap, AlertTriangle, Search, BrainCircuit, ShieldCheck, Edit3, Globe, Activity, CheckCircle2, Terminal, Skull, Flame, Cpu } from 'lucide-react';
import { GeneratorState, AgentType, GroundingChunk, ProducerPersona } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusLogProps {
  state: GeneratorState;
  activeAgent?: AgentType;
  researchData?: { text: string; sources: GroundingChunk[] } | null;
  errorMessage?: string;
  isPyriteMode?: boolean;
  producerPersona?: ProducerPersona;
  t?: any;
}

const LOGS_BY_PERSONA: Record<string, string[]> = {
    standard: ["Initializing Neural Handshake...", "Allocating Context...", "Optimizing Architecture...", "Checking Audio Fidelity..."],
    pyrite: ["Waking up the machine...", "Injecting chaos, darling...", "Polishing the diamonds...", "Seducing the network..."],
    shin: ["Avoiding kernel panic...", "Refactoring matrix...", "Compiling lethal code...", "Deploying to production..."],
    twin_flames: ["SYNC ERROR: DUAL CORES", "Fusing order and chaos...", "Burning firewalls...", "System instability detected..."]
};

const THEMES: Record<string, { bg: string, border: string, text: string, accent: string, icon: any }> = {
    standard: { bg: "bg-zinc-950/95", border: "border-yellow-500/20", text: "text-yellow-500", accent: "bg-yellow-500", icon: Activity },
    pyrite: { bg: "bg-[#050505]/95", border: "border-purple-500/30", text: "text-purple-400", accent: "bg-purple-600", icon: Flame },
    shin: { bg: "bg-[#000000]/95", border: "border-red-600/40", text: "text-red-500", accent: "bg-red-600", icon: Skull },
    twin_flames: { bg: "bg-[#100505]/95", border: "border-pink-500/30", text: "text-pink-400", accent: "bg-gradient-to-r from-purple-600 to-red-600", icon: Zap }
};

const StatusLog: React.FC<StatusLogProps> = memo(({ state, activeAgent = 'idle', researchData, errorMessage, producerPersona = 'standard' }) => {
  const [currentLog, setCurrentLog] = useState("");
  const theme = THEMES[producerPersona] || THEMES.standard;
  const personaLogs = LOGS_BY_PERSONA[producerPersona] || LOGS_BY_PERSONA.standard;
  
  useEffect(() => {
      if (state === GeneratorState.GENERATING || state === GeneratorState.RESEARCHING || state === GeneratorState.ANALYZING) {
          let i = 0;
          const interval = setInterval(() => {
              setCurrentLog(personaLogs[i % personaLogs.length]);
              i++;
          }, 1500);
          return () => clearInterval(interval);
      } else if (state === GeneratorState.COMPLETE) {
          setCurrentLog("Sequence Finalized.");
      } else if (state === GeneratorState.ERROR) {
          setCurrentLog("System Failure.");
      } else {
          setCurrentLog("");
      }
  }, [state, personaLogs]);

  if (state === GeneratorState.IDLE) return null;

  return (
    <AnimatePresence>
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
                "w-full rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden z-50",
                theme.bg, theme.border
            )}
        >
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className={cn("p-2 rounded-xl bg-white/5", theme.text)}>
                        {state === GeneratorState.ERROR ? <AlertTriangle className="w-5 h-5" /> : <theme.icon className={cn("w-5 h-5", state !== GeneratorState.COMPLETE && "animate-pulse")} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none mb-1", theme.text)}>
                            {state === GeneratorState.ERROR ? 'Fatal Error' : (state === GeneratorState.ANALYZING ? 'Deep Reasoning Active' : activeAgent)}
                        </span>
                        <p className="text-xs text-zinc-200 font-mono truncate">
                            {state === GeneratorState.ERROR ? errorMessage : currentLog || "Processing signal..."}
                        </p>
                    </div>
                </div>
                {state !== GeneratorState.COMPLETE && state !== GeneratorState.ERROR && (
                    <div className="flex items-center gap-2">
                         <Cpu className={cn("w-4 h-4 animate-spin-slow", theme.text)} />
                         <Loader2 className={cn("w-3.5 h-3.5 animate-spin", theme.text)} />
                    </div>
                )}
            </div>

            {/* Micro Progress Bar */}
            <div className="h-1 bg-zinc-900 w-full overflow-hidden">
                <motion.div 
                    className={cn("h-full", theme.accent)}
                    initial={{ width: "0%" }}
                    animate={{ width: state === GeneratorState.COMPLETE ? "100%" : "95%" }}
                    transition={{ duration: state === GeneratorState.COMPLETE ? 0.3 : 30, ease: "linear" }}
                />
            </div>
            
            {/* Sources Mini-Feed */}
            {researchData?.sources && researchData.sources.length > 0 && (
                <div className="px-4 py-2 bg-black/60 border-t border-white/5 flex gap-4 overflow-x-auto scrollbar-hide">
                    <span className="text-[9px] font-black text-zinc-500 uppercase flex-shrink-0">Grounding:</span>
                    {researchData.sources.slice(0, 5).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[9px] text-blue-400 font-bold whitespace-nowrap">
                            <Globe className="w-2.5 h-2.5 opacity-70" />
                            <span className="truncate max-w-[150px]">{s.web?.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    </AnimatePresence>
  );
});

export default StatusLog;
