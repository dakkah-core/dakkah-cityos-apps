import { createDashboardAuth } from "@cityos/auth";

const dashboardAuth = createDashboardAuth({
  requiredRole: "developer",
  clientId: import.meta.env.VITE_KC_CLIENT_ID || "dev-portal",
  sessionKey: "cityos_dev_session",
  guestName: "Guest Developer",
  guestEmail: "dev@sandbox.dakkah.com",
  guestIdPrefix: "guest_dev",
  extraGuestFields: { environment: "sandbox" as const },
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
    signInProduction: auth.signInWithKeycloak,
  };
}
