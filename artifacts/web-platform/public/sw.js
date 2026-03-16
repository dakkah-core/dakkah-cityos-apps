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
    event.respondWith(staleWhileRevalidate(event.request, SDUI_CACHE));
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

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    fetchPromise.catch(() => {});
    return cached;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;

  return new Response(JSON.stringify({ error: "offline", cached: false }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
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

self.addEventListener("sync", (event) => {
  if (event.tag === "mutation-sync") {
    event.waitUntil(drainMutationQueue());
  }
});

async function drainMutationQueue() {
  try {
    const db = await openIDB();
    const tx = db.transaction("mutation-queue", "readwrite");
    const store = tx.objectStore("mutation-queue");

    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = async () => {
        const mutations = req.result || [];
        const results = await Promise.allSettled(
          mutations.map((m) =>
            fetch(m.endpoint, {
              method: m.method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(m.body),
            })
          )
        );

        const succeeded = results.filter((r) => r.status === "fulfilled" && r.value.ok);
        if (succeeded.length === mutations.length) {
          store.clear();
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("Background sync failed:", e);
  }
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("dakkah-cityos", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("mutation-queue")) {
        db.createObjectStore("mutation-queue", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

self.addEventListener("push", (event) => {
  const defaults = {
    title: "Dakkah CityOS",
    body: "You have a new notification",
    icon: "/web-platform/icon-192.svg",
    badge: "/web-platform/favicon.svg",
    tag: "dakkah-notification",
    data: { url: "/web-platform/" },
  };

  let payload = defaults;
  if (event.data) {
    try {
      const data = event.data.json();
      payload = {
        title: data.title || defaults.title,
        body: data.body || defaults.body,
        icon: data.icon || defaults.icon,
        badge: defaults.badge,
        tag: data.tag || defaults.tag,
        data: { url: data.url || defaults.data.url, ...data },
      };
    } catch {
      payload.body = event.data.text() || defaults.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag,
      data: payload.data,
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "Open" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/web-platform/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/web-platform/") && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
