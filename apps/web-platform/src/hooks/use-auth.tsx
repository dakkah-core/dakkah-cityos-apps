import { createDashboardAuth } from "@cityos/auth";

const SESSION_KEY = "cityos_web_session";

const dashboardAuth = createDashboardAuth({
  requiredRole: "citizen",
  clientId: import.meta.env.VITE_KC_CLIENT_ID || "web-platform",
  sessionKey: SESSION_KEY,
  guestName: "Guest Citizen",
  guestEmail: "guest@dakkah.city",
  guestIdPrefix: "guest_citizen",
  keycloakRealm: import.meta.env.VITE_KC_REALM || "dakkah",
  keycloakBaseUrl: import.meta.env.VITE_KC_BASE_URL || "",
  basePath: import.meta.env.BASE_URL,
  isDev: import.meta.env.DEV,
  isDemoMode: import.meta.env.VITE_DEMO_MODE === "true",
});

export const AuthProvider = dashboardAuth.AuthProvider;
export const useAuth = dashboardAuth.useAuth;

export { SESSION_KEY };
