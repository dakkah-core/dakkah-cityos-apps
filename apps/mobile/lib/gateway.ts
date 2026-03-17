const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

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
    const res = await fetch(`${API_BASE}/gateway`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, method, params }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: { code: "NETWORK_ERROR", message: err.message } };
  }
}

export async function getHealthDashboard() {
  try {
    const res = await fetch(`${API_BASE}/health/dashboard`);
    return await res.json();
  } catch (err: any) {
    return { overall: "unreachable", services: [], error: err.message };
  }
}
