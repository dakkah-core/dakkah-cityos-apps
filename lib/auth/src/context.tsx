import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { KeycloakConfig, User, AuthTokens, AuthState } from "./types";
import type { TokenStorage } from "./storage";
import { webStorage } from "./storage";
import { generatePKCE, generateState } from "./pkce";
import {
  extractUser,
  isTokenExpired,
  buildAuthorizationUrl,
  buildLogoutUrl,
  exchangeCodeForTokens,
  refreshTokens as refreshTokensFn,
} from "./token";

interface AuthContextValue {
  state: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  handleCallback: (callbackUrl: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue>({
  state: { status: "loading" },
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  getToken: async () => null,
  handleCallback: async () => false,
});

interface AuthProviderProps {
  config: KeycloakConfig;
  storage?: TokenStorage;
  onLoginRedirect?: (url: string) => void;
  onLogoutRedirect?: (url: string) => void;
  children: React.ReactNode;
}

export function AuthProvider({
  config,
  storage = webStorage,
  onLoginRedirect,
  onLogoutRedirect,
  children,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const tokensRef = useRef<AuthTokens | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setAuthenticated = useCallback((tokens: AuthTokens) => {
    tokensRef.current = tokens;
    const user = extractUser(tokens.accessToken);
    setState({ status: "authenticated", user, tokens });
  }, []);

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
        setAuthenticated(newTokens);
        scheduleRefresh(newTokens);
      } catch {
        tokensRef.current = null;
        await storage.clear();
        setState({ status: "unauthenticated" });
      }
    }, refreshIn);
  }, [config, storage, setAuthenticated]);

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
            setAuthenticated(newTokens);
            scheduleRefresh(newTokens);
            return;
          } catch {
            await storage.clear();
          }
        } else {
          tokensRef.current = saved;
          setAuthenticated(saved);
          scheduleRefresh(saved);
          return;
        }
      }
      setState({ status: "unauthenticated" });
    })();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [config, storage, scheduleRefresh, setAuthenticated]);

  const login = useCallback(async () => {
    const { codeVerifier, codeChallenge } = await generatePKCE();
    const pkceState = generateState();

    await storage.savePkceVerifier(codeVerifier);
    await storage.savePkceState(pkceState);

    const authUrl = buildAuthorizationUrl({
      baseUrl: config.baseUrl,
      realm: config.realm,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      codeChallenge,
      state: pkceState,
      scopes: config.scopes,
    });

    if (onLoginRedirect) {
      onLoginRedirect(authUrl);
    } else {
      window.location.href = authUrl;
    }
  }, [config, storage, onLoginRedirect]);

  const handleCallback = useCallback(async (callbackUrl: string): Promise<boolean> => {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");

    if (!code) return false;

    const savedState = await storage.loadPkceState();
    if (!savedState || returnedState !== savedState) {
      throw new Error("PKCE state mismatch or missing — possible CSRF attack");
    }

    const codeVerifier = await storage.loadPkceVerifier();
    if (!codeVerifier) {
      throw new Error("PKCE code verifier not found — login flow may have expired");
    }

    const tokens = await exchangeCodeForTokens({
      baseUrl: config.baseUrl,
      realm: config.realm,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      code,
      codeVerifier,
    });

    await storage.save(tokens);
    await storage.clearPkce();
    setAuthenticated(tokens);
    scheduleRefresh(tokens);

    return true;
  }, [config, storage, setAuthenticated, scheduleRefresh]);

  const logout = useCallback(async () => {
    const currentTokens = tokensRef.current;
    tokensRef.current = null;
    await storage.clear();
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setState({ status: "unauthenticated" });

    const logoutUrl = buildLogoutUrl({
      baseUrl: config.baseUrl,
      realm: config.realm,
      idToken: currentTokens?.idToken,
      redirectUri: config.redirectUri,
    });

    if (onLogoutRedirect) {
      onLogoutRedirect(logoutUrl);
    } else {
      window.location.href = logoutUrl;
    }
  }, [config, storage, onLogoutRedirect]);

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
        setAuthenticated(newTokens);
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
  }, [config, storage, scheduleRefresh, setAuthenticated]);

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
      handleCallback,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
