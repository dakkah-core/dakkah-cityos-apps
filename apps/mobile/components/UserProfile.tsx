import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

const MOCK_USER = {
  name: "Ahmed Al-Rashid",
  email: "ahmed@dakkah.app",
  tier: "Gold",
  xp: 4500,
  xpMax: 5000,
  placesVisited: 127,
  favorites: 34,
  walletBalance: "1,250.00",
};

export function UserProfile() {
  const xpPercent = (MOCK_USER.xp / MOCK_USER.xpMax) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {MOCK_USER.name.split(" ").map((n) => n[0]).join("")}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{MOCK_USER.name}</Text>
          <Text style={styles.email}>{MOCK_USER.email}</Text>
        </View>
      </View>

      <View style={styles.xpSection}>
        <View style={styles.xpLabelRow}>
          <View style={styles.tierBadge}>
            <Text style={styles.tierIcon}>★</Text>
            <Text style={styles.tierText}>{MOCK_USER.tier} Tier</Text>
          </View>
          <Text style={styles.xpText}>
            {MOCK_USER.xp.toLocaleString()}/{MOCK_USER.xpMax.toLocaleString()} XP
          </Text>
        </View>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📍</Text>
          <Text style={styles.statValue}>{MOCK_USER.placesVisited}</Text>
          <Text style={styles.statLabel}>Places Visited</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statValue}>{MOCK_USER.favorites}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      <View style={styles.wallet}>
        <View style={styles.walletLeft}>
          <Text style={styles.walletIcon}>💳</Text>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
        </View>
        <Text style={styles.walletAmount}>SAR {MOCK_USER.walletBalance}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.darkNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  email: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  xpSection: {
    marginBottom: 14,
  },
  xpLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierIcon: {
    fontSize: 12,
    color: "#D97706",
  },
  tierText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
  },
  xpText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  xpBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  wallet: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.darkNavy,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  walletLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  walletIcon: {
    fontSize: 16,
  },
  walletLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  walletAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
