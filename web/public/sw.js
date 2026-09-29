/**
 * STARK // English Singularity HUD - Service Worker
 * Architecture: 100% Offline Progressive Web App
 * Cache-First for App Shell | Stale-While-Revalidate for Assets & Fonts
 */

const CACHE_VERSION = 'v1.0.0';
const SHELL_CACHE = `stark-shell-${CACHE_VERSION}`;
const ASSETS_CACHE = `stark-assets-${CACHE_VERSION}`;

const SHELL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. Installation: Pre-cache core architectural app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_RESOURCES);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. Activation: Clean stale caches and take immediate control of clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== SHELL_CACHE && name !== ASSETS_CACHE)
          .map((staleName) => {
            console.log(`[PWA SW] Purging obsolete cache: ${staleName}`);
            return caches.delete(staleName);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Fetch Strategy: Cache-First for Shell, Stale-While-Revalidate for Assets & Fonts
self.addEventListener('fetch', (event) => {
  // Only process HTTP/HTTPS GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore non-http/https requests (e.g. chrome-extension:)
  if (!url.protocol.startsWith('http')) return;

  const isNavigation = event.request.mode === 'navigate';
  const isFont = url.hostname.includes('fonts.googleapis.com') ||
                 url.hostname.includes('fonts.gstatic.com') ||
                 url.pathname.match(/\.(woff2?|ttf|otf|eot)$/i);
  const isStaticAsset = url.pathname.includes('/assets/') ||
                        url.pathname.match(/\.(js|css|json|png|jpg|jpeg|svg|webp|ico|wav|mp3)$/i);

  // STRATEGY A: Offline App Shell (Cache-First)
  // Navigation requests and explicit shell paths
  if (isNavigation || SHELL_RESOURCES.includes(url.pathname)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) {
          // Revalidate shell in background
          fetch(event.request).then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(event.request, networkRes.clone());
            }
          }).catch(() => {/* Offline */});
          return cached;
        }

        try {
          const networkRes = await fetch(event.request);
          if (networkRes && networkRes.status === 200) {
            cache.put(event.request, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          // Offline fallback for navigation requests
          const fallback = await cache.match('/index.html') || await cache.match('/');
          if (fallback) return fallback;
          throw err;
        }
      })
    );
    return;
  }

  // STRATEGY B: Assets & Typography (Stale-While-Revalidate)
  if (isFont || isStaticAsset) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);

        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Opaque responses (type: 'opaque') are accepted for cross-origin fonts (Google Fonts)
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          return null;
        });

        // Serve cached version immediately if available; otherwise wait for network
        return cachedResponse || (await fetchPromise);
      })
    );
    return;
  }

  // Default fallback for any remaining requests: Network-First with cache fallback
  event.respondWith(
    fetch(event.request).catch(async () => {
      return caches.match(event.request);
    })
  );
});

// 4. Message Listener: Support manual SKIP_WAITING prompts
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
