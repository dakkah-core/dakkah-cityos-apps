import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { Message, Thread, MessageAttachment } from "@/types/chat";
import { saveMessages, loadMessages } from "@/lib/offline-store";
import { apiClient } from "@/lib/api-client";

interface ChatContextValue {
  messages: Message[];
  threads: Thread[];
  isProcessing: boolean;
  sendMessage: (text: string, replyTo?: Message, attachments?: MessageAttachment[]) => Promise<void>;
  createNewChat: () => void;
  loadThread: (id: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const DEMO_RESPONSES: Record<string, { content: string; artifacts?: Message["artifacts"] }> = {
  default: {
    content: "I'm Dakkah, your city AI copilot. I can help you with transport, healthcare, commerce, governance, events, and more. Try asking me about city services, nearby restaurants, or your schedule!",
    artifacts: [
      {
        type: "selection-chips",
        data: {
          chips: [
            { label: "🚗 Book a ride", action: "Book a ride to downtown" },
            { label: "🏥 Find a clinic", action: "Find nearby clinics" },
            { label: "🍽️ Restaurants", action: "Show nearby restaurants" },
            { label: "📋 My permits", action: "Check my permit status" },
            { label: "🎫 Events today", action: "What events are happening today" },
            { label: "☀️ Weather", action: "What's the weather today" },
          ],
        },
      },
    ],
  },
  weather: {
    content: "Here's the current weather for Riyadh:",
    artifacts: [{ type: "weather-card", data: { city: "Riyadh", temp: 38, condition: "Sunny", high: 42, low: 29, humidity: 15, wind: "12 km/h NE", forecast: [{ day: "Tue", high: 41, low: 28, icon: "☀️" }, { day: "Wed", high: 39, low: 27, icon: "⛅" }, { day: "Thu", high: 40, low: 29, icon: "☀️" }] } }],
  },
  ride: {
    content: "I'll set up a ride for you. Here are the available options:",
    artifacts: [{ type: "ride-status", data: { status: "searching", pickup: "Current Location", destination: "Downtown Riyadh", eta: "4 min", drivers: [{ name: "Ahmed K.", rating: 4.9, vehicle: "Toyota Camry", plate: "ABC 1234" }] } }],
  },
  restaurant: {
    content: "Here are some popular restaurants near you:",
    artifacts: [{ type: "poi-carousel", data: { title: "Nearby Restaurants", items: [{ id: "1", name: "Al Najd Village", category: "Saudi Cuisine", rating: 4.7, distance: "0.8 km", image: "" }, { id: "2", name: "The Globe", category: "International", rating: 4.5, distance: "1.2 km", image: "" }, { id: "3", name: "Lusin", category: "Armenian", rating: 4.8, distance: "1.5 km", image: "" }] } }],
  },
  event: {
    content: "Here are today's events in the city:",
    artifacts: [{ type: "event-carousel", data: { title: "Today's Events", items: [{ id: "1", title: "Art Exhibition Opening", venue: "National Museum", time: "6:00 PM", category: "Culture" }, { id: "2", title: "Tech Meetup", venue: "KAUST Hub", time: "7:30 PM", category: "Technology" }, { id: "3", title: "Night Market", venue: "Boulevard", time: "8:00 PM", category: "Shopping" }] } }],
  },
  clinic: {
    content: "Here are nearby healthcare facilities:",
    artifacts: [{ type: "poi-carousel", data: { title: "Nearby Clinics", items: [{ id: "1", name: "King Faisal Specialist Hospital", category: "Hospital", rating: 4.8, distance: "2.1 km", image: "" }, { id: "2", name: "Saudi German Hospital", category: "Hospital", rating: 4.5, distance: "3.5 km", image: "" }, { id: "3", name: "Dr. Sulaiman Al Habib", category: "Medical Center", rating: 4.7, distance: "1.8 km", image: "" }] } }],
  },
  permit: {
    content: "Here's your permit status:",
    artifacts: [{ type: "status-tracker", data: { title: "Building Permit #BP-2026-4521", status: "In Review", steps: [{ label: "Submitted", completed: true }, { label: "Document Review", completed: true }, { label: "Site Inspection", completed: false, current: true }, { label: "Approved", completed: false }], eta: "3-5 business days" } }],
  },
};

function matchResponse(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("weather")) return DEMO_RESPONSES.weather;
  if (lower.includes("ride") || lower.includes("book") || lower.includes("taxi")) return DEMO_RESPONSES.ride;
  if (lower.includes("restaurant") || lower.includes("food") || lower.includes("eat")) return DEMO_RESPONSES.restaurant;
  if (lower.includes("event") || lower.includes("happening") || lower.includes("today")) return DEMO_RESPONSES.event;
  if (lower.includes("clinic") || lower.includes("hospital") || lower.includes("doctor") || lower.includes("health")) return DEMO_RESPONSES.clinic;
  if (lower.includes("permit") || lower.includes("license") || lower.includes("status")) return DEMO_RESPONSES.permit;
  return { content: `I understand you're asking about "${text}". In a production environment, I would connect to the relevant city service to help you with this. For now, try asking about weather, restaurants, rides, events, clinics, or permits!` };
}

async function fetchFromApi(
  text: string,
  history: Message[],
): Promise<{ content: string; artifacts?: Message["artifacts"] } | null> {
  try {
    const messages = history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: text });

    const json = await apiClient.post<{ success: boolean; data?: { content: string; sdui?: unknown } }>(
      "/ai/chat",
      { messages, threadId: "web-default" },
    );
    if (!json.success || !json.data) return null;

    const { content, sdui } = json.data;
    if (!content) return null;

    let resolvedArtifacts: Message["artifacts"] | undefined;
    if (sdui) {
      resolvedArtifacts = [{ type: "sdui-node", data: { node: sdui } }];
    }

    return { content, artifacts: resolvedArtifacts };
  } catch {
    return null;
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to Dakkah CityOS! I'm your AI copilot for the entire city. Ask me anything — from booking rides to checking permits, finding restaurants to monitoring IoT sensors. How can I help?",
      timestamp: Date.now(),
      artifacts: DEMO_RESPONSES.default.artifacts,
    },
  ]);
  const [threads, setThreads] = useState<Thread[]>([
    { id: "1", title: "Welcome", lastMessage: "Welcome to Dakkah CityOS!", timestamp: Date.now() },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const idCounter = useRef(1);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    loadMessages()
      .then((cached) => {
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setMessages(cached as Message[]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      saveMessages(messages).catch(() => {});
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string, replyTo?: Message, attachments?: MessageAttachment[]) => {
    const userMsg: Message = {
      id: `msg-${++idCounter.current}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
      replyTo: replyTo ? { id: replyTo.id, content: replyTo.content } : undefined,
      attachments,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    const apiResponse = await fetchFromApi(text, messagesRef.current);
    const response = apiResponse || matchResponse(text);

    if (!apiResponse) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }

    const assistantMsg: Message = {
      id: `msg-${++idCounter.current}`,
      role: "assistant",
      content: response.content,
      timestamp: Date.now(),
      artifacts: response.artifacts,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsProcessing(false);
  }, []);

  const createNewChat = useCallback(() => {
    const newThread: Thread = {
      id: `thread-${Date.now()}`,
      title: "New Conversation",
      lastMessage: "",
      timestamp: Date.now(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setMessages([{
      id: `msg-${++idCounter.current}`,
      role: "assistant",
      content: "New conversation started. How can I help you today?",
      timestamp: Date.now(),
      artifacts: DEMO_RESPONSES.default.artifacts,
    }]);
  }, []);

  const loadThread = useCallback((_id: string) => {
    setMessages([{
      id: `msg-${++idCounter.current}`,
      role: "assistant",
      content: "Loaded conversation thread. How can I continue helping you?",
      timestamp: Date.now(),
    }]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, threads, isProcessing, sendMessage, createNewChat, loadThread }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
