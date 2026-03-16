import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "sys_1",
  role: "ai",
  content: "Hello! I'm your Dakkah CityOS Copilot. I can help you find city services, report issues, or check on your applications. How can I assist you today?",
  timestamp: new Date(),
};

export const useChat = create<ChatState>((set, get) => ({
  messages: [INITIAL_MESSAGE],
  isTyping: false,
  isOpen: false, // Default hidden on mobile, overridden by layout on desktop
  setIsOpen: (isOpen) => set({ isOpen }),
  sendMessage: async (content: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isTyping: true,
    }));

    // Simulate network delay and AI processing
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Simulated simple responses based on keywords to make it feel alive
    let aiResponse = "I can help you with that. I'm currently in demo mode, but normally I would navigate you to the appropriate service or form.";
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("report") || lowerContent.includes("pothole")) {
      aiResponse = "I can help you report an issue. Normally, I would open the 'Report an Issue' form right here for you. Please use the quick actions on the dashboard for now.";
    } else if (lowerContent.includes("parking") || lowerContent.includes("transport")) {
      aiResponse = "Looking for transport services? I can guide you to parking permits or public transit schedules. Check the Popular Services section.";
    } else if (lowerContent.includes("hello") || lowerContent.includes("hi")) {
      aiResponse = "Hello! What city service can I help you find today?";
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: aiResponse,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, aiMsg],
      isTyping: false,
    }));
  },
  clearHistory: () => set({ messages: [INITIAL_MESSAGE] }),
}));
