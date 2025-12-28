
import { ExpertInputs, Platform, SongConcept } from '../types';

export interface SharePayload {
  v: number; // version for future compatibility
  inputs: SongConcept;
  expertInputs: ExpertInputs;
  isExpertMode: boolean;
  isPyriteMode: boolean;
}

const CURRENT_VERSION = 1;

// INLINED WORKER CODE TO PREVENT URL RESOLUTION ERRORS
// Importing via URL in a blob works if type='module'
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

// Worker Wrapper
const runWorker = (type: 'compress' | 'decompress', payload: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    // Use Blob for Worker to avoid URL resolution issues
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

/**
 * Async: Compresses the current application state into a URL-safe string via Web Worker.
 */
export const compressState = async (
  inputs: SongConcept,
  expertInputs: ExpertInputs,
  isExpertMode: boolean,
  isPyriteMode: boolean
): Promise<string> => {
  const payload: SharePayload = {
    v: CURRENT_VERSION,
    inputs,
    expertInputs,
    isExpertMode,
    isPyriteMode
  };
  
  const json = JSON.stringify(payload);
  const result = await runWorker('compress', json);
  const url = `${window.location.origin}${window.location.pathname}?forge=${result || ''}`;
  return url;
};

/**
 * Async: Decompresses a URL-safe string back into application state via Web Worker.
 */
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

/**
 * Generates pre-formatted URLs for social media sharing.
 */
export const generateShareLinks = (title: string, url: string) => {
  const text = `Check out this Suno prompt I created with Pyrite's Sonic Forge: "${title}"`;
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
  };
};
