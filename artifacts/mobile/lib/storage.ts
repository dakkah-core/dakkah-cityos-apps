import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Conversation, Message } from "@/types/chat";

const CONVERSATIONS_KEY = "dakkah_conversations";
const MESSAGES_KEY = "dakkah_messages";

export async function loadConversations(): Promise<Conversation[]> {
  const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveConversations(convos: Conversation[]): Promise<void> {
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convos));
}

export async function loadMessages(conversationId: string): Promise<Message[]> {
  const data = await AsyncStorage.getItem(`${MESSAGES_KEY}_${conversationId}`);
  return data ? JSON.parse(data) : [];
}

export async function saveMessages(
  conversationId: string,
  messages: Message[],
): Promise<void> {
  await AsyncStorage.setItem(
    `${MESSAGES_KEY}_${conversationId}`,
    JSON.stringify(messages),
  );
}

export async function clearAllData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const dakkahKeys = keys.filter(
    (k) => k.startsWith("dakkah_") || k.startsWith(MESSAGES_KEY),
  );
  await AsyncStorage.multiRemove(dakkahKeys);
}
