import { createDashboardAuth } from "@cityos/auth";

const dashboardAuth = createDashboardAuth({
  requiredRole: "citizen",
  clientId: import.meta.env.VITE_KC_CLIENT_ID || "smart-city-portal",
  sessionKey: "cityos_citizen_session",
  guestName: "Citizen Guest",
  guestIdPrefix: "guest",
  keycloakRealm: import.meta.env.VITE_KC_REALM || "dakkah",
  keycloakBaseUrl: import.meta.env.VITE_KC_BASE_URL || "",
  basePath: import.meta.env.BASE_URL,
  isDev: import.meta.env.DEV,
  isDemoMode: import.meta.env.VITE_DEMO_MODE === "true",
});

export const AuthProvider = dashboardAuth.AuthProvider;

export function useAuth() {
  const auth = dashboardAuth.useAuth();
  return {
    ...auth,
    loginAsGuest: auth.signInAsGuest,
  };
}
