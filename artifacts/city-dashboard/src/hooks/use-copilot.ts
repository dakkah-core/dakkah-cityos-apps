import { useState, useRef, useEffect } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function useCopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to the City Operations Center. I am your AI Copilot. You can ask me to navigate to specific systems, generate reports, or monitor active city metrics. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Mock an AI response for demonstration
    setTimeout(() => {
      setIsTyping(false);
      
      let responseText = "I've noted your request. Currently, the system is in demonstration mode. I can monitor city metrics, but deep integrations are simulated.";
      
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes("report") || lowerContent.includes("incident")) {
        responseText = "Pulling up the latest incident reports... There are 7 active incidents right now. The most critical is a water main break in District 4. Would you like me to deploy a repair crew?";
      } else if (lowerContent.includes("traffic")) {
        responseText = "Traffic flow is currently at 94% overall. We're seeing some minor congestion on the Northern Ring Road due to construction. I can reroute public transit if needed.";
      } else if (lowerContent.includes("energy")) {
        responseText = "Energy usage is stable at 342 MW, which is 5% lower than the weekly average. The smart grid is functioning optimally.";
      } else if (lowerContent.includes("emergency")) {
        responseText = "Emergency protocols are standing by. I can alert all active units. Please confirm if you want to initiate a city-wide alert.";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  return {
    messages,
    sendMessage,
    isTyping
  };
}
