import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface VendorTrustData {
  name: string;
  category: string;
  trustScore: number;
  totalReviews: number;
  responseRate: number;
  responseTime: string;
  badges: string[];
  memberSince: string;
  recentReview: { author: string; text: string; rating: number };
}

interface Props {
  data: VendorTrustData;
  onAction?: (action: string) => void;
}

export function VendorTrustProfile({ data, onAction }: Props) {
  const trustColor = data.trustScore >= 90 ? COLORS.success : data.trustScore >= 70 ? COLORS.warning : COLORS.danger;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{data.name.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.category}>{data.category}</Text>
          <Text style={styles.memberSince}>Member since {data.memberSince}</Text>
        </View>
        <View style={[styles.trustBadge, { borderColor: trustColor }]}>
          <Text style={[styles.trustScore, { color: trustColor }]}>{data.trustScore}</Text>
          <Text style={styles.trustLabel}>Trust</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatItem label="Reviews" value={String(data.totalReviews)} />
        <StatItem label="Response Rate" value={`${data.responseRate}%`} />
        <StatItem label="Avg Reply" value={data.responseTime} />
      </View>

      <View style={styles.badgesRow}>
        {data.badges.map((badge, i) => (
          <View key={i} style={styles.badgeChip}>
            <Text style={styles.badgeIcon}>✦</Text>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewAuthor}>{data.recentReview.author}</Text>
          <Text style={styles.reviewStars}>{"★".repeat(data.recentReview.rating)}</Text>
        </View>
        <Text style={styles.reviewText}>"{data.recentReview.text}"</Text>
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  category: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  memberSince: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  trustBadge: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  trustScore: { fontSize: 18, fontWeight: "800" },
  trustLabel: { fontSize: 8, fontWeight: "600", color: COLORS.textMuted },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16, paddingVertical: 12, backgroundColor: COLORS.borderLight, borderRadius: 12 },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  badgeChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.primaryTint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeIcon: { fontSize: 10, color: COLORS.primary },
  badgeText: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
  reviewCard: { backgroundColor: COLORS.borderLight, borderRadius: 12, padding: 12 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  reviewAuthor: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  reviewStars: { fontSize: 12, color: COLORS.warning },
  reviewText: { fontSize: 12, color: COLORS.textSecondary, fontStyle: "italic", lineHeight: 18 },
});
