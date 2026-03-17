import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@/constants/colors";
import { useDriver } from "@/context/DriverContext";
import type { DriverEarnings } from "@/types/driver";

type Period = "today" | "week" | "month";

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getEarnings } = useDriver();
  const [period, setPeriod] = useState<Period>("today");
  const [earnings, setEarnings] = useState<DriverEarnings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEarnings = useCallback(async (p: Period) => {
    setIsLoading(true);
    const data = await getEarnings(p);
    setEarnings(data);
    setIsLoading(false);
  }, [getEarnings]);

  useEffect(() => {
    loadEarnings(period);
  }, [period, loadEarnings]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.headerBackBtn} onPress={() => router.back()}>
          <Text style={styles.headerBackText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.periodRow}>
        {(["today", "week", "month"] as Period[]).map((p) => (
          <Pressable key={p} style={[styles.periodBtn, period === p && styles.periodBtnActive]} onPress={() => setPeriod(p)}>
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : earnings ? (
        <ScrollView style={styles.content}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsAmount}>{earnings.amount.toFixed(2)} {earnings.currency}</Text>
            <View style={styles.earningsStatsRow}>
              <View style={styles.earningsStat}>
                <Text style={styles.earningsStatValue}>{earnings.trips}</Text>
                <Text style={styles.earningsStatLabel}>Trips</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsStat}>
                <Text style={styles.earningsStatValue}>{earnings.hours}h</Text>
                <Text style={styles.earningsStatLabel}>Online</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsStat}>
                <Text style={styles.earningsStatValue}>{earnings.trips > 0 ? (earnings.amount / earnings.trips).toFixed(1) : "0"}</Text>
                <Text style={styles.earningsStatLabel}>Per Trip</Text>
              </View>
            </View>
          </View>

          <Text style={styles.historyTitle}>Daily Breakdown</Text>
          {earnings.history.map((day) => (
            <View key={day.date} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyDate}>{day.date}</Text>
                <Text style={styles.historyMeta}>{day.trips} trips • {day.hours}h</Text>
              </View>
              <Text style={styles.historyAmount}>{day.amount.toFixed(2)} SAR</Text>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No earnings data available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: BRAND.navy, paddingBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  headerBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerBackText: { color: "#fff", fontSize: 20 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff", textAlign: "center" },
  periodRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  periodBtnActive: { backgroundColor: BRAND.teal, borderColor: BRAND.teal },
  periodText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  periodTextActive: { color: "#fff" },
  content: { flex: 1 },
  earningsCard: { margin: 16, backgroundColor: BRAND.navy, borderRadius: 16, padding: 24, alignItems: "center" },
  earningsLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  earningsAmount: { fontSize: 36, fontWeight: "800", color: "#fff", marginTop: 4 },
  earningsStatsRow: { flexDirection: "row", marginTop: 20, gap: 12 },
  earningsStat: { alignItems: "center", flex: 1 },
  earningsStatValue: { fontSize: 20, fontWeight: "700", color: "#fff" },
  earningsStatLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  earningsDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  historyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  historyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyDate: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  historyMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  historyAmount: { fontSize: 16, fontWeight: "700", color: BRAND.teal },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
