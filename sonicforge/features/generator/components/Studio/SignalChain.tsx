
import React, { memo } from 'react';
import { Activity, ChevronRight, Zap, ShieldCheck, Database, Sliders } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface SignalChainProps {
  stylePrompt: string;
  isPyriteMode: boolean;
}

const SignalChain: React.FC<SignalChainProps> = memo(({ stylePrompt, isPyriteMode }) => {
  const parts = stylePrompt.split(',').map(p => p.trim()).filter(Boolean);
  
  // Calculate weight based on position (Suno v4.5 logic: first 50 chars = 80% weight)
  const getWeight = (index: number) => {
    if (index === 0) return 80;
    if (index === 1) return 40;
    if (index === 2) return 20;
    return 10;
  };

  const getCategory = (index: number) => {
    if (index === 0) return { label: 'Genre Anchor', icon: Database, color: 'text-blue-400' };
    if (index === 1) return { label: 'Vocal Lock', icon: ShieldCheck, color: 'text-pink-400' };
    if (index === 2) return { label: 'Atmos', icon: Zap, color: 'text-yellow-400' };
    return { label: 'Tech', icon: Sliders, color: 'text-zinc-500' };
  };

  return (
    <div className={cn(
      "p-4 rounded-xl border bg-black/40 overflow-x-auto custom-scrollbar",
      isPyriteMode ? "border-purple-500/20" : "border-white/5"
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className={cn("w-3.5 h-3.5", isPyriteMode ? "text-purple-400" : "text-yellow-500")} />
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Signal Chain Weighting</h4>
      </div>

      <div className="flex items-center gap-4 min-w-max px-2">
        {parts.slice(0, 5).map((part, i) => {
          const weight = getWeight(i);
          const cat = getCategory(i);
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2 animate-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={cn(
                  "p-2 rounded-lg border transition-all duration-500",
                  i === 0 ? (isPyriteMode ? "border-purple-500 bg-purple-900/20 scale-110" : "border-yellow-500 bg-yellow-900/20 scale-110") : "border-white/10 bg-white/5"
                )}>
                  <cat.icon className={cn("w-4 h-4", cat.color)} />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold text-white uppercase truncate max-w-[80px]">{part}</p>
                  <p className={cn("text-[8px] font-mono", i === 0 ? "text-green-400" : "text-zinc-500")}>
                    {weight}% LOAD
                  </p>
                </div>
              </div>
              {i < parts.length - 1 && i < 4 && (
                <ChevronRight className="w-4 h-4 text-zinc-700 mt-[-20px]" />
              )}
            </React.Fragment>
          );
        })}
        {parts.length === 0 && (
          <div className="text-[10px] text-zinc-600 italic py-2">Waiting for signal input...</div>
        )}
      </div>
    </div>
  );
});

export default SignalChain;
