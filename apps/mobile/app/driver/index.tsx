import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@/constants/colors";
import { useDriver } from "@/context/DriverContext";
import { useAuth } from "@/context/AuthContext";
import { StatusToggle } from "@/components/driver/StatusToggle";
import { JobCard } from "@/components/driver/JobCard";
import { SOSButton } from "@/components/driver/SOSButton";
import { DynamicScreen } from "@/components/artifacts/DynamicScreen";
import type { DriverJob } from "@/types/driver";

export default function DriverHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { status, jobs, activeJob, completedToday, isLoading, offlineQueueCount, refreshJobs } = useDriver();
  const [refreshing, setRefreshing] = useState(false);

  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const inProgressJobs = jobs.filter((j) => ["accepted", "in_transit", "arrived"].includes(j.status));

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshJobs();
    setRefreshing(false);
  };

  const handleJobPress = (job: DriverJob) => {
    router.push({ pathname: "/driver/job", params: { jobId: job.id } });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading driver dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>{(user?.displayName || "D")[0]}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Dakkah Driver</Text>
            <Text style={styles.headerSub}>{user?.displayName || "Driver"}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn} onPress={() => router.push("/driver/earnings")}>
            <Text style={styles.headerBtnIcon}>💰</Text>
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={() => router.push("/driver/inspection")}>
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
        <View style={styles.sduiContainer}>
          <DynamicScreen
            screenId="driver_home"
            surface="mobile"
            extraParams={{ driverStatus: status }}
            onAction={(action) => {
              if (action === "view_earnings") router.push("/driver/earnings");
              else if (action === "start_inspection") router.push("/driver/inspection");
            }}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedToday}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pendingJobs.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{inProgressJobs.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>

        {activeJob && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Delivery</Text>
            <JobCard job={activeJob} onPress={() => handleJobPress(activeJob)} isActive />
          </View>
        )}

        {status === "online" && pendingJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Jobs</Text>
            {pendingJobs.map((job) => (
              <JobCard key={job.id} job={job} onPress={() => handleJobPress(job)} />
            ))}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
  header: { backgroundColor: BRAND.navy, paddingBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  driverAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: BRAND.blue, alignItems: "center", justifyContent: "center" },
  driverAvatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "#94a3b8" },
  headerRight: { flexDirection: "row", gap: 6 },
  headerBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerBtnIcon: { fontSize: 16 },
  offlineBanner: { backgroundColor: BRAND.amber, paddingVertical: 6, paddingHorizontal: 16 },
  offlineBannerText: { color: "#fff", fontSize: 12, fontWeight: "600", textAlign: "center" },
  content: { flex: 1 },
  sduiContainer: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: "hidden" },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontWeight: "500" },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  offlineCard: { margin: 16, padding: 32, backgroundColor: COLORS.surfaceWhite, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  breakCard: { margin: 16, padding: 32, backgroundColor: "#fef3c7", borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "#fbbf24" },
  offlineIcon: { fontSize: 40, marginBottom: 12 },
  offlineTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  offlineSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: "center" },
});
