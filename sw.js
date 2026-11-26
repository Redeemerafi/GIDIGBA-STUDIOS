/* GIDIGBA STUDIOS — service worker
   Network-first for documents and styles so a design change is visible on the
   very next reload. The cache is a fallback for offline, never the source of
   truth. Bump CACHE when the shell changes. */
const CACHE = 'gidigba-v6-grid';
const SHELL = [
  '/', '/photoshoots', '/services', '/work', '/about',
  '/samples-female', '/samples-male', '/samples-child', '/samples-couple', '/reviews', '/journal',
  '/brands', '/track', '/voucher', '/samples',
  '/for-restaurants', '/for-real-estate', '/for-events',
  'styles.css', 'js/chrome.js', 'js/app.js', 'js/galleries.js', 'js/swipe.js', 'js/legacy-shim.js',
  'manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // one missing file must not block the whole install
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  const isDoc = e.request.destination === 'document' || /\.html?$/.test(url.pathname);
  const isAsset = /\.(css|js|woff2?|webp|png|jpe?g|svg)$/.test(url.pathname);

  if (isDoc || isAsset) {
    // network first: always try for the current file, fall back to cache
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(hit => hit || caches.match('/404')))
    );
    return;
  }

  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
