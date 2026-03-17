import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BRAND, COLORS } from "@cityos/mobile-core";

interface GoalRingProps {
  progress: number;
  current: number;
  goal: number;
  currency: string;
  size?: number;
}

export function GoalRing({ progress, current, goal, currency, size = 140 }: GoalRingProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clampedProgress * 100);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const strokeWidth = 10;
  const center = size / 2;

  if (Platform.OS === "web") {
    const svgStyle: Record<string, string | number> = {
      width: size,
      height: size,
    };

    const bgCircleProps = {
      cx: center,
      cy: center,
      r: radius,
      fill: "none",
      stroke: COLORS.border,
      strokeWidth: strokeWidth,
    };

    const progressCircleProps = {
      cx: center,
      cy: center,
      r: radius,
      fill: "none",
      stroke: clampedProgress >= 1 ? "#059669" : BRAND.teal,
      strokeWidth: strokeWidth,
      strokeDasharray: `${circumference}`,
      strokeDashoffset: `${strokeDashoffset}`,
      strokeLinecap: "round" as const,
      transform: `rotate(-90 ${center} ${center})`,
    };

    return (
      <View style={styles.container}>
        {React.createElement("svg", { style: svgStyle, viewBox: `0 0 ${size} ${size}` },
          React.createElement("circle", bgCircleProps),
          React.createElement("circle", progressCircleProps),
        )}
        <View style={[styles.innerContent, { width: size, height: size }]}>
          <Text style={styles.percentText}>{percentage}%</Text>
          <Text style={styles.amountText}>{current.toFixed(0)} {currency}</Text>
          <Text style={styles.goalText}>of {goal} goal</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fallbackRing, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[
        styles.fallbackInner,
        {
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
        }
      ]}>
        <Text style={styles.percentText}>{percentage}%</Text>
        <Text style={styles.amountText}>{current.toFixed(0)} {currency}</Text>
        <Text style={styles.goalText}>of {goal} goal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", position: "relative" },
  innerContent: { position: "absolute", alignItems: "center", justifyContent: "center" },
  percentText: { fontSize: 24, fontWeight: "800", color: BRAND.teal },
  amountText: { fontSize: 13, fontWeight: "600", color: COLORS.text, marginTop: 2 },
  goalText: { fontSize: 11, color: COLORS.textSecondary },
  fallbackRing: { backgroundColor: BRAND.teal + "20", alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: BRAND.teal },
  fallbackInner: { backgroundColor: COLORS.surfaceWhite, alignItems: "center", justifyContent: "center" },
});
