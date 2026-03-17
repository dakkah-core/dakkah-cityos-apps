import type { AuthTokens } from "./types";

const TOKENS_KEY = "cityos_auth_tokens";
const PKCE_VERIFIER_KEY = "cityos_pkce_verifier";
const PKCE_STATE_KEY = "cityos_pkce_state";

export interface TokenStorage {
  save(tokens: AuthTokens): Promise<void>;
  load(): Promise<AuthTokens | null>;
  clear(): Promise<void>;
  savePkceVerifier(verifier: string): Promise<void>;
  loadPkceVerifier(): Promise<string | null>;
  clearPkce(): Promise<void>;
  savePkceState(state: string): Promise<void>;
  loadPkceState(): Promise<string | null>;
}

export const webStorage: TokenStorage = {
  async save(tokens) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  },
  async load() {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  async clear() {
    localStorage.removeItem(TOKENS_KEY);
  },
  async savePkceVerifier(verifier) {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  },
  async loadPkceVerifier() {
    return sessionStorage.getItem(PKCE_VERIFIER_KEY);
  },
  async clearPkce() {
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);
  },
  async savePkceState(state) {
    sessionStorage.setItem(PKCE_STATE_KEY, state);
  },
  async loadPkceState() {
    return sessionStorage.getItem(PKCE_STATE_KEY);
  },
};

export interface NativeSecureStoreModule {
  setItemAsync(key: string, value: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<void>;
}

export function createNativeStorage(secureStore: NativeSecureStoreModule): TokenStorage {
  return {
    async save(tokens) {
      await secureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
    },
    async load() {
      const raw = await secureStore.getItemAsync(TOKENS_KEY);
      return raw ? JSON.parse(raw) : null;
    },
    async clear() {
      await secureStore.deleteItemAsync(TOKENS_KEY);
    },
    async savePkceVerifier(verifier) {
      await secureStore.setItemAsync(PKCE_VERIFIER_KEY, verifier);
    },
    async loadPkceVerifier() {
      return secureStore.getItemAsync(PKCE_VERIFIER_KEY);
    },
    async clearPkce() {
      await secureStore.deleteItemAsync(PKCE_VERIFIER_KEY);
      await secureStore.deleteItemAsync(PKCE_STATE_KEY);
    },
    async savePkceState(state) {
      await secureStore.setItemAsync(PKCE_STATE_KEY, state);
    },
    async loadPkceState() {
      return secureStore.getItemAsync(PKCE_STATE_KEY);
    },
  };
}
