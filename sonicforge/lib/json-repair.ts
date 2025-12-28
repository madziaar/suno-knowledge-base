
/**
 * JSON Repair & Parse Logic (Isolated for Worker)
 * This code is stringified and executed in a Web Worker.
 */
const WORKER_LOGIC = `
  function repairPartialJson(text) {
    // 1. Strip Markdown Code Blocks
    let clean = text.replace(/^\\\`\\\`\\\`json\\s*/, '').replace(/^\\\`\\\`\\\`/, '');
    
    if (!clean.trim().startsWith('{')) return {};

    // 2. Try parsing as is
    try {
      return JSON.parse(clean);
    } catch (e) {}

    // 3. Remove trailing Markdown end block
    clean = clean.replace(/\\\`+$/, '');

    // 4. State Machine for closers
    let inString = false;
    let escape = false;
    let stack = [];
    
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      if (escape) { escape = false; continue; }
      if (char === '\\\\') { escape = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      
      if (!inString) {
        if (char === '{') stack.push('}');
        else if (char === '[') stack.push(']');
        else if (char === '}') {
          if (stack[stack.length - 1] === '}') stack.pop();
        }
        else if (char === ']') {
          if (stack[stack.length - 1] === ']') stack.pop();
        }
      }
    }

    // 5. Apply repairs
    let repaired = clean;
    if (inString) repaired += '"';
    while (stack.length > 0) repaired += stack.pop();

    // 6. Final Attempt
    try {
      return JSON.parse(repaired);
    } catch (e) {
      return extractFieldsFallback(clean);
    }
  }

  function extractFieldsFallback(text) {
    const result = {};
    const extract = (key) => {
      const match = text.match(new RegExp(\`"\${key}"\\\\s*:\\\\s*"(.*?)(?:"|$)\`, 's'));
      if (match) return match[1];
      return undefined;
    };
    result.analysis = extract('analysis');
    result.title = extract('title');
    result.tags = extract('tags');
    result.style = extract('style');
    result.lyrics = extract('lyrics');
    return result;
  }

  self.onmessage = (e) => {
    const { type, payload } = e.data;
    
    try {
      if (type === 'repair') {
        const result = repairPartialJson(payload);
        self.postMessage({ success: true, result });
      } else if (type === 'parse') {
        // Strict parse for final output
        const clean = payload.replace(/^\\\`\\\`\\\`json\\s*/, '').replace(/^\\\`\\\`\\\`/, '');
        const result = JSON.parse(clean);
        self.postMessage({ success: true, result });
      } else {
        // Legacy fallback
        const result = repairPartialJson(payload || e.data);
        self.postMessage({ success: true, result });
      }
    } catch (err) {
      self.postMessage({ success: false, error: err.message });
    }
  };
`;

// Singleton Worker Instance
let workerInstance: Worker | null = null;

const getWorker = () => {
  if (!workerInstance && typeof window !== 'undefined') {
    const blob = new Blob([WORKER_LOGIC], { type: 'application/javascript' });
    workerInstance = new Worker(URL.createObjectURL(blob));
  }
  return workerInstance;
};

/**
 * Asynchronously repairs partial JSON using a background worker.
 * Prevents UI freeze during heavy streaming.
 */
export const repairJsonAsync = (text: string): Promise<any> => {
  return new Promise((resolve) => {
    const worker = getWorker();
    if (!worker) {
      resolve({}); 
      return;
    }

    const handler = (e: MessageEvent) => {
      // Clean up listener to avoid leaks, but keep worker alive
      worker.removeEventListener('message', handler);
      if (e.data.success) {
        resolve(e.data.result);
      } else {
        resolve({});
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'repair', payload: text });
  });
};

/**
 * Asynchronously parses JSON using a background worker.
 * Useful for large AI responses to avoid main thread blocking.
 */
export const parseJsonAsync = (text: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    if (!worker) {
      try {
        const clean = text.replace(/^```json\s*/, '').replace(/^```/, '');
        resolve(JSON.parse(clean));
      } catch(e) {
        reject(e);
      }
      return;
    }

    const handler = (e: MessageEvent) => {
      worker.removeEventListener('message', handler);
      if (e.data.success) {
        resolve(e.data.result);
      } else {
        reject(new Error(e.data.error));
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'parse', payload: text });
  });
};

/**
 * Legacy synchronous version
 */
export const repairPartialJsonSync = (text: string): any => {
    return {}; 
};
