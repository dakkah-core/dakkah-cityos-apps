import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@/constants/colors";
import { useMerchant } from "@/context/MerchantContext";
import { DynamicScreen } from "@/components/artifacts/DynamicScreen";
import { configureActionHandler } from "@cityos/sdui-renderer-native";

export default function MerchantHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    profile,
    pendingCount,
    lowStockCount,
    isLoading,
    toggleStoreOpen,
  } = useMerchant();

  React.useEffect(() => {
    configureActionHandler({
      onNavigate: (screen) => {
        if (screen.startsWith("merchant/")) {
          router.push(`/${screen}` as never);
        }
      },
    });
  }, [router]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading store dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.storeName}>{profile?.storeName || "My Store"}</Text>
          <Text style={styles.storeCategory}>{profile?.category || "Merchant Dashboard"}</Text>
        </View>
        <View style={styles.storeToggle}>
          <Text style={[styles.storeStatus, profile?.isOpen ? styles.statusOpen : styles.statusClosed]}>
            {profile?.isOpen ? "Open" : "Closed"}
          </Text>
          <Switch
            value={profile?.isOpen ?? false}
            onValueChange={toggleStoreOpen}
            trackColor={{ false: "#ccc", true: BRAND.teal }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.alertRow}>
          {pendingCount > 0 && (
            <Pressable style={styles.alertCard} onPress={() => router.push("/merchant/orders" as never)}>
              <Text style={styles.alertIcon}>🔔</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{pendingCount} Pending Order{pendingCount > 1 ? "s" : ""}</Text>
                <Text style={styles.alertSub}>Tap to review</Text>
              </View>
              <Text style={styles.alertArrow}>{">"}</Text>
            </Pressable>
          )}
          {lowStockCount > 0 && (
            <Pressable style={[styles.alertCard, styles.alertWarning]} onPress={() => router.push("/merchant/inventory" as never)}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{lowStockCount} Low Stock Item{lowStockCount > 1 ? "s" : ""}</Text>
                <Text style={styles.alertSub}>Restock needed</Text>
              </View>
              <Text style={styles.alertArrow}>{">"}</Text>
            </Pressable>
          )}
        </View>

        <DynamicScreen screenId="merchant_home" surface="tablet" />

        <View style={styles.quickGrid}>
          {[
            { icon: "📦", label: "Orders", route: "/merchant/orders", badge: pendingCount > 0 ? String(pendingCount) : undefined },
            { icon: "📋", label: "Catalog", route: "/merchant/catalog" },
            { icon: "📊", label: "Inventory", route: "/merchant/inventory", badge: lowStockCount > 0 ? String(lowStockCount) : undefined },
            { icon: "📅", label: "Bookings", route: "/merchant/bookings" },
            { icon: "📈", label: "Analytics", route: "/merchant/analytics" },
            { icon: "🎯", label: "Campaigns", route: "/merchant/campaigns" },
          ].map((item) => (
            <Pressable key={item.label} style={styles.quickItem} onPress={() => router.push(item.route as never)}>
              <View style={styles.quickIconWrap}>
                <Text style={styles.quickIcon}>{item.icon}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.storeInfo}>
          <Text style={styles.infoLabel}>Rating</Text>
          <Text style={styles.infoValue}>
            {"⭐".repeat(Math.floor(profile?.rating ?? 0))} {profile?.rating ?? 0} ({profile?.reviewCount ?? 0} reviews)
          </Text>
          <Text style={styles.infoLabel}>Hours</Text>
          <Text style={styles.infoValue}>{profile?.operatingHours?.open} - {profile?.operatingHours?.close}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  loadingContainer: { flex: 1, backgroundColor: COLORS.surface, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: BRAND.navy, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerCenter: { flex: 1 },
  storeName: { fontSize: 18, fontWeight: "800", color: "#fff" },
  storeCategory: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  storeToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  storeStatus: { fontSize: 12, fontWeight: "700" },
  statusOpen: { color: BRAND.teal },
  statusClosed: { color: BRAND.rose },
  content: { flex: 1 },
  contentInner: { padding: 16, gap: 16, paddingBottom: 40 },
  alertRow: { gap: 8 },
  alertCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef3c7", borderRadius: 12, padding: 14, gap: 12, borderWidth: 1, borderColor: "#fbbf24" },
  alertWarning: { backgroundColor: "#fee2e2", borderColor: "#f87171" },
  alertIcon: { fontSize: 24 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  alertSub: { fontSize: 12, color: COLORS.textSecondary },
  alertArrow: { color: COLORS.textSecondary, fontSize: 18 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickItem: { width: "30%", backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: COLORS.border },
  quickIconWrap: { position: "relative" },
  quickIcon: { fontSize: 28 },
  badge: { position: "absolute", top: -6, right: -10, backgroundColor: BRAND.rose, borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  quickLabel: { fontSize: 12, fontWeight: "600", color: COLORS.text, textAlign: "center" },
  storeInfo: { backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 16, gap: 4, borderWidth: 1, borderColor: COLORS.border },
  infoLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600", marginTop: 4 },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
});
