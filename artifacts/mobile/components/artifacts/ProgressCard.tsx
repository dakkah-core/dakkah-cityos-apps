import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import type { ProgressData } from "../../types/chat";

interface Props {
  data: ProgressData;
}

export function ProgressCard({ data }: Props) {
  const progress = (data.xp / data.xpToNext) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.levelHeader}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{data.level}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.xpText}>{data.xp} / {data.xpToNext} XP</Text>
        </View>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.badges}>
        {data.badges.map((badge) => (
          <View key={badge.name} style={[styles.badge, !badge.earned && styles.badgeLocked]}>
            <Text style={styles.badgeIcon}>{badge.earned ? "🏆" : "🔒"}</Text>
            <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>{badge.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Active Missions</Text>
      {data.missions.map((mission) => (
        <View key={mission.title} style={styles.mission}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionReward}>{mission.reward}</Text>
          </View>
          <View style={styles.missionBar}>
            <View style={[styles.missionFill, { width: `${mission.progress}%` }]} />
          </View>
          <Text style={styles.missionProgress}>{mission.progress}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  levelHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  levelBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center" },
  levelNumber: { fontSize: 20, fontWeight: "800", color: "#fff" },
  levelInfo: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  xpText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: COLORS.borderLight, overflow: "hidden", marginBottom: 16 },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: COLORS.primary },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.primaryTint, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  badgeLocked: { backgroundColor: COLORS.borderLight, opacity: 0.6 },
  badgeIcon: { fontSize: 14 },
  badgeName: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
  badgeNameLocked: { color: COLORS.textMuted },
  mission: { marginBottom: 12 },
  missionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  missionTitle: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  missionReward: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
  missionBar: { height: 4, borderRadius: 2, backgroundColor: COLORS.borderLight, overflow: "hidden" },
  missionFill: { height: "100%", borderRadius: 2, backgroundColor: COLORS.success },
  missionProgress: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
});
