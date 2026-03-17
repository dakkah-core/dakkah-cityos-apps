import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User as UserIcon, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useCopilot } from "@/hooks/use-copilot";
import { format } from "date-fns";
import { cn } from "@cityos/ui";

export function CopilotPanel() {
  const { messages, sendMessage, isTyping } = useCopilot();
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className={cn(
      "flex flex-col bg-card border-l border-border h-full transition-all duration-300",
      isExpanded ? "w-full absolute inset-0 z-50 md:relative md:w-[600px]" : "w-full md:w-[380px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-card"></span>
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">CityOS Copilot</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Online & Ready
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden md:flex p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
        >
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                msg.role === "user" 
                  ? "bg-secondary border-secondary text-foreground" 
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                {msg.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                "flex flex-col gap-1",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md shadow-primary/10" 
                    : "bg-secondary text-foreground rounded-tl-sm border border-border"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground px-1">
                  {format(msg.timestamp, "HH:mm")}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-3 max-w-[85%]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-primary/10 border-primary/20 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-secondary border border-border flex items-center gap-1.5 h-11">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot to analyze traffic, manage incidents..."
            className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-colors"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["Show active incidents", "Generate budget report", "Check traffic flow"].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setInput(suggestion)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
