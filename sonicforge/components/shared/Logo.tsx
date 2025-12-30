
import React from 'react';

interface LogoProps {
  className?: string;
  isPyriteMode?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-6 h-6", isPyriteMode = false }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="pyriteGradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#facc15" />
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
        fill={isPyriteMode ? "url(#pyriteGradient)" : "url(#goldGradient)"}
        opacity="0.8"
      />
      
      {/* The Strike / Waveform */}
      <path 
        d="M2 10L6 14H18L22 10" 
        stroke={isPyriteMode ? "#e879f9" : "#fef08a"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter={isPyriteMode ? "url(#glow)" : ""}
      />
      
      {/* Top Hammer / Circuit */}
      <path 
        d="M12 4V10M8 6L12 10L16 6" 
        stroke={isPyriteMode ? "#d8b4fe" : "#fde047"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Glitch Sparks (Pyrite Only) */}
      {isPyriteMode && (
        <>
          <circle cx="18" cy="6" r="1" fill="#fff" className="animate-pulse" />
          <circle cx="6" cy="7" r="1" fill="#fff" className="animate-ping" style={{ animationDuration: '2s' }} />
        </>
      )}
    </svg>
  );
};

export default Logo;
