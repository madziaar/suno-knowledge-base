
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import Logo from './Logo';

interface NeuralSpinnerProps {
  isPyriteMode: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const NeuralSpinner: React.FC<NeuralSpinnerProps> = ({ isPyriteMode, size = 'md', label }) => {
  const sizes = {
    sm: { container: 'w-12 h-12', logo: 'w-4 h-4', border: 'border-2' },
    md: { container: 'w-32 h-32', logo: 'w-8 h-8', border: 'border-2' },
    lg: { container: 'w-48 h-48', logo: 'w-12 h-12', border: 'border-4' }
  };

  const currentSize = sizes[size];
  const accentColor = isPyriteMode ? 'border-purple-500' : 'border-yellow-500';
  const glowClass = isPyriteMode ? 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'shadow-[0_0_15px_rgba(234,179,8,0.2)]';

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className={cn("relative flex items-center justify-center", currentSize.container)}>
        {/* Outer Ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-dashed opacity-40",
            currentSize.border,
            accentColor
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle Ring - Reverse */}
        <motion.div
          className={cn(
            "absolute inset-4 rounded-full border-dotted opacity-60",
            currentSize.border,
            accentColor
          )}
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner Pulsing Core */}
        <motion.div
          className={cn(
            "absolute inset-8 rounded-full border transition-all duration-700 bg-white/5",
            isPyriteMode ? "border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.1)]" : "border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]"
          )}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Central Logo */}
        <div className="relative z-10 animate-pulse">
          <Logo className={currentSize.logo} isPyriteMode={isPyriteMode} />
        </div>

        {/* Scanning Line */}
        <motion.div
          className={cn(
            "absolute w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20",
            isPyriteMode ? "text-purple-400" : "text-yellow-400"
          )}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {label && (
        <div className="flex flex-col items-center gap-2">
          <span className={cn(
            "text-xs font-bold uppercase tracking-[0.3em] animate-pulse",
            isPyriteMode ? "text-purple-400" : "text-yellow-500"
          )}>
            {label}
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn("w-1 h-1 rounded-full", isPyriteMode ? "bg-purple-500" : "bg-yellow-500")}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralSpinner;
