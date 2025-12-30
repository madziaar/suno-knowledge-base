
import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Language } from '../types';
import { useAudio } from './AudioContext';

interface SettingsContextType {
  lang: Language;
  setLang: (value: Language | ((val: Language) => Language)) => void;
  isPyriteMode: boolean;
  setIsPyriteMode: (value: boolean | ((val: boolean) => boolean)) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useLocalStorage<Language>('pyrite_lang', 'pl');
  const [isPyriteMode, setIsPyriteMode] = useLocalStorage<boolean>('pyrite_mode', false);
  
  const { setPyriteMode: setAudioPyriteMode } = useAudio();

  // Sync Pyrite Mode
  useEffect(() => {
    setAudioPyriteMode(isPyriteMode);
    if (isPyriteMode) {
      document.body.classList.add('pyrite-mode');
    } else {
      document.body.classList.remove('pyrite-mode');
    }
  }, [isPyriteMode, setAudioPyriteMode]);

  // Sync Language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    isPyriteMode,
    setIsPyriteMode,
  }), [lang, setLang, isPyriteMode, setIsPyriteMode]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
