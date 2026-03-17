import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface Module {
  title: string;
  duration: string;
  status: "completed" | "in-progress" | "locked";
}

interface LessonTrackerData {
  courseName: string;
  instructor: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  modules: Module[];
  nextDeadline: string;
}

interface Props {
  data: LessonTrackerData;
}

export function LessonTracker({ data }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.courseIcon}>
          <Text style={styles.courseIconText}>📚</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.courseName}>{data.courseName}</Text>
          <Text style={styles.instructor}>by {data.instructor}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{data.completedModules}/{data.totalModules} modules</Text>
          <Text style={styles.progressPercent}>{data.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${data.progress}%` }]} />
        </View>
        <Text style={styles.deadline}>Next deadline: {data.nextDeadline}</Text>
      </View>

      <View style={styles.moduleList}>
        {data.modules.map((mod, i) => (
          <View key={i} style={styles.moduleRow}>
            <View style={[
              styles.moduleIcon,
              mod.status === "completed" && styles.moduleCompleted,
              mod.status === "in-progress" && styles.moduleActive,
            ]}>
              <Text style={styles.moduleIconText}>
                {mod.status === "completed" ? "✓" : mod.status === "in-progress" ? "▶" : "🔒"}
              </Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={[styles.moduleTitle, mod.status === "locked" && styles.moduleLocked]}>{mod.title}</Text>
              <Text style={styles.moduleDuration}>{mod.duration}</Text>
            </View>
            {mod.status === "in-progress" && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 16 },
  courseIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primaryTint, alignItems: "center", justifyContent: "center" },
  courseIconText: { fontSize: 22 },
  headerInfo: { flex: 1 },
  courseName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  instructor: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  progressSection: { marginBottom: 16 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 12, color: COLORS.textSecondary },
  progressPercent: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: COLORS.borderLight, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: COLORS.primary },
  deadline: { fontSize: 11, color: COLORS.warning, fontWeight: "600" },
  moduleList: { gap: 4 },
  moduleRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  moduleIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.borderLight, alignItems: "center", justifyContent: "center" },
  moduleCompleted: { backgroundColor: COLORS.success },
  moduleActive: { backgroundColor: COLORS.primary },
  moduleIconText: { fontSize: 12, color: "#fff", fontWeight: "700" },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  moduleLocked: { color: COLORS.textMuted },
  moduleDuration: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  currentBadge: { backgroundColor: COLORS.primaryTint, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  currentBadgeText: { fontSize: 10, fontWeight: "700", color: COLORS.primary },
});
