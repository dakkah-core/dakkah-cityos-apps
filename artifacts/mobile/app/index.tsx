import React, { useCallback, useRef, useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { useCopilot } from "@/context/ChatContext";
import { CopilotMessage } from "@/components/CopilotMessage";
import { DiscoverySheet } from "@/components/DiscoverySheet";
import { ThreadsDrawer } from "@/components/ThreadsDrawer";
import { RightDrawer } from "@/components/RightDrawer";
import { DetailsDrawer, type DetailItem } from "@/components/DetailsDrawer";
import type { Message } from "@/types/chat";

export default function CopilotScreen() {
  const insets = useSafeAreaInsets();
  const { messages, threads, isProcessing, sendMessage, createNewChat, loadThread, refreshThreads } = useCopilot();
  const [input, setInput] = useState("");
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<DetailItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const prevMsgCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  }, [input, isProcessing, sendMessage]);

  const handleChipAction = useCallback(async (action: string) => {
    await sendMessage(action);
  }, [sendMessage]);

  const handleDiscoverySelect = useCallback(async (prompt: string) => {
    await sendMessage(prompt);
  }, [sendMessage]);

  const handleShowDetails = useCallback((item: DetailItem) => {
    setDetailsItem(item);
    setDetailsOpen(true);
  }, []);

  const handleDetailsAction = useCallback(async (message: string) => {
    await sendMessage(message);
  }, [sendMessage]);

  const handleRightDrawerAction = useCallback(async (message: string) => {
    await sendMessage(message);
  }, [sendMessage]);

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <CopilotMessage message={item} onAction={handleChipAction} onShowDetails={handleShowDetails} />
  ), [handleChipAction, handleShowDetails]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.menuBtn} onPress={() => setThreadsOpen(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.logoRow}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>✦</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Dakkah</Text>
              <Text style={styles.headerSub}>City Experience OS</Text>
            </View>
          </View>
        </View>
        <Pressable style={styles.contextBtn} onPress={() => setRightDrawerOpen(true)}>
          <Text style={styles.contextIcon}>☷</Text>
        </Pressable>
        <Pressable style={styles.discoverBtn} onPress={() => setDiscoveryOpen(true)}>
          <Text style={styles.discoverIcon}>◉</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          
        />

        {isProcessing && (
          <View style={styles.typingRow}>
            <View style={styles.typingDot} />
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.typingText}>Copilot is thinking...</Text>
          </View>
        )}

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable style={styles.compassBtn} onPress={() => setDiscoveryOpen(true)}>
            <Text style={styles.compassIcon}>◎</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Ask Dakkah anything..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || isProcessing) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isProcessing}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <DiscoverySheet visible={discoveryOpen} onClose={() => setDiscoveryOpen(false)} onSelect={handleDiscoverySelect} />
      <ThreadsDrawer visible={threadsOpen} onClose={() => setThreadsOpen(false)} threads={threads} onNewChat={createNewChat} onLoadThread={loadThread} onRefresh={refreshThreads} />
      <RightDrawer visible={rightDrawerOpen} onClose={() => setRightDrawerOpen(false)} onAction={handleRightDrawerAction} />
      <DetailsDrawer visible={detailsOpen} item={detailsItem} onClose={() => { setDetailsOpen(false); setDetailsItem(null); }} onAction={handleDetailsAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  flex: { flex: 1 },
  header: { backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  menuIcon: { color: "#fff", fontSize: 18, fontWeight: "600" },
  headerCenter: { flex: 1, marginHorizontal: 4 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  logoText: { color: COLORS.primary, fontSize: 16, fontWeight: "700" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  headerSub: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "500" },
  contextBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  contextIcon: { color: COLORS.textSecondary, fontSize: 20 },
  discoverBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryTint, alignItems: "center", justifyContent: "center" },
  discoverIcon: { color: COLORS.primary, fontSize: 20 },
  chatContent: { paddingTop: 16, paddingBottom: 8 },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  typingText: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" },
  inputBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingTop: 10, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border },
  compassBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.chipBg, alignItems: "center", justifyContent: "center" },
  compassIcon: { fontSize: 18, color: COLORS.textSecondary },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.text, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.3 },
  sendIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
