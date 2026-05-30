// सुडोकु — Service Worker v2
// Scope: /dainik-darshan/ only
const CACHE = 'sudoku-v2';

const CACHE_FILES = [
  '/dainik-darshan/sudoku.html',
  '/dainik-darshan/js/sudoku.js',
  '/dainik-darshan/js/sweetAlert.min.js',
  '/dainik-darshan/css/animate.css',
  '/dainik-darshan/manifest.json',
  '/dainik-darshan/assets/sudokus.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        // delete ALL old caches including the old scope-/ worker's caches (named 'v1')
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/dainik-darshan/')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(resp => {
        if (resp && resp.status === 200) {
          caches.open(CACHE).then(c => c.put(event.request, resp.clone()));
        }
        return resp;
      });
    })
  );
});
