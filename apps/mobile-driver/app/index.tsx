import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND, useAuth, DynamicScreen } from "@cityos/mobile-core";
import { useDriver } from "@/context/DriverContext";
import { StatusToggle } from "@/components/driver/StatusToggle";
import { JobCard } from "@/components/driver/JobCard";
import { SOSButton } from "@/components/driver/SOSButton";
import { JobOfferOverlay } from "@/components/driver/JobOfferOverlay";
import { DashboardSkeleton } from "@/components/driver/Skeleton";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import type { DriverJob } from "@/types/driver";

function AnimatedCounter({ value, prefix, suffix }: { value: number; prefix?: string; suffix?: string }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animValue.setValue(0);
    Animated.timing(animValue, { toValue: value, duration: 800, useNativeDriver: false }).start();
    const listener = animValue.addListener(({ value: v }) => setDisplayValue(Math.round(v * 100) / 100));
    return () => animValue.removeListener(listener);
  }, [value, animValue]);

  const formatted = Number.isInteger(value) ? Math.round(displayValue).toString() : displayValue.toFixed(2);

  return (
    <Text style={styles.statValue}>{prefix}{formatted}{suffix}</Text>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

export default function DriverHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    status, jobs, activeJob, completedToday, todayEarnings, todayTips, currency,
    isLoading, offlineQueueCount, refreshJobs, jobOffer, dismissJobOffer,
    acceptJobOffer, notificationCount,
  } = useDriver();
  const [refreshing, setRefreshing] = useState(false);

  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const inProgressJobs = jobs.filter((j) => ["accepted", "in_transit", "arrived"].includes(j.status));

  const onRefresh = async () => {
    hapticLight();
    setRefreshing(true);
    await refreshJobs();
    hapticSuccess();
    setRefreshing(false);
  };

  const handleJobPress = (job: DriverJob) => {
    hapticLight();
    router.push({ pathname: "/job", params: { jobId: job.id } });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerLeft}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>D</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Dakkah Driver</Text>
              <Text style={styles.headerSub}>Loading...</Text>
            </View>
          </View>
        </View>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.driverAvatar} onPress={() => router.push("/profile")}>
            <Text style={styles.driverAvatarText}>{(user?.displayName || "D")[0]}</Text>
          </Pressable>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerSub}>{user?.displayName || "Driver"}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn} onPress={() => router.push("/profile")}>
            {notificationCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{notificationCount > 9 ? "9+" : notificationCount}</Text>
              </View>
            )}
            <Text style={styles.headerBtnIcon}>🔔</Text>
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={() => router.push("/earnings")}>
            <Text style={styles.headerBtnIcon}>💰</Text>
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={() => router.push("/inspection")}>
            <Text style={styles.headerBtnIcon}>🔧</Text>
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={signOut}>
            <Text style={styles.headerBtnIcon}>↪</Text>
          </Pressable>
        </View>
      </View>

      {offlineQueueCount > 0 && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>⚡ {offlineQueueCount} action(s) queued — will sync when online</Text>
        </View>
      )}

      <StatusToggle />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.earningsSummary}>
          <View style={styles.earningsSummaryLeft}>
            <Text style={styles.earningsSummaryLabel}>Today's Earnings</Text>
            <Text style={styles.earningsSummaryAmount}>{todayEarnings.toFixed(2)} {currency}</Text>
            {todayTips > 0 && (
              <Text style={styles.earningsTipsText}>incl. {todayTips.toFixed(2)} tips</Text>
            )}
          </View>
          <Pressable style={styles.earningsSummaryBtn} onPress={() => router.push("/earnings")}>
            <Text style={styles.earningsSummaryBtnText}>View Details →</Text>
          </Pressable>
        </View>

        <View style={styles.sduiContainer}>
          <DynamicScreen
            screenId="driver_home"
            surface="mobile"
            extraParams={{ driverStatus: status }}
            onAction={(action) => {
              if (action === "view_earnings") router.push("/earnings");
              else if (action === "start_inspection") router.push("/inspection");
            }}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AnimatedCounter value={completedToday} />
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <AnimatedCounter value={pendingJobs.length} />
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <AnimatedCounter value={inProgressJobs.length} />
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>

        {activeJob && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Delivery</Text>
              <View style={styles.liveDot} />
            </View>
            <JobCard job={activeJob} onPress={() => handleJobPress(activeJob)} isActive />
          </View>
        )}

        {status === "online" && pendingJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Jobs ({pendingJobs.length})</Text>
            {pendingJobs.map((job) => (
              <JobCard key={job.id} job={job} onPress={() => handleJobPress(job)} />
            ))}
          </View>
        )}

        {status === "online" && pendingJobs.length === 0 && !activeJob && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Jobs Available</Text>
            <Text style={styles.emptySubtitle}>New delivery requests will appear here. Stay online to receive them.</Text>
          </View>
        )}

        {status === "offline" && (
          <View style={styles.offlineCard}>
            <Text style={styles.offlineIcon}>🌙</Text>
            <Text style={styles.offlineTitle}>You're Offline</Text>
            <Text style={styles.offlineSubtitle}>Go online to start receiving delivery requests</Text>
          </View>
        )}

        {status === "break" && (
          <View style={styles.breakCard}>
            <Text style={styles.offlineIcon}>☕</Text>
            <Text style={styles.offlineTitle}>On Break</Text>
            <Text style={styles.offlineSubtitle}>Take your time — go online when you're ready</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <SOSButton />

      <JobOfferOverlay
        offer={jobOffer}
        onAccept={acceptJobOffer}
        onDecline={dismissJobOffer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { backgroundColor: BRAND.navy, paddingBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  driverAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: BRAND.blue, alignItems: "center", justifyContent: "center" },
  driverAvatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  greeting: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "#94a3b8" },
  headerRight: { flexDirection: "row", gap: 6 },
  headerBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", position: "relative" },
  headerBtnIcon: { fontSize: 16 },
  notifBadge: { position: "absolute", top: -4, right: -4, backgroundColor: BRAND.rose, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", zIndex: 1 },
  notifBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  offlineBanner: { backgroundColor: BRAND.amber, paddingVertical: 6, paddingHorizontal: 16 },
  offlineBannerText: { color: "#fff", fontSize: 12, fontWeight: "600", textAlign: "center" },
  content: { flex: 1 },
  earningsSummary: { marginHorizontal: 16, marginTop: 12, backgroundColor: BRAND.navy, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  earningsSummaryLeft: {},
  earningsSummaryLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  earningsSummaryAmount: { fontSize: 24, fontWeight: "800", color: "#fff", marginTop: 2 },
  earningsTipsText: { fontSize: 11, color: BRAND.amber, fontWeight: "500", marginTop: 2 },
  earningsSummaryBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 8 },
  earningsSummaryBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  sduiContainer: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: "hidden" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontWeight: "500" },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#059669", marginBottom: 10 },
  emptyCard: { margin: 16, padding: 32, backgroundColor: COLORS.surfaceWhite, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: "center", lineHeight: 18 },
  offlineCard: { margin: 16, padding: 32, backgroundColor: COLORS.surfaceWhite, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  breakCard: { margin: 16, padding: 32, backgroundColor: "#fef3c7", borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "#fbbf24" },
  offlineIcon: { fontSize: 40, marginBottom: 12 },
  offlineTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  offlineSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: "center" },
});
