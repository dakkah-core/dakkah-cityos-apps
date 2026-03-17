import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/colors";

const MERCHANT_ROLES = ["merchant", "vendor", "store_manager", "store_staff"];

interface MerchantRoleGateProps {
  children: React.ReactNode;
}

export function MerchantRoleGate({ children }: MerchantRoleGateProps) {
  const { user, isAuthenticated, signInWithKeycloak } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isRegisterRoute = pathname === "/merchant/register";

  const hasMerchantRole = user?.roles?.some((r) => MERCHANT_ROLES.includes(r));
  const isDev = process.env.NODE_ENV === "development" || process.env.EXPO_PUBLIC_ALLOW_DEV_MERCHANT === "true";

  if (isRegisterRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated && !isDev) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={styles.subtitle}>Sign in with your merchant account to access the dashboard</Text>
        <Pressable style={styles.signInBtn} onPress={() => signInWithKeycloak()}>
          <Text style={styles.signInBtnText}>Sign in with Keycloak</Text>
        </Pressable>
        <Pressable style={styles.backBtn} onPress={() => router.replace("/")}>
          <Text style={styles.backBtnText}>Go to Home</Text>
        </Pressable>
      </View>
    );
  }

  if (!hasMerchantRole && !isDev) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🏪</Text>
        <Text style={styles.title}>Merchant Access Only</Text>
        <Text style={styles.subtitle}>This section is restricted to authorized merchants and vendors</Text>
        <Pressable style={styles.registerBtn} onPress={() => router.push("/merchant/register" as never)}>
          <Text style={styles.registerBtnText}>Register as Vendor</Text>
        </Pressable>
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
  signInBtn: { backgroundColor: "#3182ce", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginBottom: 12, width: 220, alignItems: "center" as const },
  signInBtnText: { color: "#fff", fontWeight: "700" as const, fontSize: 15 },
  registerBtn: { backgroundColor: "#0d9488", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginBottom: 12, width: 220, alignItems: "center" as const },
  registerBtnText: { color: "#fff", fontWeight: "700" as const, fontSize: 15 },
  backBtn: { backgroundColor: "#0a1628", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, width: 220, alignItems: "center" as const },
  backBtnText: { color: "#fff", fontWeight: "700" as const, fontSize: 15 },
});
