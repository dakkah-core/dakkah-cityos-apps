import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface Document {
  name: string;
  status: "submitted" | "approved" | "missing";
}

interface PermitApplicationData {
  permitType: string;
  applicationId: string;
  status: "submitted" | "under-review" | "approved" | "rejected";
  submittedDate: string;
  estimatedCompletion: string;
  applicant: string;
  documents: Document[];
  notes?: string;
}

interface Props {
  data: PermitApplicationData;
}

export function PermitApplication({ data }: Props) {
  const statusConfig = {
    submitted: { color: COLORS.info, label: "Submitted" },
    "under-review": { color: COLORS.warning, label: "Under Review" },
    approved: { color: COLORS.success, label: "Approved" },
    rejected: { color: COLORS.danger, label: "Rejected" },
  };

  const st = statusConfig[data.status];
  const docStatusIcon = { submitted: "📄", approved: "✅", missing: "❌" };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.govIcon}>
          <Text style={styles.govIconText}>🏛️</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.permitType}>{data.permitType}</Text>
          <Text style={styles.applicationId}>ID: {data.applicationId}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: st.color + "20" }]}>
          <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <InfoItem label="Applicant" value={data.applicant} />
        <InfoItem label="Submitted" value={data.submittedDate} />
        <InfoItem label="Est. Completion" value={data.estimatedCompletion} />
      </View>

      <Text style={styles.sectionTitle}>Required Documents</Text>
      <View style={styles.docList}>
        {data.documents.map((doc, i) => (
          <View key={i} style={styles.docRow}>
            <Text style={styles.docIcon}>{docStatusIcon[doc.status]}</Text>
            <Text style={styles.docName}>{doc.name}</Text>
            <Text style={[styles.docStatus, { color: doc.status === "missing" ? COLORS.danger : COLORS.success }]}>
              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      {data.notes && (
        <View style={styles.notesCard}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{data.notes}</Text>
        </View>
      )}
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  govIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.borderLight, alignItems: "center", justifyContent: "center" },
  govIconText: { fontSize: 20 },
  headerInfo: { flex: 1 },
  permitType: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  applicationId: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontFamily: "monospace" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontWeight: "700" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  infoItem: { minWidth: "30%" },
  infoLabel: { fontSize: 10, color: COLORS.textMuted },
  infoValue: { fontSize: 12, fontWeight: "600", color: COLORS.text, marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  docList: { gap: 6, marginBottom: 12 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: COLORS.borderLight, borderRadius: 8 },
  docIcon: { fontSize: 14 },
  docName: { flex: 1, fontSize: 12, fontWeight: "600", color: COLORS.text },
  docStatus: { fontSize: 10, fontWeight: "700" },
  notesCard: { backgroundColor: COLORS.primaryTint, borderRadius: 10, padding: 10 },
  notesLabel: { fontSize: 10, fontWeight: "700", color: COLORS.primary, marginBottom: 4 },
  notesText: { fontSize: 12, color: COLORS.text, lineHeight: 17 },
});
