import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@cityos/mobile-core";
import { useMerchant } from "@/context/MerchantContext";
import type { SalesAnalytics } from "@/types/merchant";

type Period = "today" | "week" | "month";

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getAnalytics } = useMerchant();
  const [period, setPeriod] = useState<Period>("week");
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async (p: Period) => {
    setLoading(true);
    const data = await getAnalytics(p);
    setAnalytics(data);
    setLoading(false);
  }, [getAnalytics]);

  useEffect(() => {
    loadAnalytics(period);
  }, [period, loadAnalytics]);

  const maxRevenue = analytics?.dailyRevenue ? Math.max(...analytics.dailyRevenue.map((d) => d.revenue)) : 1;
  const maxPeakOrders = analytics?.peakHours ? Math.max(...analytics.peakHours.map((h) => h.orders)) : 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <View style={styles.periodRow}>
        {(["today", "week", "month"] as Period[]).map((p) => (
          <Pressable key={p} style={[styles.periodChip, period === p && styles.periodActive]} onPress={() => setPeriod(p)}>
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingState}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : !analytics ? (
        <View style={styles.loadingState}><Text style={styles.emptyText}>No data available</Text></View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Revenue</Text>
              <Text style={styles.kpiValue}>{analytics.revenue.toLocaleString()} {analytics.currency}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Orders</Text>
              <Text style={styles.kpiValue}>{analytics.orders}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Avg Order</Text>
              <Text style={styles.kpiValue}>{analytics.avgOrderValue.toFixed(0)} {analytics.currency}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <View style={styles.chartContainer}>
              {analytics.dailyRevenue.slice(-7).map((d, i) => (
                <View key={i} style={styles.barColumn}>
                  <View style={[styles.bar, { height: Math.max((d.revenue / maxRevenue) * 100, 4) }]} />
                  <Text style={styles.barLabel}>{d.date.slice(-2)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Peak Hours</Text>
            <View style={styles.chartContainer}>
              {analytics.peakHours.map((h, i) => (
                <View key={i} style={styles.barColumn}>
                  <View style={[styles.barPeak, { height: Math.max((h.orders / maxPeakOrders) * 80, 4) }]} />
                  <Text style={styles.barLabel}>{h.hour}:00</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Items</Text>
            {analytics.topItems.map((item, i) => (
              <View key={i} style={styles.topItemRow}>
                <Text style={styles.topItemRank}>#{i + 1}</Text>
                <View style={styles.topItemInfo}>
                  <Text style={styles.topItemName}>{item.name}</Text>
                  <Text style={styles.topItemQty}>{item.quantity} sold</Text>
                </View>
                <Text style={styles.topItemRevenue}>{item.revenue.toLocaleString()} SAR</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Insights</Text>
            <View style={styles.insightRow}>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>{analytics.customerInsights.newCustomers}</Text>
                <Text style={styles.insightLabel}>New Customers</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>{analytics.customerInsights.returning}</Text>
                <Text style={styles.insightLabel}>Returning</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightValue}>{"⭐"} {analytics.customerInsights.avgRating}</Text>
                <Text style={styles.insightLabel}>Avg Rating</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: BRAND.navy, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  periodRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  periodChip: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  periodActive: { backgroundColor: BRAND.navy, borderColor: BRAND.navy },
  periodText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  periodTextActive: { color: "#fff" },
  loadingState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
  content: { flex: 1 },
  contentInner: { padding: 16, gap: 16, paddingBottom: 40 },
  kpiRow: { flexDirection: "row", gap: 10 },
  kpiCard: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 14, alignItems: "center", gap: 4, borderWidth: 1, borderColor: COLORS.border },
  kpiLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600" },
  kpiValue: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  section: { backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  chartContainer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 120, paddingTop: 10 },
  barColumn: { alignItems: "center", gap: 4, flex: 1 },
  bar: { width: 20, backgroundColor: BRAND.blue, borderRadius: 4 },
  barPeak: { width: 20, backgroundColor: BRAND.amber, borderRadius: 4 },
  barLabel: { fontSize: 9, color: COLORS.textMuted },
  topItemRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  topItemRank: { fontSize: 14, fontWeight: "800", color: COLORS.primary, width: 28 },
  topItemInfo: { flex: 1 },
  topItemName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  topItemQty: { fontSize: 11, color: COLORS.textSecondary },
  topItemRevenue: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  insightRow: { flexDirection: "row", gap: 10 },
  insightCard: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.surface, gap: 2 },
  insightValue: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  insightLabel: { fontSize: 10, color: COLORS.textSecondary },
});
