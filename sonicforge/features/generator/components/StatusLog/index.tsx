
import React, { memo, useEffect, useRef, useState } from 'react';
import { Loader2, Zap, AlertTriangle, Search, BrainCircuit, ShieldCheck, Edit3, Globe, Activity, CheckCircle2, Terminal, Skull, Flame } from 'lucide-react';
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
    pyrite: ["Waking up the machine...", "Injecting chaos...", "Polishing the diamonds...", "Seducing the network..."],
    shin: ["Avoiding kernel panic...", "Refactoring matrix...", "Compiling code...", "Deploying to production..."],
    twin_flames: ["SYNC ERROR: DUAL CORES", "Fusing order and chaos...", "Burning firewalls...", "System unstable..."]
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
                "w-full rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden",
                theme.bg, theme.border
            )}
        >
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("p-1.5 rounded-lg bg-white/5", theme.text)}>
                        {state === GeneratorState.ERROR ? <AlertTriangle className="w-4 h-4" /> : <theme.icon className={cn("w-4 h-4", state !== GeneratorState.COMPLETE && "animate-pulse")} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5", theme.text)}>
                            {state === GeneratorState.ERROR ? 'Fatal Error' : activeAgent}
                        </span>
                        <p className="text-[10px] text-zinc-300 font-mono truncate">
                            {state === GeneratorState.ERROR ? errorMessage : currentLog || "Processing signal..."}
                        </p>
                    </div>
                </div>
                {state !== GeneratorState.COMPLETE && state !== GeneratorState.ERROR && <Loader2 className={cn("w-3.5 h-3.5 animate-spin", theme.text)} />}
            </div>

            {/* Micro Progress Bar */}
            <div className="h-0.5 bg-zinc-900 w-full overflow-hidden">
                <motion.div 
                    className={cn("h-full", theme.accent)}
                    initial={{ width: "0%" }}
                    animate={{ width: state === GeneratorState.COMPLETE ? "100%" : "95%" }}
                    transition={{ duration: state === GeneratorState.COMPLETE ? 0.2 : 20, ease: "linear" }}
                />
            </div>
            
            {/* Sources Mini-Feed */}
            {researchData?.sources && researchData.sources.length > 0 && (
                <div className="px-3 py-1.5 bg-black/40 border-t border-white/5 flex gap-3 overflow-x-auto scrollbar-hide">
                    {researchData.sources.slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[8px] text-zinc-500 whitespace-nowrap">
                            <Globe className="w-2.5 h-2.5 opacity-50" />
                            <span className="truncate max-w-[100px]">{s.web?.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    </AnimatePresence>
  );
});

export default StatusLog;
