import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { WidgetMessage, HostScreenContext } from "../lib/types";

interface AssistantContextValue {
  messages: WidgetMessage[];
  isProcessing: boolean;
  hostContext: HostScreenContext;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  setHostContext: (ctx: HostScreenContext) => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

interface AssistantProviderProps {
  children: ReactNode;
  apiEndpoint: string;
  authToken?: string;
  hostContext?: HostScreenContext;
  greeting?: string;
  onAction?: (action: unknown) => void;
}

const DEFAULT_GREETING = "Hi! I'm the Dakkah AI Assistant. I can help you with city services, bookings, information, and more. How can I help?";

let idCounter = 0;
function genId() {
  return `widget-msg-${Date.now()}-${++idCounter}`;
}

export function AssistantProvider({
  children,
  apiEndpoint,
  authToken,
  hostContext: initialHostContext,
  greeting,
  onAction,
}: AssistantProviderProps) {
  const [messages, setMessages] = useState<WidgetMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: greeting || DEFAULT_GREETING,
      timestamp: Date.now(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hostContext, setHostContext] = useState<HostScreenContext>(initialHostContext || {});
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      const userMsg: WidgetMessage = {
        id: genId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);

      try {
        const history = messagesRef.current
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));
        history.push({ role: "user", content: text });

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        const res = await fetch(`${apiEndpoint}/ai/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: history,
            threadId: "widget-session",
            context: {
              surface: hostContext.surface || "widget",
              screenId: hostContext.screenId,
              pageUrl: hostContext.pageUrl || (typeof window !== "undefined" ? window.location.href : undefined),
            },
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.content) {
            const assistantMsg: WidgetMessage = {
              id: genId(),
              role: "assistant",
              content: json.data.content,
              timestamp: Date.now(),
              sduiNode: json.data.sdui || undefined,
            };
            setMessages((prev) => [...prev, assistantMsg]);

            if (json.data.intent && onActionRef.current) {
              onActionRef.current({
                type: "intent",
                intent: json.data.intent,
                data: json.data.bffData,
              });
            }
          } else {
            addFallbackResponse(text, setMessages);
          }
        } else {
          addFallbackResponse(text, setMessages);
        }
      } catch {
        addFallbackResponse(text, setMessages);
      } finally {
        setIsProcessing(false);
      }
    },
    [apiEndpoint, authToken, hostContext, isProcessing],
  );

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: greeting || DEFAULT_GREETING,
        timestamp: Date.now(),
      },
    ]);
  }, [greeting]);

  return (
    <AssistantContext.Provider
      value={{ messages, isProcessing, hostContext, sendMessage, clearHistory, setHostContext }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistantContext() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistantContext must be used within AssistantProvider");
  return ctx;
}

const DEMO_RESPONSES: Record<string, string> = {
  weather: "The weather in Riyadh is currently 38°C and sunny with clear skies. Expected high of 42°C today.",
  ride: "I can help you book a ride! Would you like me to find available drivers near your location?",
  restaurant: "I found several great restaurants nearby. Would you like Saudi cuisine, international, or something specific?",
  event: "There are several events happening today including an Art Exhibition at the National Museum and a Tech Meetup at KAUST Hub.",
  help: "I can help you with: city services, restaurant bookings, ride requests, event discovery, permit applications, health appointments, and much more. Just ask!",
};

function addFallbackResponse(
  text: string,
  setMessages: React.Dispatch<React.SetStateAction<WidgetMessage[]>>,
) {
  const lower = text.toLowerCase();
  let content = DEMO_RESPONSES.help;
  if (lower.includes("weather")) content = DEMO_RESPONSES.weather;
  else if (lower.includes("ride") || lower.includes("taxi")) content = DEMO_RESPONSES.ride;
  else if (lower.includes("restaurant") || lower.includes("food")) content = DEMO_RESPONSES.restaurant;
  else if (lower.includes("event")) content = DEMO_RESPONSES.event;
  else content = `I understand you're asking about "${text}". I'm connecting to city services to help you with this. In the meantime, try asking about weather, restaurants, rides, or events!`;

  setTimeout(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: genId(),
        role: "assistant",
        content,
        timestamp: Date.now(),
      },
    ]);
  }, 400);
}
