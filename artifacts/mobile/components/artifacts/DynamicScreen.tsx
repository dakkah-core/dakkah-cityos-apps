import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { fetchSduiScreen } from "@/lib/ai-client";
import { SduiNodeRenderer } from "./SduiNodeRenderer";

interface Props {
  screenId: string;
  surface?: string;
  tenant?: string;
  theme?: "light" | "dark";
  onAction?: (action: string) => void;
}

export function DynamicScreen({ screenId, surface, tenant, theme = "dark", onAction }: Props) {
  const [screen, setScreen] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSduiScreen(screenId, surface, tenant)
      .then((result) => {
        if (cancelled) return;
        if (result?.screen) {
          setScreen(result.screen);
        } else {
          setError(`Screen "${screenId}" not found`);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load screen");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [screenId, surface, tenant]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#3182ce" />
      </View>
    );
  }

  if (error || !screen) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || "Unknown error"}</Text>
      </View>
    );
  }

  return <SduiNodeRenderer data={{ node: screen, theme }} />;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  errorText: {
    color: "#e11d48",
    fontSize: 13,
    textAlign: "center",
  },
});
