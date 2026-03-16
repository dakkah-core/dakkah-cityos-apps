import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface Metric {
  label: string;
  value: string;
  unit?: string;
  status?: "normal" | "warning" | "alert";
  icon?: string;
}

interface Props {
  data: {
    title?: string;
    metrics: Metric[];
    lastUpdated?: string;
  };
}

const STATUS_COLORS: Record<string, string> = { normal: COLORS.success, warning: COLORS.warning, alert: COLORS.danger };

export function HealthSnapshot({ data }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title || "Health Snapshot"}</Text>
      <View style={styles.grid}>
        {data.metrics.map((m, i) => (
          <View key={i} style={styles.metricCard}>
            <Text style={styles.metricIcon}>{m.icon || "❤️"}</Text>
            <Text style={styles.metricValue}>{m.value}{m.unit ? ` ${m.unit}` : ""}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
            {m.status && <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[m.status] || COLORS.success }]} />}
          </View>
        ))}
      </View>
      {data.lastUpdated && <Text style={styles.updated}>Updated {data.lastUpdated}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metricCard: { width: "47%", backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: "center", position: "relative" },
  metricIcon: { fontSize: 20, marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  metricLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statusDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  updated: { fontSize: 11, color: COLORS.textMuted, textAlign: "center", marginTop: 10 },
});
