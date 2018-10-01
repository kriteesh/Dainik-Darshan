self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('airhorner').then(function(cache) {
     return cache.addAll([
       '/',
       '/sudoku.html',
       '/js/sudoku.js',
	   '/js/sweetAlert.min.js',
	   '/css/animate.css',
	   '/js/manifest.json',
	   '/js/noSleep.js'
     ]);
   })
 );
});

self.addEventListener('fetch', function(event) {
 console.log(event.request.url);

 event.respondWith(
   caches.match(event.request).then(function(response) {
     return response || fetch(event.request);
   })
 );
});