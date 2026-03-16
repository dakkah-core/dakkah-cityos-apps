import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { AuthTokens } from "@workspace/auth";
import { extractUser, isTokenExpired, generatePKCE, generateState } from "@workspace/auth";

const REQUIRED_ROLE = "merchant_admin";

interface DashboardUser {
  id: string;
  name: string;
  roles: string[];
  email?: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: DashboardUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  signInWithKeycloak: () => void;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function tryRestoreSession(): DashboardUser | null {
  try {
    const saved = sessionStorage.getItem("cityos_merchant_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.roles?.includes(REQUIRED_ROLE)) return parsed;
    }
    const tokenJson = localStorage.getItem("cityos_tokens");
    if (tokenJson) {
      const tokens: AuthTokens = JSON.parse(tokenJson);
      if (!isTokenExpired(tokens, 0)) {
        const kUser = extractUser(tokens.accessToken);
        if (kUser.roles.includes(REQUIRED_ROLE)) {
          return { id: kUser.id, name: kUser.name, roles: kUser.roles, email: kUser.email, isGuest: false };
        }
      }
    }
  } catch {}
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(tryRestoreSession);

  const signInWithKeycloak = useCallback(async () => {
    const realm = import.meta.env.VITE_KC_REALM || "dakkah";
    const clientId = import.meta.env.VITE_KC_CLIENT_ID || "business-dashboard";
    const baseUrl = import.meta.env.VITE_KC_BASE_URL || "";
    if (!baseUrl) {
      console.warn("Keycloak not configured — use guest access or set VITE_KC_BASE_URL");
      return;
    }
    const { codeVerifier, codeChallenge } = await generatePKCE();
    const state = generateState();
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);
    sessionStorage.setItem("pkce_state", state);
    const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}callback`;
    window.location.href = `${baseUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser: DashboardUser = {
      id: "guest_merchant_" + Math.random().toString(36).substr(2, 9),
      name: "Demo Merchant",
      roles: [REQUIRED_ROLE, "guest"],
      email: "merchant@demo.dakkah.com",
      isGuest: true,
    };
    setUser(guestUser);
    sessionStorage.setItem("cityos_merchant_session", JSON.stringify(guestUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("cityos_merchant_session");
    localStorage.removeItem("cityos_tokens");
  }, []);

  const hasRole = useCallback((role: string) => user?.roles?.includes(role) ?? false, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && user.roles.includes(REQUIRED_ROLE),
      isLoading: false,
      hasRole,
      signInWithKeycloak,
      loginAsGuest,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
