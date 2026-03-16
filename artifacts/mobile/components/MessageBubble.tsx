import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Message } from "@/types/chat";
import Colors from "@/constants/colors";
import { currentUserId } from "@/lib/seed-data";

interface MessageBubbleProps {
  message: Message;
  showTail?: boolean;
}

function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

export default function MessageBubble({
  message,
  showTail = true,
}: MessageBubbleProps) {
  const isMe = message.senderId === currentUserId;

  return (
    <View
      style={[
        styles.wrapper,
        isMe ? styles.wrapperRight : styles.wrapperLeft,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
          showTail && (isMe ? styles.tailRight : styles.tailLeft),
        ]}
      >
        <Text
          style={[styles.text, isMe ? styles.textMe : styles.textOther]}
        >
          {message.text}
        </Text>
        <View style={styles.meta}>
          <Text
            style={[styles.time, isMe ? styles.timeMe : styles.timeOther]}
          >
            {formatMessageTime(message.timestamp)}
          </Text>
          {isMe && (
            <Ionicons
              name={
                message.status === "read"
                  ? "checkmark-done"
                  : message.status === "delivered"
                    ? "checkmark-done"
                    : "checkmark"
              }
              size={14}
              color={
                message.status === "read"
                  ? "#A7F3D0"
                  : "rgba(255,255,255,0.6)"
              }
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  wrapperRight: {
    alignItems: "flex-end",
  },
  wrapperLeft: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: Colors.light.bubbleUser,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.light.bubbleOther,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  tailRight: {
    borderBottomRightRadius: 4,
  },
  tailLeft: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  textMe: {
    color: Colors.light.bubbleUserText,
  },
  textOther: {
    color: Colors.light.bubbleOtherText,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  timeMe: {
    color: "rgba(255,255,255,0.7)",
  },
  timeOther: {
    color: Colors.light.textMuted,
  },
  statusIcon: {
    marginLeft: 4,
  },
});
