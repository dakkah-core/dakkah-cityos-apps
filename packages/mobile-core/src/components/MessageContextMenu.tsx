import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { REACTION_EMOJIS } from "../lib/contacts";

interface Props {
  visible: boolean;
  isUserMessage: boolean;
  onClose: () => void;
  onReply: () => void;
  onPin: () => void;
  onEdit: () => void;
  onReact: (emoji: string) => void;
  isPinned?: boolean;
}

export function MessageContextMenu({ visible, isUserMessage, onClose, onReply, onPin, onEdit, onReact, isPinned }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menu}>
          <View style={styles.emojiRow}>
            {REACTION_EMOJIS.map((emoji) => (
              <Pressable key={emoji} style={styles.emojiBtn} onPress={() => { onReact(emoji); onClose(); }}>
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.action} onPress={() => { onReply(); onClose(); }}>
            <Text style={styles.actionIcon}>↩</Text>
            <Text style={styles.actionText}>Reply</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={() => { onPin(); onClose(); }}>
            <Text style={styles.actionIcon}>📌</Text>
            <Text style={styles.actionText}>{isPinned ? "Unpin" : "Pin"}</Text>
          </Pressable>
          {isUserMessage && (
            <Pressable style={styles.action} onPress={() => { onEdit(); onClose(); }}>
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "center", alignItems: "center" },
  menu: { backgroundColor: COLORS.surfaceWhite, borderRadius: 16, padding: 12, width: 260, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  emojiRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8 },
  emojiBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 20 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  action: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8 },
  actionIcon: { fontSize: 16 },
  actionText: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
});
