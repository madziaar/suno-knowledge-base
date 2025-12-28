
# THE SUBCONSCIOUS: PWA & WEB WORKERS

This document outlines the background processing architecture of Sonic Forge V5, which includes its Progressive Web App (PWA) capabilities and its use of Web Workers to maintain a responsive main thread.

---

## 1. PROGRESSIVE WEB APP (PWA)

The application is a fully-featured PWA, allowing it to be "installed" on a user's device for an app-like experience and offline access.

### `manifest.json`
-   Defines the application's name, icons, theme colors, and display mode (`standalone`).
-   Enables the "Add to Home Screen" prompt on supported browsers.

### `service-worker.js`
-   **Purpose**: To enable offline functionality and optimize asset loading through caching.
-   **Caching Strategy**: A "stale-while-revalidate" strategy is used for most assets.
    1.  When a resource is requested, the service worker first serves it from the cache if available (for instant loading).
    2.  Simultaneously, it sends a request to the network to fetch the latest version of the asset.
    3.  If a newer version is downloaded, it updates the cache for the *next* visit.
-   **Cache Buckets**: Caches are separated for better management:
    -   `STATIC_ASSETS`: The core app shell (`index.html`, etc.).
    -   `FONT_CACHE`: External Google Fonts, cached aggressively.
    -   `DYNAMIC_CACHE`: All other runtime assets.
-   **Update Flow**: The `usePWA` hook (`hooks/usePWA.ts`) detects when a new service worker is installed and waiting. It then displays a toast notification prompting the user to update, which triggers the new service worker to take over and reload the page.

---

## 2. WEB WORKERS

Web Workers are used to offload computationally expensive tasks from the main UI thread, preventing the interface from freezing during heavy processing. The application uses a singleton pattern for its workers to avoid re-instantiating them on every call.

### `workers/audio.worker.js`
-   **Task**: Base64 Encoding of Audio Files.
-   **Workflow**: When a user uploads an audio file in the "Sonic Mirror", the `ArrayBuffer` of the file is transferred to this worker. The worker then performs the Base64 conversion in the background.
-   **Benefit**: Converting a large (e.g., 10MB) audio file to a Base64 string on the main thread would cause a noticeable stutter. Offloading this ensures the UI remains smooth.

### `workers/lz.worker.js`
-   **Task**: Compressing and decompressing application state for shareable URLs.
-   **Library**: `lz-string`
-   **Workflow**:
    -   **Compression**: When a user clicks "Share," the entire prompt state (inputs, expert settings) is stringified and sent to this worker. The worker uses `LZString.compressToEncodedURIComponent` to create a compact, URL-safe string.
    -   **Decompression**: When a user loads a URL with a `?forge=` parameter, the compressed string is sent to this worker to be decompressed back into a JSON object.
-   **Benefit**: `lz-string` can be CPU-intensive, especially for large state objects. The worker prevents UI lag during the sharing/loading process.

### `lib/json-repair.ts` (Worker Logic)
-   **Task**: Asynchronously repair and parse streaming JSON from the Gemini API.
-   **Workflow**: As the AI model streams its JSON response in chunks, the incomplete string is sent to a worker. The worker contains logic to add missing brackets, quotes, and commas to make the partial string parsable.
-   **Benefit**: This allows for real-time preview of the AI's output as it's being generated, without blocking the main thread with constant JSON parsing attempts on invalid data.
