import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    zone: string;
    spot?: string;
    timeRemaining: string;
    rate: string;
    status: "active" | "expired" | "free";
    vehiclePlate?: string;
  };
  onAction?: (action: string) => void;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  expired: { bg: "#FEE2E2", color: "#991B1B", label: "Expired" },
  free: { bg: "#EFF6FF", color: "#1E40AF", label: "Available" },
};

export function ParkingMeter({ data, onAction }: Props) {
  const s = STATUS_STYLE[data.status] || STATUS_STYLE.active;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🅿️</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.zone}>{data.zone}</Text>
          {data.spot && <Text style={styles.spot}>Spot {data.spot}</Text>}
        </View>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Time Remaining</Text>
        <Text style={styles.timeValue}>{data.timeRemaining}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detail}>Rate: {data.rate}</Text>
        {data.vehiclePlate && <Text style={styles.detail}>Vehicle: {data.vehiclePlate}</Text>}
      </View>
      <Pressable style={styles.btn} onPress={() => onAction?.("extend-parking")}>
        <Text style={styles.btnText}>Extend Time</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  icon: { fontSize: 28 },
  headerInfo: { flex: 1 },
  zone: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  spot: { fontSize: 12, color: COLORS.textSecondary },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  timeRow: { alignItems: "center", marginBottom: 12 },
  timeLabel: { fontSize: 11, color: COLORS.textMuted },
  timeValue: { fontSize: 28, fontWeight: "800", color: COLORS.text },
  details: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  detail: { fontSize: 12, color: COLORS.textSecondary },
  btn: { backgroundColor: COLORS.darkNavy, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  btnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
