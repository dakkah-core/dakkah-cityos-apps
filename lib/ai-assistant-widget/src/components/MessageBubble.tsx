import { SduiRenderer } from "@workspace/sdui-renderer-web";
import type { SdNode } from "@workspace/sdui-protocol";
import type { WidgetMessage } from "../lib/types";

interface MessageBubbleProps {
  message: WidgetMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        maxWidth: "88%",
        alignSelf: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser ? "var(--da-primary)" : "var(--da-card)",
          color: isUser ? "var(--da-primary-fg)" : "var(--da-card-fg)",
          border: isUser ? "none" : "1px solid var(--da-border)",
          fontSize: 13,
          lineHeight: 1.5,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {message.content}
      </div>

      {message.sduiNode != null && (
        <div
          style={{
            marginTop: 6,
            width: "100%",
            borderRadius: 10,
            border: "1px solid var(--da-border)",
            background: "var(--da-card)",
            padding: 10,
            overflow: "hidden",
          }}
        >
          <SduiRenderer node={message.sduiNode as SdNode} theme="light" />
        </div>
      )}

      <div
        style={{
          fontSize: 9,
          color: "var(--da-muted-fg)",
          marginTop: 3,
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
        }}
      >
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
