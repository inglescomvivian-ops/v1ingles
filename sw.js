// Service worker for "Mentoria V1 - Tempos Verbais" — cache-first for offline use.
// Bump CACHE_NAME whenever index.html (or the question bank inside it) changes,
// so returning users pick up the new version instead of a stale cached copy.
var CACHE_NAME = "mentoria-v1-tempos-verbais-v2";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var network = fetch(event.request)
        .then(function (response) {
          if (response && response.status === 200) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          }
          return response;
        })
        .catch(function () { return cached; });
      return cached || network;
    })
  );
});
