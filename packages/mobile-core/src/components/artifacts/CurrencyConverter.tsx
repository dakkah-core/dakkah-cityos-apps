import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface CurrencyConverterData {
  from: { code: string; name: string; flag: string; amount: number };
  to: { code: string; name: string; flag: string; amount: number };
  rate: number;
  lastUpdated: string;
  trend: "up" | "down" | "stable";
  changePercent: string;
}

interface Props {
  data: CurrencyConverterData;
}

export function CurrencyConverter({ data }: Props) {
  const trendConfig = {
    up: { icon: "↑", color: COLORS.success },
    down: { icon: "↓", color: COLORS.danger },
    stable: { icon: "→", color: COLORS.textMuted },
  };

  const tr = trendConfig[data.trend];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Converter</Text>

      <View style={styles.currencyBox}>
        <View style={styles.currencyRow}>
          <Text style={styles.flag}>{data.from.flag}</Text>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyCode}>{data.from.code}</Text>
            <Text style={styles.currencyName}>{data.from.name}</Text>
          </View>
          <Text style={styles.amount}>{data.from.amount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.swapRow}>
        <View style={styles.swapLine} />
        <View style={styles.swapButton}>
          <Text style={styles.swapIcon}>⇅</Text>
        </View>
        <View style={styles.swapLine} />
      </View>

      <View style={[styles.currencyBox, styles.currencyBoxHighlight]}>
        <View style={styles.currencyRow}>
          <Text style={styles.flag}>{data.to.flag}</Text>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyCode}>{data.to.code}</Text>
            <Text style={styles.currencyName}>{data.to.name}</Text>
          </View>
          <Text style={[styles.amount, styles.amountHighlight]}>{data.to.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>
      </View>

      <View style={styles.rateRow}>
        <View style={styles.rateInfo}>
          <Text style={styles.rateLabel}>Exchange Rate</Text>
          <Text style={styles.rateValue}>1 {data.from.code} = {data.rate} {data.to.code}</Text>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: tr.color + "20" }]}>
          <Text style={[styles.trendIcon, { color: tr.color }]}>{tr.icon}</Text>
          <Text style={[styles.trendText, { color: tr.color }]}>{data.changePercent}</Text>
        </View>
      </View>

      <Text style={styles.lastUpdated}>Last updated: {data.lastUpdated}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 16 },
  currencyBox: { backgroundColor: COLORS.borderLight, borderRadius: 12, padding: 14 },
  currencyBoxHighlight: { backgroundColor: COLORS.primaryTint, borderWidth: 1, borderColor: COLORS.primary + "30" },
  currencyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  flag: { fontSize: 28 },
  currencyInfo: { flex: 1 },
  currencyCode: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  currencyName: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  amount: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  amountHighlight: { color: COLORS.primary },
  swapRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  swapLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  swapButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center", marginHorizontal: 8 },
  swapIcon: { fontSize: 16, color: "#fff", fontWeight: "700" },
  rateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  rateInfo: {},
  rateLabel: { fontSize: 10, color: COLORS.textMuted },
  rateValue: { fontSize: 13, fontWeight: "600", color: COLORS.text, marginTop: 2 },
  trendBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  trendIcon: { fontSize: 12, fontWeight: "700" },
  trendText: { fontSize: 11, fontWeight: "700" },
  lastUpdated: { fontSize: 10, color: COLORS.textMuted, marginTop: 8, textAlign: "center" },
});
