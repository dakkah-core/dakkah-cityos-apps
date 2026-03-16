import React, { useState } from "react";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ChatPanel() {
  const { messages, isTyping, sendMessage, bottomRef } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const aiAvatarUrl = `${import.meta.env.BASE_URL}images/ai-avatar.png`;

  return (
    <div className="flex flex-col h-full w-full bg-background border-l border-border/50 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border/40 bg-background/80 backdrop-blur-xl z-10 flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-accent/20 shadow-sm shadow-accent/10">
            <img src={aiAvatarUrl} alt="AI Copilot" className="w-full h-full object-cover" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></span>
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            Business Copilot <Sparkles className="w-4 h-4 text-accent" />
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Online • Powered by Dakkah AI</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 z-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex max-w-[85%] gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}>
                {/* Avatar */}
                <div className="flex-shrink-0 mt-auto">
                  {msg.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                      <img src={aiAvatarUrl} alt="AI" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-br-sm" 
                    : "bg-card border border-border/50 text-foreground rounded-bl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full justify-start"
          >
             <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 mt-auto">
                <img src={aiAvatarUrl} alt="AI" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/50 rounded-bl-sm flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Analyzing business data...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-background/80 backdrop-blur-xl border-t border-border/40 z-10">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-center bg-card border border-border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent transition-all p-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sales, inventory, or staff..."
            className="flex-1 bg-transparent border-none focus:outline-none px-4 py-3 text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 bg-accent text-accent-foreground rounded-xl font-bold shadow-md shadow-accent/20 hover:shadow-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mr-1"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
          {["Show today's revenue", "Check inventory", "Staff on duty"].map(suggestion => (
            <button 
              key={suggestion}
              type="button"
              onClick={() => { setInput(suggestion); setTimeout(() => sendMessage(suggestion), 100); setInput(""); }}
              className="whitespace-nowrap text-xs font-medium px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-lg transition-colors border border-border/50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
