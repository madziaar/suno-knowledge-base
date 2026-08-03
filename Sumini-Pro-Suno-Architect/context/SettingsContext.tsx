import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
  generation: {
    modelPreference: 'quality',
    temperature: 1.0,
  },
  ui: {
    soundEnabled: true,
    reducedMotion: false,
    highContrast: false,
  },
  developer: {
    showDebug: false,
    showSystemPrompt: false,
  },
};

// Helper type for granular updates allowing nested partials
type AppSettingsUpdates = {
  generation?: Partial<AppSettings['generation']>;
  ui?: Partial<AppSettings['ui']>;
  developer?: Partial<AppSettings['developer']>;
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettingsUpdates) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sumini_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('sumini_settings', JSON.stringify(settings));
    
    // Apply UI effects
    if (settings.ui.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [settings]);

  const updateSettings = (partial: AppSettingsUpdates) => {
    setSettings(prev => {
      // Deep merge for nested objects
      const next = { ...prev };
      if (partial.generation) {
        next.generation = { ...prev.generation, ...partial.generation } as AppSettings['generation'];
      }
      if (partial.ui) {
        next.ui = { ...prev.ui, ...partial.ui } as AppSettings['ui'];
      }
      if (partial.developer) {
        next.developer = { ...prev.developer, ...partial.developer } as AppSettings['developer'];
      }
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      // Basic validation could go here
      setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, exportSettings, importSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};