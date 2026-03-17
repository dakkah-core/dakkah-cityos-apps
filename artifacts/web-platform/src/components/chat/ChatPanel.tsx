import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Paperclip, Mic } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@cityos/ui";

export function ChatPanel() {
  const { messages, isProcessing, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    const text = input;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    await sendMessage(text);
  }, [input, isProcessing, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleAction = useCallback(
    async (action: string) => {
      await sendMessage(action);
    },
    [sendMessage]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="py-4 space-y-1">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onAction={handleAction} />
          ))}
          {isProcessing && (
            <div className="flex gap-3 px-4 py-2 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-lg bg-[var(--navy)] flex items-center justify-center flex-shrink-0">
                <span className="text-[var(--primary)] text-sm font-bold">✦</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Copilot is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card p-3">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-shrink-0" title="Attach file">
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Dakkah anything..."
              rows={1}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 scrollbar-thin"
              style={{ maxHeight: 120 }}
            />
          </div>
          <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors flex-shrink-0" title="Voice input">
            <Mic className="h-5 w-5" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className={cn(
              "p-2.5 rounded-xl bg-[var(--navy)] text-white flex-shrink-0 transition-opacity",
              (!input.trim() || isProcessing) && "opacity-30 cursor-not-allowed"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Dakkah AI may make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
