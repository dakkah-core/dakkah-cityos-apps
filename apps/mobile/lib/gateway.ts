import { CityOSClient } from "@cityos/api-client";
import { Platform } from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

const TOKENS_KEY = "dakkah_auth_tokens";

async function getStoredToken(): Promise<string | null> {
  try {
    let tokenJson: string | null = null;
    if (Platform.OS === "web") {
      const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
      tokenJson = await AsyncStorage.getItem(TOKENS_KEY);
    } else {
      const SecureStore = await import("expo-secure-store");
      tokenJson = await SecureStore.getItemAsync(TOKENS_KEY);
    }
    if (tokenJson) {
      const tokens = JSON.parse(tokenJson);
      return tokens.accessToken || null;
    }
  } catch {}
  return null;
}

const client = new CityOSClient({
  baseUrl: API_BASE,
  getToken: getStoredToken,
  surface: "mobile",
});

export { client as apiClient };

interface GatewayResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { source: string; timestamp: string; requestId: string };
}

export async function callGateway<T = any>(
  service: string,
  method: string,
  params: Record<string, any> = {}
): Promise<GatewayResponse<T>> {
  try {
    return await client.post<GatewayResponse<T>>("/gateway", { service, method, params });
  } catch (err: any) {
    return { success: false, error: { code: "NETWORK_ERROR", message: err.message } };
  }
}

export async function getHealthDashboard() {
  try {
    return await client.get<any>("/health/dashboard");
  } catch (err: any) {
    return { overall: "unreachable", services: [], error: err.message };
  }
}
