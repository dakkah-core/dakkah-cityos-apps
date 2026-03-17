import { apiClient } from "./gateway";

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
    return await apiClient.post<AIChatResponse>("/ai/chat", {
      messages,
      model: options?.model,
      threadId: options?.threadId,
      context: options?.context,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
}

export async function aiExecute(
  intent: string,
  params?: Record<string, unknown>,
  options?: { threadId?: string; accessToken?: string },
): Promise<AIExecuteResponse> {
  try {
    return await apiClient.post<AIExecuteResponse>("/ai/execute", {
      intent,
      params,
      threadId: options?.threadId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { success: false, error: { code: "NETWORK_ERROR", message } };
  }
}

export async function fetchSduiScreen(screenId: string, surface?: string, tenant?: string, extraParams?: Record<string, string>): Promise<{ screen: Record<string, unknown>; source?: string } | null> {
  try {
    const params = new URLSearchParams();
    if (surface) params.set("surface", surface);
    if (tenant) params.set("tenant", tenant);
    if (extraParams) {
      for (const [key, value] of Object.entries(extraParams)) {
        params.set(key, value);
      }
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await apiClient.get<{ success: boolean; data?: { screen: Record<string, unknown>; source?: string } }>(`/sdui/${screenId}${query}`);
    return data.success ? data.data ?? null : null;
  } catch {
    return null;
  }
}

export async function transcribeAudio(audioBase64: string, format: string = "webm"): Promise<{ text: string } | null> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: { text: string } }>("/ai/transcribe", { audio: audioBase64, format });
    return data.success ? data.data ?? null : null;
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

export async function fetchThreads(_accessToken?: string): Promise<ThreadSummary[]> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { threads: ThreadSummary[] } }>("/threads");
    return data.success ? data.data?.threads ?? [] : [];
  } catch {
    return [];
  }
}

export async function fetchThread(threadId: string, _accessToken?: string): Promise<{ messages: unknown[] } | null> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: { messages: unknown[] } }>(`/threads/${threadId}`);
    return data.success ? data.data ?? null : null;
  } catch {
    return null;
  }
}

export async function syncThread(
  threadId: string,
  messages: unknown[],
  title?: string,
  _accessToken?: string,
): Promise<boolean> {
  try {
    const data = await apiClient.post<{ success: boolean }>("/threads", { threadId, messages, title });
    return data.success;
  } catch {
    return false;
  }
}

export async function deleteServerThread(threadId: string, _accessToken?: string): Promise<boolean> {
  try {
    const data = await apiClient.delete<{ success: boolean }>(`/threads/${threadId}`);
    return data.success;
  } catch {
    return false;
  }
}

export async function fetchProducts(params?: { category?: string; query?: string }): Promise<unknown> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.query) searchParams.set("query", params.query);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const data = await apiClient.get<{ success: boolean; data?: unknown }>(`/commerce/products${query}`);
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function addToCart(productId: string, userId?: string): Promise<unknown> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: unknown }>("/commerce/cart/add", { productId, userId, quantity: 1 });
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getCart(userId?: string): Promise<unknown> {
  try {
    const data = await apiClient.get<{ success: boolean; data?: unknown }>(`/commerce/cart?userId=${userId || "anonymous"}`);
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function validateAddress(address: { street: string; city: string; district?: string; postalCode?: string }): Promise<unknown> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: unknown }>("/commerce/checkout/validate-address", { address });
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getDeliveryOptions(userId?: string, address?: unknown): Promise<unknown> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: unknown }>("/commerce/checkout/delivery-options", { userId, address });
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function createPaymentSession(userId?: string, deliveryOptionId?: string, address?: unknown): Promise<unknown> {
  try {
    const data = await apiClient.post<{ success: boolean; data?: unknown }>("/commerce/checkout/create-payment", { userId, deliveryOptionId, address });
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
    const data = await apiClient.post<{ success: boolean; data?: unknown }>("/commerce/checkout", { userId, ...options });
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}
