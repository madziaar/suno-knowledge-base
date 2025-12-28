
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { GeneratorState } from '../types';
import { ToastState } from '../components/shared/Toast';
import { useAudio } from './AudioContext';

type Tab = 'forge' | 'studio' | 'guide' | 'history' | 'docs' | 'templates';

// State
interface UIState {
  activeTab: Tab;
  generatorState: GeneratorState;
  toast: ToastState;
  isSettingsModalOpen: boolean;
}
// Dispatch
type UIDispatch = {
  setActiveTab: (tab: Tab) => void;
  setGeneratorState: (state: GeneratorState) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: () => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const UIStateContext = createContext<UIState | undefined>(undefined);
const UIDispatchContext = createContext<UIDispatch | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('forge');
  const [generatorState, setGeneratorState] = useState<GeneratorState>(GeneratorState.IDLE);
  const [toast, setToast] = useState<ToastState>({ msg: '', type: 'info', visible: false });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { play } = useAudio();

  const handleSetActiveTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    play('click');
  }, [play]);

  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ msg, type, visible: true });
    if (type === 'success') play('success');
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }, [play]);

  const dismissToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const openSettings = useCallback(() => setIsSettingsModalOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsModalOpen(false), []);

  const state = useMemo(() => ({
    activeTab, generatorState, toast, isSettingsModalOpen
  }), [activeTab, generatorState, toast, isSettingsModalOpen]);
  
  const dispatch = useMemo(() => ({
    setActiveTab: handleSetActiveTab, setGeneratorState, showToast, dismissToast, openSettings, closeSettings
  }), [handleSetActiveTab, showToast, dismissToast, openSettings, closeSettings]);

  return (
    <UIStateContext.Provider value={state}>
      <UIDispatchContext.Provider value={dispatch}>
        {children}
      </UIDispatchContext.Provider>
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) throw new Error('useUIState must be used within a UIProvider');
  return context;
};

export const useUIDispatch = () => {
  const context = useContext(UIDispatchContext);
  if (!context) throw new Error('useUIDispatch must be used within a UIProvider');
  return context;
};

// Legacy hook for compatibility
export const useUI = () => {
  const state = useUIState();
  const dispatch = useUIDispatch();
  return { ...state, ...dispatch };
};
