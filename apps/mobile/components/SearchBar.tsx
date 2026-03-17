import React, { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

interface Props {
  visible: boolean;
  messages: { id: string; content: string }[];
  onClose: () => void;
  onHighlight: (messageId: string | null) => void;
}

export function SearchBar({ visible, messages, onClose, onHighlight }: Props) {
  const [query, setQuery] = useState("");
  const [matchIds, setMatchIds] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setMatchIds([]);
      setCurrentIdx(0);
      onHighlight(null);
      return;
    }
    const lower = text.toLowerCase();
    const ids = messages.filter((m) => m.content.toLowerCase().includes(lower)).map((m) => m.id);
    setMatchIds(ids);
    setCurrentIdx(0);
    if (ids.length > 0) onHighlight(ids[0]);
    else onHighlight(null);
  }, [messages, onHighlight]);

  const navigate = useCallback((dir: 1 | -1) => {
    if (matchIds.length === 0) return;
    const next = (currentIdx + dir + matchIds.length) % matchIds.length;
    setCurrentIdx(next);
    onHighlight(matchIds[next]);
  }, [matchIds, currentIdx, onHighlight]);

  if (!visible) return null;

  return (
    <View style={styles.bar}>
      <TextInput
        style={styles.input}
        placeholder="Search messages..."
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={handleSearch}
        autoFocus
        returnKeyType="search"
      />
      {matchIds.length > 0 && (
        <Text style={styles.count}>{currentIdx + 1}/{matchIds.length}</Text>
      )}
      <Pressable onPress={() => navigate(-1)} style={styles.navBtn}><Text style={styles.navText}>▲</Text></Pressable>
      <Pressable onPress={() => navigate(1)} style={styles.navBtn}><Text style={styles.navText}>▼</Text></Pressable>
      <Pressable onPress={() => { setQuery(""); onHighlight(null); onClose(); }} style={styles.closeBtn}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, fontSize: 14, color: COLORS.text },
  count: { fontSize: 12, color: COLORS.textMuted, minWidth: 30, textAlign: "center" },
  navBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 12, color: COLORS.textSecondary },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.chipBg, alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 14, color: COLORS.textSecondary },
});
