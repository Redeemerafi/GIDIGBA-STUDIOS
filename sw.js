const CACHE_NAME = 'gidigba-creatives-v6';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/app.html',
  '/about.html',
  '/services.html',
  '/process.html',
  '/vision.html',
  '/work.html',
  '/brands.html',
  '/testimonials.html',
  '/site.css',
  '/site.js',
  '/reviews.js',
  '/style.css',
  '/script.js',
  '/manifest.webmanifest',
  '/icon-512.png',
  '/logo-mark.png',
  '/logo.png',
  '/brands/kwa-fori.png',
  '/brands/luxe-threads.png',
  '/brands/adom-beauty.png',
  '/brands/zenith-motors.png',
  '/brands/nkyinkyim.png',
  '/brands/baaba-coffee.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== 'portfolio-images').map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.hostname === 'i.ibb.co') {
    event.respondWith(
      caches.open('portfolio-images').then(cache => {
        return fetch(request).then(response => {
          cache.put(request, response.clone());
          return response;
        }).catch(() => cache.match(request));
      })
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
