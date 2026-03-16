import { useState, useRef, useEffect } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to your Business Copilot. I can help you analyze sales, manage inventory, or coordinate staff. What would you like to look at today?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI response delay and logic
    setTimeout(() => {
      let aiResponse = "I've updated the dashboard with those insights.";
      
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes("sales") || lowerContent.includes("revenue")) {
        aiResponse = "I've highlighted the sales data. The Downtown Branch is leading today with 18,450 SAR in revenue, driven primarily by morning coffee orders.";
      } else if (lowerContent.includes("inventory") || lowerContent.includes("stock")) {
        aiResponse = "You have 3 critical inventory alerts. You are completely out of Oat Milk at two locations, and running low on Espresso beans. Would you like me to draft purchase orders?";
      } else if (lowerContent.includes("staff") || lowerContent.includes("schedule")) {
        aiResponse = "You have 12 team members on shift today across all locations. Everyone has checked in on time.";
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return { messages, isTyping, sendMessage, bottomRef };
}
