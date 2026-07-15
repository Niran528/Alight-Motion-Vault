// Minimal service worker — required for PWA installability.
// No caching, so the app always loads the latest version from the server.

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  // Clean up any old caches from previous versions, just in case.
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // Always fetch from network — no caching, no stale content, ever.
  event.respondWith(fetch(event.request));
});
