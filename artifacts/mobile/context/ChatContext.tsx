import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Conversation, Message } from "@/types/chat";
import {
  loadConversations,
  saveConversations,
  loadMessages,
  saveMessages,
} from "@/lib/storage";
import {
  seedConversations,
  seedMessages,
  currentUserId,
  contacts,
} from "@/lib/seed-data";
import { generateId } from "@/lib/id";

interface ChatContextValue {
  conversations: Conversation[];
  isLoading: boolean;
  getMessages: (conversationId: string) => Promise<Message[]>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markAsRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  createConversation: (contactId: string) => Conversation;
  pinConversation: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      let convos = await loadConversations();
      if (convos.length === 0) {
        convos = seedConversations;
        await saveConversations(convos);
        for (const [convId, msgs] of Object.entries(seedMessages)) {
          await saveMessages(convId, msgs);
        }
      }
      setConversations(convos);
      setIsLoading(false);
    })();
  }, []);

  const persistConversations = useCallback(
    async (updated: Conversation[]) => {
      setConversations(updated);
      await saveConversations(updated);
    },
    [],
  );

  const getMessages = useCallback(async (conversationId: string) => {
    return loadMessages(conversationId);
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      const msg: Message = {
        id: generateId("msg"),
        conversationId,
        senderId: currentUserId,
        text,
        timestamp: Date.now(),
        status: "sent",
      };

      const msgs = await loadMessages(conversationId);
      msgs.push(msg);
      await saveMessages(conversationId, msgs);

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: msg, unreadCount: 0 }
            : c,
        );
        saveConversations(updated);
        return updated;
      });

      setTimeout(async () => {
        const conv = conversations.find((c) => c.id === conversationId);
        if (!conv) return;

        const otherParticipant = conv.participants.find(
          (p) => p !== currentUserId,
        );
        if (!otherParticipant) return;

        const contact = contacts.find((c) => c.id === otherParticipant);
        const replies = [
          "Got it, I'll look into this right away.",
          "Thanks for the update! I'll follow up shortly.",
          "That's a great point. Let me check the latest data.",
          "I agree. Let's schedule a meeting to discuss further.",
          "Perfect, I've noted this. Will send my analysis soon.",
          "Understood. I'll coordinate with the team on this.",
          "Good to know. I'll prepare a report by end of day.",
          "Interesting insight! Let me run some numbers.",
        ];

        const replyMsg: Message = {
          id: generateId("msg"),
          conversationId,
          senderId: otherParticipant,
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: Date.now(),
          status: "delivered",
        };

        const currentMsgs = await loadMessages(conversationId);
        currentMsgs.push(replyMsg);
        await saveMessages(conversationId, currentMsgs);

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === conversationId ? { ...c, lastMessage: replyMsg } : c,
          );
          saveConversations(updated);
          return updated;
        });
      }, 1500 + Math.random() * 2000);
    },
    [conversations],
  );

  const markAsRead = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c,
      );
      saveConversations(updated);
      return updated;
    });
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== conversationId);
      saveConversations(updated);
      return updated;
    });
  }, []);

  const createConversation = useCallback(
    (contactId: string) => {
      const contact = contacts.find((c) => c.id === contactId);
      const existing = conversations.find(
        (c) =>
          !c.isGroup &&
          c.participants.includes(contactId) &&
          c.participants.includes(currentUserId),
      );
      if (existing) return existing;

      const newConv: Conversation = {
        id: generateId("conv"),
        name: contact?.name ?? "Unknown",
        isGroup: false,
        participants: [currentUserId, contactId],
        unreadCount: 0,
        isPinned: false,
        isOnline: contact?.isOnline ?? false,
        subtitle: contact?.role,
      };

      setConversations((prev) => {
        const updated = [newConv, ...prev];
        saveConversations(updated);
        return updated;
      });

      return newConv;
    },
    [conversations],
  );

  const pinConversation = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c,
      );
      saveConversations(updated);
      return updated;
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        isLoading,
        getMessages,
        sendMessage,
        markAsRead,
        deleteConversation,
        createConversation,
        pinConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
