import { cn } from "@/lib/utils";
import { ArtifactRenderer } from "@/components/artifacts/ArtifactRenderer";
import type { Message } from "@/types/chat";

interface Props {
  message: Message;
  onAction?: (action: string) => void;
}

export function MessageBubble({ message, onAction }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 px-4 py-2 max-w-4xl mx-auto", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-[var(--navy)] flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-[var(--primary)] text-sm font-bold">✦</span>
        </div>
      )}
      <div className={cn("max-w-[75%] min-w-0", isUser && "order-first")}>
        {message.replyTo && (
          <div className="text-xs text-muted-foreground mb-1 pl-3 border-l-2 border-primary/40 truncate">
            Replying to: {message.replyTo.content}
          </div>
        )}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {message.attachments.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                {a.type === "image" ? "🖼️" : "📄"} {a.name}
              </span>
            ))}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-[var(--navy)] text-white rounded-br-md"
              : "bg-card border border-border rounded-bl-md"
          )}
        >
          {message.content}
        </div>
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="mt-2 space-y-2">
            <ArtifactRenderer artifacts={message.artifacts} onAction={onAction} />
          </div>
        )}
        <div className="text-[10px] text-muted-foreground mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
