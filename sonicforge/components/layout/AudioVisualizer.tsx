
import React, { useEffect, useRef, memo, useMemo } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useSettings } from '../../contexts/SettingsContext';
import { usePromptState } from '../../contexts/PromptContext';

interface AudioVisualizerProps {
  isPyriteMode: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = memo(({ isPyriteMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getAnalyser } = useAudio();
  const { performanceMode } = useSettings();
  const { inputs } = usePromptState();
  
  const persona = inputs.producerPersona || 'standard';

  const visualizerColors = useMemo(() => {
    if (persona === 'pyrite') return { r: 168, g: 85, b: 247 };
    if (persona === 'shin') return { r: 239, g: 68, b: 68 };
    if (persona === 'twin_flames') return { r: 219, g: 39, b: 119 };
    return { r: 234, g: 179, b: 8 };
  }, [persona]);

  useEffect(() => {
    if (performanceMode === 'low') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [performanceMode]);

  useEffect(() => {
    if (performanceMode === 'low') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let animationId: number;
    let dataArray: Uint8Array | null = null;

    const render = () => {
      if (document.hidden) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const analyser = getAnalyser();
      if (!analyser) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Lazy init data array to avoid re-allocation
      if (!dataArray || dataArray.length !== analyser.frequencyBinCount) {
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      }
      
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hasSignal = dataArray[0] > 0 || dataArray[10] > 0 || dataArray[20] > 0;

      if (hasSignal) {
        if (persona !== 'standard') {
          const barWidth = (canvas.width / dataArray.length) * 2.5;
          let x = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i];
            if (value > 0) {
              const barHeight = value * 2.0;
              // Mix in persona-specific color base
              const mixR = Math.min(255, visualizerColors.r + (value / 2));
              ctx.fillStyle = `rgba(${mixR}, ${visualizerColors.g}, ${visualizerColors.b}, ${value / 512})`;
              ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              ctx.fillRect(x, 0, barWidth, barHeight * 0.5);
            }
            x += barWidth + 1;
          }
        } else {
          const sliceWidth = canvas.width / dataArray.length;
          let x = 0;
          // Fix: Updated 'medium' to 'balanced' to match new core types
          const opacity = performanceMode === 'balanced' ? 0.08 : 0.12;
          ctx.fillStyle = `rgba(${visualizerColors.r}, ${visualizerColors.g}, ${visualizerColors.b}, ${opacity})`;
          for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 255.0;
            const barHeight = v * (canvas.height / 3);
            ctx.fillRect(x, canvas.height - barHeight, sliceWidth * 2, barHeight);
            x += sliceWidth * 2;
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [persona, visualizerColors, getAnalyser, performanceMode]);

  if (performanceMode === 'low') return null;

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none opacity-50" />;
});

export default AudioVisualizer;
