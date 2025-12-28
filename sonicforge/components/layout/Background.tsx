
import React, { memo, useMemo } from 'react';
import AudioVisualizer from './AudioVisualizer';
import { useAudio } from '../../contexts/AudioContext';
import { useSettings } from '../../contexts/SettingsContext';
import { usePromptState } from '../../contexts/PromptContext';

interface BackgroundProps {
  isPyriteMode: boolean;
}

const Background: React.FC<BackgroundProps> = memo(({ isPyriteMode }) => {
  const { performanceMode } = useSettings();
  const { inputs } = usePromptState();
  const isHighPerf = performanceMode === 'high';
  const isLowPerf = performanceMode === 'low';
  
  const persona = inputs.producerPersona || 'standard';

  const personaColors = useMemo(() => {
    if (persona === 'pyrite') return "bg-purple-900/10";
    if (persona === 'shin') return "bg-red-900/10";
    if (persona === 'twin_flames') return "bg-pink-900/10";
    return "bg-yellow-500/5";
  }, [persona]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      
      {/* Audio Reactive Layer - Will unmount in low mode */}
      <AudioVisualizer isPyriteMode={isPyriteMode} />

      {persona !== 'standard' ? (
        <>
          {/* Moving Gradient Orbs */}
          {isHighPerf && (
            <>
              <div className={`hidden md:block absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] ${personaColors} rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[4s]`} />
              <div className={`hidden md:block absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] ${persona === 'shin' ? 'bg-red-800/5' : 'bg-pink-900/5'} rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[7s]`} />
              <div className={`hidden md:block absolute top-[30%] left-[30%] w-[40vw] h-[40vw] ${persona === 'pyrite' ? 'bg-indigo-900/5' : 'bg-orange-900/5'} rounded-full blur-[100px] animate-pulse duration-[5s]`} />
            </>
          )}

          {/* Fallback Static Gradient for Low/Medium */}
          {!isHighPerf && (
             <div className={`absolute inset-0 bg-gradient-to-br from-black via-${persona === 'shin' ? 'red' : 'purple'}-950/20 to-black opacity-50`} />
          )}
          
          {/* Static Noise Overlay (Low Opacity in Low Perf) */}
          <div className={`absolute inset-0 ${isLowPerf ? 'opacity-[0.05]' : 'opacity-[0.2]'}`} style={{ backgroundImage: 'var(--noise-pattern)' }} />
          
          {/* Scanline / Grid Effect - Skip in Low Perf */}
          {!isLowPerf && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-30" />
          )}
          
          {/* VHS Tracking Line Animation - High Perf Desktop Only */}
          {isHighPerf && (
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
          )}
        </>
      ) : (
        <>
          {/* Standard Suno Mode */}
          {isHighPerf && (
            <>
              <div className="hidden md:block absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] bg-yellow-500/5 rounded-full blur-[120px]" />
              <div className="hidden md:block absolute bottom-0 right-0 w-[50vw] h-[50vw] rounded-full bg-zinc-800/20 blur-[100px]" />
            </>
          )}
          {/* Simple gradient for lower modes */}
          {!isHighPerf && (
             <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-zinc-900" />
          )}
          
          <div className={`absolute inset-0 ${isLowPerf ? 'opacity-[0.03]' : 'opacity-[0.07]'}`} style={{ backgroundImage: 'var(--noise-pattern)' }} />
        </>
      )}
    </div>
  );
});

export default Background;
