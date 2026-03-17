import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, BRAND } from "@cityos/mobile-core";
import { useDriver } from "@/context/DriverContext";
import { ProfileSkeleton } from "@/components/driver/Skeleton";
import { updatePreferences } from "@/lib/driver-api";
import type { DriverProfile, ShiftSummary, DriverPreferences } from "@/types/driver";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, getProfile, getShiftHistory, updatePreferences: updateContextPrefs } = useDriver();
  const [shifts, setShifts] = useState<ShiftSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prefs, setPrefs] = useState<DriverPreferences>({
    navigationApp: "google",
    notificationsEnabled: true,
    soundEnabled: true,
    language: "en",
  });

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([getProfile(), getShiftHistory()]);
      if (p) setPrefs(p.preferences);
      setShifts(s);
      setIsLoading(false);
    })();
  }, [getProfile, getShiftHistory]);

  const handleTogglePref = useCallback(async (key: keyof DriverPreferences, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    updateContextPrefs({ [key]: value });
    await updatePreferences({ [key]: value });
  }, [updateContextPrefs]);

  const handleNavAppChange = useCallback(async () => {
    const apps: Array<"google" | "apple" | "waze"> = ["google", "apple", "waze"];
    const currentIndex = apps.indexOf(prefs.navigationApp);
    const nextApp = apps[(currentIndex + 1) % apps.length];
    setPrefs((prev) => ({ ...prev, navigationApp: nextApp }));
    updateContextPrefs({ navigationApp: nextApp });
    await updatePreferences({ navigationApp: nextApp });
  }, [prefs.navigationApp, updateContextPrefs]);

  const navAppLabels: Record<string, string> = { google: "Google Maps", apple: "Apple Maps", waze: "Waze" };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let stars = "";
    for (let i = 0; i < full; i++) stars += "★";
    if (half) stars += "½";
    for (let i = stars.length; i < 5; i++) stars += "☆";
    return stars;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.headerBackBtn} onPress={() => router.back()}>
            <Text style={styles.headerBackText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 36 }} />
        </View>
        <ProfileSkeleton />
      </View>
    );
  }

  const p = profile;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.headerBackBtn} onPress={() => router.back()}>
          <Text style={styles.headerBackText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{(p?.name || "D")[0]}</Text>
          </View>
          <Text style={styles.profileName}>{p?.name || "Driver"}</Text>
          <Text style={styles.profileEmail}>{p?.email || ""}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>{renderStars(p?.rating || 0)}</Text>
            <Text style={styles.ratingNum}>{(p?.rating || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{p?.totalTrips || 0}</Text>
              <Text style={styles.profileStatLabel}>Total Trips</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{p?.memberSince ? new Date(p.memberSince).getFullYear() : "—"}</Text>
              <Text style={styles.profileStatLabel}>Member Since</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Vehicle</Text>
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIcon}>
            <Text style={styles.vehicleIconText}>🚗</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleName}>{p?.vehicle.name || "—"}</Text>
            <Text style={styles.vehicleDetail}>{p?.vehicle.plateNumber} • {p?.vehicle.type} • {p?.vehicle.year}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Shifts</Text>
        {shifts.length === 0 ? (
          <Text style={styles.emptyText}>No shift history</Text>
        ) : (
          shifts.map((shift, i) => (
            <View key={i} style={styles.shiftRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shiftDate}>{shift.date}</Text>
                <Text style={styles.shiftMeta}>{shift.startTime} – {shift.endTime} • {shift.hoursOnline}h online</Text>
              </View>
              <View style={styles.shiftRight}>
                <Text style={styles.shiftEarnings}>{shift.earnings.toFixed(2)} SAR</Text>
                <Text style={styles.shiftTrips}>{shift.trips} trips</Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          <Pressable style={styles.settingRow} onPress={handleNavAppChange}>
            <Text style={styles.settingLabel}>Navigation App</Text>
            <Text style={styles.settingValue}>{navAppLabels[prefs.navigationApp] || prefs.navigationApp}</Text>
          </Pressable>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={prefs.notificationsEnabled}
              onValueChange={(v) => handleTogglePref("notificationsEnabled", v)}
              trackColor={{ false: COLORS.border, true: BRAND.teal + "60" }}
              thumbColor={prefs.notificationsEnabled ? BRAND.teal : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={prefs.soundEnabled}
              onValueChange={(v) => handleTogglePref("soundEnabled", v)}
              trackColor={{ false: COLORS.border, true: BRAND.teal + "60" }}
              thumbColor={prefs.soundEnabled ? BRAND.teal : "#f4f3f4"}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>{prefs.language === "en" ? "English" : "العربية"}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { backgroundColor: BRAND.navy, paddingBottom: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" },
  headerBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerBackText: { color: "#fff", fontSize: 20 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#fff", textAlign: "center" },
  content: { flex: 1 },
  profileCard: { margin: 16, backgroundColor: COLORS.surfaceWhite, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: BRAND.blue, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarLargeText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  profileName: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  profileEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  ratingStars: { fontSize: 18, color: BRAND.amber },
  ratingNum: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  profileStatsRow: { flexDirection: "row", marginTop: 16, gap: 20 },
  profileStat: { alignItems: "center", flex: 1 },
  profileStatValue: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  profileStatLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  profileStatDivider: { width: 1, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  vehicleCard: { marginHorizontal: 16, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: COLORS.border },
  vehicleIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: BRAND.blue + "15", alignItems: "center", justifyContent: "center" },
  vehicleIconText: { fontSize: 24 },
  vehicleName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  vehicleDetail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  shiftRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.surfaceWhite, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  shiftDate: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  shiftMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  shiftRight: { alignItems: "flex-end" },
  shiftEarnings: { fontSize: 15, fontWeight: "700", color: BRAND.teal },
  shiftTrips: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, paddingHorizontal: 16 },
  settingsCard: { marginHorizontal: 16, backgroundColor: COLORS.surfaceWhite, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingLabel: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  settingValue: { fontSize: 14, fontWeight: "600", color: BRAND.blue },
});
