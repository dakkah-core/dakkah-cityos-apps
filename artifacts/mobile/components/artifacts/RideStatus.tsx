import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    driverName: string;
    vehicleInfo: string;
    licensePlate?: string;
    eta: string;
    status: "searching" | "arriving" | "in-progress" | "completed";
    pickup?: string;
    dropoff?: string;
    fare?: string;
    rating?: number;
  };
  onAction?: (action: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  searching: { label: "Finding driver...", color: "#92400E", bg: "#FEF3C7" },
  arriving: { label: "Driver arriving", color: "#1E40AF", bg: "#DBEAFE" },
  "in-progress": { label: "In progress", color: "#065F46", bg: "#D1FAE5" },
  completed: { label: "Completed", color: "#374151", bg: "#F3F4F6" },
};

export function RideStatus({ data, onAction }: Props) {
  const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.searching;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.carEmoji}>🚗</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.driverName}>{data.driverName}</Text>
          <Text style={styles.vehicle}>{data.vehicleInfo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      {data.licensePlate && (
        <View style={styles.plateContainer}>
          <Text style={styles.plate}>{data.licensePlate}</Text>
        </View>
      )}
      <View style={styles.route}>
        {data.pickup && (
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.routeText}>{data.pickup}</Text>
          </View>
        )}
        {data.dropoff && (
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.routeText}>{data.dropoff}</Text>
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <View style={styles.etaBox}>
          <Text style={styles.etaLabel}>ETA</Text>
          <Text style={styles.etaValue}>{data.eta}</Text>
        </View>
        {data.fare && (
          <View style={styles.etaBox}>
            <Text style={styles.etaLabel}>Fare</Text>
            <Text style={styles.etaValue}>{data.fare}</Text>
          </View>
        )}
        <Pressable style={styles.contactBtn} onPress={() => onAction?.("contact-driver")}>
          <Text style={styles.contactText}>Contact</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  carEmoji: { fontSize: 28 },
  headerInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  vehicle: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "700" },
  plateContainer: { alignSelf: "flex-start", backgroundColor: "#F3F4F6", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  plate: { fontSize: 14, fontWeight: "800", color: COLORS.text, letterSpacing: 2 },
  route: { gap: 8, marginBottom: 14 },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 13, color: COLORS.text },
  footer: { flexDirection: "row", alignItems: "center", gap: 12 },
  etaBox: { flex: 1 },
  etaLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "600" },
  etaValue: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  contactBtn: { backgroundColor: COLORS.darkNavy, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  contactText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
