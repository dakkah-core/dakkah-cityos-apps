import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { COLORS } from "@cityos/mobile-core";

function SkeletonPulse({ style }: { style?: object }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[styles.base, style, { opacity }]} />;
}

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SkeletonPulse style={styles.statusBar} />
      </View>
      <View style={styles.statsRow}>
        <SkeletonPulse style={styles.statCard} />
        <SkeletonPulse style={styles.statCard} />
        <SkeletonPulse style={styles.statCard} />
      </View>
      <SkeletonPulse style={styles.earningsCard} />
      <SkeletonPulse style={styles.jobCard} />
      <SkeletonPulse style={styles.jobCard} />
    </View>
  );
}

export function EarningsSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonPulse style={styles.bigCard} />
      <View style={styles.statsRow}>
        <SkeletonPulse style={styles.statCard} />
        <SkeletonPulse style={styles.statCard} />
        <SkeletonPulse style={styles.statCard} />
      </View>
      <SkeletonPulse style={styles.chartArea} />
      <SkeletonPulse style={styles.listItem} />
      <SkeletonPulse style={styles.listItem} />
      <SkeletonPulse style={styles.listItem} />
    </View>
  );
}

export function JobDetailSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonPulse style={styles.mapArea} />
      <View style={styles.statsRow}>
        <SkeletonPulse style={styles.statCard} />
        <SkeletonPulse style={styles.statCard} />
        <SkeletonPulse style={styles.statCard} />
      </View>
      <SkeletonPulse style={styles.timelineArea} />
      <SkeletonPulse style={styles.jobCard} />
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      <View style={[styles.row, { justifyContent: "center", gap: 12 }]}>
        <SkeletonPulse style={styles.avatar} />
      </View>
      <SkeletonPulse style={styles.nameBar} />
      <SkeletonPulse style={styles.jobCard} />
      <SkeletonPulse style={styles.listItem} />
      <SkeletonPulse style={styles.listItem} />
      <SkeletonPulse style={styles.listItem} />
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Animated.Text style={styles.emptyIcon}>{icon}</Animated.Text>
      </View>
      <Animated.Text style={styles.emptyTitle}>{title}</Animated.Text>
      <Animated.Text style={styles.emptySubtitle}>{subtitle}</Animated.Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Animated.Text style={styles.emptyIcon}>⚠️</Animated.Text>
      <Animated.Text style={styles.emptyTitle}>Something went wrong</Animated.Text>
      <Animated.Text style={styles.emptySubtitle}>{message}</Animated.Text>
      <View style={styles.retryBtn}>
        <Animated.Text style={styles.retryText} onPress={onRetry}>Try Again</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: "#e2e8f0", borderRadius: 10 },
  container: { padding: 16, gap: 12 },
  row: { flexDirection: "row", gap: 10 },
  statsRow: { flexDirection: "row", gap: 10 },
  statusBar: { height: 48, flex: 1, borderRadius: 12 },
  statCard: { height: 72, flex: 1, borderRadius: 12 },
  earningsCard: { height: 100, borderRadius: 14 },
  jobCard: { height: 120, borderRadius: 14 },
  bigCard: { height: 140, borderRadius: 16 },
  chartArea: { height: 180, borderRadius: 14 },
  mapArea: { height: 200, borderRadius: 14 },
  timelineArea: { height: 160, borderRadius: 14 },
  listItem: { height: 56, borderRadius: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  nameBar: { height: 24, width: "60%", alignSelf: "center", borderRadius: 6 },
  emptyContainer: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 },
  emptyIconWrap: { marginBottom: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 4, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", lineHeight: 20 },
  retryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
