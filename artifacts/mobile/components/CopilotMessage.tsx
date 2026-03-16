import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import type { Message } from "../types/chat";
import { ArtifactRenderer } from "./artifacts/ArtifactRenderer";

interface Props {
  message: Message;
  onAction?: (action: string) => void;
}

const MODE_CONFIG = {
  suggest: { label: "Suggestion", color: COLORS.suggest, bg: "#F3E8FF" },
  propose: { label: "Proposal", color: COLORS.propose, bg: "#FEF3C7" },
  execute: { label: "Result", color: COLORS.execute, bg: "#D1FAE5" },
};

export function CopilotMessage({ message, onAction }: Props) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const mode = message.mode ? MODE_CONFIG[message.mode] : null;
  const hasArtifacts = isAssistant && message.artifacts && message.artifacts.length > 0;
  const inlineArtifacts = message.artifacts?.filter((a) => a.type === "selection-chips") || [];
  const blockArtifacts = message.artifacts?.filter((a) => a.type !== "selection-chips") || [];

  if (message.role === "system") {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {isAssistant && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>✦</Text>
        </View>
      )}
      <View style={[styles.bubbleCol, isUser && styles.bubbleColUser]}>
        {mode && isAssistant && (
          <View style={[styles.modeBadge, { backgroundColor: mode.bg }]}>
            <Text style={[styles.modeText, { color: mode.color }]}>{mode.label}</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.content, isUser && styles.userContent]}>{message.content}</Text>
          {inlineArtifacts.length > 0 && (
            <View style={styles.inlineArtifacts}>
              <ArtifactRenderer artifacts={inlineArtifacts} onAction={onAction} />
            </View>
          )}
        </View>
        {blockArtifacts.length > 0 && (
          <View style={styles.blockArtifacts}>
            <ArtifactRenderer artifacts={blockArtifacts} onAction={onAction} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  rowUser: { justifyContent: "flex-end" },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center", marginTop: 4 },
  avatarText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  bubbleCol: { maxWidth: "85%", gap: 4 },
  bubbleColUser: { alignItems: "flex-end" },
  modeBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 2 },
  modeText: { fontSize: 10, fontWeight: "700" },
  bubble: { borderRadius: 18, padding: 12, overflow: "hidden" },
  userBubble: { backgroundColor: COLORS.userBubble, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: COLORS.assistantBubble, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  content: { fontSize: 14, lineHeight: 21, color: COLORS.text },
  userContent: { color: COLORS.textInverse },
  inlineArtifacts: { marginTop: 8 },
  blockArtifacts: { marginTop: 4 },
  systemRow: { alignItems: "center", paddingVertical: 8 },
  systemText: { fontSize: 11, color: COLORS.textMuted, backgroundColor: COLORS.borderLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
});
