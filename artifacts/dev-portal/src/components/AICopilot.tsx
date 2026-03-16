import { useState, useRef, useEffect } from "react";
import { Send, Terminal, Sparkles, Loader2, Bot, Settings2, Box } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    role: "ai",
    content: "Hi there! I'm your Dakkah CityOS Developer Copilot. Ask me how to use our APIs, register your app, or generate code snippets.",
    timestamp: new Date()
  }
];

export function AICopilot() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI Response Logic
    setTimeout(() => {
      let aiContent = "";
      const query = userMsg.content.toLowerCase();
      
      if (query.includes("commerce") || query.includes("product")) {
        aiContent = `To list products using the Commerce API, make a GET request to the \`/api/commerce/products\` endpoint.

Here is an example in JavaScript (Fetch):
\`\`\`javascript
const response = await fetch('https://api.dakkah.cityos/commerce/products', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await response.json();
console.log(data);
\`\`\`
Would you like me to show you how to filter by category?`;
      } else if (query.includes("register") || query.includes("app")) {
        aiContent = "You can register a new application by clicking the **Register New App** button in the dashboard, or I can start the workflow for you right here. Once registered, you'll receive your `client_id` and `client_secret` to authenticate your API calls via OAuth2.";
      } else {
        aiContent = "I can certainly help with that. The CityOS platform offers REST APIs and real-time WebSockets for Transport, Healthcare, Commerce, and IoT.\n\nCould you specify which service you are trying to integrate with?";
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: aiContent,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-border/50 shadow-2xl relative">
      {/* Copilot Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_10px_var(--color-primary)_inset]">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground font-mono text-sm">CityOS Copilot</h2>
            <p className="text-xs text-primary animate-pulse">Online & Ready</p>
          </div>
        </div>
        <button className="p-2 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[90%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 shrink-0 rounded-full flex items-center justify-center",
              msg.role === "user" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary border border-primary/20"
            )}>
              {msg.role === "user" ? <Box className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={cn(
              "rounded-2xl p-4 text-sm",
              msg.role === "user" 
                ? "bg-accent text-accent-foreground rounded-tr-sm shadow-md" 
                : "bg-secondary border border-border rounded-tl-sm text-foreground prose prose-invert"
            )}>
              {msg.role === "user" ? (
                msg.content
              ) : (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-mono">Generating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border mt-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask copilot to build, debug, or query APIs..."
            className="w-full bg-secondary border border-border rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono placeholder:text-muted-foreground/70"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 text-center flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-mono">
          <Sparkles className="w-3 h-3 text-primary" /> AI can make mistakes. Verify code before using.
        </div>
      </div>
    </div>
  );
}
