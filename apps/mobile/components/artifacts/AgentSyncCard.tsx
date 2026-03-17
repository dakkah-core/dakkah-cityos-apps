import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Step {
  label: string;
  status: "pending" | "active" | "done";
}

interface Props {
  data: {
    title: string;
    theme?: "social" | "transport" | "dining" | "ticket" | "service";
    steps: { label: string }[];
    avatars?: string[];
    actions?: string[];
  };
  onAction?: (action: string) => void;
}

const THEME_COLORS: Record<string, string> = {
  social: "#8B5CF6",
  transport: "#3B82F6",
  dining: "#F59E0B",
  ticket: "#EC4899",
  service: "#10B981",
};

const THEME_ICONS: Record<string, string> = {
  social: "👥",
  transport: "🚗",
  dining: "🍽️",
  ticket: "🎟️",
  service: "🔧",
};

export function AgentSyncCard({ data, onAction }: Props) {
  const theme = data.theme || "service";
  const themeColor = THEME_COLORS[theme] || COLORS.primary;
  const themeIcon = THEME_ICONS[theme] || "⚡";
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (activeStep < data.steps.length) {
      const timer = setTimeout(() => {
        if (activeStep === data.steps.length - 1) {
          setCompleted(true);
        }
        setActiveStep((s) => Math.min(s + 1, data.steps.length));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeStep, data.steps.length]);

  return (
    <View style={[styles.container, { borderLeftColor: themeColor, borderLeftWidth: 3 }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{themeIcon}</Text>
        <Text style={styles.title}>{data.title}</Text>
      </View>
      <View style={styles.steps}>
        {data.steps.map((step, i) => {
          const status = i < activeStep ? "done" : i === activeStep && !completed ? "active" : "pending";
          return (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.dot, status === "done" && { backgroundColor: themeColor }, status === "active" && { backgroundColor: themeColor, opacity: 0.6 }]} />
              <Text style={[styles.stepLabel, status === "done" && styles.stepDone, status === "active" && styles.stepActive]}>{step.label}</Text>
              {status === "done" && <Text style={styles.check}>✓</Text>}
            </View>
          );
        })}
      </View>
      {data.avatars && data.avatars.length > 0 && (
        <View style={styles.avatarRow}>
          {data.avatars.slice(0, 5).map((a, i) => (
            <View key={i} style={[styles.avatarCircle, { marginLeft: i > 0 ? -8 : 0, backgroundColor: themeColor }]}>
              <Text style={styles.avatarText}>{a.charAt(0).toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}
      {completed && data.actions && (
        <View style={styles.actions}>
          {data.actions.map((action, i) => (
            <Pressable key={action} style={[styles.actionBtn, i === 0 && { backgroundColor: themeColor, borderColor: themeColor }]} onPress={() => onAction?.(action)}>
              <Text style={[styles.actionText, i === 0 && { color: "#fff" }]}>{action}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  icon: { fontSize: 20 },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
  steps: { gap: 10, marginBottom: 12 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  stepLabel: { fontSize: 13, color: COLORS.textMuted, flex: 1 },
  stepDone: { color: COLORS.text, fontWeight: "600" },
  stepActive: { color: COLORS.text },
  check: { fontSize: 12, color: COLORS.success, fontWeight: "700" },
  avatarRow: { flexDirection: "row", marginBottom: 12 },
  avatarCircle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.card },
  avatarText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  actionText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
});
