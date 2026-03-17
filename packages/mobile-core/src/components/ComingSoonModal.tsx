import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

interface Props {
  visible: boolean;
  feature: string;
  onClose: () => void;
}

export function ComingSoonModal({ visible, feature, onClose }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.icon}>🚀</Text>
          <Text style={styles.title}>{feature}</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
          <Text style={styles.desc}>This feature is being built and will be available in a future update.</Text>
          <Pressable style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Got it</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: COLORS.surfaceWhite, borderRadius: 20, padding: 28, width: 280, alignItems: "center" },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.primary, fontWeight: "600", marginBottom: 12 },
  desc: { fontSize: 13, color: COLORS.textSecondary, textAlign: "center", lineHeight: 19, marginBottom: 20 },
  btn: { width: "100%", paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center" },
  btnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
