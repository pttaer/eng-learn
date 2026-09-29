// ==========================================================================
// STARK ENGLISH SINGULARITY HUD — SERVICE WORKER
// 100% Offline Capability, Stale-While-Revalidate Caching, SPA Navigation
// ==========================================================================

const CACHE_NAME = 'stark-eng-hud-v1';

const STATIC_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: Cache critical application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static shell assets');
      return cache.addAll(STATIC_SHELL);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Purge obsolete cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Evicting deprecated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategic Stale-While-Revalidate & Offline Navigation
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) return;

  // 1. Navigation requests (SPA page loads) -> Network first with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match('/index.html') || caches.match('/');
          });
        })
    );
    return;
  }

  // 2. Static Assets, Scripts, Styles, Fonts & Curriculum Data -> Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and not in cache
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
