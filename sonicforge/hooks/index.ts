
import { useState, useEffect, useCallback } from 'react';
import { HistoryItem, SyncStatus, CloudConfig } from '../types';

// from useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// from useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  return [storedValue, setValue] as const;
}

// from useCloudSync.ts
export const useCloudSync = () => {
  const [config, setConfig] = useLocalStorage<CloudConfig>('pyrite_cloud_config', {
    url: '',
    key: '',
    syncId: crypto.randomUUID()
  });
  
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const syncToCloud = useCallback(async (history: HistoryItem[]): Promise<boolean> => {
    if (!config.url || !config.key) {
        setStatus('error');
        return false;
    }
    setStatus('syncing');
    try {
      const baseUrl = config.url.replace(/\/$/, '');
      const endpoint = `${baseUrl}/rest/v1/user_data`;
      const payload = { id: config.syncId, content: history, updated_at: new Date().toISOString() };
      const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
              'apikey': config.key,
              'Authorization': `Bearer ${config.key}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(response.statusText);
      setLastSyncTime(Date.now());
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      return true;
    } catch (e) {
      console.error('[CloudSync] Push failed', e);
      setStatus('error');
      return false;
    }
  }, [config]);

  const pullFromCloud = useCallback(async (): Promise<HistoryItem[] | null> => {
    if (!config.url || !config.key) {
        setStatus('error');
        return null;
    }
    setStatus('syncing');
    try {
      const baseUrl = config.url.replace(/\/$/, '');
      const endpoint = `${baseUrl}/rest/v1/user_data?id=eq.${config.syncId}&select=content`;
      const response = await fetch(endpoint, {
          method: 'GET',
          headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].content) {
          setLastSyncTime(Date.now());
          setStatus('success');
          setTimeout(() => setStatus('idle'), 2000);
          return data[0].content as HistoryItem[];
      }
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      return [];
    } catch (e) {
      console.error('[CloudSync] Pull failed', e);
      setStatus('error');
      return null;
    }
  }, [config]);

  return { status, lastSyncTime, syncToCloud, pullFromCloud, config, setConfig };
};

// from useKonamiCode.ts
const konamiCode = [ 'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a' ];
export const useKonamiCode = (callback: () => void) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const newSequence = [...sequence, e.key];
    const isMatching = newSequence.every((key, index) => key.toLowerCase() === konamiCode[index].toLowerCase());
    if (isMatching) {
      if (newSequence.length === konamiCode.length) {
        callback();
        setSequence([]);
      } else {
        setSequence(newSequence);
      }
    } else {
      setSequence([]);
    }
  }, [sequence, callback]);
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);
};

// from usePWA.ts
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string; }>;
  prompt(): Promise<void>;
}
declare global {
  interface Window { deferredPrompt?: BeforeInstallPromptEvent; }
}
export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        if (reg.waiting) { setIsUpdateAvailable(true); }
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        setIsUpdateAvailable(true);
                    }
                });
            }
        });
      });
    }
  }, []);

  const installApp = useCallback(async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      window.deferredPrompt = undefined;
    }
  }, []);

  const updateApp = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
    } else {
      window.location.reload();
    }
  }, [registration]);

  return { isInstallable, isUpdateAvailable, installApp, updateApp };
};

// from useTypewriter.ts
import { triggerHaptic } from '../lib/utils';
export const useTypewriter = (text: string | undefined, speed: number = 5) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    if (!text) { setDisplayedText(''); return; }
    setDisplayedText('');
    let i = 0;
    let hapticCounter = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        const chunk = text.slice(i, i + 3); 
        setDisplayedText((prev) => prev + chunk);
        i += 3;
        hapticCounter++;
        if (hapticCounter % 3 === 0) {
            triggerHaptic('light');
        }
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayedText;
};

// Export usePersonas hook
export * from './usePersonas';
