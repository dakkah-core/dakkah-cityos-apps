const DB_NAME = "dakkah-cityos";
const DB_VERSION = 1;
const STORES = {
  messages: "messages",
  sduiCache: "sdui-cache",
  mutationQueue: "mutation-queue",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.messages)) {
        db.createObjectStore(STORES.messages, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.sduiCache)) {
        db.createObjectStore(STORES.sduiCache, { keyPath: "screenId" });
      }
      if (!db.objectStoreNames.contains(STORES.mutationQueue)) {
        db.createObjectStore(STORES.mutationQueue, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMessages(messages: unknown[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES.messages, "readwrite");
  const store = tx.objectStore(STORES.messages);
  store.clear();
  for (const msg of messages) {
    store.put(msg);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadMessages(): Promise<unknown[]> {
  const db = await openDB();
  const tx = db.transaction(STORES.messages, "readonly");
  const store = tx.objectStore(STORES.messages);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheSduiScreen(screenId: string, data: unknown): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES.sduiCache, "readwrite");
  tx.objectStore(STORES.sduiCache).put({ screenId, data, cachedAt: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedSduiScreen(screenId: string): Promise<unknown | null> {
  const db = await openDB();
  const tx = db.transaction(STORES.sduiCache, "readonly");
  return new Promise((resolve, reject) => {
    const req = tx.objectStore(STORES.sduiCache).get(screenId);
    req.onsuccess = () => resolve(req.result?.data ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function queueMutation(mutation: { endpoint: string; method: string; body: unknown }): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES.mutationQueue, "readwrite");
  tx.objectStore(STORES.mutationQueue).add({ ...mutation, queuedAt: Date.now() });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("mutation-sync");
    } catch {
      await drainMutationQueue();
    }
  } else {
    await drainMutationQueue();
  }
}

export async function drainMutationQueue(): Promise<Array<{ endpoint: string; method: string; body: unknown }>> {
  const db = await openDB();

  const mutations: Array<{ id: IDBValidKey; endpoint: string; method: string; body: unknown }> = await new Promise(
    (resolve, reject) => {
      const tx = db.transaction(STORES.mutationQueue, "readonly");
      const req = tx.objectStore(STORES.mutationQueue).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    },
  );

  if (mutations.length === 0) return [];

  const results = await Promise.allSettled(
    mutations.map((m) =>
      fetch(m.endpoint, {
        method: m.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m.body),
      }),
    ),
  );

  const successIds: IDBValidKey[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value.ok) {
      successIds.push(mutations[i].id);
    }
  });

  if (successIds.length > 0) {
    const clearTx = db.transaction(STORES.mutationQueue, "readwrite");
    const clearStore = clearTx.objectStore(STORES.mutationQueue);
    for (const id of successIds) {
      clearStore.delete(id);
    }
    await new Promise<void>((resolve, reject) => {
      clearTx.oncomplete = () => resolve();
      clearTx.onerror = () => reject(clearTx.error);
    });
  }

  return mutations;
}
