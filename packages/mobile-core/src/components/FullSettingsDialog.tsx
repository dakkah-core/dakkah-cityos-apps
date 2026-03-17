import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, StyleSheet, ScrollView, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants/colors";
import { useTheme } from "../context/ThemeContext";
import { useCopilot } from "../context/ChatContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  onLanguageChange?: (lang: "en" | "ar") => void;
}

const TABS = ["General", "Privacy", "About"] as const;

export function FullSettingsDialog({ visible, onClose, onLanguageChange }: Props) {
  const { mode, toggle: toggleTheme } = useTheme();
  const { useAI, setUseAI } = useCopilot();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("General");
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    AsyncStorage.getItem("dakkah_settings").then((val) => {
      if (val) {
        try {
          const s = JSON.parse(val);
          if (s.notifications !== undefined) setNotifications(s.notifications);
          if (s.sounds !== undefined) setSounds(s.sounds);
          if (s.haptics !== undefined) setHaptics(s.haptics);
          if (s.analytics !== undefined) setAnalytics(s.analytics);
          if (s.dataSharing !== undefined) setDataSharing(s.dataSharing);
          if (s.language) setLanguage(s.language);
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const saveSetting = (key: string, value: any) => {
    AsyncStorage.getItem("dakkah_settings").then((val) => {
      const s = val ? JSON.parse(val) : {};
      s[key] = value;
      AsyncStorage.setItem("dakkah_settings", JSON.stringify(s)).catch(() => {});
    }).catch(() => {});
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Settings</Text>
          <View style={styles.tabs}>
            {TABS.map((tab) => (
              <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
          <ScrollView style={styles.content}>
            {activeTab === "General" && (
              <>
                <View style={styles.settingRow}>
                  <View><Text style={styles.settingLabel}>Dark Mode</Text><Text style={styles.settingDesc}>Switch to dark theme</Text></View>
                  <Switch value={mode === "dark"} onValueChange={toggleTheme} trackColor={{ true: COLORS.primary }} />
                </View>
                <View style={styles.settingRow}>
                  <View><Text style={styles.settingLabel}>AI Copilot</Text><Text style={styles.settingDesc}>Use real AI for unknown queries</Text></View>
                  <Switch value={useAI} onValueChange={setUseAI} trackColor={{ true: COLORS.primary }} />
                </View>
                <View style={styles.settingRow}>
                  <View><Text style={styles.settingLabel}>Notifications</Text><Text style={styles.settingDesc}>Push notifications</Text></View>
                  <Switch value={notifications} onValueChange={(v) => { setNotifications(v); saveSetting("notifications", v); }} trackColor={{ true: COLORS.primary }} />
                </View>
                <View style={styles.settingRow}>
                  <View><Text style={styles.settingLabel}>Sounds</Text><Text style={styles.settingDesc}>Message sounds</Text></View>
                  <Switch value={sounds} onValueChange={(v) => { setSounds(v); saveSetting("sounds", v); }} trackColor={{ true: COLORS.primary }} />
                </View>
                <View style={styles.settingRow}>
                  <View><Text style={styles.settingLabel}>Haptic Feedback</Text><Text style={styles.settingDesc}>Vibration on actions</Text></View>
                  <Switch value={haptics} onValueChange={(v) => { setHaptics(v); saveSetting("haptics", v); }} trackColor={{ true: COLORS.primary }} />
                </View>
                <View style={styles.settingRow}>
                  <View><Text style={styles.settingLabel}>Language</Text><Text style={styles.settingDesc}>{language === "en" ? "English" : "Arabic"}</Text></View>
                  <Pressable style={styles.langBtn} onPress={() => { const l = language === "en" ? "ar" : "en"; setLanguage(l); saveSetting("language", l); onLanguageChange?.(l as "en" | "ar"); }}>
                    <Text style={styles.langBtnText}>{language === "en" ? "EN" : "AR"}</Text>
                  </Pressable>
                </View>
              </>
            )}
            {activeTab === "Privacy" && (
              <>
                <View style={styles.settingRow}>
                  <View><Text style={styles.settingLabel}>Analytics</Text><Text style={styles.settingDesc}>Help improve the app</Text></View>
                  <Switch value={analytics} onValueChange={(v) => { setAnalytics(v); saveSetting("analytics", v); }} trackColor={{ true: COLORS.primary }} />
                </View>
                <View style={styles.settingRow}>
                  <View><Text style={styles.settingLabel}>Data Sharing</Text><Text style={styles.settingDesc}>Share usage data</Text></View>
                  <Switch value={dataSharing} onValueChange={(v) => { setDataSharing(v); saveSetting("dataSharing", v); }} trackColor={{ true: COLORS.primary }} />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Your Data</Text>
                  <Text style={styles.infoText}>All chat data is stored locally on your device. No conversations are sent to external servers without your explicit consent.</Text>
                </View>
              </>
            )}
            {activeTab === "About" && (
              <View style={styles.aboutSection}>
                <View style={styles.aboutLogo}>
                  <Text style={styles.aboutLogoText}>✦</Text>
                </View>
                <Text style={styles.aboutTitle}>Dakkah CityOS</Text>
                <Text style={styles.aboutVersion}>Version 1.0.0</Text>
                <View style={styles.aboutItem}><Text style={styles.aboutLabel}>Build</Text><Text style={styles.aboutValue}>2026.03.16</Text></View>
                <View style={styles.aboutItem}><Text style={styles.aboutLabel}>Platform</Text><Text style={styles.aboutValue}>React Native + Expo</Text></View>
                <View style={styles.aboutItem}><Text style={styles.aboutLabel}>Artifacts</Text><Text style={styles.aboutValue}>47 types</Text></View>
                <View style={styles.aboutItem}><Text style={styles.aboutLabel}>Scenarios</Text><Text style={styles.aboutValue}>189 responses</Text></View>
                <Text style={styles.copyright}>&copy; 2026 Dakkah. All rights reserved.</Text>
              </View>
            )}
          </ScrollView>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surfaceWhite, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%", paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text, textAlign: "center", marginBottom: 16 },
  tabs: { flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: 10, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  tabActive: { backgroundColor: COLORS.surfaceWhite, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  tabTextActive: { color: COLORS.primary, fontWeight: "600" },
  content: { maxHeight: 400 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  settingLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  settingDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  langBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.primaryTint },
  langBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  infoBox: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginTop: 16 },
  infoTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 4 },
  infoText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  aboutSection: { alignItems: "center", paddingVertical: 16 },
  aboutLogo: { width: 60, height: 60, borderRadius: 16, backgroundColor: COLORS.darkNavy, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  aboutLogoText: { color: COLORS.primary, fontSize: 24, fontWeight: "700" },
  aboutTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  aboutVersion: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  aboutItem: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  aboutLabel: { fontSize: 13, color: COLORS.textMuted },
  aboutValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  copyright: { fontSize: 11, color: COLORS.textMuted, marginTop: 20 },
  closeBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" },
  closeBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
