import React from "react";
import { format } from "date-fns";
import { Bot, User as UserIcon } from "lucide-react";
import { cn } from "@cityos/ui";
import type { ChatMessage as ChatMessageType } from "@/hooks/use-chat";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isAi = message.role === "ai" || message.role === "system";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isAi ? "justify-start" : "justify-end"
      )}
    >
      {isAi && (
        <div className="flex-shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Bot size={16} />
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[85%]",
          isAi ? "items-start" : "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-sm",
            isAi
              ? "bg-card border border-border/50 text-foreground rounded-tl-none"
              : "bg-primary text-primary-foreground rounded-tr-none"
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {format(message.timestamp, "h:mm a")}
        </span>
      </div>

      {!isAi && (
        <div className="flex-shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground border border-border/50">
            <UserIcon size={16} />
          </div>
        </div>
      )}
    </div>
  );
}
