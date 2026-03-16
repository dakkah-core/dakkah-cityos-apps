export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  isGroup: boolean;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isOnline: boolean;
  subtitle?: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  role?: string;
  department?: string;
}
