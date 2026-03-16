const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatResponse {
  success: boolean;
  data?: {
    content: string;
    model: string;
    intent?: string | null;
    bffData?: unknown;
    sdui?: Record<string, unknown> | null;
    threadId?: string | null;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };
  error?: { code: string; message: string };
}

interface AIExecuteResponse {
  success: boolean;
  data?: {
    intent: string;
    service: string;
    action: string;
    bffData: unknown;
    sdui: Record<string, unknown>;
    threadId?: string | null;
  };
  error?: { code: string; message: string };
}

interface ChatOptions {
  model?: string;
  threadId?: string;
  context?: {
    location?: string;
    language?: string;
    tier?: string;
  };
  accessToken?: string;
}

export async function aiChat(messages: AIChatMessage[], options?: ChatOptions): Promise<AIChatResponse> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options?.accessToken) {
      headers["Authorization"] = `Bearer ${options.accessToken}`;
    }

    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages,
        model: options?.model,
        threadId: options?.threadId,
        context: options?.context,
      }),
    });
    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
}

export async function aiExecute(
  intent: string,
  params?: Record<string, unknown>,
  options?: { threadId?: string; accessToken?: string }
): Promise<AIExecuteResponse> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options?.accessToken) {
      headers["Authorization"] = `Bearer ${options.accessToken}`;
    }

    const res = await fetch(`${API_BASE}/ai/execute`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        intent,
        params,
        threadId: options?.threadId,
      }),
    });
    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
}

export async function fetchSduiScreen(screenId: string, surface?: string, tenant?: string, extraParams?: Record<string, string>): Promise<{ screen: Record<string, unknown>; source?: string } | null> {
  try {
    const url = new URL(`${API_BASE}/sdui/${screenId}`);
    if (surface) url.searchParams.set("surface", surface);
    if (tenant) url.searchParams.set("tenant", tenant);
    if (extraParams) {
      for (const [key, value] of Object.entries(extraParams)) {
        url.searchParams.set(key, value);
      }
    }
    const res = await fetch(url.toString());
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function transcribeAudio(audioBase64: string, format: string = "webm"): Promise<{ text: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/ai/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: audioBase64, format }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

interface ThreadSummary {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}

export async function fetchThreads(accessToken?: string): Promise<ThreadSummary[]> {
  try {
    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(`${API_BASE}/threads`, { headers });
    const data = await res.json();
    return data.success ? data.data.threads : [];
  } catch {
    return [];
  }
}

export async function fetchThread(threadId: string, accessToken?: string): Promise<{ messages: unknown[] } | null> {
  try {
    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(`${API_BASE}/threads/${threadId}`, { headers });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function syncThread(
  threadId: string,
  messages: unknown[],
  title?: string,
  accessToken?: string
): Promise<boolean> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(`${API_BASE}/threads`, {
      method: "POST",
      headers,
      body: JSON.stringify({ threadId, messages, title }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function deleteServerThread(threadId: string, accessToken?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const res = await fetch(`${API_BASE}/threads/${threadId}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function fetchProducts(params?: { category?: string; query?: string }): Promise<unknown> {
  try {
    const url = new URL(`${API_BASE}/commerce/products`);
    if (params?.category) url.searchParams.set("category", params.category);
    if (params?.query) url.searchParams.set("query", params.query);
    const res = await fetch(url.toString());
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function addToCart(productId: string, userId?: string): Promise<unknown> {
  try {
    const res = await fetch(`${API_BASE}/commerce/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, userId, quantity: 1 }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getCart(userId?: string): Promise<unknown> {
  try {
    const res = await fetch(`${API_BASE}/commerce/cart?userId=${userId || "anonymous"}`);
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function validateAddress(address: { street: string; city: string; district?: string; postalCode?: string }): Promise<unknown> {
  try {
    const res = await fetch(`${API_BASE}/commerce/checkout/validate-address`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getDeliveryOptions(userId?: string, address?: unknown): Promise<unknown> {
  try {
    const res = await fetch(`${API_BASE}/commerce/checkout/delivery-options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, address }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function createPaymentSession(userId?: string, deliveryOptionId?: string, address?: unknown): Promise<unknown> {
  try {
    const res = await fetch(`${API_BASE}/commerce/checkout/create-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, deliveryOptionId, address }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function checkout(
  userId?: string,
  options?: { paymentMethodId?: string; paymentSessionId?: string; address?: unknown; deliveryOptionId?: string }
): Promise<unknown> {
  try {
    const res = await fetch(`${API_BASE}/commerce/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...options }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}
