import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { COLORS } from "../constants/colors";
import type { Message } from "../types/chat";
import type { DetailItem } from "./DetailsDrawer";
import { ArtifactRenderer } from "./artifacts/ArtifactRenderer";
import { MessageContextMenu } from "./MessageContextMenu";

interface Props {
  message: Message;
  onAction?: (action: string) => void;
  onShowDetails?: (item: DetailItem) => void;
  onReply?: (message: Message) => void;
  onPin?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  highlighted?: boolean;
}

const MODE_CONFIG = {
  suggest: { label: "Suggestion", color: COLORS.suggest, bg: "#F3E8FF" },
  propose: { label: "Proposal", color: COLORS.propose, bg: "#FEF3C7" },
  execute: { label: "Result", color: COLORS.execute, bg: "#D1FAE5" },
};

export function CopilotMessage({ message, onAction, onShowDetails, onReply, onPin, onEdit, onReact, highlighted }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const mode = message.mode ? MODE_CONFIG[message.mode] : null;
  const inlineArtifacts = message.artifacts?.filter((a) => a.type === "selection-chips") || [];
  const blockArtifacts = message.artifacts?.filter((a) => a.type !== "selection-chips") || [];

  const handleLongPress = useCallback(() => {
    if (message.role === "system") return;
    setMenuOpen(true);
  }, [message.role]);

  const handleSaveEdit = useCallback(() => {
    if (editText.trim() && editText !== message.content) {
      onEdit?.(message.id, editText.trim());
    }
    setEditing(false);
  }, [editText, message.content, message.id, onEdit]);

  if (message.role === "system") {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <>
      <Pressable onLongPress={handleLongPress} delayLongPress={400}>
        <View style={[styles.row, isUser && styles.rowUser, highlighted && styles.highlighted]}>
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
            {message.replyToContent && (
              <View style={styles.replyStrip}>
                <View style={styles.replyBar} />
                <Text style={styles.replyText} numberOfLines={1}>{message.replyToContent}</Text>
              </View>
            )}
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
              {message.pinned && <Text style={styles.pinIcon}>📌</Text>}
              {editing ? (
                <View style={styles.editRow}>
                  <TextInput style={styles.editInput} value={editText} onChangeText={setEditText} multiline autoFocus />
                  <View style={styles.editActions}>
                    <Pressable onPress={() => setEditing(false)} style={styles.editBtn}><Text style={styles.editBtnText}>Cancel</Text></Pressable>
                    <Pressable onPress={handleSaveEdit} style={[styles.editBtn, styles.editBtnSave]}><Text style={[styles.editBtnText, styles.editBtnSaveText]}>Save</Text></Pressable>
                  </View>
                </View>
              ) : (
                <Text style={[styles.content, isUser && styles.userContent]}>
                  {message.content}
                  {message.editedAt && <Text style={styles.editedLabel}> (edited)</Text>}
                </Text>
              )}
              {inlineArtifacts.length > 0 && (
                <View style={styles.inlineArtifacts}>
                  <ArtifactRenderer artifacts={inlineArtifacts} onAction={onAction} onShowDetails={onShowDetails} />
                </View>
              )}
            </View>
            {message.reactions && message.reactions.length > 0 && (
              <View style={styles.reactionsRow}>
                {message.reactions.map((r) => (
                  <Pressable key={r.emoji} style={[styles.reactionBadge, r.reacted && styles.reactionActive]} onPress={() => onReact?.(message.id, r.emoji)}>
                    <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                    <Text style={styles.reactionCount}>{r.count}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {blockArtifacts.length > 0 && (
              <View style={styles.blockArtifacts}>
                <ArtifactRenderer artifacts={blockArtifacts} onAction={onAction} onShowDetails={onShowDetails} />
              </View>
            )}
          </View>
        </View>
      </Pressable>
      <MessageContextMenu
        visible={menuOpen}
        isUserMessage={isUser}
        onClose={() => setMenuOpen(false)}
        onReply={() => onReply?.(message)}
        onPin={() => onPin?.(message.id)}
        onEdit={() => { setEditText(message.content); setEditing(true); }}
        onReact={(emoji) => onReact?.(message.id, emoji)}
        isPinned={message.pinned}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  rowUser: { justifyContent: "flex-end" },
  highlighted: { backgroundColor: "#FEFCE8", borderRadius: 12 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center", marginTop: 4 },
  avatarText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  bubbleCol: { maxWidth: "85%", gap: 4 },
  bubbleColUser: { alignItems: "flex-end" },
  modeBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 2 },
  modeText: { fontSize: 10, fontWeight: "700" },
  replyStrip: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4, paddingHorizontal: 8 },
  replyBar: { width: 3, height: 16, borderRadius: 1.5, backgroundColor: COLORS.primary },
  replyText: { fontSize: 11, color: COLORS.textMuted, flex: 1, fontStyle: "italic" },
  bubble: { borderRadius: 18, padding: 12, overflow: "hidden" },
  userBubble: { backgroundColor: COLORS.userBubble, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: COLORS.assistantBubble, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  content: { fontSize: 14, lineHeight: 21, color: COLORS.text },
  userContent: { color: COLORS.textInverse },
  pinIcon: { position: "absolute", top: 4, right: 8, fontSize: 10 },
  editedLabel: { fontSize: 10, color: COLORS.textMuted, fontStyle: "italic" },
  inlineArtifacts: { marginTop: 8 },
  blockArtifacts: { marginTop: 4 },
  reactionsRow: { flexDirection: "row", gap: 4, marginTop: 2, flexWrap: "wrap" },
  reactionBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.border },
  reactionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryTint },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600" },
  editRow: { gap: 8 },
  editInput: { fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 8, minHeight: 40 },
  editActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.surface },
  editBtnSave: { backgroundColor: COLORS.primary },
  editBtnText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  editBtnSaveText: { color: "#fff" },
  systemRow: { alignItems: "center", paddingVertical: 8 },
  systemText: { fontSize: 11, color: COLORS.textMuted, backgroundColor: COLORS.borderLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
});
