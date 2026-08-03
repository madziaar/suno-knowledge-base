
const CACHE_NAME = 'pyrite-forge-v5-obsidian';
const DYNAMIC_CACHE = 'pyrite-dynamic-v1';
const FONT_CACHE = 'pyrite-fonts-v1';

// Assets that must be cached immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // External Critical Assets
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap',
  'https://grainy-gradients.vercel.app/noise.svg'
];

// Install Event: Cache Core Shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll with error handling for external resources which might fail opaque checks if strict
      return Promise.all(
        STATIC_ASSETS.map(url => {
          return cache.add(url).catch(err => console.warn(`Failed to cache ${url} during install:`, err));
        })
      );
    })
  );
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE && key !== FONT_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event: Stale-While-Revalidate Strategy & Font Caching
self.addEventListener('fetch', (event) => {
  let url;
  try {
    url = new URL(event.request.url);
  } catch (e) {
    // Fail silently for non-standard URLs (data:, blob:, chrome-extension:)
    return;
  }

  // Skip non-GET requests and API calls to Gemini
  if (event.request.method !== 'GET' || (url.hostname.includes('googleapis') && !url.hostname.includes('fonts'))) {
    return;
  }

  // Strategy 1: Cache First for Fonts (Google Fonts) & External Textures
  if (
      url.hostname.includes('fonts.googleapis.com') || 
      url.hostname.includes('fonts.gstatic.com') ||
      url.pathname.endsWith('noise.svg')
  ) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not in cache, fetch and cache
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
             cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (e) {
          // If offline and no cache, font fails (acceptable fallback to system font)
          return new Response('', { status: 404 }); 
        }
      })
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for App Shell & Dynamic Assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Check if valid response
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }

          // Clone and cache
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Fallback logic if network fails could go here
        });

      // Return cached response immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

// Handle "skipWaiting" message from client to force update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
