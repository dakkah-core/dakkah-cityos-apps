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
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };
  error?: { code: string; message: string };
}

export async function aiChat(messages: AIChatMessage[]): Promise<AIChatResponse> {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: { code: "NETWORK_ERROR", message: err.message } };
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
