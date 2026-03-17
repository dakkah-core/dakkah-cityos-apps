import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../constants/colors";

const MOCK_QUESTS = [
  {
    id: "q1",
    title: "City Explorer",
    description: "Visit 10 different districts in Riyadh",
    progress: 7,
    total: 10,
    reward: "500 XP",
    icon: "🗺️",
  },
  {
    id: "q2",
    title: "Foodie Trail",
    description: "Try 5 local restaurants recommended by Copilot",
    progress: 3,
    total: 5,
    reward: "300 XP",
    icon: "🍽️",
  },
  {
    id: "q3",
    title: "Event Hunter",
    description: "Attend 3 cultural events this month",
    progress: 1,
    total: 3,
    reward: "200 XP",
    icon: "🎭",
  },
];

export function ActiveQuests() {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>⚔️</Text>
          <Text style={styles.headerTitle}>Active Quests</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{MOCK_QUESTS.length}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.questList}>
          {MOCK_QUESTS.map((quest) => {
            const percent = (quest.progress / quest.total) * 100;
            return (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questTop}>
                  <Text style={styles.questIcon}>{quest.icon}</Text>
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <Text style={styles.questDesc}>{quest.description}</Text>
                  </View>
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>{quest.reward}</Text>
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {quest.progress}/{quest.total}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  chevron: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  questList: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 10,
  },
  questCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
  },
  questTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  questIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  questDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rewardBadge: {
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
