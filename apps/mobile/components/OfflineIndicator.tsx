import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { COLORS } from "@/constants/colors";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch("https://httpbin.org/get", { signal: controller.signal, method: "HEAD" });
        clearTimeout(timeout);
        setIsOffline(false);
      } catch {
        setIsOffline(true);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -40,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.warning,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  icon: { fontSize: 12 },
  text: { fontSize: 12, fontWeight: "600", color: "#1C1917" },
});
