import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthTokens } from "@workspace/auth";
import { extractUser, isTokenExpired, generatePKCE, generateState } from "@workspace/auth";

const REQUIRED_ROLE = "citizen";

interface DashboardUser {
  id: string;
  name: string;
  roles: string[];
  email?: string;
  isGuest: boolean;
}

interface AuthState {
  user: DashboardUser | null;
  isAuthenticated: boolean;
  loginAsGuest: () => void;
  signInWithKeycloak: () => void;
  hasRole: (role: string) => boolean;
  logout: () => void;
}

function tryRestoreKeycloak(): DashboardUser | null {
  try {
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

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: tryRestoreKeycloak(),
      isAuthenticated: !!tryRestoreKeycloak(),
      loginAsGuest: () => {
        if (!import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== "true") {
          console.warn("Guest login is only available in development or demo mode");
          return;
        }
        set({
          user: {
            id: "guest_" + Math.random().toString(36).substr(2, 9),
            name: "Citizen Guest",
            roles: [REQUIRED_ROLE, "guest"],
            isGuest: true,
          },
          isAuthenticated: true,
        });
      },
      signInWithKeycloak: async () => {
        const realm = import.meta.env.VITE_KC_REALM || "dakkah";
        const clientId = import.meta.env.VITE_KC_CLIENT_ID || "smart-city-portal";
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
      },
      hasRole: (role: string) => get().user?.roles?.includes(role) ?? false,
      logout: () => {
        localStorage.removeItem("cityos_tokens");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "smart-city-auth",
    }
  )
);
