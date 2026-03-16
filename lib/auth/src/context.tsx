import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { KeycloakConfig, User, AuthTokens, AuthState } from "./types";
import type { TokenStorage } from "./storage";
import { webStorage } from "./storage";
import { extractUser, isTokenExpired, refreshTokens as refreshTokensFn } from "./token";

interface AuthContextValue {
  state: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  state: { status: "loading" },
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

interface AuthProviderProps {
  config: KeycloakConfig;
  storage?: TokenStorage;
  onLogin?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export function AuthProvider({ config, storage = webStorage, onLogin, onLogout, children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const tokensRef = useRef<AuthTokens | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback((tokens: AuthTokens) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const refreshIn = Math.max((tokens.expiresAt - Date.now()) - 60000, 5000);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const newTokens = await refreshTokensFn({
          baseUrl: config.baseUrl,
          realm: config.realm,
          clientId: config.clientId,
          refreshToken: tokens.refreshToken,
        });
        tokensRef.current = newTokens;
        await storage.save(newTokens);
        const user = extractUser(newTokens.accessToken);
        setState({ status: "authenticated", user, tokens: newTokens });
        scheduleRefresh(newTokens);
      } catch {
        tokensRef.current = null;
        await storage.clear();
        setState({ status: "unauthenticated" });
      }
    }, refreshIn);
  }, [config, storage]);

  useEffect(() => {
    (async () => {
      const saved = await storage.load();
      if (saved) {
        if (isTokenExpired(saved, 0)) {
          try {
            const newTokens = await refreshTokensFn({
              baseUrl: config.baseUrl,
              realm: config.realm,
              clientId: config.clientId,
              refreshToken: saved.refreshToken,
            });
            tokensRef.current = newTokens;
            await storage.save(newTokens);
            const user = extractUser(newTokens.accessToken);
            setState({ status: "authenticated", user, tokens: newTokens });
            scheduleRefresh(newTokens);
            return;
          } catch {
            await storage.clear();
          }
        } else {
          tokensRef.current = saved;
          const user = extractUser(saved.accessToken);
          setState({ status: "authenticated", user, tokens: saved });
          scheduleRefresh(saved);
          return;
        }
      }
      setState({ status: "unauthenticated" });
    })();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [config, storage, scheduleRefresh]);

  const login = useCallback(async () => {
    onLogin?.();
  }, [onLogin]);

  const logout = useCallback(async () => {
    tokensRef.current = null;
    await storage.clear();
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setState({ status: "unauthenticated" });
    onLogout?.();
  }, [storage, onLogout]);

  const getToken = useCallback(async (): Promise<string | null> => {
    const tokens = tokensRef.current;
    if (!tokens) return null;
    if (isTokenExpired(tokens)) {
      try {
        const newTokens = await refreshTokensFn({
          baseUrl: config.baseUrl,
          realm: config.realm,
          clientId: config.clientId,
          refreshToken: tokens.refreshToken,
        });
        tokensRef.current = newTokens;
        await storage.save(newTokens);
        const user = extractUser(newTokens.accessToken);
        setState({ status: "authenticated", user, tokens: newTokens });
        scheduleRefresh(newTokens);
        return newTokens.accessToken;
      } catch {
        tokensRef.current = null;
        await storage.clear();
        setState({ status: "unauthenticated" });
        return null;
      }
    }
    return tokens.accessToken;
  }, [config, storage, scheduleRefresh]);

  const user = state.status === "authenticated" ? state.user : null;

  return (
    <AuthContext.Provider value={{
      state,
      user,
      isAuthenticated: state.status === "authenticated",
      isLoading: state.status === "loading",
      login,
      logout,
      getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
