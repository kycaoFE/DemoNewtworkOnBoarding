const CACHE_NAME = 'kts9998';

var urlsToCache = RESOURCES;

var domain = location.href.replace('sw.js','');

urlsToCache = urlsToCache.map(it => {
  return it.replace('./build/web-mobile/', domain);
})

self.addEventListener('install', function(event){
    event.waitUntil(
        caches.open(CACHE_NAME)
          .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
          })
    );
})

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request.url).then((cachedResponse) => {
        if (cachedResponse) {
          console.log("sw found from cache: ", event.request.url);
          return cachedResponse;
        }
        console.log("sw fetching from server: ", event.request.url);
        return fetch(event.request).then((fetchedResponse) => {

          if (event.request.method == 'GET') {
            cache.put(event.request, fetchedResponse.clone());
          }
          return fetchedResponse;
        });
      });
    }));
});

self.addEventListener('activate', function(event) {
    var cacheWhitelist = [];
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});  