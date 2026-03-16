export interface AssistantTheme {
  primary?: string;
  primaryForeground?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  border?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  radius?: string;
  fontFamily?: string;
}

export type AssistantPosition = "bottom-right" | "bottom-left";

export interface HostScreenContext {
  screenId?: string;
  surface?: string;
  pageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface WidgetMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  sduiNode?: unknown;
}

export interface DakkahAssistantProps {
  apiEndpoint?: string;
  authToken?: string;
  theme?: AssistantTheme;
  position?: AssistantPosition;
  hostContext?: HostScreenContext;
  greeting?: string;
  placeholder?: string;
  onAction?: (action: unknown) => void;
  zIndex?: number;
  defaultOpen?: boolean;
}
