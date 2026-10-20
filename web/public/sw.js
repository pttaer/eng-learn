/**
 * STARK // English Singularity HUD - Service Worker
 * Architecture: 100% Offline Progressive Web App
 * Cache-First for App Shell | Stale-While-Revalidate for Assets & Fonts
 */

const CACHE_VERSION = 'v1.1.0';
const SHELL_CACHE = `stark-shell-${CACHE_VERSION}`;
const ASSETS_CACHE = `stark-assets-${CACHE_VERSION}`;
const MAX_ASSET_ENTRIES = 120;
const NAV_TIMEOUT_MS = 4000;

const SHELL_RESOURCES = [
  '/',
  '/index.html',
  '/ielts.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Keep only the newest `max` entries. Cache.keys() returns entries in insertion order.
async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) {
    await cache.delete(keys[i]);
  }
}

// Network-first with a timeout. On a slow network, answer from cache and keep the request running to refresh it.
async function navigationResponse(request, cache) {
  const cachedShell = () => cache.match(request)
    .then((hit) => hit || cache.match('/index.html'))
    .then((hit) => hit || cache.match('/'));
  const network = fetch(request).then((res) => {
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  });
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NAV_TIMEOUT_MS));
  try {
    const first = await Promise.race([network, timeout]);
    if (first) return first;
  } catch (err) {
    const fallback = await cachedShell();
    if (fallback) return fallback;
    throw err;
  }
  const fallback = await cachedShell();
  return fallback || network;
}

// 1. Installation: Pre-cache core architectural app shell.
// No skipWaiting here: a new version activates on the next full launch, so a page never reloads mid-session.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_RESOURCES);
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
      return trimCache(ASSETS_CACHE, MAX_ASSET_ENTRIES);
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

  // STRATEGY A: App Shell (Network-First, cache fallback offline)
  // Cache-first here pinned users to an old index.html (and its old hashed bundles) after every update.
  if (isNavigation || SHELL_RESOURCES.includes(url.pathname)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then((cache) => navigationResponse(event.request, cache))
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

// 5. Notification Click Listener: Focus window and route to #collocations or due review
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetRoute = (event.notification.data && event.notification.data.route) ? event.notification.data.route : '#collocations';
  const targetUrl = new URL(`/${targetRoute}`, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing client window and navigate
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // If no window is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Push Notification Listener: Support background push alerts
self.addEventListener('push', (event) => {
  let data = { title: 'English Singularity', body: 'Flashcards are due for review!', route: '#collocations' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'English Singularity', {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'srs-review-due',
      data: { route: data.route || '#collocations' }
    })
  );
});
