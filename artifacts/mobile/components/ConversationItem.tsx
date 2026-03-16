import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Conversation } from "@/types/chat";
import Colors from "@/constants/colors";
import Avatar from "@/components/Avatar";
import { currentUserId } from "@/lib/seed-data";

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, "0");
    return `${h}:${m} ${ampm}`;
  }

  if (diff < 2 * oneDay) return "Yesterday";
  if (diff < 7 * oneDay) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(timestamp).getDay()];
  }

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function ConversationItem({
  conversation,
  onPress,
}: ConversationItemProps) {
  const { name, lastMessage, unreadCount, isPinned, isOnline, isGroup } =
    conversation;
  const hasUnread = unreadCount > 0;
  const isMe = lastMessage?.senderId === currentUserId;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Avatar
        name={name}
        size={52}
        isOnline={isOnline}
        isGroup={isGroup}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            {isPinned && (
              <Ionicons
                name="pin"
                size={14}
                color={Colors.light.textMuted}
                style={styles.pinIcon}
              />
            )}
            <Text
              style={[styles.name, hasUnread && styles.nameUnread]}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
          <Text
            style={[styles.time, hasUnread && styles.timeUnread]}
          >
            {lastMessage ? formatTime(lastMessage.timestamp) : ""}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.messageRow}>
            {isMe && lastMessage && (
              <Ionicons
                name={
                  lastMessage.status === "read"
                    ? "checkmark-done"
                    : lastMessage.status === "delivered"
                      ? "checkmark-done"
                      : "checkmark"
                }
                size={16}
                color={
                  lastMessage.status === "read"
                    ? Colors.light.tint
                    : Colors.light.textMuted
                }
                style={styles.checkIcon}
              />
            )}
            <Text
              style={[styles.message, hasUnread && styles.messageUnread]}
              numberOfLines={1}
            >
              {lastMessage?.text ?? "No messages yet"}
            </Text>
          </View>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  pressed: {
    backgroundColor: Colors.light.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  pinIcon: {
    marginRight: 4,
    transform: [{ rotate: "45deg" }],
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    flex: 1,
  },
  nameUnread: {
    fontFamily: "Inter_600SemiBold",
  },
  time: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textMuted,
  },
  timeUnread: {
    color: Colors.light.tint,
    fontFamily: "Inter_500Medium",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  checkIcon: {
    marginRight: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    flex: 1,
  },
  messageUnread: {
    color: Colors.light.text,
    fontFamily: "Inter_500Medium",
  },
  badge: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
