import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { COLORS } from "../../constants/colors";

interface ToastData {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: string;
  actionLabel?: string;
}

const TOAST_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: "#ecfdf5", border: "#10b981", icon: "✓" },
  error: { bg: "#fef2f2", border: "#ef4444", icon: "✕" },
  warning: { bg: "#fffbeb", border: "#f59e0b", icon: "⚠" },
  info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ" },
};

export function ToastCard({ data, onAction }: { data: ToastData; onAction?: (action: string) => void }) {
  const [visible, setVisible] = useState(true);
  const opacity = useState(new Animated.Value(1))[0];
  const type = data.type || "info";
  const colors = TOAST_COLORS[type] || TOAST_COLORS.info;

  useEffect(() => {
    const duration = data.duration || 5000;
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setVisible(false));
    }, duration);
    return () => clearTimeout(timer);
  }, [data.duration, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: colors.bg, borderLeftColor: colors.border }]}>
      <Text style={styles.icon}>{colors.icon}</Text>
      <Text style={styles.message}>{data.message}</Text>
      {data.actionLabel && data.action && (
        <Pressable onPress={() => onAction?.(data.action!)} style={styles.actionBtn}>
          <Text style={[styles.actionText, { color: colors.border }]}>{data.actionLabel}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginHorizontal: 4,
  },
  icon: {
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
