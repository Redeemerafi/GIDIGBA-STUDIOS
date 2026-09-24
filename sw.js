const CACHE_NAME = 'gidigba-v4';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/photoshoots.html',
  '/work.html',
  '/brands.html',
  '/reviews.html',
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

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone).catch(() => {}));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
