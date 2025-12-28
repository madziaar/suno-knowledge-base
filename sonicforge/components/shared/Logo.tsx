
import React, { memo, useMemo } from 'react';
import { usePromptState } from '../../contexts/PromptContext';

interface LogoProps {
  className?: string;
  isPyriteMode?: boolean;
}

const Logo: React.FC<LogoProps> = memo(({ className = "w-6 h-6", isPyriteMode = false }) => {
  const { inputs } = usePromptState();
  const persona = inputs.producerPersona || 'standard';

  const gradients = useMemo(() => {
    if (persona === 'pyrite') {
      return {
        primary: { start: "#a855f7", mid: "#ec4899", end: "#a855f7" },
        stroke: "#e879f9",
        spark: "#d8b4fe"
      };
    }
    if (persona === 'shin') {
      return {
        primary: { start: "#dc2626", mid: "#7f1d1d", end: "#dc2626" },
        stroke: "#ef4444",
        spark: "#f87171"
      };
    }
    if (persona === 'twin_flames') {
      return {
        primary: { start: "#a855f7", mid: "#ef4444", end: "#ec4899" },
        stroke: "#f472b6",
        spark: "#ffffff"
      };
    }
    return {
      primary: { start: "#eab308", mid: "#facc15", end: "#eab308" },
      stroke: "#fef08a",
      spark: "#fde047"
    };
  }, [persona]);

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="dynamicGradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor={gradients.primary.start} />
          <stop offset="50%" stopColor={gradients.primary.mid} />
          <stop offset="100%" stopColor={gradients.primary.end} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* The Anvil Base */}
      <path 
        d="M4 14H20V16C20 18.2 18.2 20 16 20H8C5.8 20 4 18.2 4 16V14Z" 
        fill="url(#dynamicGradient)"
        opacity="0.8"
      />
      
      {/* The Strike / Waveform */}
      <path 
        d="M2 10L6 14H18L22 10" 
        stroke={gradients.stroke} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter={persona !== 'standard' ? "url(#glow)" : ""}
      />
      
      {/* Top Hammer / Circuit */}
      <path 
        d="M12 4V10M8 6L12 10L16 6" 
        stroke={gradients.spark} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Glitch Sparks */}
      {persona !== 'standard' && (
        <>
          <circle cx="18" cy="6" r="1" fill="#fff" className="animate-pulse" />
          <circle cx="6" cy="7" r="1" fill="#fff" className="animate-ping" style={{ animationDuration: '2s' }} />
        </>
      )}
    </svg>
  );
});

export default Logo;
