
import React, { memo } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pyrite';
  layer?: 'surface' | 'card' | 'overlay';
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  className, 
  variant = 'default', 
  layer = 'surface',
  noPadding = false,
  ...props 
}, ref) => {
  const isPyrite = variant === 'pyrite';

  // Layer Logic
  const layerStyles = {
    surface: isPyrite 
      ? "bg-zinc-950/85 shadow-[0_8px_32px_rgba(0,0,0,0.6)] border-purple-500/20" 
      : "bg-zinc-900/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-white/10",
    card: isPyrite
      ? "bg-zinc-900/60 shadow-lg border-purple-500/10 hover:border-purple-500/30 hover:bg-zinc-900/80 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
      : "bg-zinc-900/60 shadow-lg border-white/5 hover:border-yellow-500/20 hover:bg-zinc-900/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
    overlay: isPyrite
      ? "bg-black/95 shadow-2xl border-purple-500/30 ring-1 ring-purple-500/20"
      : "bg-zinc-950/95 shadow-2xl border-white/10"
  };

  return (
    <div 
      ref={ref}
      className={cn(
        "relative rounded-2xl backdrop-blur-md md:backdrop-blur-2xl transition-all duration-500 overflow-hidden border ring-1 ring-white/5",
        layerStyles[layer],
        noPadding ? '' : 'p-5 md:p-6',
        className
      )}
      {...props}
    >
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" 
           style={{ backgroundImage: 'var(--noise-pattern)' }} />

      {/* Holographic Edge (Pyrite) */}
      {isPyrite && layer !== 'overlay' && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 box-border border border-transparent"
             style={{ 
               background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.05) 50%, rgba(168,85,247,0.1) 100%) border-box',
               mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
               maskComposite: 'exclude',
             }} 
        />
      )}

      <div className="relative z-20 h-full">
        {children}
      </div>
    </div>
  );
});

Card.displayName = "Card";
