import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/colors";

const POS_ROLES = ["cashier", "pos_operator", "store_manager", "merchant"];

interface PosRoleGateProps {
  children: React.ReactNode;
}

export function PosRoleGate({ children }: PosRoleGateProps) {
  const { user, isAuthenticated, signInWithKeycloak } = useAuth();
  const router = useRouter();

  const hasPosRole = user?.roles?.some((r) => POS_ROLES.includes(r));
  const isDev = process.env.NODE_ENV === "development" || process.env.EXPO_PUBLIC_ALLOW_DEV_POS === "true";

  if (!isAuthenticated && !isDev) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>POS Terminal Login</Text>
        <Text style={styles.subtitle}>Sign in with your cashier account to access the point-of-sale terminal</Text>
        <Pressable style={styles.signInBtn} onPress={() => signInWithKeycloak()}>
          <Text style={styles.signInBtnText}>Sign in with Keycloak</Text>
        </Pressable>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backBtnText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  if (!hasPosRole && !isDev) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🏪</Text>
        <Text style={styles.title}>POS Access Restricted</Text>
        <Text style={styles.subtitle}>This terminal is restricted to authorized cashiers and POS operators</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backBtnText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628", justifyContent: "center", alignItems: "center", padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  signInBtn: { backgroundColor: "#3182ce", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginBottom: 12, width: 240, alignItems: "center" },
  signInBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, width: 240, alignItems: "center" },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
