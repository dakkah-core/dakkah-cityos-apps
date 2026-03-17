import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import type { ZoneData } from "../../types/chat";

interface Props {
  data: { zones: ZoneData[] };
}

const TREND_ICON: Record<string, string> = { up: "↑", down: "↓", stable: "→" };
const TREND_COLOR: Record<string, string> = { up: COLORS.success, down: COLORS.danger, stable: COLORS.textMuted };

export function ZoneHeatmap({ data }: Props) {
  return (
    <View style={styles.container}>
      {data.zones.map((zone) => (
        <View key={zone.id} style={styles.zone}>
          <View style={styles.zoneHeader}>
            <View style={styles.zoneLeft}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <View style={styles.trendRow}>
                <Text style={[styles.trendIcon, { color: TREND_COLOR[zone.trend] }]}>{TREND_ICON[zone.trend]}</Text>
                <Text style={[styles.trendText, { color: TREND_COLOR[zone.trend] }]}>{zone.trend}</Text>
              </View>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{zone.score}</Text>
            </View>
          </View>
          <View style={styles.factors}>
            <FactorBar label="Vibes" value={zone.factors.vibes} color="#8B5CF6" />
            <FactorBar label="Activity" value={zone.factors.activity} color="#F59E0B" />
            <FactorBar label="Safety" value={zone.factors.safety} color="#10B981" />
            <FactorBar label="Events" value={zone.factors.events} color="#3B82F6" />
          </View>
        </View>
      ))}
    </View>
  );
}

function FactorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.factorRow}>
      <Text style={styles.factorLabel}>{label}</Text>
      <View style={styles.factorBarBg}>
        <View style={[styles.factorBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.factorValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  zone: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  zoneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  zoneLeft: { flex: 1 },
  zoneName: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  trendIcon: { fontSize: 12, fontWeight: "700" },
  trendText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  scoreText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  factors: { gap: 6 },
  factorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  factorLabel: { width: 50, fontSize: 10, fontWeight: "600", color: COLORS.textSecondary },
  factorBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.borderLight, overflow: "hidden" },
  factorBarFill: { height: "100%", borderRadius: 3 },
  factorValue: { width: 24, fontSize: 10, fontWeight: "600", color: COLORS.textSecondary, textAlign: "right" },
});
