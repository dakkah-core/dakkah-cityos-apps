import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../../constants/colors";

interface Device {
  name: string;
  type: string;
  status: "on" | "off";
  value?: string;
  icon?: string;
}

interface Props {
  data: {
    room?: string;
    devices: Device[];
  };
  onAction?: (action: string) => void;
}

const DEVICE_ICONS: Record<string, string> = { light: "💡", thermostat: "🌡️", lock: "🔒", camera: "📷", speaker: "🔊", fan: "🌀", tv: "📺", blind: "🪟" };

export function SmartHomeControl({ data, onAction }: Props) {
  const [deviceStates, setDeviceStates] = useState<Record<number, boolean>>(
    Object.fromEntries(data.devices.map((d, i) => [i, d.status === "on"]))
  );

  const toggle = (idx: number) => {
    setDeviceStates((prev) => ({ ...prev, [idx]: !prev[idx] }));
    onAction?.(`toggle:${data.devices[idx].name}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 {data.room || "Smart Home"}</Text>
      <View style={styles.devices}>
        {data.devices.map((device, i) => (
          <Pressable key={i} style={[styles.device, deviceStates[i] && styles.deviceOn]} onPress={() => toggle(i)}>
            <Text style={styles.deviceIcon}>{device.icon || DEVICE_ICONS[device.type] || "⚡"}</Text>
            <Text style={styles.deviceName} numberOfLines={1}>{device.name}</Text>
            {device.value && <Text style={styles.deviceValue}>{device.value}</Text>}
            <View style={[styles.toggleDot, deviceStates[i] && styles.toggleOn]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  devices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  device: { width: "47%", backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: "center" },
  deviceOn: { backgroundColor: COLORS.primaryTint, borderWidth: 1, borderColor: COLORS.primary },
  deviceIcon: { fontSize: 24, marginBottom: 6 },
  deviceName: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  deviceValue: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  toggleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted, marginTop: 6 },
  toggleOn: { backgroundColor: COLORS.success },
});
