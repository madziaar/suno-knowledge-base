
import React, { memo } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useSettingsState } from '../../contexts/SettingsContext';

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pyrite';
  layer?: 'surface' | 'card' | 'overlay';
  noPadding?: boolean;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = '', 
  variant = 'default', 
  layer = 'surface',
  noPadding = false,
  ...props
}) => {
  const { performanceMode } = useSettingsState();
  const isPyrite = variant === 'pyrite';
  const isLowPerf = performanceMode === 'low';

  // Base Aesthetics - Remove blur on low performance to save GPU
  const baseClasses = isLowPerf
    ? "relative rounded-xl overflow-hidden ring-1 ring-inset transition-colors duration-300"
    : "relative rounded-2xl backdrop-blur-md md:backdrop-blur-2xl overflow-hidden ring-1 ring-inset transition-colors duration-300";
  
  // Layer Logic (Refined Depth System)
  // In Low Perf: Increase opacity to ensure readability without blur
  const layerStyles = {
    surface: isPyrite 
      ? (isLowPerf ? "bg-zinc-950 border border-purple-500/20" : "bg-zinc-950/60 shadow-xl border border-purple-500/10 ring-purple-500/5")
      : (isLowPerf ? "bg-zinc-950 border border-white/10" : "bg-zinc-950/60 shadow-xl border border-white/5 ring-white/5"),
      
    card: isPyrite
      ? (isLowPerf ? "bg-zinc-900 border border-purple-500/20" : "bg-white/[0.02] shadow-lg border border-purple-500/10 hover:border-purple-500/30 hover:bg-white/[0.04] ring-white/0")
      : (isLowPerf ? "bg-zinc-900 border border-zinc-800" : "bg-white/[0.02] shadow-lg border border-white/5 hover:border-white/10 hover:bg-white/[0.04] ring-white/0"),
      
    overlay: isPyrite
      ? (isLowPerf ? "bg-zinc-950 border border-purple-500/30" : "bg-black/90 shadow-2xl border border-purple-500/20 ring-1 ring-purple-500/10 backdrop-blur-3xl")
      : (isLowPerf ? "bg-zinc-950 border border-white/20" : "bg-zinc-950/90 shadow-2xl border border-white/10 ring-white/5 backdrop-blur-3xl")
  };

  // Disable hover animations on low perf to reduce layout thrashing
  // FIX: Added 'as const' and literal string cast for 'ease' to satisfy Framer Motion type requirements
  const hoverProps = (layer === 'card' && !isLowPerf) ? ({
      whileHover: { y: -2, scale: 1.005, transition: { duration: 0.2, ease: "easeOut" as const } },
      whileTap: { scale: 0.98 }
  } as const) : {};

  // Disable entry animations on low perf
  // FIX: Added 'as const' to ensure transition properties are treated as literal types
  const animationProps = isLowPerf ? {} : ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring" as const, stiffness: 400, damping: 30 }
  } as const);

  return (
    <motion.div 
      className={cn(baseClasses, layerStyles[layer], noPadding ? '' : 'p-5 md:p-6', className)}
      {...animationProps}
      {...hoverProps}
      {...props}
    >
      
      {/* 1. Global Noise Texture (Skip on Low Perf) */}
      {!isLowPerf && (
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-0 mix-blend-overlay select-none" 
             style={{ backgroundImage: 'var(--noise-pattern)' }} />
      )}

      {/* 2. Holographic Edge Effect (Pyrite Mode) - Skip on Low Perf */}
      {isPyrite && layer !== 'overlay' && !isLowPerf && (
        <>
          <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 box-border border border-transparent"
               style={{ 
                 background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.02) 50%, rgba(168,85,247,0.1) 100%) border-box',
                 mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                 maskComposite: 'exclude',
               }} 
          />
          {/* Subtle moving sheen - Desktop High Perf Only */}
          <div className="hidden md:block absolute inset-[-100%] bg-gradient-to-r from-transparent via-purple-500/5 to-transparent skew-x-12 animate-[shimmer_10s_infinite] pointer-events-none z-0" />
        </>
      )}

      {/* 3. Pyrite Glow Accent - Static on Low Perf */}
      {isPyrite && !isLowPerf && (
        <div className="absolute -top-[120px] left-[20%] right-[20%] h-[200px] bg-purple-600/10 blur-[80px] pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
      )}
      
      {/* 4. Standard Gold Accent - Static on Low Perf */}
      {!isPyrite && layer === 'card' && !isLowPerf && (
        <div className="absolute -top-[120px] -right-[100px] w-[200px] h-[200px] bg-yellow-500/5 blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}

      {/* Content Wrapper */}
      <div className="relative z-20 h-full">
        {/* FIX: Cast children to ReactNode to prevent MotionValue type mismatch when rendering inside standard div */}
        {children as React.ReactNode}
      </div>
    </motion.div>
  );
});

export default GlassPanel;
