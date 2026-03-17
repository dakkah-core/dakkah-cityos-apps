import type { Contact } from "../types/chat";

export const CONTACTS: Contact[] = [
  { id: "user_sarah", name: "Sarah Al-Rashid", role: "City Planner", department: "Urban Development", isOnline: true },
  { id: "user_omar", name: "Omar Khalid", role: "Transport Engineer", department: "Mobility & Transit", isOnline: true },
  { id: "user_fatima", name: "Fatima Noor", role: "Environmental Analyst", department: "Sustainability", isOnline: false },
  { id: "user_ahmed", name: "Ahmed Mansour", role: "Infrastructure Lead", department: "Smart Infrastructure", isOnline: true },
  { id: "user_lina", name: "Lina Al-Sayed", role: "Data Scientist", department: "City Intelligence", isOnline: false },
  { id: "user_yusuf", name: "Yusuf Ibrahim", role: "Security Analyst", department: "Public Safety", isOnline: true },
];

export const SLASH_COMMANDS = [
  { command: "/explore", description: "Discover places & experiences", prompt: "Show me interesting places nearby" },
  { command: "/book", description: "Make a reservation", prompt: "I want to book a reservation" },
  { command: "/report", description: "Report a city issue", prompt: "I need to report an issue" },
  { command: "/weather", description: "Check weather conditions", prompt: "What's the weather like?" },
  { command: "/health", description: "Health & wellness info", prompt: "Show me my health metrics" },
  { command: "/trip", description: "Plan a trip", prompt: "Help me plan a trip" },
  { command: "/events", description: "Find events nearby", prompt: "What events are happening?" },
  { command: "/transit", description: "Transit & navigation", prompt: "Show me transit options" },
  { command: "/wallet", description: "Payments & wallet", prompt: "Show me my wallet balance" },
  { command: "/quests", description: "View active quests", prompt: "Show my active quests" },
];

export const REACTION_EMOJIS = ["👍", "❤️", "😊", "🎉", "🤔", "👏"];
