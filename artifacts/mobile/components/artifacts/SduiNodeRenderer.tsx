import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

interface SduiNodeData {
  node: Record<string, unknown>;
  theme?: "light" | "dark";
}

let SduiRendererComponent: React.ComponentType<{ node: unknown; theme?: "light" | "dark" }> | null = null;

try {
  const mod = require("@workspace/sdui-renderer-native");
  SduiRendererComponent = mod.SduiRenderer;
} catch {}

export function SduiNodeRenderer({ data }: { data: SduiNodeData }) {
  if (!data?.node) {
    return null;
  }

  if (SduiRendererComponent) {
    return (
      <View style={styles.container}>
        <SduiRendererComponent node={data.node} theme={data.theme || "light"} />
      </View>
    );
  }

  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackText}>SDUI Component</Text>
      <Text style={styles.fallbackSub}>
        {typeof data.node === "object" && data.node !== null && "type" in data.node
          ? `Type: ${String(data.node.type)}`
          : "Unknown node"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  fallback: {
    backgroundColor: COLORS.primaryTint,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  fallbackSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
