
import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Language, PerformanceMode } from '../types';
import { useAudio } from './AudioContext';

// State
interface SettingsState {
  lang: Language;
  isOverclockedMode: boolean;
  performanceMode: PerformanceMode;
  warnerOptIn: boolean;
}
// Dispatch
type SettingsDispatch = {
  setLang: (value: Language | ((val: Language) => Language)) => void;
  setIsOverclockedMode: (value: boolean | ((val: boolean) => boolean)) => void;
  setPerformanceMode: (value: PerformanceMode) => void;
  setWarnerOptIn: (value: boolean | ((val: boolean) => boolean)) => void;
};

const SettingsStateContext = createContext<SettingsState | undefined>(undefined);
const SettingsDispatchContext = createContext<SettingsDispatch | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useLocalStorage<Language>('pyrite_lang', 'pl');
  const [isOverclockedMode, setIsOverclockedMode] = useLocalStorage<boolean>('pyrite_overclock_mode', false);
  const [performanceMode, setPerformanceMode] = useLocalStorage<PerformanceMode>('pyrite_perf', 'low');
  const [warnerOptIn, setWarnerOptIn] = useLocalStorage<boolean>('pyrite_warner_optin', false);
  
  const { setPyriteMode: setAudioPyriteMode } = useAudio();

  useEffect(() => {
    setAudioPyriteMode(isOverclockedMode);
    document.body.classList.toggle('pyrite-mode', isOverclockedMode);
  }, [isOverclockedMode, setAudioPyriteMode]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.body.classList.remove('perf-high', 'perf-medium', 'perf-low');
    document.body.classList.add(`perf-${performanceMode}`);
  }, [performanceMode]);

  const state = useMemo(() => ({
    lang, isOverclockedMode, performanceMode, warnerOptIn
  }), [lang, isOverclockedMode, performanceMode, warnerOptIn]);

  const dispatch = useMemo(() => ({
    setLang, setIsOverclockedMode, setPerformanceMode, setWarnerOptIn
  }), [setLang, setIsOverclockedMode, setPerformanceMode, setWarnerOptIn]);

  return (
    <SettingsStateContext.Provider value={state}>
      <SettingsDispatchContext.Provider value={dispatch}>
        {children}
      </SettingsDispatchContext.Provider>
    </SettingsStateContext.Provider>
  );
};

export const useSettingsState = () => {
  const context = useContext(SettingsStateContext);
  if (!context) throw new Error('useSettingsState must be used within a SettingsProvider');
  return context;
};

export const useSettingsDispatch = () => {
  const context = useContext(SettingsDispatchContext);
  if (!context) throw new Error('useSettingsDispatch must be used within a SettingsProvider');
  return context;
};

// Legacy hook for easier migration if needed, though direct usage of split hooks is preferred.
export const useSettings = () => {
    const state = useSettingsState();
    const dispatch = useSettingsDispatch();
    return { ...state, ...dispatch };
};
