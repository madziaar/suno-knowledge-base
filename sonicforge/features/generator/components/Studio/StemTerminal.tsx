
import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Mic2, Drum, Music, Activity, Waves } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { sfx } from '../../../../lib/audio';
import { StemWeights } from '../../../../types';
import { useDebounce } from '../../../../hooks/useDebounce';

interface StemTerminalProps {
  isPyriteMode: boolean;
  weights: StemWeights;
  onWeightChange: (weights: StemWeights) => void;
}

const STEMS: { id: keyof StemWeights; label: string; icon: React.ElementType; color: string; glow: string }[] = [
  { id: 'vocals', label: 'Vocal Stem', icon: Mic2, color: 'text-pink-400', glow: 'shadow-pink-500/20' },
  { id: 'drums', label: 'Percussion', icon: Drum, color: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  { id: 'bass', label: 'Low Frequency', icon: Activity, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
  { id: 'melody', label: 'Lead Synth', icon: Music, color: 'text-purple-400', glow: 'shadow-purple-500/20' }
];

const StemTerminal: React.FC<StemTerminalProps> = memo(({ isPyriteMode, weights, onWeightChange }) => {
  const [localWeights, setLocalWeights] = useState<StemWeights>(weights);
  
  // Sync local state when props change (e.g. reset or load history)
  useEffect(() => {
      setLocalWeights(weights);
  }, [weights]);

  // Debounce the update upstream to avoid aggressive re-renders
  const debouncedWeights = useDebounce(localWeights, 300);

  useEffect(() => {
      onWeightChange(debouncedWeights);
  }, [debouncedWeights, onWeightChange]);

  const handleUpdate = useCallback((id: keyof StemWeights, val: number) => {
    setLocalWeights(prev => ({ ...prev, [id]: val }));
    if (val === 69) {
        sfx.play('secret');
    }
    if (val % 10 === 0) sfx.play('light');
  }, []);

  return (
    <div className={cn(
      "p-4 rounded-2xl border bg-black/40 space-y-4",
      isPyriteMode ? "border-purple-500/20" : "border-white/5"
    )}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
            <Waves className={cn("w-4 h-4", isPyriteMode ? "text-purple-400" : "text-yellow-500")} />
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural Stem Focus Matrix</h3>
        </div>
        <div className="text-[8px] font-mono text-zinc-600">V4.5_STEM_API: ONLINE</div>
      </div>

      <div className="grid grid-cols-4 gap-3 h-48">
        {STEMS.map((stem) => {
          const val = localWeights[stem.id];
          const height = `${val}%`;

          return (
            <div key={stem.id} className="flex flex-col items-center gap-3 group">
              <div className="flex-1 w-full bg-zinc-900/50 rounded-lg relative overflow-hidden border border-white/5">
                <motion.div 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 transition-all duration-300",
                    isPyriteMode ? "bg-purple-600/40" : "bg-blue-600/40"
                  )}
                  style={{ height }}
                >
                    <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-current", isPyriteMode ? "text-purple-400" : "text-blue-400")} />
                </motion.div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={val} 
                  onChange={(e) => handleUpdate(stem.id, parseInt(e.target.value))} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  style={{ writingMode: 'vertical-lr' as any, direction: 'rtl' }}
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity">
                    <stem.icon className={cn("w-6 h-6", stem.color)} />
                </div>
              </div>

              <div className="text-center">
                  <p className={cn("text-[8px] font-bold uppercase truncate w-full", stem.color)}>{stem.label}</p>
                  <p className="text-[9px] font-mono text-zinc-500">{val}%</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <p className="text-[9px] text-zinc-500 leading-relaxed italic">
              "Higher focus values inject weighted production tags, forcing the model to allocate more compute to that specific stem's fidelity."
          </p>
      </div>
    </div>
  );
});

export default StemTerminal;
