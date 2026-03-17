import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth, COLORS, BRAND } from "@cityos/mobile-core";

interface DriverRoleGateProps {
  children: React.ReactNode;
}

export function DriverRoleGate({ children }: DriverRoleGateProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const hasDriverRole = user?.roles?.some((r) =>
    ["driver", "courier", "fleet_driver", "field_agent"].includes(r)
  );

  const isDev = process.env.NODE_ENV === "development" || process.env.EXPO_PUBLIC_ALLOW_DEV_DRIVER === "true";

  if (!isAuthenticated && !isDev) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={styles.subtitle}>Sign in with your driver account to access the dashboard</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backBtnText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  if (!hasDriverRole && !isDev) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🚫</Text>
        <Text style={styles.title}>Driver Access Only</Text>
        <Text style={styles.subtitle}>This section is restricted to authorized drivers and couriers</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backBtnText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, justifyContent: "center", alignItems: "center", padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  backBtn: { backgroundColor: BRAND.navy, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
