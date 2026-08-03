
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { GeneratorState } from '../types';
import { ToastState } from '../components/shared/Toast';
import { useAudio } from './AudioContext';

type Tab = 'forge' | 'studio' | 'guide' | 'history' | 'docs' | 'templates';

interface UIContextType {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  generatorState: GeneratorState;
  setGeneratorState: (state: GeneratorState) => void;
  toast: ToastState;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: () => void;
  isSettingsModalOpen: boolean; // New
  openSettings: () => void; // New
  closeSettings: () => void; // New
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('forge');
  const [generatorState, setGeneratorState] = useState<GeneratorState>(GeneratorState.IDLE);
  const [toast, setToast] = useState<ToastState>({ msg: '', type: 'info', visible: false });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // New: State for settings modal
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

  // New: Settings modal handlers
  const openSettings = useCallback(() => {
    setIsSettingsModalOpen(true);
    play('click');
  }, [play]);

  const closeSettings = useCallback(() => {
    setIsSettingsModalOpen(false);
    play('click');
  }, [play]);


  const value = useMemo(() => ({
    activeTab,
    setActiveTab: handleSetActiveTab,
    generatorState,
    setGeneratorState,
    toast,
    showToast,
    dismissToast,
    isSettingsModalOpen, // New
    openSettings, // New
    closeSettings, // New
  }), [activeTab, handleSetActiveTab, generatorState, toast, showToast, dismissToast, isSettingsModalOpen, openSettings, closeSettings]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
