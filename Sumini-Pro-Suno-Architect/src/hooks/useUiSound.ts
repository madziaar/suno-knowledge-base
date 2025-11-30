import { useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

export const useUiSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const { settings } = useSettings();

  const initAudio = () => {
    if (!settings.ui.soundEnabled) return;
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
  };

  // Auto-resume audio context on first user interaction
  useEffect(() => {
    if (!settings.ui.soundEnabled) return;

    const resumeAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(e => console.debug("Audio resume failed", e));
      }
    };
    
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
    document.addEventListener('keydown', resumeAudio);
    
    return () => {
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
    };
  }, [settings.ui.soundEnabled]);

  const playTone = (freq: number, type: 'sine' | 'triangle' | 'square', duration: number, vol = 0.1) => {
    if (!settings.ui.soundEnabled) return;
    
    initAudio();
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playClick = useCallback(() => {
    playTone(800, 'sine', 0.05, 0.05);
  }, [settings.ui.soundEnabled]);

  const playTick = useCallback(() => {
    playTone(1200, 'triangle', 0.03, 0.015);
  }, [settings.ui.soundEnabled]);

  const playWoosh = useCallback(() => {
    if (!settings.ui.soundEnabled) return;
    initAudio();
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Smooth low-freq sweep
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }, [settings.ui.soundEnabled]);

  const playSuccess = useCallback(() => {
    if (!settings.ui.soundEnabled) return;
    initAudio();
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    // Chord for success
    [440, 554.37, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.03, now + (i * 0.05));
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + (i * 0.05));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + (i * 0.05));
      osc.stop(now + 0.6 + (i * 0.05));
    });
  }, [settings.ui.soundEnabled]);

  const playPop = useCallback(() => {
    playTone(600, 'sine', 0.1, 0.03);
  }, [settings.ui.soundEnabled]);

  return { playClick, playTick, playWoosh, playSuccess, playPop };
};