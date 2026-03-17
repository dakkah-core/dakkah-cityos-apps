import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import type { AnalyticsMetric } from "../../types/chat";

interface Props {
  data: { title: string; metrics: AnalyticsMetric[] };
}

const TREND_ICON: Record<string, string> = { up: "↑", down: "↓", neutral: "→" };
const TREND_COLOR: Record<string, string> = { up: COLORS.success, down: COLORS.danger, neutral: COLORS.textMuted };

export function AnalyticsSnapshot({ data }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      <View style={styles.grid}>
        {data.metrics.map((m) => (
          <View key={m.label} style={styles.metric}>
            <Text style={styles.metricValue}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
            {m.trend && m.trendValue && (
              <View style={styles.trendRow}>
                <Text style={[styles.trendIcon, { color: TREND_COLOR[m.trend] }]}>{TREND_ICON[m.trend]}</Text>
                <Text style={[styles.trendText, { color: TREND_COLOR[m.trend] }]}>{m.trendValue}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: { width: "47%", backgroundColor: COLORS.borderLight, borderRadius: 12, padding: 12 },
  metricValue: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  metricLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  trendIcon: { fontSize: 12, fontWeight: "700" },
  trendText: { fontSize: 11, fontWeight: "600" },
});
