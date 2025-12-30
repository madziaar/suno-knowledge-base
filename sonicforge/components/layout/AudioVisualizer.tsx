
import React, { useEffect, useRef, memo } from 'react';
import { useAudio } from '../../contexts/AudioContext';

interface AudioVisualizerProps {
  isPyriteMode: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = memo(({ isPyriteMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getAnalyser, platform } = useAudio();

  // Resize Handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial size
    handleResize();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let dataArray: Uint8Array;

    const render = () => {
      // Optimization: Do not render if tab is hidden
      if (document.hidden) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const analyser = getAnalyser();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser) {
        if (!dataArray || dataArray.length !== analyser.frequencyBinCount) {
             dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(dataArray);

        // Check if there is actual sound (skip rendering if silent to save battery)
        const hasSignal = dataArray.some(val => val > 0);

        if (hasSignal) {
            if (isPyriteMode) {
                // --- PYRITE MODE: Glitchy Vertical Bars ---
                const barWidth = (canvas.width / dataArray.length) * 2.5;
                let x = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const value = dataArray[i];
                    if (value > 0) {
                        const barHeight = value * 2.0;
                        // Glitch color: Purple/Blue/White spectrum
                        const r = 120 + (value / 2);
                        const g = 50;
                        const b = 255;
                        
                        ctx.fillStyle = `rgba(${r},${g},${b}, ${value / 512})`; // Semi transparent
                        
                        // Bottom bars
                        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                        
                        // Mirror top bars (Glitch effect)
                        ctx.fillRect(x, 0, barWidth, barHeight * 0.5);
                    }
                    x += barWidth + 1;
                }
            } else {
                // --- STANDARD SUNO MODE: Smooth Equalizer ---
                ctx.beginPath();
                const sliceWidth = canvas.width / dataArray.length;
                let x = 0;
                
                for(let i = 0; i < dataArray.length; i++) {
                    const v = dataArray[i] / 255.0;
                    const y = canvas.height - (v * (canvas.height / 3));
                    const barHeight = v * (canvas.height / 3);
                    
                    ctx.fillStyle = `rgba(234, 179, 8, 0.15)`; // Yellow low opacity
                    ctx.fillRect(x, canvas.height - barHeight, sliceWidth * 2, barHeight);
                    
                    x += sliceWidth * 2;
                }
            }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPyriteMode, getAnalyser, platform]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none opacity-50" />;
});
export default AudioVisualizer;
