import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useMerchant } from "@/context/MerchantContext";
import type { InventoryItem } from "@/types/merchant";

const STATUS_ICON: Record<string, string> = {
  in_stock: "🟢",
  low_stock: "🟡",
  out_of_stock: "🔴",
};

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { inventory, refreshInventory, setStock, isLoading } = useMerchant();
  const [filter, setFilter] = useState<"all" | "low_stock" | "out_of_stock">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStockLevel, setNewStockLevel] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = filter === "all"
    ? inventory
    : inventory.filter((i) => i.status === filter);

  const handleUpdateStock = useCallback(async (productId: string) => {
    const level = parseInt(newStockLevel);
    if (isNaN(level) || level < 0) {
      Alert.alert("Invalid", "Please enter a valid stock level.");
      return;
    }
    setUpdatingId(productId);
    await setStock(productId, level);
    setEditingId(null);
    setNewStockLevel("");
    setUpdatingId(null);
    await refreshInventory();
  }, [newStockLevel, setStock, refreshInventory]);

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => {
    const isEditing = editingId === item.productId;
    const isUpdating = updatingId === item.productId;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.statusIcon}>{STATUS_ICON[item.status]}</Text>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemSku}>SKU: {item.sku}</Text>
          </View>
          <View style={styles.stockInfo}>
            <Text style={[styles.stockLevel, item.status !== "in_stock" && styles.stockWarn]}>
              {item.stockLevel}
            </Text>
            <Text style={styles.stockLabel}>in stock</Text>
          </View>
        </View>

        <View style={styles.itemMeta}>
          <Text style={styles.threshold}>Alert threshold: {item.lowStockThreshold}</Text>
          <Text style={styles.lastRestocked}>Restocked: {new Date(item.lastRestocked).toLocaleDateString()}</Text>
        </View>

        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.stockInput}
              value={newStockLevel}
              onChangeText={setNewStockLevel}
              placeholder="New stock level"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              autoFocus
            />
            <Pressable style={styles.cancelBtn} onPress={() => { setEditingId(null); setNewStockLevel(""); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.updateBtn} onPress={() => handleUpdateStock(item.productId)} disabled={isUpdating}>
              {isUpdating ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.updateBtnText}>Update</Text>}
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.restockBtn} onPress={() => { setEditingId(item.productId); setNewStockLevel(String(item.stockLevel)); }}>
            <Text style={styles.restockBtnText}>Adjust Stock</Text>
          </Pressable>
        )}
      </View>
    );
  }, [editingId, newStockLevel, updatingId, handleUpdateStock]);

  const lowCount = inventory.filter((i) => i.status === "low_stock").length;
  const outCount = inventory.filter((i) => i.status === "out_of_stock").length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Inventory</Text>
        <Pressable style={styles.refreshBtn} onPress={refreshInventory}>
          <Text style={styles.refreshIcon}>↻</Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{inventory.length}</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={[styles.summaryItem, styles.summaryWarn]}>
          <Text style={[styles.summaryValue, { color: "#d97706" }]}>{lowCount}</Text>
          <Text style={styles.summaryLabel}>Low Stock</Text>
        </View>
        <View style={[styles.summaryItem, styles.summaryDanger]}>
          <Text style={[styles.summaryValue, { color: "#e11d48" }]}>{outCount}</Text>
          <Text style={styles.summaryLabel}>Out of Stock</Text>
        </View>
      </View>

      <View style={styles.filters}>
        {[
          { label: "All", value: "all" as const },
          { label: `Low Stock (${lowCount})`, value: "low_stock" as const },
          { label: `Out (${outCount})`, value: "out_of_stock" as const },
        ].map((f) => (
          <Pressable key={f.value} style={[styles.filterChip, filter === f.value && styles.filterActive]} onPress={() => setFilter(f.value)}>
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.empty}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.productId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No inventory items</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#0a1628", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  refreshBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  refreshIcon: { color: "#fff", fontSize: 20 },
  summary: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 10, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryItem: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.surface },
  summaryWarn: { borderWidth: 1, borderColor: "#fbbf24" },
  summaryDanger: { borderWidth: 1, borderColor: "#f87171" },
  summaryValue: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  summaryLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: "600" },
  filters: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, gap: 8, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: "#0a1628", borderColor: "#0a1628" },
  filterText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  itemCard: { backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  itemHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusIcon: { fontSize: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  itemSku: { fontSize: 11, color: COLORS.textMuted },
  stockInfo: { alignItems: "center" },
  stockLevel: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  stockWarn: { color: "#d97706" },
  stockLabel: { fontSize: 10, color: COLORS.textSecondary },
  itemMeta: { flexDirection: "row", justifyContent: "space-between" },
  threshold: { fontSize: 11, color: COLORS.textSecondary },
  lastRestocked: { fontSize: 11, color: COLORS.textSecondary },
  editRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  stockInput: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.surface },
  cancelBtnText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: 13 },
  updateBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: "#0d9488" },
  updateBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  restockBtn: { paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#3182ce", alignItems: "center" },
  restockBtnText: { color: "#3182ce", fontWeight: "600", fontSize: 13 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});
