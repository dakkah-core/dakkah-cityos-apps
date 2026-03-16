import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useChat } from "@/context/ChatContext";
import Avatar from "@/components/Avatar";
import MessageBubble from "@/components/MessageBubble";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import type { Message } from "@/types/chat";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { conversations, getMessages, sendMessage, markAsRead } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTyping, setShowTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const initializedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const conversation = conversations.find((c) => c.id === id);

  useEffect(() => {
    if (!id || initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      const msgs = await getMessages(id);
      setMessages(msgs);
      setIsLoading(false);
      markAsRead(id);
    })();
  }, [id, getMessages, markAsRead]);

  useEffect(() => {
    if (!id) return;

    pollRef.current = setInterval(async () => {
      const msgs = await getMessages(id);
      setMessages(msgs);
    }, 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id, getMessages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!id || isSending) return;
      setIsSending(true);
      setShowTyping(true);

      const newMsg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversationId: id,
        senderId: "user_me",
        text,
        timestamp: Date.now(),
        status: "sent",
      };
      setMessages((prev) => [...prev, newMsg]);

      try {
        await sendMessage(id, text);
      } finally {
        setTimeout(() => {
          setShowTyping(false);
          setIsSending(false);
        }, 2000);
      }
    },
    [id, isSending, sendMessage],
  );

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, []);

  const reversedMessages = [...messages].reverse();

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const prev = reversedMessages[index + 1];
      const showTail = !prev || prev.senderId !== item.senderId;
      return <MessageBubble message={item} showTail={showTail} />;
    },
    [reversedMessages],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  if (!conversation) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={Colors.light.textMuted}
        />
        <Text style={styles.errorText}>Conversation not found</Text>
        <Pressable style={styles.errorButton} onPress={handleBack}>
          <Text style={styles.errorButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + webTopInset + 4 },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={handleBack}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={Colors.light.tint}
          />
        </Pressable>

        <Pressable style={styles.headerInfo}>
          <Avatar
            name={conversation.name}
            size={38}
            isOnline={conversation.isOnline}
            isGroup={conversation.isGroup}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName} numberOfLines={1}>
              {conversation.name}
            </Text>
            <Text style={styles.headerStatus} numberOfLines={1}>
              {conversation.isGroup
                ? conversation.subtitle
                : conversation.isOnline
                  ? "Online"
                  : "Offline"}
            </Text>
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.headerActionBtn,
              pressed && styles.headerActionBtnPressed,
            ]}
          >
            <Ionicons
              name="call-outline"
              size={22}
              color={Colors.light.tint}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.headerActionBtn,
              pressed && styles.headerActionBtnPressed,
            ]}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={Colors.light.tint}
            />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <FlatList
          data={reversedMessages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          inverted={messages.length > 0}
          scrollEnabled={messages.length > 0}
          contentContainerStyle={styles.messageList}
          ListHeaderComponent={showTyping ? <TypingIndicator /> : null}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <View style={styles.emptyBubble}>
                <Ionicons
                  name="chatbubble-outline"
                  size={32}
                  color={Colors.light.textMuted}
                />
              </View>
              <Text style={styles.emptyMessageText}>
                Start a conversation
              </Text>
            </View>
          }
        />
      )}

      <View style={{ paddingBottom: insets.bottom + webBottomInset }}>
        <ChatInput onSend={handleSend} disabled={isSending} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: {
    backgroundColor: Colors.light.tintLight,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    gap: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  headerStatus: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 2,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActionBtnPressed: {
    backgroundColor: Colors.light.tintLight,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  messageList: {
    paddingVertical: 8,
  },
  emptyMessages: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
    transform: [{ scaleY: -1 }],
  },
  emptyBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.tintLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMessageText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
