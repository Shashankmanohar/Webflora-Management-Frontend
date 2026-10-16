const CACHE_NAME = 'webflora-cache-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/webflora-logo.webp',
  '/webfloralogo.png',
  '/minilogo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Force fetching fresh assets by bypassing the HTTP cache
      const cachePromises = urlsToCache.map((url) => {
        return fetch(new Request(url, { cache: 'reload' }))
          .then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
          })
          .catch((err) => {
            console.warn('Failed to cache asset during SW install:', url, err);
          });
      });
      return Promise.all(cachePromises);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests, skip API calls, and skip non-http(s) schemes (e.g. chrome-extension://)
  const reqUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || event.request.url.includes('/api/') || !reqUrl.protocol.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // 1. HTML / Document requests -> Network First, Fallback to Cache
  const isHtmlRequest = 
    event.request.mode === 'navigate' || 
    event.request.headers.get('accept')?.includes('text/html') ||
    url.pathname === '/' ||
    url.pathname === '/index.html';

  if (isHtmlRequest) {
    const fetchRequest = event.request.mode === 'navigate' 
      ? new Request(event.request.url, { cache: 'no-cache' }) 
      : event.request;

    event.respondWith(
      fetch(fetchRequest)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cached) {
            return cached;
          }
          return new Response(
            '<!DOCTYPE html><html><body><h1>Offline</h1><p>Application is temporarily unavailable offline.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' }, status: 503 }
          );
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts, JSON, manifest) -> Cache First, Network fallback
  const isStaticAsset = 
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.json');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, responseClone);
          }
          return networkResponse;
        } catch (err) {
          // Return a safe 404 Response object so respondWith never receives undefined or an unhandled rejection
          return new Response('Asset not found or network unavailable', {
            status: 404,
            statusText: 'Not Found'
          });
        }
      })
    );
    return;
  }

  // 3. Default: Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(async (networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, responseClone);
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        const htmlFallback = (await caches.match('/index.html')) || (await caches.match('/'));
        if (htmlFallback) return htmlFallback;
        return new Response('Resource unavailable offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});
