import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface AvatarProps {
  name: string;
  size?: number;
  isOnline?: boolean;
  isGroup?: boolean;
}

const avatarColors = [
  "#0A9396",
  "#005F73",
  "#EE9B00",
  "#CA6702",
  "#BB3E03",
  "#9B2226",
  "#3A86FF",
  "#8338EC",
  "#06D6A0",
  "#118AB2",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export default function Avatar({
  name,
  size = 48,
  isOnline,
  isGroup,
}: AvatarProps) {
  const bg = getColor(name);
  const fontSize = size * 0.38;
  const indicatorSize = size * 0.28;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
          },
        ]}
      >
        {isGroup ? (
          <View style={styles.groupContainer}>
            <Text
              style={[styles.initials, { fontSize: fontSize * 0.85, top: -2 }]}
            >
              {getInitials(name)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.initials, { fontSize }]}>
            {getInitials(name)}
          </Text>
        )}
      </View>
      {isOnline !== undefined && !isGroup && (
        <View
          style={[
            styles.indicator,
            {
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              backgroundColor: isOnline
                ? Colors.light.online
                : Colors.light.textMuted,
              borderWidth: size * 0.05,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  groupContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderColor: Colors.light.backgroundSecondary,
  },
});
