self.onmessage = (e) => {
  const { buffer, type } = e.data;

  try {
    // Efficiently convert ArrayBuffer to Base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    // Chunking to avoid stack overflow on large files
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    
    const base64 = btoa(binary);
    self.postMessage({ success: true, base64, type });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};