import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, BRAND } from "@cityos/mobile-core";
import { useDriver } from "@/context/DriverContext";
import { hapticMedium } from "@/lib/haptics";
import type { DriverStatus } from "@/types/driver";

const STATUS_CONFIG: Record<DriverStatus, { label: string; color: string; bg: string }> = {
  online: { label: "Online", color: "#fff", bg: BRAND.teal },
  offline: { label: "Offline", color: "#fff", bg: "#64748b" },
  break: { label: "On Break", color: "#fff", bg: BRAND.amber },
};

export function StatusToggle() {
  const { status, setStatus } = useDriver();
  const config = STATUS_CONFIG[status];

  const statuses: DriverStatus[] = ["offline", "online", "break"];

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        {statuses.map((s) => {
          const c = STATUS_CONFIG[s];
          const isActive = status === s;
          return (
            <Pressable
              key={s}
              style={[styles.toggleBtn, isActive && { backgroundColor: c.bg }]}
              onPress={() => { hapticMedium(); setStatus(s); }}
            >
              <Text style={[styles.toggleText, isActive && { color: c.color }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.statusIndicator, { backgroundColor: config.bg }]}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{config.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12 },
  toggleRow: { flexDirection: "row", gap: 6, backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  toggleText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  statusIndicator: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 8, paddingVertical: 6, borderRadius: 8, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
