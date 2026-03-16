const CACHE_NAME = "dakkah-cityos-v1";
const STATIC_CACHE = "dakkah-static-v1";
const SDUI_CACHE = "dakkah-sdui-v1";

const STATIC_ASSETS = [
  "/web-platform/",
  "/web-platform/manifest.json",
  "/web-platform/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE && key !== SDUI_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.includes("/api/sdui/")) {
    event.respondWith(networkFirstWithCache(event.request, SDUI_CACHE));
    return;
  }

  if (url.pathname.includes("/api/")) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  if (
    event.request.destination === "style" ||
    event.request.destination === "script" ||
    event.request.destination === "image" ||
    event.request.destination === "font"
  ) {
    event.respondWith(cacheFirstWithNetwork(event.request, STATIC_CACHE));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirstWithCache(event.request, CACHE_NAME));
    return;
  }
});

async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const fallback = await caches.match("/web-platform/");
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503 });
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
