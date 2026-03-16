import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Modal } from "react-native";
import { COLORS } from "../constants/colors";
import { CATEGORIES, QUICK_ACTIONS } from "../lib/discovery-data";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

export function DiscoverySheet({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    let items = QUICK_ACTIONS;
    if (activeCategory !== "all") {
      items = items.filter((a) => a.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((a) => a.title.toLowerCase().includes(q) || a.prompt.toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, search]);

  const handleSelect = (prompt: string) => {
    onSelect(prompt);
    onClose();
    setSearch("");
    setActiveCategory("all");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Explore</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search actions..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats} style={styles.catsScroll}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[styles.catPill, activeCategory === cat.id && { backgroundColor: COLORS.darkNavy, borderColor: COLORS.darkNavy }]}
              >
                <Text style={[styles.catText, activeCategory === cat.id && { color: "#fff" }]}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {filtered.map((action) => {
              const cat = CATEGORIES.find((c) => c.id === action.category);
              return (
                <Pressable key={action.id} style={styles.actionItem} onPress={() => handleSelect(action.prompt)}>
                  <View style={[styles.actionIcon, { backgroundColor: cat?.bgColor || COLORS.chipBg }]}>
                    <Text style={styles.actionIconText}>{cat?.icon || "●"}</Text>
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionPrompt} numberOfLines={1}>{action.prompt}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", paddingTop: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  close: { fontSize: 20, color: COLORS.textMuted, padding: 4 },
  searchRow: { paddingHorizontal: 20, marginBottom: 12 },
  searchInput: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  catsScroll: { maxHeight: 44, marginBottom: 8 },
  cats: { paddingHorizontal: 20, gap: 8 },
  catPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.chipBg, borderWidth: 1, borderColor: COLORS.chipBorder },
  catText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 4 },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionIconText: { fontSize: 14 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  actionPrompt: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
});
