import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from "react-native";
import { COLORS } from "../constants/colors";
import type { ChatThread } from "../types/chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  threads: ChatThread[];
  onNewChat: () => void;
  onLoadThread: (id: string) => void;
}

export function ThreadsDrawer({ visible, onClose, threads, onNewChat, onLoadThread }: Props) {
  const insets = useSafeAreaInsets();

  const handleNew = () => {
    onNewChat();
    onClose();
  };

  const handleLoad = (id: string) => {
    onLoadThread(id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Conversations</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <Pressable style={styles.newBtn} onPress={handleNew}>
            <Text style={styles.newBtnIcon}>+</Text>
            <Text style={styles.newBtnText}>New Conversation</Text>
          </Pressable>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {threads.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No previous conversations</Text>
              </View>
            ) : (
              threads.map((thread) => (
                <Pressable key={thread.id} style={styles.threadItem} onPress={() => handleLoad(thread.id)}>
                  <View style={styles.threadIcon}>
                    <Text style={styles.threadIconText}>💬</Text>
                  </View>
                  <View style={styles.threadContent}>
                    <Text style={styles.threadTitle} numberOfLines={1}>{thread.title}</Text>
                    <Text style={styles.threadMsg} numberOfLines={1}>{thread.lastMessage}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "70%", paddingTop: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  close: { fontSize: 20, color: COLORS.textMuted, padding: 4 },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, padding: 14, backgroundColor: COLORS.darkNavy, borderRadius: 14, marginBottom: 16 },
  newBtnIcon: { fontSize: 18, fontWeight: "700", color: "#fff" },
  newBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  list: { flex: 1, paddingHorizontal: 20 },
  threadItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  threadIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryTint, alignItems: "center", justifyContent: "center" },
  threadIconText: { fontSize: 18 },
  threadContent: { flex: 1 },
  threadTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  threadMsg: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});
