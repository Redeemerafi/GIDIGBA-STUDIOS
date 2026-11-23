const CACHE = 'gidigba-v2-1';
const ASSETS = [
  'index.html','photoshoots.html','services.html','work.html','about.html',
  'samples-female.html','samples-male.html','reviews.html','journal.html',
  'brands.html','track.html','voucher.html','404.html',
  'for-restaurants.html','for-real-estate.html','for-events.html',
  'css/styles.css','js/chrome.js','js/app.js','js/legacy-shim.js',
  'manifest.webmanifest'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('404.html')))
  );
});
