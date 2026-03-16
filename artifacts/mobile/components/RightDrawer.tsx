import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Dimensions, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAction: (message: string) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

function useDelayedUnmount(visible: boolean, delay: number): boolean {
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), delay);
      return () => clearTimeout(timer);
    }
  }, [visible, delay]);
  return mounted;
}

const QUICK_ACTIONS = [
  { icon: "🚗", label: "Ride", message: "Call a ride for me" },
  { icon: "🏨", label: "Book", message: "Help me book a hotel" },
  { icon: "🎉", label: "Events", message: "What events are happening tonight?" },
  { icon: "🗺️", label: "Map", message: "Show me a map of nearby places" },
  { icon: "📞", label: "Contact", message: "I need to contact support" },
  { icon: "📤", label: "Share", message: "Share my location with a friend" },
  { icon: "🆘", label: "SOS", message: "I need emergency assistance" },
];

const AGENDA_ITEMS = [
  { time: "10:00 AM", title: "Coffee at Elixir Bunn", type: "dining" },
  { time: "1:00 PM", title: "Museum District Tour", type: "culture" },
  { time: "4:30 PM", title: "Spa Appointment", type: "wellness" },
  { time: "8:00 PM", title: "Dinner Reservation", type: "dining" },
];

const COMMUNITY_FEED = [
  { user: "Sarah M.", text: "Just discovered an amazing rooftop bar in Al Olaya!", time: "5m ago", prompt: "Tell me about rooftop bars in Al Olaya" },
  { user: "Ahmed K.", text: "The jazz night at Boulevard is incredible tonight", time: "12m ago", prompt: "Tell me about jazz night at Boulevard" },
  { user: "Lina R.", text: "Found the best shawarma spot near King Fahd Road", time: "25m ago", prompt: "Find shawarma spots near King Fahd Road" },
];

export function RightDrawer({ visible, onClose, onAction }: Props) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [liveExpanded, setLiveExpanded] = useState(true);
  const shouldMount = useDelayedUnmount(visible, 250);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleAction = (msg: string) => {
    onAction(msg);
    onClose();
  };

  if (!shouldMount) return null;

  return (
    <Modal visible={shouldMount} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.drawer,
            { width: DRAWER_WIDTH, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>City Context</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.quickActions}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
                {QUICK_ACTIONS.map((action) => (
                  <Pressable
                    key={action.label}
                    style={styles.quickItem}
                    onPress={() => handleAction(action.message)}
                  >
                    <View style={styles.quickIcon}>
                      <Text style={styles.quickIconText}>{action.icon}</Text>
                    </View>
                    <Text style={styles.quickLabel}>{action.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Pressable style={styles.sectionHeader} onPress={() => setLiveExpanded(!liveExpanded)}>
                <View style={styles.sectionHeaderLeft}>
                  <Text style={styles.sectionTitle}>Live Activity</Text>
                  <View style={styles.liveDot} />
                </View>
                <Text style={styles.collapseIcon}>{liveExpanded ? "▲" : "▼"}</Text>
              </Pressable>
              {liveExpanded && (
                <Pressable style={styles.liveCard} onPress={() => handleAction("Track my delivery order #4821")}>
                  <View style={styles.liveRow}>
                    <Text style={styles.liveIcon}>📦</Text>
                    <View style={styles.liveInfo}>
                      <Text style={styles.liveTitle}>Delivery in Progress</Text>
                      <Text style={styles.liveSub}>Order #4821 · ETA 15 min</Text>
                    </View>
                  </View>
                  <View style={styles.liveProgress}>
                    <View style={styles.liveProgressFill} />
                  </View>
                  <View style={styles.liveAction}>
                    <Text style={styles.liveActionText}>Track Order →</Text>
                  </View>
                </Pressable>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitleStandalone}>Weather</Text>
              <Pressable style={styles.weatherCard} onPress={() => handleAction("What's the weather like today?")}>
                <View style={styles.weatherMain}>
                  <Text style={styles.weatherIcon}>☀️</Text>
                  <View>
                    <Text style={styles.weatherTemp}>34°C</Text>
                    <Text style={styles.weatherDesc}>Sunny, Clear Skies</Text>
                  </View>
                </View>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetail}>
                    <Text style={styles.weatherDetailLabel}>Humidity</Text>
                    <Text style={styles.weatherDetailValue}>22%</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Text style={styles.weatherDetailLabel}>Wind</Text>
                    <Text style={styles.weatherDetailValue}>12 km/h</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Text style={styles.weatherDetailLabel}>UV</Text>
                    <Text style={styles.weatherDetailValue}>High</Text>
                  </View>
                </View>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitleStandalone}>Today's Agenda</Text>
              {AGENDA_ITEMS.map((item, i) => (
                <Pressable
                  key={i}
                  style={styles.agendaItem}
                  onPress={() => handleAction(`Tell me about my ${item.title} at ${item.time}`)}
                >
                  <Text style={styles.agendaTime}>{item.time}</Text>
                  <View style={styles.agendaDot} />
                  <Text style={styles.agendaTitle}>{item.title}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitleStandalone}>Community Feed</Text>
              {COMMUNITY_FEED.map((item, i) => (
                <Pressable key={i} style={styles.feedItem} onPress={() => handleAction(item.prompt)}>
                  <View style={styles.feedAvatar}>
                    <Text style={styles.feedAvatarText}>{item.user[0]}</Text>
                  </View>
                  <View style={styles.feedContent}>
                    <View style={styles.feedHeader}>
                      <Text style={styles.feedUser}>{item.user}</Text>
                      <Text style={styles.feedTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.feedText}>{item.text}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  drawer: { backgroundColor: "#fff", paddingHorizontal: 16, position: "absolute", right: 0, top: 0, bottom: 0 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 16, color: COLORS.textMuted },
  scrollContent: { paddingBottom: 24 },

  quickActions: { marginBottom: 20 },
  quickRow: { gap: 12 },
  quickItem: { alignItems: "center", gap: 6, width: 56 },
  quickIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  quickIconText: { fontSize: 20 },
  quickLabel: { fontSize: 10, fontWeight: "600", color: COLORS.textSecondary },

  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  sectionTitleStandalone: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  collapseIcon: { fontSize: 10, color: COLORS.textMuted },

  liveCard: { backgroundColor: COLORS.darkNavy, borderRadius: 16, padding: 14 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  liveIcon: { fontSize: 28 },
  liveInfo: { flex: 1 },
  liveTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  liveSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  liveProgress: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 12 },
  liveProgressFill: { width: "65%", height: "100%", borderRadius: 2, backgroundColor: COLORS.primary },
  liveAction: { alignSelf: "flex-end" },
  liveActionText: { fontSize: 12, fontWeight: "700", color: COLORS.primary },

  weatherCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  weatherMain: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  weatherIcon: { fontSize: 36 },
  weatherTemp: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  weatherDesc: { fontSize: 12, color: COLORS.textSecondary },
  weatherDetails: { flexDirection: "row", justifyContent: "space-around" },
  weatherDetail: { alignItems: "center" },
  weatherDetailLabel: { fontSize: 10, color: COLORS.textMuted },
  weatherDetailValue: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginTop: 2 },

  agendaItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  agendaTime: { fontSize: 11, fontWeight: "600", color: COLORS.primary, width: 70 },
  agendaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  agendaTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text, flex: 1 },

  feedItem: { flexDirection: "row", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  feedAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryTint, alignItems: "center", justifyContent: "center" },
  feedAvatarText: { fontSize: 13, fontWeight: "700", color: COLORS.primary },
  feedContent: { flex: 1 },
  feedHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  feedUser: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  feedTime: { fontSize: 10, color: COLORS.textMuted },
  feedText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});
