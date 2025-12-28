
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TapeMachineProps {
  isActive: boolean;
  isPyriteMode: boolean;
  speed?: number;
}

const TapeMachine: React.FC<TapeMachineProps> = memo(({ isActive, isPyriteMode, speed = 1 }) => {
  const reelRotation = isActive ? { rotate: 360 } : { rotate: 0 };
  // Fix: Cast 'ease' value to 'as const' to avoid string type mismatch in Framer Motion transitions
  const reelTransition = { duration: 3 / speed, repeat: Infinity, ease: "linear" as const };

  return (
    <div className="relative w-full h-16 flex items-center justify-between px-6 bg-black/40 rounded-xl border border-white/5 overflow-hidden group">
      {/* Background Tape Path */}
      <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-px bg-zinc-800" />
      
      {/* Left Reel */}
      <div className="relative z-10">
        <motion.div 
          animate={reelRotation}
          transition={reelTransition}
          className={cn(
            "w-12 h-12 rounded-full border-4 flex items-center justify-center relative",
            isPyriteMode ? "border-purple-500/30 bg-zinc-900" : "border-zinc-700 bg-zinc-800"
          )}
        >
          {[0, 120, 240].map(deg => (
            <div 
              key={deg}
              className={cn("absolute w-full h-0.5 bg-current opacity-20", isPyriteMode ? "text-purple-400" : "text-zinc-500")}
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
        </motion.div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-bold text-zinc-600 uppercase">Supply</div>
      </div>

      {/* Center Status */}
      <div className="flex flex-col items-center">
          <div className={cn(
            "w-2 h-2 rounded-full mb-1",
            isActive ? "bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" : "bg-zinc-800"
          )} />
          <span className={cn(
            "text-[8px] font-mono uppercase tracking-tighter transition-colors",
            isActive ? "text-white" : "text-zinc-600"
          )}>
            {isActive ? "REC_ACTIVE" : "STANDBY"}
          </span>
      </div>

      {/* Right Reel */}
      <div className="relative z-10">
        <motion.div 
          animate={reelRotation}
          transition={reelTransition}
          className={cn(
            "w-12 h-12 rounded-full border-4 flex items-center justify-center relative",
            isPyriteMode ? "border-purple-500/30 bg-zinc-900" : "border-zinc-700 bg-zinc-800"
          )}
        >
          {[0, 120, 240].map(deg => (
            <div 
              key={deg}
              className={cn("absolute w-full h-0.5 bg-current opacity-20", isPyriteMode ? "text-purple-400" : "text-zinc-500")}
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
        </motion.div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-bold text-zinc-600 uppercase">Take-Up</div>
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    </div>
  );
});

export default TapeMachine;
