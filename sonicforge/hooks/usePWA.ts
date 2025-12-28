
import { useState, useEffect, useCallback } from 'react';

// Extend Window interface for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // 1. Capture Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Store event for later
      window.deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // 2. Check for SW Updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        
        // Check if there's a waiting worker (update downloaded but not activated)
        if (reg.waiting) {
            setIsUpdateAvailable(true);
        }

        // Listen for new workers found
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
      // Send message to SW to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload page when new SW takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
        window.location.reload(); // Fallback
    }
  }, [registration]);

  return {
    isInstallable,
    isUpdateAvailable,
    installApp,
    updateApp
  };
};
