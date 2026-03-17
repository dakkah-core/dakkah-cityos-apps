import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { generateId } from "@/lib/id";
import {
  generatePKCE,
  generateState,
  buildAuthorizationUrl,
  buildLogoutUrl,
  exchangeCodeForTokens,
  refreshTokens as refreshTokensFn,
  decodeJwt,
  extractUser,
  isTokenExpired,
} from "@cityos/auth";
import type { AuthTokens } from "@cityos/auth";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { registerForPushNotifications, unregisterPushNotifications } from "@/lib/notifications";

const AUTH_KEY = "dakkah_auth_profile";
const TOKENS_KEY = "dakkah_auth_tokens";
const PKCE_VERIFIER_KEY = "dakkah_pkce_verifier";
const PKCE_STATE_KEY = "dakkah_pkce_state";

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

const KEYCLOAK_BASE_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL || "https://auth.dakkah.city";
const KEYCLOAK_REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM || "cityos";
const KEYCLOAK_CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID || "cityos-mobile";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  xp: number;
  xpToNext: number;
  walletBalance: number;
  currency: string;
  language: "en" | "ar";
  placesVisited: number;
  favorites: number;
  joinedDate: string;
  roles?: string[];
  tenantId?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  id: "user_default",
  displayName: "Explorer",
  email: "",
  avatar: undefined,
  tier: "Gold",
  xp: 4500,
  xpToNext: 5000,
  walletBalance: 1250.0,
  currency: "SAR",
  language: "en",
  placesVisited: 47,
  favorites: 12,
  joinedDate: "2025-06-15",
};

interface CopilotSettings {
  temperature: number;
  model: string;
  privacyMode: boolean;
  language: "en" | "ar";
}

const DEFAULT_COPILOT_SETTINGS: CopilotSettings = {
  temperature: 0.7,
  model: "gpt-5-mini",
  privacyMode: false,
  language: "en",
};

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  copilotSettings: CopilotSettings;
  signInAsGuest: (name: string, email: string) => Promise<void>;
  signInWithKeycloak: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  updateCopilotSettings: (updates: Partial<CopilotSettings>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  tokens: null,
  copilotSettings: DEFAULT_COPILOT_SETTINGS,
  signInAsGuest: async () => {},
  signInWithKeycloak: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  getAccessToken: async () => null,
  updateCopilotSettings: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [copilotSettings, setCopilotSettings] = useState<CopilotSettings>(DEFAULT_COPILOT_SETTINGS);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokensRef = useRef<AuthTokens | null>(null);

  const scheduleRefresh = useCallback((t: AuthTokens) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const refreshIn = Math.max((t.expiresAt - Date.now()) - 60000, 5000);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const redirectUri = Linking.createURL("auth/callback");
        const newTokens = await refreshTokensFn({
          baseUrl: KEYCLOAK_BASE_URL,
          realm: KEYCLOAK_REALM,
          clientId: KEYCLOAK_CLIENT_ID,
          refreshToken: t.refreshToken,
        });
        tokensRef.current = newTokens;
        setTokens(newTokens);
        await secureSet(TOKENS_KEY, JSON.stringify(newTokens));
        scheduleRefresh(newTokens);
      } catch {
        tokensRef.current = null;
        setTokens(null);
        await secureDelete(TOKENS_KEY);
        setUser(DEFAULT_PROFILE);
      }
    }, refreshIn);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const settingsData = await AsyncStorage.getItem("dakkah_copilot_settings");
        if (settingsData) setCopilotSettings(JSON.parse(settingsData));

        const tokensData = await secureGet(TOKENS_KEY);
        if (tokensData) {
          const savedTokens: AuthTokens = JSON.parse(tokensData);
          if (!isTokenExpired(savedTokens, 0)) {
            tokensRef.current = savedTokens;
            setTokens(savedTokens);
            const keycloakUser = extractUser(savedTokens.accessToken);
            const profileData = await AsyncStorage.getItem(AUTH_KEY);
            const profile = profileData ? JSON.parse(profileData) : DEFAULT_PROFILE;
            setUser({
              ...profile,
              id: keycloakUser.id,
              displayName: keycloakUser.name || profile.displayName,
              email: keycloakUser.email || profile.email,
              avatar: keycloakUser.avatar || profile.avatar,
              roles: keycloakUser.roles,
              tenantId: keycloakUser.tenantId,
            });
            scheduleRefresh(savedTokens);
          } else {
            try {
              const newTokens = await refreshTokensFn({
                baseUrl: KEYCLOAK_BASE_URL,
                realm: KEYCLOAK_REALM,
                clientId: KEYCLOAK_CLIENT_ID,
                refreshToken: savedTokens.refreshToken,
              });
              tokensRef.current = newTokens;
              setTokens(newTokens);
              await secureSet(TOKENS_KEY, JSON.stringify(newTokens));
              const keycloakUser = extractUser(newTokens.accessToken);
              const profileData = await AsyncStorage.getItem(AUTH_KEY);
              const profile = profileData ? JSON.parse(profileData) : DEFAULT_PROFILE;
              setUser({
                ...profile,
                id: keycloakUser.id,
                displayName: keycloakUser.name || profile.displayName,
                email: keycloakUser.email || profile.email,
                roles: keycloakUser.roles,
              });
              scheduleRefresh(newTokens);
            } catch {
              await secureDelete(TOKENS_KEY);
              const data = await AsyncStorage.getItem(AUTH_KEY);
              setUser(data ? JSON.parse(data) : DEFAULT_PROFILE);
            }
          }
        } else {
          const data = await AsyncStorage.getItem(AUTH_KEY);
          if (data) {
            setUser(JSON.parse(data));
          } else {
            setUser(DEFAULT_PROFILE);
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(DEFAULT_PROFILE));
          }
        }
      } catch {
        setUser(DEFAULT_PROFILE);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  const signInAsGuest = useCallback(async (name: string, email: string) => {
    const profile: UserProfile = {
      ...DEFAULT_PROFILE,
      id: generateId("user"),
      displayName: name,
      email,
    };
    setUser(profile);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(profile)).catch(() => {});
    registerForPushNotifications(profile.id, undefined, undefined).catch(() => {});
  }, []);

  const signInWithKeycloak = useCallback(async () => {
    try {
      const redirectUri = Linking.createURL("auth/callback");
      const { codeVerifier, codeChallenge } = await generatePKCE();
      const state = generateState();

      await secureSet(PKCE_VERIFIER_KEY, codeVerifier);
      await secureSet(PKCE_STATE_KEY, state);

      const authUrl = buildAuthorizationUrl({
        baseUrl: KEYCLOAK_BASE_URL,
        realm: KEYCLOAK_REALM,
        clientId: KEYCLOAK_CLIENT_ID,
        redirectUri,
        codeChallenge,
        state,
      });

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");

        const savedState = await secureGet(PKCE_STATE_KEY);
        if (!savedState || returnedState !== savedState) {
          throw new Error("PKCE state mismatch");
        }

        const savedVerifier = await secureGet(PKCE_VERIFIER_KEY);
        if (!savedVerifier || !code) {
          throw new Error("Missing PKCE verifier or authorization code");
        }

        const exchangedTokens = await exchangeCodeForTokens({
          baseUrl: KEYCLOAK_BASE_URL,
          realm: KEYCLOAK_REALM,
          clientId: KEYCLOAK_CLIENT_ID,
          redirectUri,
          code,
          codeVerifier: savedVerifier,
        });

        tokensRef.current = exchangedTokens;
        setTokens(exchangedTokens);
        await secureSet(TOKENS_KEY, JSON.stringify(exchangedTokens));
        await secureDelete(PKCE_VERIFIER_KEY);
        await secureDelete(PKCE_STATE_KEY);

        const keycloakUser = extractUser(exchangedTokens.accessToken);
        const profile: UserProfile = {
          ...DEFAULT_PROFILE,
          id: keycloakUser.id,
          displayName: keycloakUser.name || "City Explorer",
          email: keycloakUser.email,
          avatar: keycloakUser.avatar,
          roles: keycloakUser.roles,
          tenantId: keycloakUser.tenantId,
        };
        setUser(profile);
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(profile));
        scheduleRefresh(exchangedTokens);
        registerForPushNotifications(profile.id, undefined, exchangedTokens.accessToken).catch(() => {});
      }
    } catch (err) {
      console.error("Keycloak sign-in failed:", err);
    }
  }, [scheduleRefresh]);

  const signOut = useCallback(async () => {
    const currentTokens = tokensRef.current;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    tokensRef.current = null;
    setTokens(null);
    setUser(DEFAULT_PROFILE);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(DEFAULT_PROFILE));
    await secureDelete(TOKENS_KEY);
    if (currentTokens?.accessToken) {
      unregisterPushNotifications(currentTokens.accessToken).catch(() => {});
    }

    if (currentTokens?.idToken) {
      const redirectUri = Linking.createURL("/");
      const logoutUrl = buildLogoutUrl({
        baseUrl: KEYCLOAK_BASE_URL,
        realm: KEYCLOAK_REALM,
        idToken: currentTokens.idToken,
        redirectUri,
      });
      try {
        await WebBrowser.openBrowserAsync(logoutUrl);
      } catch {}
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const t = tokensRef.current;
    if (!t) return null;
    if (isTokenExpired(t)) {
      try {
        const newTokens = await refreshTokensFn({
          baseUrl: KEYCLOAK_BASE_URL,
          realm: KEYCLOAK_REALM,
          clientId: KEYCLOAK_CLIENT_ID,
          refreshToken: t.refreshToken,
        });
        tokensRef.current = newTokens;
        setTokens(newTokens);
        await secureSet(TOKENS_KEY, JSON.stringify(newTokens));
        scheduleRefresh(newTokens);
        return newTokens.accessToken;
      } catch {
        tokensRef.current = null;
        setTokens(null);
        await secureDelete(TOKENS_KEY);
        setUser(DEFAULT_PROFILE);
        return null;
      }
    }
    return t.accessToken;
  }, [scheduleRefresh]);

  const updateCopilotSettings = useCallback((updates: Partial<CopilotSettings>) => {
    setCopilotSettings((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem("dakkah_copilot_settings", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && user.id !== "user_default",
      isLoading,
      tokens,
      copilotSettings,
      signInAsGuest,
      signInWithKeycloak,
      signOut,
      updateProfile,
      getAccessToken,
      updateCopilotSettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
