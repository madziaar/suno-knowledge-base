
import React, { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { sfx } from '../lib/audio';
import { Platform } from '../types';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  play: (type: 'click' | 'hover' | 'success' | 'error' | 'toggle' | 'light' | 'secret') => void;
  setPyriteMode: (isPyrite: boolean) => void;
  getAnalyser: () => AnalyserNode | null;
  platform: Platform;
  setPlatform: (p: Platform) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [platform, setPlatform] = useState<Platform>('suno');
  const engineRef = useRef(sfx);

  // Sync initial mute state
  useEffect(() => {
    setIsMuted(engineRef.current.getMuteState());
  }, []);

  const toggleMute = useCallback(() => {
    const newState = engineRef.current.toggleMute();
    setIsMuted(newState);
  }, []);

  const play = useCallback((type: 'click' | 'hover' | 'success' | 'error' | 'toggle' | 'light' | 'secret') => {
    engineRef.current.play(type);
  }, []);

  const setPyriteMode = useCallback((isPyrite: boolean) => {
    engineRef.current.setMode(isPyrite);
  }, []);

  const getAnalyser = useCallback(() => {
    return engineRef.current.getAnalyser();
  }, []);

  // Memoize the context value to prevent unnecessary re-renders in consumers
  const value = useMemo(() => ({
    isMuted,
    toggleMute,
    play,
    setPyriteMode,
    getAnalyser,
    platform,
    setPlatform
  }), [isMuted, toggleMute, play, setPyriteMode, getAnalyser, platform]);

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
