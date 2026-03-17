import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

const SETTINGS_KEY = "dakkah_copilot_settings";

type Tab = "behavior" | "capabilities" | "privacy";

interface CopilotSettingsData {
  temperature: number;
  proactiveMode: boolean;
  webSearch: boolean;
  contextMemory: boolean;
  privacyMode: boolean;
  model: string;
}

const DEFAULT_SETTINGS: CopilotSettingsData = {
  temperature: 0.7,
  proactiveMode: true,
  webSearch: true,
  contextMemory: true,
  privacyMode: false,
  model: "dakkah-v2",
};

const MODELS = [
  { id: "dakkah-v2", label: "Dakkah v2 (Default)" },
  { id: "dakkah-v2-fast", label: "Dakkah v2 Fast" },
  { id: "dakkah-v1", label: "Dakkah v1 Legacy" },
];

const TEMP_STEPS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CopilotSettings({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("behavior");
  const [settings, setSettings] = useState<CopilotSettingsData>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (visible && !loaded) {
      loadSettings();
    }
  }, [visible, loaded]);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(data) });
      }
    } catch {}
    setLoaded(true);
  };

  const updateSetting = useCallback(
    <K extends keyof CopilotSettingsData>(key: K, value: CopilotSettingsData[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "behavior", label: "Behavior", icon: "⚙️" },
    { key: "capabilities", label: "Capabilities", icon: "🔌" },
    { key: "privacy", label: "Privacy", icon: "🔒" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Copilot Settings</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.tabBar}>
            {tabs.map((t) => (
              <Pressable
                key={t.key}
                style={[styles.tab, tab === t.key && styles.tabActive]}
                onPress={() => setTab(t.key)}
              >
                <Text style={styles.tabIcon}>{t.icon}</Text>
                <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {tab === "behavior" && (
              <View style={styles.section}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Temperature</Text>
                  <Text style={styles.settingDesc}>
                    Controls creativity. Lower = more focused, higher = more creative.
                  </Text>
                  <View style={styles.tempRow}>
                    {TEMP_STEPS.map((step) => (
                      <Pressable
                        key={step}
                        style={[
                          styles.tempDot,
                          settings.temperature === step && styles.tempDotActive,
                        ]}
                        onPress={() => updateSetting("temperature", step)}
                      >
                        {settings.temperature === step && (
                          <Text style={styles.tempValue}>{step.toFixed(1)}</Text>
                        )}
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.tempLabels}>
                    <Text style={styles.tempLabelText}>Focused</Text>
                    <Text style={styles.tempLabelText}>Creative</Text>
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                      <Text style={styles.settingLabel}>Proactive Suggestions</Text>
                      <Text style={styles.settingDesc}>
                        Copilot offers tips and recommendations without being asked.
                      </Text>
                    </View>
                    <Switch
                      value={settings.proactiveMode}
                      onValueChange={(v) => updateSetting("proactiveMode", v)}
                      trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>
              </View>
            )}

            {tab === "capabilities" && (
              <View style={styles.section}>
                <View style={styles.settingItem}>
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                      <Text style={styles.settingLabel}>Web Search</Text>
                      <Text style={styles.settingDesc}>
                        Allow Copilot to search the web for real-time information.
                      </Text>
                    </View>
                    <Switch
                      value={settings.webSearch}
                      onValueChange={(v) => updateSetting("webSearch", v)}
                      trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                      <Text style={styles.settingLabel}>Context Memory</Text>
                      <Text style={styles.settingDesc}>
                        Remember conversation context and preferences across sessions.
                      </Text>
                    </View>
                    <Switch
                      value={settings.contextMemory}
                      onValueChange={(v) => updateSetting("contextMemory", v)}
                      trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>
              </View>
            )}

            {tab === "privacy" && (
              <View style={styles.section}>
                <View style={styles.settingItem}>
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                      <Text style={styles.settingLabel}>Privacy Mode</Text>
                      <Text style={styles.settingDesc}>
                        Conversations are not stored and analytics are disabled.
                      </Text>
                    </View>
                    <Switch
                      value={settings.privacyMode}
                      onValueChange={(v) => updateSetting("privacyMode", v)}
                      trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>AI Model</Text>
                  <Text style={styles.settingDesc}>
                    Choose which model powers your Copilot experience.
                  </Text>
                  <View style={styles.modelList}>
                    {MODELS.map((m) => (
                      <Pressable
                        key={m.id}
                        style={[
                          styles.modelOption,
                          settings.model === m.id && styles.modelOptionActive,
                        ]}
                        onPress={() => updateSetting("model", m.id)}
                      >
                        <View
                          style={[
                            styles.modelRadio,
                            settings.model === m.id && styles.modelRadioActive,
                          ]}
                        >
                          {settings.model === m.id && <View style={styles.modelRadioDot} />}
                        </View>
                        <Text
                          style={[
                            styles.modelLabel,
                            settings.model === m.id && styles.modelLabelActive,
                          ]}
                        >
                          {m.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  close: { fontSize: 20, color: COLORS.textMuted, padding: 4 },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabIcon: { fontSize: 14 },
  tabLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted },
  tabLabelActive: { color: COLORS.text },
  content: { paddingHorizontal: 20 },
  section: { gap: 16, paddingBottom: 20 },
  settingItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleInfo: { flex: 1 },
  tempRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  tempDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tempDotActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  tempValue: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },
  tempLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  tempLabelText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  modelList: { gap: 8, marginTop: 12 },
  modelOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modelOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryTint,
  },
  modelRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modelRadioActive: {
    borderColor: COLORS.primary,
  },
  modelRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  modelLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  modelLabelActive: {
    color: COLORS.text,
  },
});
