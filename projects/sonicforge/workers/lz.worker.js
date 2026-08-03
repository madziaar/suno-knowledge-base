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
      throw new Error(`Unknown operation: ${type}`);
    }
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};