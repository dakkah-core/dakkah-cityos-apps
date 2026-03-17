import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@/constants/colors";
import { usePos } from "@/context/PosContext";
import type { KitchenOrder } from "@/types/pos";

const STATUS_COLORS: Record<string, string> = {
  pending: BRAND.amber,
  preparing: BRAND.blue,
  ready: BRAND.teal,
  served: "#666",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
};

const NEXT_STATUS: Record<string, KitchenOrder["status"] | null> = {
  pending: "preparing",
  preparing: "ready",
  ready: "served",
  served: null,
};

export default function KitchenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { kitchenOrders, updateKitchenStatus } = usePos();
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all"
    ? kitchenOrders
    : kitchenOrders.filter((o) => o.status === filter);

  const handleAdvance = useCallback(async (order: KitchenOrder) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await updateKitchenStatus(order.id, next);
    } catch {
      Alert.alert("Error", "Failed to update status");
    }
  }, [updateKitchenStatus]);

  const getElapsed = (createdAt: string) => {
    const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return mins < 1 ? "Just now" : `${mins}m ago`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Kitchen Display</Text>
        <View style={styles.orderCount}>
          <Text style={styles.orderCountText}>{kitchenOrders.filter((o) => o.status !== "served").length} active</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {["all", "pending", "preparing", "ready", "served"].map((f) => (
          <Pressable key={f} style={[styles.filterChip, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍳</Text>
            <Text style={styles.emptyText}>No orders in queue</Text>
          </View>
        ) : (
          filtered.map((order) => (
            <View key={order.id} style={[styles.orderCard, { borderLeftColor: STATUS_COLORS[order.status] }]}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] }]}>
                  <Text style={styles.statusText}>{STATUS_LABELS[order.status]}</Text>
                </View>
                <Text style={styles.elapsed}>{getElapsed(order.createdAt)}</Text>
              </View>

              <View style={styles.orderItems}>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.orderItem}>
                    <Text style={styles.orderItemQty}>{item.quantity}x</Text>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    {item.notes && <Text style={styles.orderItemNotes}>{item.notes}</Text>}
                  </View>
                ))}
              </View>

              {NEXT_STATUS[order.status] && (
                <Pressable
                  style={[styles.advanceBtn, { backgroundColor: STATUS_COLORS[NEXT_STATUS[order.status]!] }]}
                  onPress={() => handleAdvance(order)}
                >
                  <Text style={styles.advanceBtnText}>
                    Mark as {STATUS_LABELS[NEXT_STATUS[order.status]!]}
                  </Text>
                </Pressable>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.navy },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  orderCount: { backgroundColor: "rgba(13,148,136,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  orderCountText: { color: BRAND.teal, fontSize: 12, fontWeight: "700" },
  filterBar: { maxHeight: 44, paddingLeft: 16 },
  filterContent: { gap: 8, paddingRight: 16, alignItems: "center" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  filterActive: { backgroundColor: BRAND.teal, borderColor: BRAND.teal },
  filterText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  filterTextActive: { color: "#fff" },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 12 },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "rgba(255,255,255,0.5)" },
  orderCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, borderLeftWidth: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  orderHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  orderNumber: { fontSize: 16, fontWeight: "800", color: "#fff", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  elapsed: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
  orderItems: { gap: 4, marginBottom: 12 },
  orderItem: { flexDirection: "row", gap: 8, alignItems: "center" },
  orderItemQty: { fontSize: 14, fontWeight: "700", color: BRAND.teal, width: 28 },
  orderItemName: { fontSize: 14, color: "#fff", flex: 1 },
  orderItemNotes: { fontSize: 11, color: BRAND.amber, fontStyle: "italic" },
  advanceBtn: { paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  advanceBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
