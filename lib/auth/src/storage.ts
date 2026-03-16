import type { AuthTokens } from "./types";

const TOKENS_KEY = "cityos_auth_tokens";

export interface TokenStorage {
  save(tokens: AuthTokens): Promise<void>;
  load(): Promise<AuthTokens | null>;
  clear(): Promise<void>;
}

export const webStorage: TokenStorage = {
  async save(tokens) {
    try {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    } catch {}
  },
  async load() {
    try {
      const raw = localStorage.getItem(TOKENS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async clear() {
    try {
      localStorage.removeItem(TOKENS_KEY);
    } catch {}
  },
};

export function createNativeStorage(): TokenStorage {
  let SecureStore: any = null;

  async function getSecureStore() {
    if (!SecureStore) {
      try {
        SecureStore = await import("expo-secure-store");
      } catch {
        return null;
      }
    }
    return SecureStore;
  }

  return {
    async save(tokens) {
      const ss = await getSecureStore();
      if (ss) {
        await ss.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
      }
    },
    async load() {
      const ss = await getSecureStore();
      if (ss) {
        const raw = await ss.getItemAsync(TOKENS_KEY);
        return raw ? JSON.parse(raw) : null;
      }
      return null;
    },
    async clear() {
      const ss = await getSecureStore();
      if (ss) {
        await ss.deleteItemAsync(TOKENS_KEY);
      }
    },
  };
}
