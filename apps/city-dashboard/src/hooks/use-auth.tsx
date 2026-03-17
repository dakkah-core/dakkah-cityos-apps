import { createDashboardAuth } from "@cityos/auth";

const { AuthProvider, useAuth } = createDashboardAuth({
  requiredRole: "city_admin",
  clientId: import.meta.env.VITE_KC_CLIENT_ID || "city-dashboard",
  sessionKey: "cityos_city_admin_session",
  guestName: "City Administrator (Demo)",
  guestEmail: "admin@city.gov",
  guestIdPrefix: "guest_admin",
  keycloakRealm: import.meta.env.VITE_KC_REALM || "dakkah",
  keycloakBaseUrl: import.meta.env.VITE_KC_BASE_URL || "",
  basePath: import.meta.env.BASE_URL,
  isDev: import.meta.env.DEV,
  isDemoMode: import.meta.env.VITE_DEMO_MODE === "true",
});

export { AuthProvider, useAuth };
