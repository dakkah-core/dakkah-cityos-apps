import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AuthTokens } from "./types";
import { extractUser, isTokenExpired } from "./token";
import { generatePKCE, generateState } from "./pkce";

export interface DashboardUser {
  id: string;
  name: string;
  roles: string[];
  email?: string;
  isGuest: boolean;
  [key: string]: unknown;
}

export interface DashboardAuthContextType {
  user: DashboardUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  signInWithKeycloak: () => void;
  signInAsGuest: () => void;
  logout: () => void;
}

export interface DashboardAuthConfig {
  requiredRole: string;
  clientId: string;
  sessionKey: string;
  guestName: string;
  guestEmail?: string;
  guestIdPrefix?: string;
  extraGuestFields?: Record<string, unknown>;
  keycloakRealm?: string;
  keycloakBaseUrl?: string;
  basePath?: string;
  isDev?: boolean;
  isDemoMode?: boolean;
}

function tryRestoreSession(config: DashboardAuthConfig): DashboardUser | null {
  try {
    const saved = sessionStorage.getItem(config.sessionKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.roles?.includes(config.requiredRole)) return parsed;
    }
    const tokenJson = localStorage.getItem("cityos_tokens");
    if (tokenJson) {
      const tokens: AuthTokens = JSON.parse(tokenJson);
      if (!isTokenExpired(tokens, 0)) {
        const kUser = extractUser(tokens.accessToken);
        if (kUser.roles.includes(config.requiredRole)) {
          return {
            id: kUser.id,
            name: kUser.name,
            roles: kUser.roles,
            email: kUser.email,
            isGuest: false,
          };
        }
      }
    }
  } catch {}
  return null;
}

export function createDashboardAuth(config: DashboardAuthConfig) {
  const AuthContext = createContext<DashboardAuthContextType | undefined>(undefined);

  function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<DashboardUser | null>(() => tryRestoreSession(config));

    const signInWithKeycloak = useCallback(async () => {
      const realm = config.keycloakRealm || "dakkah";
      const baseUrl = config.keycloakBaseUrl || "";
      if (!baseUrl) {
        console.warn("Keycloak not configured — use guest access or set VITE_KC_BASE_URL");
        return;
      }
      const { codeVerifier, codeChallenge } = await generatePKCE();
      const state = generateState();
      sessionStorage.setItem("pkce_code_verifier", codeVerifier);
      sessionStorage.setItem("pkce_state", state);
      const basePath = config.basePath || "/";
      const redirectUri = `${window.location.origin}${basePath}callback`;
      window.location.href = `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;
    }, []);

    const signInAsGuest = useCallback(() => {
      if (!config.isDev && !config.isDemoMode) {
        console.warn("Guest login is only available in development or demo mode");
        return;
      }
      const prefix = config.guestIdPrefix || "guest";
      const guestUser: DashboardUser = {
        id: `${prefix}_${Math.random().toString(36).substr(2, 9)}`,
        name: config.guestName,
        roles: [config.requiredRole, "guest"],
        email: config.guestEmail,
        isGuest: true,
        ...config.extraGuestFields,
      };
      setUser(guestUser);
      sessionStorage.setItem(config.sessionKey, JSON.stringify(guestUser));
    }, []);

    const logout = useCallback(() => {
      setUser(null);
      sessionStorage.removeItem(config.sessionKey);
      localStorage.removeItem("cityos_tokens");
    }, []);

    const hasRole = useCallback((role: string) => user?.roles?.includes(role) ?? false, [user]);

    return (
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user && user.roles.includes(config.requiredRole),
          isLoading: false,
          hasRole,
          signInWithKeycloak,
          signInAsGuest,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  function useAuth(): DashboardAuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return context;
  }

  return { AuthProvider, useAuth };
}
