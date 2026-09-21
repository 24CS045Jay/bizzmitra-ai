const CACHE_NAME = "bizzmitra-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// Install: pre-cache critical app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first with cache fallback for navigation and static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass service worker for API calls, Supabase endpoints, and auth
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co") ||
    request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful responses for local static files
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.startsWith("/assets/") || STATIC_ASSETS.includes(url.pathname))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
      })
  );
});
