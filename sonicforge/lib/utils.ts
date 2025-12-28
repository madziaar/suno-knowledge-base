import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ExpertInputs, Platform, SongConcept } from '../types';
import { useEffect } from 'react';

/**
 * Merges Tailwind classes intelligently, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const safeJSONParse = <T>(text: string, fallback: T): T => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
};

export const capitalize = (s: string) => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

// from lib/haptics.ts
export const triggerHaptic = (pattern: 'success' | 'error' | 'click' | 'light' | 'heavy' | 'rise') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        switch(pattern) {
            case 'success': navigator.vibrate([10, 30, 10, 30]); break;
            case 'error': navigator.vibrate([50, 50, 50, 50, 50]); break;
            case 'click': navigator.vibrate(5); break;
            case 'light': navigator.vibrate(2); break;
            case 'heavy': navigator.vibrate(30); break;
            case 'rise': navigator.vibrate([5, 10, 10, 10, 20]); break;
        }
    }
};

// from lib/keyboard-shortcuts.ts
type KeyHandler = (e: KeyboardEvent) => void;

export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  handler: KeyHandler;
  allowInInput?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      shortcuts.forEach(config => {
        const keyMatch = e.key.toLowerCase() === config.key.toLowerCase();
        const hasCtrl = config.ctrlKey ? (e.ctrlKey || e.metaKey) : false;
        if (keyMatch && (config.ctrlKey ? hasCtrl : true)) {
          if (isInput && !config.allowInInput) return;
          e.preventDefault();
          config.handler(e);
        }
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// from lib/sharing.ts
export interface SharePayload {
  v: number;
  inputs: SongConcept;
  expertInputs: ExpertInputs;
  isExpertMode: boolean;
  isPyriteMode: boolean;
}

const CURRENT_VERSION = 1;

const LZ_WORKER_CODE = `
import LZString from "https://aistudiocdn.com/lz-string@^1.5.0";
self.onmessage = (e) => {
  const { type, payload } = e.data;
  try {
    if (type === 'compress') {
      const result = LZString.compressToEncodedURIComponent(payload);
      self.postMessage({ success: true, result });
    } else if (type === 'decompress') {
      const result = LZString.decompressFromEncodedURIComponent(payload);
      self.postMessage({ success: true, result });
    } else {
      throw new Error(\`Unknown operation: \${type}\`);
    }
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
`;

const runWorker = (type: 'compress' | 'decompress', payload: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const blob = new Blob([LZ_WORKER_CODE], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob), { type: 'module' });
    worker.onmessage = (e) => {
      worker.terminate();
      if (e.data.success) {
        resolve(e.data.result);
      } else {
        console.error("Worker Error:", e.data.error);
        reject(e.data.error);
      }
    };
    worker.onerror = (e) => {
      worker.terminate();
      console.error("Worker Infrastructure Error", e);
      reject(e);
    }
    worker.postMessage({ type, payload });
  });
};

export const compressState = async (
  inputs: SongConcept,
  expertInputs: ExpertInputs,
  isExpertMode: boolean,
  isPyriteMode: boolean
): Promise<string> => {
  const payload: SharePayload = { v: CURRENT_VERSION, inputs, expertInputs, isExpertMode, isPyriteMode };
  const json = JSON.stringify(payload);
  const result = await runWorker('compress', json);
  const url = `${window.location.origin}${window.location.pathname}?forge=${result || ''}`;
  return url;
};

export const decompressState = async (encoded: string): Promise<SharePayload | null> => {
  try {
    const json = await runWorker('decompress', encoded);
    if (!json) return null;
    const payload = JSON.parse(json) as SharePayload;
    return payload;
  } catch (e) {
    console.error("Failed to decompress shared state", e);
    return null;
  }
};

export const generateShareLinks = (title: string, url: string) => {
  const text = `Check out this Suno prompt I created with Pyrite's Sonic Forge: "${title}"`;
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
  };
};
