import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const trimmed = text.trim();

  const handleSend = () => {
    if (!trimmed || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.light.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
          editable={!disabled}
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.sendButton,
          !!trimmed && !disabled && styles.sendButtonActive,
          pressed && !!trimmed && styles.sendButtonPressed,
        ]}
        onPress={handleSend}
        disabled={!trimmed || disabled}
      >
        <Ionicons
          name="send"
          size={20}
          color={
            trimmed && !disabled ? "#FFFFFF" : Colors.light.textMuted
          }
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.light.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    maxHeight: 100,
    lineHeight: 22,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.inputBg,
  },
  sendButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
});
