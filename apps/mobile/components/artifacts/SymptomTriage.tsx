import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/colors";

interface SymptomTriageData {
  symptoms: string[];
  severity: "low" | "moderate" | "high" | "emergency";
  recommendation: string;
  possibleConditions: { name: string; likelihood: string }[];
  nextSteps: string[];
}

interface Props {
  data: SymptomTriageData;
  onAction?: (action: string) => void;
}

export function SymptomTriage({ data, onAction }: Props) {
  const severityConfig = {
    low: { color: COLORS.success, label: "Low", icon: "●" },
    moderate: { color: COLORS.warning, label: "Moderate", icon: "●" },
    high: { color: "#F97316", label: "High", icon: "●" },
    emergency: { color: COLORS.danger, label: "Emergency", icon: "●" },
  };

  const sev = severityConfig[data.severity];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Symptom Assessment</Text>
        <View style={[styles.severityBadge, { backgroundColor: sev.color + "20" }]}>
          <Text style={[styles.severityDot, { color: sev.color }]}>{sev.icon}</Text>
          <Text style={[styles.severityText, { color: sev.color }]}>{sev.label}</Text>
        </View>
      </View>

      <View style={styles.symptomsRow}>
        {data.symptoms.map((s, i) => (
          <View key={i} style={styles.symptomChip}>
            <Text style={styles.symptomText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.recommendationLabel}>Recommendation</Text>
        <Text style={styles.recommendationText}>{data.recommendation}</Text>
      </View>

      <Text style={styles.sectionTitle}>Possible Conditions</Text>
      {data.possibleConditions.map((c, i) => (
        <View key={i} style={styles.conditionRow}>
          <Text style={styles.conditionName}>{c.name}</Text>
          <View style={[styles.likelihoodBadge, { backgroundColor: c.likelihood === "High" ? COLORS.warning + "20" : COLORS.borderLight }]}>
            <Text style={[styles.likelihoodText, { color: c.likelihood === "High" ? COLORS.warning : COLORS.textSecondary }]}>{c.likelihood}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Next Steps</Text>
      {data.nextSteps.map((step, i) => (
        <Text key={i} style={styles.stepText}>{i + 1}. {step}</Text>
      ))}

      {data.severity !== "low" && (
        <TouchableOpacity style={[styles.actionButton, data.severity === "emergency" && { backgroundColor: COLORS.danger }]} onPress={() => onAction?.("book-appointment")}>
          <Text style={styles.actionButtonText}>{data.severity === "emergency" ? "Call Emergency" : "Book Appointment"}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.disclaimer}>This is not medical advice. Consult a healthcare professional for diagnosis.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  severityBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  severityDot: { fontSize: 8 },
  severityText: { fontSize: 11, fontWeight: "700" },
  symptomsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  symptomChip: { backgroundColor: COLORS.borderLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  symptomText: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  recommendationCard: { backgroundColor: COLORS.primaryTint, borderRadius: 12, padding: 12, marginBottom: 16 },
  recommendationLabel: { fontSize: 10, fontWeight: "700", color: COLORS.primary, marginBottom: 4 },
  recommendationText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  conditionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  conditionName: { fontSize: 13, color: COLORS.text },
  likelihoodBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  likelihoodText: { fontSize: 10, fontWeight: "700" },
  stepText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 2 },
  actionButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 16 },
  actionButtonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  disclaimer: { fontSize: 9, color: COLORS.textMuted, textAlign: "center", marginTop: 12, fontStyle: "italic" },
});
