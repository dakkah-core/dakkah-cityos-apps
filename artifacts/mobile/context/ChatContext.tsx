import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Message, ChatThread } from "@/types/chat";
import { generateId } from "@/lib/id";
import { processUserMessage } from "@/lib/copilot-brain";

const THREADS_KEY = "dakkah_threads";
const MESSAGES_KEY = "dakkah_copilot_msgs";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your Dakkah Copilot \u2014 your AI concierge for the entire city. I can help you discover experiences, plan trips, join events, manage bookings, and access every capability through conversation.\n\nWhat would you like to do?",
  timestamp: Date.now(),
  mode: "suggest",
  artifacts: [
    {
      type: "selection-chips",
      data: {
        question: "Popular requests:",
        options: ["Show me quiet places", "Plan a 3-day trip", "What's happening tonight?", "How do I earn XP?"],
      },
    },
  ],
};

interface CopilotContextValue {
  messages: Message[];
  threads: ChatThread[];
  isProcessing: boolean;
  currentThreadId: string | null;
  sendMessage: (text: string) => Promise<void>;
  createNewChat: () => void;
  loadThread: (id: string) => void;
  refreshThreads: () => void;
}

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const initRef = useRef(false);
  const requestTokenRef = useRef(0);
  const threadIdRef = useRef<string | null>(null);

  useEffect(() => {
    threadIdRef.current = currentThreadId;
  }, [currentThreadId]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    loadThreadsList();
  }, []);

  const loadThreadsList = async () => {
    try {
      const data = await AsyncStorage.getItem(THREADS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) setThreads(parsed);
      }
    } catch {
    }
  };

  const saveThread = async (threadId: string, msgs: Message[]) => {
    try {
      await AsyncStorage.setItem(`${MESSAGES_KEY}_${threadId}`, JSON.stringify(msgs));

      const userMsg = msgs.find((m) => m.role === "user");
      const title = userMsg?.content.slice(0, 40) || "New Conversation";
      const lastMsg = msgs[msgs.length - 1];

      setThreads((prev) => {
        const existing = prev.find((t) => t.id === threadId);
        let updated: ChatThread[];
        if (existing) {
          updated = prev.map((t) => (t.id === threadId ? { ...t, lastMessage: lastMsg.content.slice(0, 60), timestamp: lastMsg.timestamp } : t));
        } else {
          updated = [{ id: threadId, title, lastMessage: lastMsg.content.slice(0, 60), timestamp: lastMsg.timestamp }, ...prev];
        }
        AsyncStorage.setItem(THREADS_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    } catch {
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const token = ++requestTokenRef.current;
    const threadId = currentThreadId || generateId("thread");
    if (!currentThreadId) setCurrentThreadId(threadId);

    const userMsg: Message = {
      id: generateId("msg"),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

      if (requestTokenRef.current !== token) return;

      const response = processUserMessage(text);
      const assistantMsg: Message = {
        id: generateId("msg"),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        artifacts: response.artifacts,
        mode: response.mode,
      };

      if (requestTokenRef.current !== token) return;

      setMessages((prev) => {
        const finalMsgs = [...prev, assistantMsg];
        if (threadIdRef.current === threadId || threadIdRef.current === null) {
          saveThread(threadId, finalMsgs);
        }
        return finalMsgs;
      });
    } finally {
      if (requestTokenRef.current === token) {
        setIsProcessing(false);
      }
    }
  }, [isProcessing, currentThreadId]);

  const createNewChat = useCallback(() => {
    requestTokenRef.current++;
    setMessages([WELCOME_MESSAGE]);
    setCurrentThreadId(null);
    setIsProcessing(false);
  }, []);

  const refreshThreads = useCallback(() => {
    loadThreadsList();
  }, []);

  const loadThread = useCallback(async (id: string) => {
    try {
      requestTokenRef.current++;
      setIsProcessing(false);
      const data = await AsyncStorage.getItem(`${MESSAGES_KEY}_${id}`);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.every((m: any) => m && typeof m.id === "string" && typeof m.role === "string" && typeof m.content === "string")) {
          setMessages(parsed);
          setCurrentThreadId(id);
        } else {
          setMessages([WELCOME_MESSAGE]);
          setCurrentThreadId(null);
        }
      }
    } catch {
      setMessages([WELCOME_MESSAGE]);
      setCurrentThreadId(null);
    }
  }, []);

  return (
    <CopilotContext.Provider value={{ messages, threads, isProcessing, currentThreadId, sendMessage, createNewChat, loadThread, refreshThreads }}>
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within ChatProvider");
  return ctx;
}
