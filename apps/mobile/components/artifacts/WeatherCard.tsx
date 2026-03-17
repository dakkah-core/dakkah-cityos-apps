import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface Props {
  data: {
    location: string;
    temp: number;
    condition: string;
    icon?: string;
    high?: number;
    low?: number;
    humidity?: number;
    wind?: string;
  };
}

const CONDITION_ICONS: Record<string, string> = { sunny: "☀️", cloudy: "☁️", rainy: "🌧️", stormy: "⛈️", snowy: "❄️", clear: "🌙", windy: "💨", foggy: "🌫️" };

export function WeatherCard({ data }: Props) {
  const icon = data.icon || CONDITION_ICONS[data.condition.toLowerCase()] || "🌤️";
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.icon}>{icon}</Text>
        <View>
          <Text style={styles.temp}>{data.temp}°</Text>
          <Text style={styles.condition}>{data.condition}</Text>
        </View>
      </View>
      <Text style={styles.location}>{data.location}</Text>
      <View style={styles.details}>
        {data.high !== undefined && <Text style={styles.detail}>H: {data.high}°</Text>}
        {data.low !== undefined && <Text style={styles.detail}>L: {data.low}°</Text>}
        {data.humidity !== undefined && <Text style={styles.detail}>💧 {data.humidity}%</Text>}
        {data.wind && <Text style={styles.detail}>💨 {data.wind}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  main: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  icon: { fontSize: 40 },
  temp: { fontSize: 32, fontWeight: "800", color: COLORS.text },
  condition: { fontSize: 13, color: COLORS.textSecondary, textTransform: "capitalize" },
  location: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 10 },
  details: { flexDirection: "row", gap: 16 },
  detail: { fontSize: 12, color: COLORS.textMuted },
});
