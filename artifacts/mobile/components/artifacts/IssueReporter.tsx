import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/colors";

interface IssueReporterData {
  issueType: string;
  category: string;
  description: string;
  location: string;
  status: "draft" | "submitted" | "in-progress" | "resolved";
  reportId?: string;
  priority: "low" | "medium" | "high";
  reportedAt?: string;
}

interface Props {
  data: IssueReporterData;
  onAction?: (action: string) => void;
}

export function IssueReporter({ data, onAction }: Props) {
  const statusConfig = {
    draft: { color: COLORS.textMuted, label: "Draft" },
    submitted: { color: COLORS.info, label: "Submitted" },
    "in-progress": { color: COLORS.warning, label: "In Progress" },
    resolved: { color: COLORS.success, label: "Resolved" },
  };

  const priorityConfig = {
    low: { color: COLORS.success, label: "Low" },
    medium: { color: COLORS.warning, label: "Medium" },
    high: { color: COLORS.danger, label: "High" },
  };

  const st = statusConfig[data.status];
  const pr = priorityConfig[data.priority];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Civic Issue Report</Text>
        <View style={[styles.statusBadge, { backgroundColor: st.color + "20" }]}>
          <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {data.reportId && (
        <Text style={styles.reportId}>Report #{data.reportId}</Text>
      )}

      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoIcon}>📷</Text>
        <Text style={styles.photoText}>Photo Evidence</Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Category</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{data.category}</Text>
          </View>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Priority</Text>
          <View style={[styles.priorityBadge, { backgroundColor: pr.color + "20" }]}>
            <Text style={[styles.priorityText, { color: pr.color }]}>{pr.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.issueTypeRow}>
        <Text style={styles.detailLabel}>Issue</Text>
        <Text style={styles.issueType}>{data.issueType}</Text>
      </View>

      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>{data.description}</Text>
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{data.location}</Text>
      </View>

      {data.reportedAt && (
        <Text style={styles.reportedAt}>Reported: {data.reportedAt}</Text>
      )}

      {data.status === "draft" && (
        <TouchableOpacity style={styles.submitButton} onPress={() => onAction?.("submit-issue")}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontWeight: "700" },
  reportId: { fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace", marginBottom: 12 },
  photoPlaceholder: { height: 100, backgroundColor: COLORS.borderLight, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  photoIcon: { fontSize: 28 },
  photoText: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  detailsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: 4 },
  categoryBadge: { backgroundColor: COLORS.darkNavy, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" },
  categoryText: { fontSize: 11, fontWeight: "600", color: "#fff" },
  priorityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" },
  priorityText: { fontSize: 11, fontWeight: "700" },
  issueTypeRow: { marginBottom: 8 },
  issueType: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginTop: 2 },
  descriptionCard: { backgroundColor: COLORS.borderLight, borderRadius: 10, padding: 10, marginBottom: 12 },
  descriptionText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  locationIcon: { fontSize: 14 },
  locationText: { fontSize: 12, color: COLORS.text, fontWeight: "600" },
  reportedAt: { fontSize: 10, color: COLORS.textMuted, marginBottom: 12 },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  submitButtonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
