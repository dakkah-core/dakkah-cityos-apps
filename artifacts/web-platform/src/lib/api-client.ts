import { CityOSClient } from "@cityos/api-client";

const API_BASE = `${window.location.origin}${import.meta.env.BASE_URL}api`.replace(/\/$/, "");

export const apiClient = new CityOSClient({
  baseUrl: API_BASE,
  getToken: async () => {
    try {
      const tokenJson = localStorage.getItem("cityos_tokens");
      if (tokenJson) {
        const tokens = JSON.parse(tokenJson);
        return tokens.accessToken || null;
      }
    } catch {}
    return null;
  },
  surface: "desktop",
});
