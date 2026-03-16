import React, { useRef, useEffect, useState } from "react";
import { Send, X, ShieldAlert, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "./ChatMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChatPanel({ className }: { className?: string }) {
  const { messages, isTyping, isOpen, setIsOpen, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <Button
        size="icon"
        variant="default"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl shadow-primary/30 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare />
      </Button>

      {/* Main Panel */}
      <div
        className={cn(
          "flex flex-col h-full bg-chat-bg border-l border-border/50 shadow-2xl md:shadow-none relative z-40 transition-transform duration-300 ease-in-out",
          "fixed inset-y-0 right-0 w-full sm:w-[400px] md:static md:w-full md:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border/50 px-6 bg-card">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">City Copilot</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Info Banner */}
        <div className="bg-primary/5 border-b border-primary/10 px-6 py-3 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            I'm your AI guide for city services. Ask me anything, or use me to navigate the portal. I can help report issues or find information.
          </p>
        </div>

        {/* Message Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatMessage message={msg} />
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-muted-foreground text-sm ml-12"
              >
                <div className="flex gap-1">
                  <span className="animate-bounce inline-block w-1.5 h-1.5 bg-primary/60 rounded-full" style={{ animationDelay: "0ms" }} />
                  <span className="animate-bounce inline-block w-1.5 h-1.5 bg-primary/60 rounded-full" style={{ animationDelay: "150ms" }} />
                  <span className="animate-bounce inline-block w-1.5 h-1.5 bg-primary/60 rounded-full" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs">Copilot is thinking...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-card border-t border-border/50">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-background rounded-2xl border-2 border-border/60 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about city services..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-4 h-14"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              variant="default"
              className="absolute right-2 h-10 w-10 rounded-xl"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={18} className="ml-0.5" />
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2 px-1">
            {["Report pothole", "Parking permit", "Trash collection"].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInputValue(suggestion)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
