import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@/constants/colors";
import { useMerchant } from "@/context/MerchantContext";
import type { Booking, TableInfo } from "@/types/merchant";

const BOOKING_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  seated: { bg: "#d1fae5", text: "#065f46" },
  completed: { bg: "#f0fdf4", text: "#166534" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
  no_show: { bg: "#fce7f3", text: "#9d174d" },
};

const TABLE_STATUS_COLORS: Record<string, string> = {
  available: BRAND.teal,
  occupied: BRAND.amber,
  reserved: BRAND.blue,
  maintenance: "#6b7280",
};

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    bookings, tables, isLoading,
    refreshBookings, confirmBooking, cancelBooking, seatBooking, completeBooking, refreshTables,
  } = useMerchant();
  const [tab, setTab] = useState<"bookings" | "tables">("bookings");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = useCallback(async (bookingId: string, action: "confirm" | "cancel" | "seat" | "complete") => {
    setProcessingId(bookingId);
    const fns = { confirm: confirmBooking, cancel: cancelBooking, seat: seatBooking, complete: completeBooking };
    await fns[action](bookingId);
    setProcessingId(null);
  }, [confirmBooking, cancelBooking, seatBooking, completeBooking]);

  const renderBooking = useCallback(({ item }: { item: Booking }) => {
    const statusStyle = BOOKING_STATUS_COLORS[item.status] || BOOKING_STATUS_COLORS.pending;
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View>
            <Text style={styles.bookingName}>{item.customerName}</Text>
            <Text style={styles.bookingPhone}>{item.customerPhone}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status.replace("_", " ").toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.bookingDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>👥</Text>
            <Text style={styles.detailText}>{item.partySize} guests</Text>
          </View>
          {item.tableId && (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🪑</Text>
              <Text style={styles.detailText}>{tables.find((t) => t.id === item.tableId)?.name || item.tableId}</Text>
            </View>
          )}
        </View>
        {item.notes && <Text style={styles.bookingNotes}>Note: {item.notes}</Text>}

        {item.status === "pending" && (
          <View style={styles.actionRow}>
            <Pressable style={styles.cancelBtnAction} onPress={() => handleAction(item.id, "cancel")} disabled={isProcessing}>
              <Text style={styles.cancelBtnText}>Decline</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={() => handleAction(item.id, "confirm")} disabled={isProcessing}>
              {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm</Text>}
            </Pressable>
          </View>
        )}
        {item.status === "confirmed" && (
          <Pressable style={styles.seatBtn} onPress={() => handleAction(item.id, "seat")} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.seatBtnText}>Seat Guests</Text>}
          </Pressable>
        )}
        {item.status === "seated" && (
          <Pressable style={styles.completeBtn} onPress={() => handleAction(item.id, "complete")} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.completeBtnText}>Complete</Text>}
          </Pressable>
        )}
      </View>
    );
  }, [processingId, tables, handleAction]);

  const renderTable = useCallback(({ item }: { item: TableInfo }) => (
    <View style={styles.tableCard}>
      <View style={[styles.tableStatus, { backgroundColor: TABLE_STATUS_COLORS[item.status] || "#6b7280" }]} />
      <View style={styles.tableInfo}>
        <Text style={styles.tableName}>{item.name}</Text>
        <Text style={styles.tableCapacity}>Capacity: {item.capacity}</Text>
      </View>
      <View style={[styles.tableStatusBadge, { backgroundColor: TABLE_STATUS_COLORS[item.status] + "20" }]}>
        <Text style={[styles.tableStatusText, { color: TABLE_STATUS_COLORS[item.status] }]}>
          {item.status.replace("_", " ").toUpperCase()}
        </Text>
      </View>
    </View>
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Bookings</Text>
        <Pressable style={styles.refreshBtnHeader} onPress={() => { refreshBookings(); refreshTables(); }}>
          <Text style={styles.refreshIcon}>↻</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === "bookings" && styles.tabActive]} onPress={() => setTab("bookings")}>
          <Text style={[styles.tabText, tab === "bookings" && styles.tabTextActive]}>Reservations ({bookings.length})</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === "tables" && styles.tabActive]} onPress={() => setTab("tables")}>
          <Text style={[styles.tabText, tab === "tables" && styles.tabTextActive]}>Tables ({tables.length})</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.empty}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : tab === "bookings" ? (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No bookings today</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={tables}
          renderItem={renderTable}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🪑</Text>
              <Text style={styles.emptyText}>No tables configured</Text>
            </View>
          }
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
  refreshBtnHeader: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  refreshIcon: { color: "#fff", fontSize: 20 },
  tabs: { flexDirection: "row", backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: BRAND.navy },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  tabTextActive: { color: BRAND.navy },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  bookingCard: { backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bookingName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  bookingPhone: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "700" },
  bookingDetails: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailIcon: { fontSize: 14 },
  detailText: { fontSize: 13, color: COLORS.text },
  bookingNotes: { fontSize: 12, color: BRAND.amber, fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtnAction: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: BRAND.rose, alignItems: "center" },
  cancelBtnText: { color: BRAND.rose, fontWeight: "700", fontSize: 14 },
  confirmBtn: { flex: 2, paddingVertical: 10, borderRadius: 10, backgroundColor: BRAND.teal, alignItems: "center" },
  confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  seatBtn: { paddingVertical: 10, borderRadius: 10, backgroundColor: BRAND.blue, alignItems: "center", marginTop: 4 },
  seatBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  completeBtn: { paddingVertical: 10, borderRadius: 10, backgroundColor: BRAND.teal, alignItems: "center", marginTop: 4 },
  completeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  tableCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  tableStatus: { width: 4, height: 40, borderRadius: 2 },
  tableInfo: { flex: 1 },
  tableName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  tableCapacity: { fontSize: 12, color: COLORS.textSecondary },
  tableStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tableStatusText: { fontSize: 10, fontWeight: "700" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});
