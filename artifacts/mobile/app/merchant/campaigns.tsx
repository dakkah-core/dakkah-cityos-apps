import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Modal, TextInput, ScrollView, Switch, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useMerchant } from "@/context/MerchantContext";
import type { Campaign } from "@/types/merchant";

const TYPE_ICONS: Record<string, string> = {
  promotion: "🏷",
  flash_sale: "⚡",
  loyalty: "💎",
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft: { bg: "#f3f4f6", text: "#6b7280" },
  active: { bg: "#d1fae5", text: "#065f46" },
  paused: { bg: "#fef3c7", text: "#92400e" },
  ended: { bg: "#fee2e2", text: "#991b1b" },
};

export default function CampaignsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { campaigns, refreshCampaigns, addCampaign, toggleCampaign } = useMerchant();
  const [createVisible, setCreateVisible] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"promotion" | "flash_sale" | "loyalty">("promotion");
  const [formDiscount, setFormDiscount] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!formName.trim()) {
      Alert.alert("Required", "Campaign name is required.");
      return;
    }
    setSaving(true);
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 86400000);
    await addCampaign({
      name: formName,
      type: formType,
      status: "draft",
      discount: parseFloat(formDiscount) || 0,
      discountType: formDiscountType,
      startDate: now.toISOString(),
      endDate: end.toISOString(),
      applicableProducts: [],
    });
    setSaving(false);
    setCreateVisible(false);
    setFormName("");
    setFormDiscount("");
  }, [formName, formType, formDiscount, formDiscountType, addCampaign]);

  const handleToggle = useCallback(async (campaign: Campaign) => {
    setTogglingId(campaign.id);
    await toggleCampaign(campaign.id, campaign.status !== "active");
    setTogglingId(null);
  }, [toggleCampaign]);

  const renderCampaign = useCallback(({ item }: { item: Campaign }) => {
    const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.draft;
    const isToggling = togglingId === item.id;

    return (
      <View style={styles.campaignCard}>
        <View style={styles.campaignHeader}>
          <Text style={styles.typeIcon}>{TYPE_ICONS[item.type] || "🏷"}</Text>
          <View style={styles.campaignInfo}>
            <Text style={styles.campaignName}>{item.name}</Text>
            <Text style={styles.campaignType}>{item.type.replace("_", " ")}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.campaignMeta}>
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {item.discountType === "percentage" ? `${item.discount}% OFF` : `${item.discount} SAR OFF`}
              </Text>
            </View>
          )}
          <Text style={styles.redemptions}>{item.redemptions} redemptions</Text>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>Start: {new Date(item.startDate).toLocaleDateString()}</Text>
          <Text style={styles.dateText}>End: {new Date(item.endDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{item.status === "active" ? "Active" : "Paused"}</Text>
          {isToggling ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Switch
              value={item.status === "active"}
              onValueChange={() => handleToggle(item)}
              trackColor={{ false: "#ccc", true: "#0d9488" }}
              thumbColor="#fff"
              disabled={item.status === "ended"}
            />
          )}
        </View>
      </View>
    );
  }, [togglingId, handleToggle]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Campaigns</Text>
        <Pressable style={styles.createBtn} onPress={() => setCreateVisible(true)}>
          <Text style={styles.createBtnText}>+ New</Text>
        </Pressable>
      </View>

      <FlatList
        data={campaigns}
        renderItem={renderCampaign}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No campaigns yet</Text>
          </View>
        }
      />

      <Modal visible={createVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Campaign</Text>
              <Pressable onPress={() => setCreateVisible(false)}>
                <Text style={styles.modalClose}>X</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
              <Text style={styles.fieldLabel}>Campaign Name *</Text>
              <TextInput style={styles.fieldInput} value={formName} onChangeText={setFormName} placeholder="Weekend Special" placeholderTextColor={COLORS.textMuted} />

              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.typeRow}>
                {(["promotion", "flash_sale", "loyalty"] as const).map((t) => (
                  <Pressable key={t} style={[styles.typeChip, formType === t && styles.typeActive]} onPress={() => setFormType(t)}>
                    <Text style={styles.typeChipIcon}>{TYPE_ICONS[t]}</Text>
                    <Text style={[styles.typeChipText, formType === t && styles.typeChipTextActive]}>{t.replace("_", " ")}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Discount</Text>
              <View style={styles.discountRow}>
                <TextInput style={[styles.fieldInput, { flex: 1 }]} value={formDiscount} onChangeText={setFormDiscount} placeholder="0" placeholderTextColor={COLORS.textMuted} keyboardType="decimal-pad" />
                <View style={styles.discountTypeRow}>
                  <Pressable style={[styles.discTypeChip, formDiscountType === "percentage" && styles.discTypeActive]} onPress={() => setFormDiscountType("percentage")}>
                    <Text style={[styles.discTypeText, formDiscountType === "percentage" && styles.discTypeTextActive]}>%</Text>
                  </Pressable>
                  <Pressable style={[styles.discTypeChip, formDiscountType === "fixed" && styles.discTypeActive]} onPress={() => setFormDiscountType("fixed")}>
                    <Text style={[styles.discTypeText, formDiscountType === "fixed" && styles.discTypeTextActive]}>SAR</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
            <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleCreate} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Create Campaign</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#0a1628", gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  backIcon: { color: "#fff", fontSize: 18, fontWeight: "700" },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  createBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#0d9488" },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  campaignCard: { backgroundColor: COLORS.surfaceWhite, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  campaignHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  typeIcon: { fontSize: 24 },
  campaignInfo: { flex: 1 },
  campaignName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  campaignType: { fontSize: 12, color: COLORS.textSecondary, textTransform: "capitalize" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "700" },
  campaignMeta: { flexDirection: "row", alignItems: "center", gap: 12 },
  discountBadge: { backgroundColor: "#dbeafe", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  discountText: { fontSize: 12, fontWeight: "700", color: "#1e40af" },
  redemptions: { fontSize: 12, color: COLORS.textSecondary },
  dateRow: { flexDirection: "row", justifyContent: "space-between" },
  dateText: { fontSize: 11, color: COLORS.textMuted },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  toggleLabel: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { flex: 1, backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: 120, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  modalClose: { fontSize: 18, color: COLORS.textSecondary, fontWeight: "700", padding: 4 },
  form: { flex: 1 },
  formContent: { gap: 4, paddingBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary, marginTop: 12 },
  fieldInput: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  typeRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  typeChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  typeActive: { backgroundColor: "#0a1628", borderColor: "#0a1628" },
  typeChipIcon: { fontSize: 16 },
  typeChipText: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  typeChipTextActive: { color: "#fff" },
  discountRow: { flexDirection: "row", gap: 8 },
  discountTypeRow: { flexDirection: "row", gap: 4 },
  discTypeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  discTypeActive: { backgroundColor: "#0a1628", borderColor: "#0a1628" },
  discTypeText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  discTypeTextActive: { color: "#fff" },
  saveBtn: { backgroundColor: "#0a1628", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
