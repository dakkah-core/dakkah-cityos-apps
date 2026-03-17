import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BRAND, COLORS } from "@cityos/mobile-core";
import type { EarningsDayBreakdown } from "@/types/driver";

type ChartMode = "bar" | "line";

interface EarningsChartProps {
  data: EarningsDayBreakdown[];
  height?: number;
}

export function EarningsChart({ data, height = 160 }: EarningsChartProps) {
  const [mode, setMode] = useState<ChartMode>("bar");

  if (data.length === 0) return null;

  const displayData = data.slice(0, 7).reverse();
  const maxAmount = Math.max(...displayData.map((d) => d.amount), 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Earnings Trend</Text>
        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeBtn, mode === "bar" && styles.modeBtnActive]}
            onPress={() => setMode("bar")}
          >
            <Text style={[styles.modeBtnText, mode === "bar" && styles.modeBtnTextActive]}>Bar</Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, mode === "line" && styles.modeBtnActive]}
            onPress={() => setMode("line")}
          >
            <Text style={[styles.modeBtnText, mode === "line" && styles.modeBtnTextActive]}>Line</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.chartArea, { height }]}>
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>{maxAmount.toFixed(0)}</Text>
          <Text style={styles.yLabel}>{(maxAmount / 2).toFixed(0)}</Text>
          <Text style={styles.yLabel}>0</Text>
        </View>

        {mode === "bar" ? (
          <View style={styles.barsContainer}>
            {displayData.map((day, index) => {
              const barHeight = (day.amount / maxAmount) * (height - 30);
              return (
                <View key={day.date} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, 4),
                          backgroundColor: index === displayData.length - 1 ? BRAND.teal : BRAND.blue,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel} numberOfLines={1}>{day.date.split(",")[0]?.slice(0, 3) || day.date.slice(0, 3)}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.lineContainer}>
            <View style={styles.lineChart}>
              {displayData.map((day, index) => {
                const y = ((maxAmount - day.amount) / maxAmount) * (height - 50);
                const x = (index / Math.max(displayData.length - 1, 1)) * 100;
                return (
                  <View
                    key={day.date}
                    style={[
                      styles.lineDot,
                      {
                        left: `${x}%`,
                        top: y,
                      },
                    ]}
                  >
                    <View style={styles.lineDotInner} />
                    <Text style={styles.lineDotValue}>{day.amount.toFixed(0)}</Text>
                  </View>
                );
              })}
              {displayData.length > 1 && displayData.map((day, index) => {
                if (index === 0) return null;
                const prev = displayData[index - 1];
                const y1 = ((maxAmount - prev.amount) / maxAmount) * (height - 50) + 6;
                const y2 = ((maxAmount - day.amount) / maxAmount) * (height - 50) + 6;
                const x1 = ((index - 1) / Math.max(displayData.length - 1, 1)) * 100;
                const x2 = (index / Math.max(displayData.length - 1, 1)) * 100;
                const length = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                return (
                  <View
                    key={`line-${index}`}
                    style={[
                      styles.lineSegment,
                      {
                        left: `${x1}%`,
                        top: y1,
                        width: `${x2 - x1}%`,
                        transform: [{ rotate: `${angle}deg` }],
                        transformOrigin: "left center",
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.lineLabels}>
              {displayData.map((day) => (
                <Text key={day.date} style={styles.lineLabel} numberOfLines={1}>
                  {day.date.split(",")[0]?.slice(0, 3) || day.date.slice(0, 3)}
                </Text>
              ))}
            </View>
          </View>
        )}
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  modeToggle: { flexDirection: "row", borderRadius: 6, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: COLORS.surface },
  modeBtnActive: { backgroundColor: BRAND.blue },
  modeBtnText: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  modeBtnTextActive: { color: "#fff" },
  chartArea: { flexDirection: "row" },
  yAxis: { width: 36, justifyContent: "space-between", paddingBottom: 20 },
  yLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: "right" },
  barsContainer: { flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  barColumn: { alignItems: "center", flex: 1 },
  barWrapper: { justifyContent: "flex-end" },
  bar: { width: 24, borderRadius: 4, minWidth: 16 },
  barLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 4, fontWeight: "500" },
  lineContainer: { flex: 1 },
  lineChart: { flex: 1, position: "relative" },
  lineDot: { position: "absolute", alignItems: "center", marginLeft: -6 },
  lineDotInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND.teal, borderWidth: 2, borderColor: "#fff" },
  lineDotValue: { fontSize: 9, color: COLORS.textSecondary, marginTop: 2, fontWeight: "600" },
  lineSegment: { position: "absolute", height: 2, backgroundColor: BRAND.teal + "80" },
  lineLabels: { flexDirection: "row", justifyContent: "space-between", paddingTop: 4, borderTopWidth: 1, borderTopColor: COLORS.border },
  lineLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: "500", flex: 1, textAlign: "center" },
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
