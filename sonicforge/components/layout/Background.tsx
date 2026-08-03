
import React, { memo } from 'react';
import AudioVisualizer from './AudioVisualizer';
import { useAudio } from '../../contexts/AudioContext';

interface BackgroundProps {
  isPyriteMode: boolean;
}

const Background: React.FC<BackgroundProps> = memo(({ isPyriteMode }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      
      {/* Audio Reactive Layer - Optimized internally to pause when hidden */}
      <AudioVisualizer isPyriteMode={isPyriteMode} />

      {isPyriteMode ? (
        <>
          {/* Moving Gradient Orbs (Pyrite) - Hidden on mobile for performance */}
          <div className="hidden md:block absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[4s]" />
          <div className="hidden md:block absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-pink-900/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[7s]" />
          <div className="hidden md:block absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-indigo-900/5 rounded-full blur-[100px] animate-pulse duration-[5s]" />
          
          {/* Static Noise Overlay (Local Data URI) */}
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'var(--noise-pattern)' }} />
          
          {/* Scanline / Grid Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-30" />
          
          {/* VHS Tracking Line Animation - Hidden on mobile */}
          <div className="hidden md:block absolute w-full h-[2px] bg-white/5 top-0 animate-[tracking_8s_linear_infinite] opacity-50 blur-[1px]">
            <style>{`
              @keyframes tracking {
                0% { top: 100%; opacity: 0; }
                10% { opacity: 0.5; }
                90% { opacity: 0.5; }
                100% { top: 0%; opacity: 0; }
              }
            `}</style>
          </div>
        </>
      ) : (
        <>
          {/* Standard Suno Mode (Yellow/Zinc) - Simplified on mobile */}
          <div className="hidden md:block absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-yellow-500/5 rounded-full blur-[120px]" />
          <div className="hidden md:block absolute bottom-0 right-0 w-[50vw] h-[50vw] rounded-full bg-zinc-800/20 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'var(--noise-pattern)' }} />
        </>
      )}
    </div>
  );
});

export default Background;
