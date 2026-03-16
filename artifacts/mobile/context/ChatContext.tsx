import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Message, ChatThread, MessageReaction, MessageAttachment } from "@/types/chat";
import { generateId } from "@/lib/id";
import { processUserMessage } from "@/lib/copilot-brain";
import { aiChat } from "@/lib/ai-client";

const THREADS_KEY = "dakkah_threads";
const MESSAGES_KEY = "dakkah_copilot_msgs";
const MUTE_KEY = "dakkah_muted";

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
  isMuted: boolean;
  useAI: boolean;
  setUseAI: (v: boolean) => void;
  sendMessage: (text: string, replyTo?: Message, attachments?: MessageAttachment[]) => Promise<void>;
  createNewChat: () => void;
  loadThread: (id: string) => void;
  refreshThreads: () => void;
  pinMessage: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  toggleMute: () => void;
  deleteThread: (threadId: string) => void;
}

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [useAI, setUseAI] = useState(false);
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
    AsyncStorage.getItem(MUTE_KEY).then((v) => { if (v === "true") setIsMuted(true); }).catch(() => {});
  }, []);

  const loadThreadsList = async () => {
    try {
      const data = await AsyncStorage.getItem(THREADS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) setThreads(parsed);
      }
    } catch {}
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
    } catch {}
  };

  const sendMessage = useCallback(async (text: string, replyTo?: Message, attachments?: MessageAttachment[]) => {
    if (!text.trim() || isProcessing) return;

    const token = ++requestTokenRef.current;
    const threadId = currentThreadId || generateId("thread");
    if (!currentThreadId) setCurrentThreadId(threadId);

    const userMsg: Message = {
      id: generateId("msg"),
      role: "user",
      content: text,
      timestamp: Date.now(),
      ...(replyTo ? { replyToId: replyTo.id, replyToContent: replyTo.content.slice(0, 80) } : {}),
      ...(attachments?.length ? { attachments } : {}),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const localResponse = processUserMessage(text);
      const hasScenarioMatch = localResponse.content !== "I'm not sure how to help with that yet, but I'm always learning! Try asking about places, events, services, transit, shopping, health, work, or city life.";

      if (hasScenarioMatch || !useAI) {
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
        if (requestTokenRef.current !== token) return;

        const assistantMsg: Message = {
          id: generateId("msg"),
          role: "assistant",
          content: localResponse.content,
          timestamp: Date.now(),
          artifacts: localResponse.artifacts,
          mode: localResponse.mode,
        };

        if (requestTokenRef.current !== token) return;

        setMessages((prev) => {
          const finalMsgs = [...prev, assistantMsg];
          if (threadIdRef.current === threadId || threadIdRef.current === null) {
            saveThread(threadId, finalMsgs);
          }
          return finalMsgs;
        });
      } else {
        const recentMsgs = messages.slice(-6).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        recentMsgs.push({ role: "user", content: text });

        const aiResponse = await aiChat(recentMsgs);
        if (requestTokenRef.current !== token) return;

        const content = aiResponse.success && aiResponse.data?.content
          ? aiResponse.data.content
          : localResponse.content;

        const assistantMsg: Message = {
          id: generateId("msg"),
          role: "assistant",
          content,
          timestamp: Date.now(),
          mode: "suggest",
        };

        setMessages((prev) => {
          const finalMsgs = [...prev, assistantMsg];
          if (threadIdRef.current === threadId || threadIdRef.current === null) {
            saveThread(threadId, finalMsgs);
          }
          return finalMsgs;
        });
      }
    } finally {
      if (requestTokenRef.current === token) {
        setIsProcessing(false);
      }
    }
  }, [isProcessing, currentThreadId, useAI, messages]);

  const createNewChat = useCallback(() => {
    requestTokenRef.current++;
    setMessages([WELCOME_MESSAGE]);
    setCurrentThreadId(null);
    setIsProcessing(false);
  }, []);

  const refreshThreads = useCallback(() => { loadThreadsList(); }, []);

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

  const persistMessages = useCallback((msgs: Message[]) => {
    if (threadIdRef.current) {
      saveThread(threadIdRef.current, msgs);
    }
  }, []);

  const pinMessage = useCallback((messageId: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => m.id === messageId ? { ...m, pinned: !m.pinned } : m);
      persistMessages(updated);
      return updated;
    });
  }, [persistMessages]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => m.id === messageId ? { ...m, content: newContent, editedAt: Date.now() } : m);
      persistMessages(updated);
      return updated;
    });
  }, [persistMessages]);

  const reactToMessage = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = [...(m.reactions || [])];
        const idx = reactions.findIndex((r) => r.emoji === emoji);
        if (idx >= 0) {
          if (reactions[idx].reacted) {
            reactions[idx] = { ...reactions[idx], count: Math.max(0, reactions[idx].count - 1), reacted: false };
            if (reactions[idx].count === 0) reactions.splice(idx, 1);
          } else {
            reactions[idx] = { ...reactions[idx], count: reactions[idx].count + 1, reacted: true };
          }
        } else {
          reactions.push({ emoji, count: 1, reacted: true });
        }
        return { ...m, reactions };
      });
      persistMessages(updated);
      return updated;
    });
  }, [persistMessages]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      AsyncStorage.setItem(MUTE_KEY, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const deleteThread = useCallback(async (threadId: string) => {
    try {
      await AsyncStorage.removeItem(`${MESSAGES_KEY}_${threadId}`);
      setThreads((prev) => {
        const updated = prev.filter((t) => t.id !== threadId);
        AsyncStorage.setItem(THREADS_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
      if (currentThreadId === threadId) {
        setMessages([WELCOME_MESSAGE]);
        setCurrentThreadId(null);
      }
    } catch {}
  }, [currentThreadId]);

  return (
    <CopilotContext.Provider value={{
      messages, threads, isProcessing, currentThreadId, isMuted, useAI, setUseAI,
      sendMessage, createNewChat, loadThread, refreshThreads,
      pinMessage, editMessage, reactToMessage, toggleMute, deleteThread,
    }}>
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within ChatProvider");
  return ctx;
}
