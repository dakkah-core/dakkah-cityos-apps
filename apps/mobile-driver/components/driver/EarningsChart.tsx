import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BRAND, COLORS } from "@cityos/mobile-core";
import type { EarningsDayBreakdown } from "@/types/driver";

interface EarningsChartProps {
  data: EarningsDayBreakdown[];
  height?: number;
}

export function EarningsChart({ data, height = 160 }: EarningsChartProps) {
  if (data.length === 0) return null;

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const barWidth = Math.min(32, Math.max(16, (280 - data.length * 4) / data.length));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings Trend</Text>
      <View style={[styles.chartArea, { height }]}>
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>{maxAmount.toFixed(0)}</Text>
          <Text style={styles.yLabel}>{(maxAmount / 2).toFixed(0)}</Text>
          <Text style={styles.yLabel}>0</Text>
        </View>
        <View style={styles.barsContainer}>
          {data.slice(0, 7).reverse().map((day, index) => {
            const barHeight = (day.amount / maxAmount) * (height - 30);
            return (
              <View key={day.date} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 4),
                        backgroundColor: index === data.slice(0, 7).length - 1 ? BRAND.teal : BRAND.blue,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>{day.date.split(",")[0]?.slice(0, 3) || day.date.slice(0, 3)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function TipsBreakdown({ tips, total, currency }: { tips: number; total: number; currency: string }) {
  const tipsPercentage = total > 0 ? (tips / total) * 100 : 0;
  const base = total - tips;

  return (
    <View style={styles.tipsContainer}>
      <Text style={styles.tipsTitle}>Earnings Breakdown</Text>
      <View style={styles.tipsBarBg}>
        <View style={[styles.tipsBarBase, { flex: base }]} />
        <View style={[styles.tipsBarTips, { flex: tips || 0.001 }]} />
      </View>
      <View style={styles.tipsLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BRAND.blue }]} />
          <Text style={styles.legendText}>Base: {base.toFixed(2)} {currency}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BRAND.amber }]} />
          <Text style={styles.legendText}>Tips: {tips.toFixed(2)} {currency} ({tipsPercentage.toFixed(0)}%)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  chartArea: { flexDirection: "row" },
  yAxis: { width: 36, justifyContent: "space-between", paddingBottom: 20 },
  yLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: "right" },
  barsContainer: { flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  barColumn: { alignItems: "center", flex: 1 },
  barWrapper: { justifyContent: "flex-end" },
  bar: { width: 24, borderRadius: 4, minWidth: 16 },
  barLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 4, fontWeight: "500" },
  tipsContainer: { marginHorizontal: 16, marginTop: 12, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  tipsTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  tipsBarBg: { flexDirection: "row", height: 16, borderRadius: 8, overflow: "hidden" },
  tipsBarBase: { backgroundColor: BRAND.blue },
  tipsBarTips: { backgroundColor: BRAND.amber },
  tipsLegend: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "500" },
});
