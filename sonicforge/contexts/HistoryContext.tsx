
import React, { createContext, useContext, useMemo, useCallback } from 'react';
// FIX: Import CloudConfig and SyncStatus which are now exported from the main types index.
import { HistoryItem, GenreTemplate, CloudConfig, SyncStatus } from '../types';
import { useAudio } from './AudioContext';
import { exportAsJSON } from '../lib/export-utils';
import { useSettingsState } from './SettingsContext';
import { translations } from '../translations';
import { useCloudSync, useLocalStorage } from '../hooks';

// State
interface HistoryState {
  history: HistoryItem[];
  loadedItem: HistoryItem | null;
  loadedTemplate: GenreTemplate | null;
  cloudConfig: CloudConfig;
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
}

// Dispatch
type HistoryDispatch = {
  addToHistory: (item: HistoryItem) => void;
  loadFromHistory: (item: HistoryItem) => void;
  loadFromTemplate: (template: GenreTemplate) => void;
  deleteFromHistory: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  exportHistory: () => { success: boolean, message: string };
  resetLoaders: () => void;
  setCloudConfig: (val: CloudConfig | ((prev: CloudConfig) => CloudConfig)) => void;
  pushHistoryToCloud: () => Promise<void>;
  pullHistoryFromCloud: () => Promise<void>;
};

const HistoryStateContext = createContext<HistoryState | undefined>(undefined);
const HistoryDispatchContext = createContext<HistoryDispatch | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('pyrite_history', []);
  const [loadedItem, setLoadedItem] = React.useState<HistoryItem | null>(null);
  const [loadedTemplate, setLoadedTemplate] = React.useState<GenreTemplate | null>(null);
  
  const { play } = useAudio();
  const { lang } = useSettingsState();
  
  const { 
      config: cloudConfig, 
      setConfig: setCloudConfig, 
      syncToCloud, 
      pullFromCloud, 
      status: syncStatus, 
      lastSyncTime 
  } = useCloudSync();

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
        if (!!a.isFavorite !== !!b.isFavorite) return a.isFavorite ? -1 : 1;
        return b.timestamp - a.timestamp;
    });
  }, [history]);

  const addToHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => [item, ...prev.slice(0, 99)]); 
  }, [setHistory]);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setLoadedItem(item);
    setLoadedTemplate(null);
    play('click');
  }, [play]);
  
  const loadFromTemplate = useCallback((template: GenreTemplate) => {
    setLoadedTemplate(template);
    setLoadedItem(null);
    play('success');
  }, [play]);

  const deleteFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(i => i.id !== id));
    play('click');
  }, [setHistory, play]);

  const toggleFavorite = useCallback((id: string) => {
    setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
    play('light');
  }, [setHistory, play]);
  
  const clearHistory = useCallback(() => {
    if (window.confirm(translations[lang].dialogs.purgeHistory)) {
      setHistory(prev => prev.filter(i => i.isFavorite));
      play('click');
    }
  }, [setHistory, play, lang]);

  const exportHistory = useCallback(() => {
    if (history.length > 0) {
      exportAsJSON(history, `pyrite_history_export_${Date.now()}`);
      return { success: true, message: translations[lang].toast.historyExported };
    }
    return { success: false, message: translations[lang].toast.noHistory };
  }, [history, lang]);

  const resetLoaders = useCallback(() => {
      setLoadedItem(null);
      setLoadedTemplate(null);
  }, []);

  const pushHistoryToCloud = useCallback(async () => {
      if (history.length === 0) return;
      await syncToCloud(history);
  }, [history, syncToCloud]);

  const pullHistoryFromCloud = useCallback(async () => {
      const cloudData = await pullFromCloud();
      if (cloudData) {
          setHistory((current: HistoryItem[]) => {
              const merged = new Map<string, HistoryItem>();
              current.forEach(item => merged.set(item.id, item));
              cloudData.forEach(item => merged.set(item.id, item));
              return Array.from(merged.values());
          });
      }
  }, [pullFromCloud, setHistory]);

  const stateValue = useMemo(() => ({
    history: sortedHistory, loadedItem, loadedTemplate, cloudConfig, syncStatus, lastSyncTime
  }), [sortedHistory, loadedItem, loadedTemplate, cloudConfig, syncStatus, lastSyncTime]);

  const dispatchValue = useMemo(() => ({
    addToHistory, loadFromHistory, loadFromTemplate, deleteFromHistory, toggleFavorite, clearHistory, exportHistory, resetLoaders, setCloudConfig, pushHistoryToCloud, pullHistoryFromCloud
  }), [addToHistory, loadFromHistory, loadFromTemplate, deleteFromHistory, toggleFavorite, clearHistory, exportHistory, resetLoaders, setCloudConfig, pushHistoryToCloud, pullHistoryFromCloud]);

  return (
    <HistoryStateContext.Provider value={stateValue}>
        <HistoryDispatchContext.Provider value={dispatchValue}>
            {children}
        </HistoryDispatchContext.Provider>
    </HistoryStateContext.Provider>
  );
};

export const useHistoryState = () => {
  const context = useContext(HistoryStateContext);
  if (context === undefined) throw new Error('useHistoryState must be used within a HistoryProvider');
  return context;
};

export const useHistoryDispatch = () => {
    const context = useContext(HistoryDispatchContext);
    if (context === undefined) throw new Error('useHistoryDispatch must be used within a HistoryProvider');
    return context;
};

// Legacy for compatibility
export const useHistory = () => {
    const state = useHistoryState();
    const dispatch = useHistoryDispatch();
    return { ...state, ...dispatch };
};
