const CACHE_NAME = 'gidigba-v11';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/photoshoots.html',
  '/work.html',
  '/brands.html',
  '/reviews.html',
  '/journal.html',
  '/track.html',
  '/voucher.html',
  '/for-restaurants.html',
  '/for-real-estate.html',
  '/for-events.html',
  '/styles.css',
  '/script.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Runtime cache for images (ours + portfolio hosts)
  if (request.destination === 'image' || url.hostname === 'i.ibb.co') {
    event.respondWith(
      caches.open('gidigba-images').then(cache =>
        fetch(request).then(response => {
          if (response && (response.status === 200 || response.type === 'opaque')) {
            cache.put(request, response.clone()).catch(() => {});
          }
          return response;
        }).catch(() => cache.match(request))
      )
    );
    return;
  }

  // Network-first for pages & assets (always fresh when online), cache fallback offline
  event.respondWith(
    fetch(request).then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone).catch(() => {}));
      }
      return response;
    }).catch(() => {
      return caches.match(request).then(cached => {
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return caches.match('/index.html').then(home => home || new Response(
            '<!DOCTYPE html><meta charset="utf-8"><title>Offline</title><body style="background:#f6f6f3;color:#111;font-family:sans-serif;padding:40px;text-align:center"><h1>You are offline</h1><p>This page is not cached yet. Reconnect to browse GIDIGBA STUDIOS.</p></body>',
            { headers: { 'Content-Type': 'text/html' } }
          ));
        }
        return Response.error();
      });
    })
  );
});
