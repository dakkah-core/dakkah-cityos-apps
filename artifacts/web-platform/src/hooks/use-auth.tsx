import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { generatePKCE, generateState, extractUser, isTokenExpired, buildAuthorizationUrl } from "@workspace/auth";
import type { User as AuthUser, AuthTokens } from "@workspace/auth";

interface User {
  id: string;
  name: string;
  roles: string[];
  email?: string;
  isGuest?: boolean;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  signInWithKeycloak: () => void;
  signInAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function authUserToUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    name: authUser.name,
    roles: authUser.roles,
    email: authUser.email,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem("cityos_web_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cityos_tokens");
      if (raw && !user) {
        const tokens: AuthTokens = JSON.parse(raw);
        if (!isTokenExpired(tokens)) {
          const authUser = extractUser(tokens.accessToken);
          const mapped = authUserToUser(authUser);
          setUser(mapped);
          sessionStorage.setItem("cityos_web_session", JSON.stringify(mapped));
        } else {
          localStorage.removeItem("cityos_tokens");
        }
      }
    } catch { /* ignore corrupt storage */ }
  }, [user]);

  const signInWithKeycloak = useCallback(async () => {
    const baseUrl = import.meta.env.VITE_KC_BASE_URL;
    if (!baseUrl) {
      console.error("Keycloak base URL (VITE_KC_BASE_URL) is not configured");
      return;
    }

    const { codeVerifier, codeChallenge } = await generatePKCE();
    const state = generateState();
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);
    sessionStorage.setItem("pkce_state", state);

    const realm = import.meta.env.VITE_KC_REALM || "dakkah";
    const clientId = import.meta.env.VITE_KC_CLIENT_ID || "web-platform";
    const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}callback`;

    const url = buildAuthorizationUrl({ baseUrl, realm, clientId, redirectUri, codeChallenge, state });
    window.location.href = url;
  }, []);

  const signInAsGuest = useCallback(() => {
    if (!import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== "true") {
      console.warn("Guest login is only available in development or demo mode");
      return;
    }
    const guestUser: User = {
      id: "guest_citizen_" + Math.random().toString(36).substr(2, 9),
      name: "Guest Citizen",
      roles: ["citizen", "guest"],
      email: "guest@dakkah.city",
      isGuest: true,
    };
    setUser(guestUser);
    sessionStorage.setItem("cityos_web_session", JSON.stringify(guestUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("cityos_web_session");
    localStorage.removeItem("cityos_tokens");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signInWithKeycloak, signInAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
