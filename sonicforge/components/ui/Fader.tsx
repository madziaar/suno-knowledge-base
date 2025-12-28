
import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface FaderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  isPyrite?: boolean;
  className?: string;
}

export const Fader: React.FC<FaderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  label,
  isPyrite = false,
  className
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {label && (
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-widest h-4",
          isPyrite ? "text-purple-400" : "text-zinc-500"
        )}>
          {label}
        </span>
      )}
      
      <div className="relative h-32 w-8 group">
        {/* Fader Track */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className={cn(
              "absolute bottom-0 w-full transition-colors",
              isPyrite ? "bg-purple-500 shadow-[0_0_10px_#a855f7]" : "bg-yellow-500 shadow-[0_0_8px_#eab308]"
            )}
            style={{ height: `${percentage}%` }}
          />
        </div>

        {/* Fader Handle */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20"
          style={{ writingMode: 'vertical-lr' as any, direction: 'rtl' }}
        />
        
        <motion.div 
          className={cn(
            "absolute left-0 right-0 w-full h-4 rounded-sm border-y shadow-xl z-10 pointer-events-none",
            isPyrite 
              ? "bg-zinc-900 border-purple-500/50 shadow-purple-900/40" 
              : "bg-zinc-800 border-white/20 shadow-black/60"
          )}
          style={{ bottom: `calc(${percentage}% - 8px)` }}
        >
          <div className="absolute inset-0 flex flex-col justify-around items-center opacity-30">
            <div className="w-4 h-px bg-current" />
            <div className="w-4 h-px bg-current" />
          </div>
        </motion.div>
      </div>

      <span className="text-[10px] font-mono text-zinc-400 h-4">
        {value}
      </span>
    </div>
  );
};
