import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@/constants/colors";
import { useMerchant } from "@/context/MerchantContext";
import type { MerchantOrder, OrderStatus } from "@/types/merchant";

const STATUS_FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  accepted: { bg: "#dbeafe", text: "#1e40af" },
  preparing: { bg: "#e0e7ff", text: "#3730a3" },
  ready: { bg: "#d1fae5", text: "#065f46" },
  picked_up: { bg: "#e0f2fe", text: "#075985" },
  delivered: { bg: "#f0fdf4", text: "#166534" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
  rejected: { bg: "#fce7f3", text: "#9d174d" },
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, isLoading, refreshOrders, acceptOrder, rejectOrder, markPreparing, markReady } = useMerchant();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleAccept = useCallback(async (orderId: string) => {
    setProcessingId(orderId);
    await acceptOrder(orderId);
    setProcessingId(null);
  }, [acceptOrder]);

  const handleReject = useCallback(async (orderId: string) => {
    if (!rejectReason.trim()) {
      Alert.alert("Reason Required", "Please provide a reason for rejecting the order.");
      return;
    }
    setProcessingId(orderId);
    await rejectOrder(orderId, rejectReason);
    setRejectingId(null);
    setRejectReason("");
    setProcessingId(null);
  }, [rejectOrder, rejectReason]);

  const handleMarkPreparing = useCallback(async (orderId: string) => {
    setProcessingId(orderId);
    await markPreparing(orderId);
    setProcessingId(null);
  }, [markPreparing]);

  const handleMarkReady = useCallback(async (orderId: string) => {
    setProcessingId(orderId);
    await markReady(orderId);
    setProcessingId(null);
  }, [markReady]);

  const renderOrder = useCallback(({ item }: { item: MerchantOrder }) => {
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status.replace("_", " ").toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.orderMeta}>
          <Text style={styles.customerName}>{item.customer.name}</Text>
          <Text style={styles.deliveryType}>
            {item.deliveryType === "dine_in" ? "🍽 Dine-in" : item.deliveryType === "pickup" ? "🏃 Pickup" : "🚗 Delivery"}
          </Text>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((itm, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemQty}>{itm.quantity}x</Text>
              <Text style={styles.itemName}>{itm.name}</Text>
              {itm.variant && <Text style={styles.itemVariant}>({itm.variant})</Text>}
              <Text style={styles.itemPrice}>{(itm.price * itm.quantity).toFixed(2)}</Text>
            </View>
          ))}
          {item.notes && <Text style={styles.orderNotes}>Note: {item.notes}</Text>}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>{item.total.toFixed(2)} {item.currency}</Text>
          <Text style={styles.prepTime}>~{item.estimatedPrepTime} min</Text>
        </View>

        {rejectingId === item.id && (
          <View style={styles.rejectBox}>
            <TextInput
              style={styles.rejectInput}
              placeholder="Reason for rejection..."
              placeholderTextColor={COLORS.textMuted}
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View style={styles.rejectActions}>
              <Pressable style={styles.rejectCancelBtn} onPress={() => { setRejectingId(null); setRejectReason(""); }}>
                <Text style={styles.rejectCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.rejectConfirmBtn} onPress={() => handleReject(item.id)} disabled={isProcessing}>
                <Text style={styles.rejectConfirmText}>Confirm Reject</Text>
              </Pressable>
            </View>
          </View>
        )}

        {item.status === "pending" && rejectingId !== item.id && (
          <View style={styles.actionRow}>
            <Pressable style={styles.rejectBtn} onPress={() => setRejectingId(item.id)} disabled={isProcessing}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </Pressable>
            <Pressable style={styles.acceptBtn} onPress={() => handleAccept(item.id)} disabled={isProcessing}>
              {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.acceptBtnText}>Accept</Text>}
            </Pressable>
          </View>
        )}

        {item.status === "accepted" && (
          <Pressable style={styles.prepBtn} onPress={() => handleMarkPreparing(item.id)} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.prepBtnText}>Start Preparing</Text>}
          </Pressable>
        )}

        {item.status === "preparing" && (
          <Pressable style={styles.readyBtn} onPress={() => handleMarkReady(item.id)} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.readyBtnText}>Mark Ready</Text>}
          </Pressable>
        )}
      </View>
    );
  }, [processingId, rejectingId, rejectReason, handleAccept, handleReject, handleMarkPreparing, handleMarkReady]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Orders</Text>
        <Pressable style={styles.refreshBtn} onPress={refreshOrders}>
          <Text style={styles.refreshIcon}>↻</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {STATUS_FILTERS.map((f) => (
          <Pressable key={f.value} style={[styles.filterChip, filter === f.value && styles.filterActive]} onPress={() => setFilter(f.value)}>
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: BRAND.navy, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  refreshBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  refreshIcon: { color: "#fff", fontSize: 20 },
  filters: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: BRAND.navy, borderColor: BRAND.navy },
  filterText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  filterTextActive: { color: "#fff" },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  orderCard: { backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderNumber: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  orderTime: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "700" },
  orderMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  customerName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  deliveryType: { fontSize: 12, color: COLORS.textSecondary },
  itemsList: { gap: 4, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemQty: { fontSize: 13, fontWeight: "700", color: COLORS.primary, width: 24 },
  itemName: { flex: 1, fontSize: 13, color: COLORS.text },
  itemVariant: { fontSize: 11, color: COLORS.textSecondary },
  itemPrice: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  orderNotes: { fontSize: 12, color: BRAND.amber, fontStyle: "italic", marginTop: 4 },
  orderFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  orderTotal: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  prepTime: { fontSize: 13, color: COLORS.textSecondary },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  rejectBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: BRAND.rose, alignItems: "center" },
  rejectBtnText: { color: BRAND.rose, fontWeight: "700", fontSize: 14 },
  acceptBtn: { flex: 2, paddingVertical: 10, borderRadius: 10, backgroundColor: BRAND.teal, alignItems: "center" },
  acceptBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  prepBtn: { paddingVertical: 10, borderRadius: 10, backgroundColor: BRAND.blue, alignItems: "center", marginTop: 4 },
  prepBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  readyBtn: { paddingVertical: 10, borderRadius: 10, backgroundColor: BRAND.teal, alignItems: "center", marginTop: 4 },
  readyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  rejectBox: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, gap: 8 },
  rejectInput: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 10, fontSize: 13, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  rejectActions: { flexDirection: "row", gap: 10 },
  rejectCancelBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: "center" },
  rejectCancelText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: 13 },
  rejectConfirmBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: BRAND.rose, alignItems: "center" },
  rejectConfirmText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});
