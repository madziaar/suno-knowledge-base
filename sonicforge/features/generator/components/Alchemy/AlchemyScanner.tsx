
import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Cpu, Zap, Activity, Waves } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface AlchemyScannerProps {
  isAnalyzing: boolean;
  fileName: string | null;
  isPyriteMode: boolean;
}

const AlchemyScanner: React.FC<AlchemyScannerProps> = memo(({ isAnalyzing, fileName, isPyriteMode }) => {
  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center">
      {/* Outer Rotating Ring */}
      <motion.div 
        className={cn(
          "absolute inset-0 rounded-full border-2 border-dashed opacity-20",
          isPyriteMode ? "border-purple-500" : "border-blue-500"
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulsing Core */}
      <motion.div 
        className={cn(
          "w-48 h-48 rounded-full border flex flex-col items-center justify-center relative overflow-hidden",
          isPyriteMode ? "bg-purple-900/10 border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.1)]" : "bg-blue-900/10 border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
        )}
        animate={isAnalyzing ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center text-center p-4 z-10"
            >
              <Cpu className={cn("w-10 h-10 mb-3 animate-pulse", isPyriteMode ? "text-purple-400" : "text-blue-400")} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">Spectral Scan</p>
              <p className="text-[8px] font-mono text-zinc-500 animate-pulse">DECONSTRUCTING_DNA...</p>
            </motion.div>
          ) : fileName ? (
            <motion.div 
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center p-4 z-10"
            >
              <Zap className={cn("w-10 h-10 mb-3", isPyriteMode ? "text-pink-400" : "text-yellow-400")} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">Signal Locked</p>
              <p className="text-[8px] font-mono text-zinc-500 truncate max-w-[120px]">{fileName}</p>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center p-4 z-10 opacity-40"
            >
              <Scan className="w-10 h-10 mb-3 text-zinc-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Awaiting Signal</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interior Waves (Only when active) */}
        {isAnalyzing && (
          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end justify-center gap-1 px-4 opacity-50">
            {[...Array(12)].map((_, i) => (
              <motion.div 
                key={i}
                className={cn("w-1 bg-current rounded-t-full", isPyriteMode ? "text-purple-500" : "text-blue-500")}
                animate={{ height: [4, Math.random() * 24 + 8, 4] }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Decorative Node Points */}
      {[0, 90, 180, 270].map(deg => (
        <div 
          key={deg}
          className={cn(
            "absolute w-1.5 h-1.5 rounded-full z-20",
            isPyriteMode ? "bg-purple-500" : "bg-blue-500"
          )}
          style={{ 
            transform: `rotate(${deg}deg) translateY(-140px)` 
          }}
        />
      ))}
    </div>
  );
});

export default AlchemyScanner;
