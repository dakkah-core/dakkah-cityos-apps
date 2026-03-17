import React, { useState } from "react";
import { View, Text, Modal, Pressable, StyleSheet, Switch, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import { useAuth } from "../context/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CopilotSettingsDialog({ visible, onClose }: Props) {
  const { copilotSettings, updateCopilotSettings } = useAuth();
  const [temperature, setTemperature] = useState(copilotSettings.temperature);

  const models = [
    { id: "gpt-5-mini", name: "GPT-5 Mini", desc: "Fast, efficient responses" },
    { id: "gpt-5", name: "GPT-5", desc: "Most capable, detailed analysis" },
    { id: "claude-4-sonnet", name: "Claude 4 Sonnet", desc: "Balanced intelligence" },
  ];

  const languages = [
    { id: "en" as const, name: "English" },
    { id: "ar" as const, name: "العربية" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Copilot Settings</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Model</Text>
              <Text style={styles.sectionDesc}>Choose which AI model powers your copilot</Text>
              {models.map((m) => (
                <Pressable
                  key={m.id}
                  style={[styles.modelOption, copilotSettings.model === m.id && styles.modelSelected]}
                  onPress={() => updateCopilotSettings({ model: m.id })}
                >
                  <View style={styles.modelInfo}>
                    <Text style={[styles.modelName, copilotSettings.model === m.id && styles.modelNameSelected]}>{m.name}</Text>
                    <Text style={styles.modelDesc}>{m.desc}</Text>
                  </View>
                  {copilotSettings.model === m.id && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Language</Text>
              <View style={styles.langRow}>
                {languages.map((l) => (
                  <Pressable
                    key={l.id}
                    style={[styles.langBtn, copilotSettings.language === l.id && styles.langSelected]}
                    onPress={() => updateCopilotSettings({ language: l.id })}
                  >
                    <Text style={[styles.langText, copilotSettings.language === l.id && styles.langTextSelected]}>{l.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.sectionTitle}>Privacy Mode</Text>
                  <Text style={styles.sectionDesc}>Don't store conversation history on the server</Text>
                </View>
                <Switch
                  value={copilotSettings.privacyMode}
                  onValueChange={(v) => updateCopilotSettings({ privacyMode: v })}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Response Style</Text>
              <Text style={styles.sectionDesc}>
                Temperature: {temperature.toFixed(1)} — {temperature < 0.3 ? "Precise" : temperature < 0.7 ? "Balanced" : "Creative"}
              </Text>
              <View style={styles.tempBar}>
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                  <Pressable
                    key={v}
                    style={[styles.tempDot, Math.abs(temperature - v) < 0.15 && styles.tempDotActive]}
                    onPress={() => {
                      setTemperature(v);
                      updateCopilotSettings({ temperature: v });
                    }}
                  >
                    <Text style={[styles.tempLabel, Math.abs(temperature - v) < 0.15 && styles.tempLabelActive]}>
                      {v.toFixed(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.tempLabels}>
                <Text style={styles.tempEndLabel}>Precise</Text>
                <Text style={styles.tempEndLabel}>Creative</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: { backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 16, color: COLORS.textSecondary },
  body: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: COLORS.text, marginBottom: 4 },
  sectionDesc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 },
  modelOption: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 8 },
  modelSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryTint },
  modelInfo: { flex: 1 },
  modelName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  modelNameSelected: { color: COLORS.primary },
  modelDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  checkmark: { fontSize: 16, color: COLORS.primary, fontWeight: "700" },
  langRow: { flexDirection: "row", gap: 10 },
  langBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, alignItems: "center" },
  langSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryTint },
  langText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  langTextSelected: { color: COLORS.primary },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchInfo: { flex: 1 },
  tempBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 },
  tempDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: COLORS.border },
  tempDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tempLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600" },
  tempLabelActive: { color: "#fff" },
  tempLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 6 },
  tempEndLabel: { fontSize: 11, color: COLORS.textMuted },
});
