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
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function drainMutationQueue(): Promise<Array<{ endpoint: string; method: string; body: unknown }>> {
  const db = await openDB();
  const tx = db.transaction(STORES.mutationQueue, "readwrite");
  const store = tx.objectStore(STORES.mutationQueue);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const mutations = req.result;
      store.clear();
      resolve(mutations);
    };
    req.onerror = () => reject(req.error);
  });
}
