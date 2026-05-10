// सुडोकु — Service Worker
// Scope is /dainik-darshan/ — does NOT interfere with other PWAs on the same origin.
const CACHE_VERSION = 'sudoku-v2'; // bump on every deploy

const CACHE_FILES = [
  '/dainik-darshan/sudoku.html',
  '/dainik-darshan/js/sudoku.js',
  '/dainik-darshan/js/sweetAlert.min.js',
  '/dainik-darshan/css/animate.css',
  '/dainik-darshan/manifest.json',
  '/dainik-darshan/assets/sudokus.png',
];

// INSTALL — pre-cache all app files, activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE — delete old caches, take control of all tabs
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// FETCH — cache-first for assets, network-first for the HTML page
self.addEventListener('fetch', event => {
  // Only handle GET requests within our scope
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-first for the main HTML so updates are always fetched
  if (url.pathname.endsWith('sudoku.html')) {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put(event.request, clone));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for all other assets (JS, CSS, images)
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(resp => {
          if (resp && resp.status === 200) {
            caches.open(CACHE_VERSION).then(c => c.put(event.request, resp.clone()));
          }
          return resp;
        });
      })
  );
});
