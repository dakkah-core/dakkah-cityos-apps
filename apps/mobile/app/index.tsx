import React, { useCallback, useRef, useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  COLORS,
  useCopilot,
  CopilotMessage,
  DiscoverySheet,
  ThreadsDrawer,
  RightDrawer,
  DetailsDrawer,
  SearchBar,
  SlashCommandPalette,
  MentionPopover,
  GroupInfoDialog,
  AddMemberDialog,
  SharedMediaDialog,
  SupportDialog,
  FullSettingsDialog,
  ComingSoonModal,
  VoiceInputButton,
  MediaPickerButton,
  OfflineIndicator,
  CopilotSettingsDialog,
} from "@cityos/mobile-core";
import type { Message, MessageAttachment, DetailItem } from "@cityos/mobile-core";

export default function CopilotScreen() {
  const insets = useSafeAreaInsets();
  const {
    messages, threads, isProcessing, isMuted,
    sendMessage, createNewChat, loadThread, refreshThreads,
    pinMessage, editMessage, reactToMessage, toggleMute, deleteThread,
  } = useCopilot();
  const [input, setInput] = useState("");
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<DetailItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [sharedMediaOpen, setSharedMediaOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const [copilotSettingsOpen, setCopilotSettingsOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const prevMsgCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 150);
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    const text = input;
    const attachments = pendingAttachments.length > 0 ? [...pendingAttachments] : undefined;
    setInput("");
    setSlashOpen(false);
    setMentionOpen(false);
    setPendingAttachments([]);
    await sendMessage(text, replyTo || undefined, attachments);
    setReplyTo(null);
  }, [input, isProcessing, sendMessage, replyTo, pendingAttachments]);

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput(text);
  }, []);

  const handleAttach = useCallback((attachment: MessageAttachment) => {
    setPendingAttachments((prev) => [...prev, attachment]);
  }, []);

  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    if (text.startsWith("/")) {
      setSlashOpen(true);
      setSlashFilter(text);
      setMentionOpen(false);
    } else if (text.includes("@")) {
      const atIdx = text.lastIndexOf("@");
      const afterAt = text.slice(atIdx + 1);
      if (!afterAt.includes(" ")) {
        setMentionOpen(true);
        setMentionFilter(afterAt);
        setSlashOpen(false);
      } else {
        setMentionOpen(false);
      }
    } else {
      setSlashOpen(false);
      setMentionOpen(false);
    }
  }, []);

  const handleSlashSelect = useCallback(async (prompt: string) => {
    setSlashOpen(false);
    setInput("");
    await sendMessage(prompt);
  }, [sendMessage]);

  const handleMentionSelect = useCallback((name: string) => {
    const atIdx = input.lastIndexOf("@");
    const newText = input.slice(0, atIdx) + "@" + name + " ";
    setInput(newText);
    setMentionOpen(false);
  }, [input]);

  const handleChipAction = useCallback(async (action: string) => { await sendMessage(action); }, [sendMessage]);
  const handleDiscoverySelect = useCallback(async (prompt: string) => { await sendMessage(prompt); }, [sendMessage]);

  const handleShowDetails = useCallback((item: DetailItem) => {
    setDetailsItem(item);
    setDetailsOpen(true);
  }, []);

  const handleDetailsAction = useCallback(async (message: string) => { await sendMessage(message); }, [sendMessage]);
  const handleRightDrawerAction = useCallback(async (message: string) => { await sendMessage(message); }, [sendMessage]);

  const handleReply = useCallback((message: Message) => { setReplyTo(message); }, []);

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <CopilotMessage
      message={item}
      onAction={handleChipAction}
      onShowDetails={handleShowDetails}
      onReply={handleReply}
      onPin={pinMessage}
      onEdit={editMessage}
      onReact={reactToMessage}
      highlighted={highlightedId === item.id}
    />
  ), [handleChipAction, handleShowDetails, handleReply, pinMessage, editMessage, reactToMessage, highlightedId]);

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
        <Pressable style={styles.headerBtn} onPress={() => setSearchOpen(!searchOpen)}>
          <Text style={styles.headerBtnIcon}>🔍</Text>
        </Pressable>
        <Pressable style={styles.headerBtn} onPress={() => setComingSoonFeature("Voice Call")}>
          <Text style={styles.headerBtnIcon}>📞</Text>
        </Pressable>
        <Pressable style={[styles.headerBtn, isMuted && styles.mutedBtn]} onPress={toggleMute}>
          <Text style={styles.headerBtnIcon}>{isMuted ? "🔇" : "🔔"}</Text>
        </Pressable>
        <Pressable style={styles.contextBtn} onPress={() => setRightDrawerOpen(true)}>
          <Text style={styles.contextIcon}>☷</Text>
        </Pressable>
        <Pressable style={styles.discoverBtn} onPress={() => setDiscoveryOpen(true)}>
          <Text style={styles.discoverIcon}>◉</Text>
        </Pressable>
      </View>

      <OfflineIndicator />

      {searchOpen && (
        <SearchBar
          visible={searchOpen}
          messages={messages}
          onClose={() => { setSearchOpen(false); setHighlightedId(null); }}
          onHighlight={setHighlightedId}
        />
      )}

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        <View style={styles.flex}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          />

          {slashOpen && (
            <SlashCommandPalette visible={slashOpen} filter={slashFilter} onSelect={handleSlashSelect} onClose={() => setSlashOpen(false)} />
          )}
          {mentionOpen && (
            <MentionPopover visible={mentionOpen} filter={mentionFilter} onSelect={handleMentionSelect} />
          )}
        </View>

        {isProcessing && (
          <View style={styles.typingRow}>
            <View style={styles.typingDot} />
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.typingText}>Copilot is thinking...</Text>
          </View>
        )}

        {replyTo && (
          <View style={styles.replyBar}>
            <View style={styles.replyIndicator} />
            <View style={styles.replyContent}>
              <Text style={styles.replyLabel}>Replying to</Text>
              <Text style={styles.replyPreview} numberOfLines={1}>{replyTo.content}</Text>
            </View>
            <Pressable onPress={() => setReplyTo(null)} style={styles.replyCancelBtn}>
              <Text style={styles.replyCancelText}>✕</Text>
            </Pressable>
          </View>
        )}

        {pendingAttachments.length > 0 && (
          <View style={styles.attachPreviewRow}>
            {pendingAttachments.map((a, i) => (
              <View key={i} style={styles.attachChip}>
                <Text style={styles.attachChipIcon}>{a.type === "image" ? "🖼️" : "📄"}</Text>
                <Text style={styles.attachChipText} numberOfLines={1}>{a.name}</Text>
                <Pressable onPress={() => setPendingAttachments((prev) => prev.filter((_, j) => j !== i))}>
                  <Text style={styles.attachChipRemove}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <MediaPickerButton onAttach={handleAttach} disabled={isProcessing} />
          <TextInput
            style={styles.input}
            placeholder="Ask Dakkah anything..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
          />
          <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isProcessing} />
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
      <ThreadsDrawer
        visible={threadsOpen}
        onClose={() => setThreadsOpen(false)}
        threads={threads}
        onNewChat={createNewChat}
        onLoadThread={loadThread}
        onRefresh={refreshThreads}
        onOpenSettings={() => { setThreadsOpen(false); setSettingsOpen(true); }}
        onOpenCopilotSettings={() => { setThreadsOpen(false); setCopilotSettingsOpen(true); }}
        onOpenSupport={() => { setThreadsOpen(false); setSupportOpen(true); }}
        onOpenGroupInfo={() => { setThreadsOpen(false); setGroupInfoOpen(true); }}
        onOpenSharedMedia={() => { setThreadsOpen(false); setSharedMediaOpen(true); }}
        onDeleteThread={deleteThread}
      />
      <RightDrawer visible={rightDrawerOpen} onClose={() => setRightDrawerOpen(false)} onAction={handleRightDrawerAction} />
      <DetailsDrawer visible={detailsOpen} item={detailsItem} onClose={() => { setDetailsOpen(false); setDetailsItem(null); }} onAction={handleDetailsAction} />
      <GroupInfoDialog visible={groupInfoOpen} onClose={() => setGroupInfoOpen(false)} onAddMember={() => { setGroupInfoOpen(false); setAddMemberOpen(true); }} />
      <AddMemberDialog visible={addMemberOpen} onClose={() => setAddMemberOpen(false)} />
      <SharedMediaDialog visible={sharedMediaOpen} onClose={() => setSharedMediaOpen(false)} />
      <SupportDialog visible={supportOpen} onClose={() => setSupportOpen(false)} />
      <FullSettingsDialog visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ComingSoonModal visible={!!comingSoonFeature} feature={comingSoonFeature || ""} onClose={() => setComingSoonFeature(null)} />
      <CopilotSettingsDialog visible={copilotSettingsOpen} onClose={() => setCopilotSettingsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  flex: { flex: 1 },
  header: { backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 10, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 4 },
  menuBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  menuIcon: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerCenter: { flex: 1, marginHorizontal: 4 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  logoText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  headerSub: { fontSize: 10, color: COLORS.textSecondary, fontWeight: "500" },
  headerBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  headerBtnIcon: { fontSize: 14 },
  mutedBtn: { backgroundColor: COLORS.primaryTint },
  contextBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  contextIcon: { color: COLORS.textSecondary, fontSize: 16 },
  discoverBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primaryTint, alignItems: "center", justifyContent: "center" },
  discoverIcon: { color: COLORS.primary, fontSize: 16 },
  chatContent: { paddingTop: 16, paddingBottom: 8 },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  typingText: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" },
  replyBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primaryTint, borderTopWidth: 1, borderTopColor: COLORS.border },
  replyIndicator: { width: 3, height: 20, borderRadius: 1.5, backgroundColor: COLORS.primary },
  replyContent: { flex: 1 },
  replyLabel: { fontSize: 10, fontWeight: "600", color: COLORS.primary },
  replyPreview: { fontSize: 12, color: COLORS.textSecondary },
  replyCancelBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.chipBg, alignItems: "center", justifyContent: "center" },
  replyCancelText: { fontSize: 12, color: COLORS.textSecondary },
  attachPreviewRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border },
  attachChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.primaryTint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, maxWidth: 160 },
  attachChipIcon: { fontSize: 12 },
  attachChipText: { fontSize: 11, color: COLORS.text, flex: 1 },
  attachChipRemove: { fontSize: 10, color: COLORS.textMuted, paddingLeft: 4 },
  inputBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingTop: 10, backgroundColor: COLORS.surfaceWhite, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.text, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.3 },
  sendIcon: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
