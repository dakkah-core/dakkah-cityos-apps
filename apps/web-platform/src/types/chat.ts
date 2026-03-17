export interface MessageAttachment {
  type: "image" | "document";
  name: string;
  url?: string;
}

export interface Artifact {
  type: string;
  data: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  artifacts?: Artifact[];
  replyTo?: { id: string; content: string };
  attachments?: MessageAttachment[];
  pinned?: boolean;
  reactions?: Record<string, number>;
}

export interface Thread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  unread?: boolean;
}

export interface DiscoveryCategory {
  id: string;
  icon: string;
  label: string;
  prompts: string[];
}
