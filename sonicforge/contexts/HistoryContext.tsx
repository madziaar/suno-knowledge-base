
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { HistoryItem, GenreTemplate } from '../types';
import { useAudio } from './AudioContext';
import { exportAsJSON } from '../lib/export-utils';
import { useSettings } from './SettingsContext';
import { translations } from '../translations';
import { useCloudSync, CloudConfig, SyncStatus } from '../hooks/useCloudSync';

interface HistoryContextType {
  history: HistoryItem[];
  loadedItem: HistoryItem | null;
  loadedTemplate: GenreTemplate | null;
  addToHistory: (item: HistoryItem) => void;
  loadFromHistory: (item: HistoryItem) => void;
  loadFromTemplate: (template: GenreTemplate) => void;
  deleteFromHistory: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  exportHistory: () => { success: boolean, message: string };
  resetLoaders: () => void;
  // Cloud Sync
  cloudConfig: CloudConfig;
  setCloudConfig: (val: CloudConfig | ((prev: CloudConfig) => CloudConfig)) => void;
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
  pushHistoryToCloud: () => Promise<void>;
  pullHistoryFromCloud: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('pyrite_history', []);
  const [loadedItem, setLoadedItem] = useState<HistoryItem | null>(null);
  const [loadedTemplate, setLoadedTemplate] = useState<GenreTemplate | null>(null);
  
  const { play } = useAudio();
  const { lang } = useSettings();
  
  // Cloud Sync Hook
  const { 
      config: cloudConfig, 
      setConfig: setCloudConfig, 
      syncToCloud, 
      pullFromCloud, 
      status: syncStatus, 
      lastSyncTime 
  } = useCloudSync();

  // Sort history: Favorites first, then chronological descending
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
        // If one is favorite and the other isn't, favorite wins
        if (!!a.isFavorite !== !!b.isFavorite) {
            return a.isFavorite ? -1 : 1;
        }
        // Otherwise sort by timestamp (newest first)
        return b.timestamp - a.timestamp;
    });
  }, [history]);

  const addToHistory = useCallback((item: HistoryItem) => {
    // Limit to 100 items to prevent storage bloat
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
      setHistory(prev => prev.filter(i => i.isFavorite)); // Keep favorites
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

  // --- CLOUD OPERATIONS ---
  
  const pushHistoryToCloud = useCallback(async () => {
      if (history.length === 0) return;
      await syncToCloud(history);
  }, [history, syncToCloud]);

  const pullHistoryFromCloud = useCallback(async () => {
      const cloudData = await pullFromCloud();
      if (cloudData) {
          // Merge Strategy: Union by ID
          setHistory((current: HistoryItem[]) => {
              const merged = new Map<string, HistoryItem>();
              // Load local items first
              current.forEach(item => merged.set(item.id, item));
              // Overwrite/Add cloud items
              cloudData.forEach(item => merged.set(item.id, item));
              
              return Array.from(merged.values());
          });
      }
  }, [pullFromCloud, setHistory]);

  const value = useMemo(() => ({
    history: sortedHistory,
    loadedItem,
    loadedTemplate,
    addToHistory,
    loadFromHistory,
    loadFromTemplate,
    deleteFromHistory,
    toggleFavorite,
    clearHistory,
    exportHistory,
    resetLoaders,
    // Cloud
    cloudConfig,
    setCloudConfig,
    syncStatus,
    lastSyncTime,
    pushHistoryToCloud,
    pullHistoryFromCloud
  }), [sortedHistory, loadedItem, loadedTemplate, addToHistory, loadFromHistory, loadFromTemplate, deleteFromHistory, toggleFavorite, clearHistory, exportHistory, resetLoaders, cloudConfig, setCloudConfig, syncStatus, lastSyncTime, pushHistoryToCloud, pullHistoryFromCloud]);

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
