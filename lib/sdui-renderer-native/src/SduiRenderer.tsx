import React, { useCallback, useRef } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";
import type {
  SdNode,
  SdTextNode,
  SdButtonNode,
  SdImageNode,
  SdStackNode,
  SdCardNode,
  SdCarouselNode,
  SdGridNode,
  SdMapNode,
} from "@workspace/sdui-protocol";
import { fontSize, fontWeight, spacing, elevation, borderRadius } from "@workspace/design-tokens/native";
import { getSemanticColors } from "@workspace/design-tokens";
import { modifiersToStyle } from "./ModifierStyles";
import { dispatchAction } from "./ActionHandler";

interface SduiRendererProps {
  node: SdNode;
  theme?: "light" | "dark";
}

const textVariantStyles: Record<string, TextStyle> = {
  h1: { fontSize: fontSize["3xl"], fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
  h2: { fontSize: fontSize["2xl"], fontWeight: fontWeight.bold as TextStyle["fontWeight"] },
  h3: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold as TextStyle["fontWeight"] },
  h4: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold as TextStyle["fontWeight"] },
  body: { fontSize: fontSize.base, fontWeight: fontWeight.normal as TextStyle["fontWeight"] },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.normal as TextStyle["fontWeight"] },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium as TextStyle["fontWeight"] },
  overline: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold as TextStyle["fontWeight"], textTransform: "uppercase", letterSpacing: 1 },
};

function SdTextRenderer({ node, theme }: { node: SdTextNode; theme: string }) {
  const colors = getSemanticColors(theme as "light" | "dark");
  const variantStyle = textVariantStyles[node.variant] || textVariantStyles.body;
  const style: TextStyle = {
    ...variantStyle,
    color: node.color || colors.text,
    textAlign: node.align,
    ...modifiersToStyle(node.modifiers) as any,
  };
  if (node.weight) style.fontWeight = fontWeight[node.weight] as TextStyle["fontWeight"];

  const content = <Text style={style} numberOfLines={node.numberOfLines}>{node.content}</Text>;
  if (node.onPress) {
    return <TouchableOpacity onPress={() => dispatchAction(node.onPress!)}>{content}</TouchableOpacity>;
  }
  return content;
}

function SdButtonRenderer({ node, theme }: { node: SdButtonNode; theme: string }) {
  const colors = getSemanticColors(theme as "light" | "dark");
  const btnColor = node.color || colors.primary;
  const variant = node.variant || "solid";
  const size = node.size || "md";

  const paddingMap = { sm: spacing.sm, md: spacing.md, lg: spacing.lg };
  const fontSizeMap = { sm: fontSize.sm, md: fontSize.base, lg: fontSize.lg };

  const containerStyle: ViewStyle = {
    paddingVertical: paddingMap[size] - 4,
    paddingHorizontal: paddingMap[size] * 1.5,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    opacity: node.disabled ? 0.5 : 1,
    ...(variant === "solid" && { backgroundColor: btnColor }),
    ...(variant === "outline" && { borderWidth: 1.5, borderColor: btnColor }),
    ...(variant === "ghost" && { backgroundColor: "transparent" }),
    ...(variant === "link" && { backgroundColor: "transparent" }),
    ...modifiersToStyle(node.modifiers),
  };

  const textStyle: TextStyle = {
    fontSize: fontSizeMap[size],
    fontWeight: fontWeight.semibold as TextStyle["fontWeight"],
    ...(variant === "solid" && { color: "#ffffff" }),
    ...(variant !== "solid" && { color: btnColor }),
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => !node.disabled && !node.loading && dispatchAction(node.action)}
      disabled={node.disabled || node.loading}
      activeOpacity={0.7}
    >
      {node.loading ? (
        <ActivityIndicator size="small" color={variant === "solid" ? "#ffffff" : btnColor} />
      ) : (
        <Text style={textStyle}>{node.label}</Text>
      )}
    </TouchableOpacity>
  );
}

function SdImageRenderer({ node }: { node: SdImageNode }) {
  const style: ImageStyle = {
    width: node.width || "100%",
    height: node.height,
    aspectRatio: node.aspectRatio,
    borderRadius: node.borderRadius ? (borderRadius as any)[node.borderRadius] ?? 0 : 0,
    ...modifiersToStyle(node.modifiers) as any,
  };

  const resizeMode = node.contentMode === "cover" ? "cover"
    : node.contentMode === "contain" ? "contain"
    : node.contentMode === "fill" ? "stretch"
    : "center";

  return <Image source={{ uri: node.src }} style={style} resizeMode={resizeMode} accessibilityLabel={node.alt} />;
}

function SdStackRenderer({ node, theme }: { node: SdStackNode; theme: string }) {
  const direction = node.direction || "vertical";
  const gap = node.spacing ? (spacing as any)[node.spacing] ?? spacing.md : spacing.md;

  const alignMap: Record<string, ViewStyle["alignItems"]> = {
    start: "flex-start", center: "center", end: "flex-end", stretch: "stretch",
  };
  const justifyMap: Record<string, ViewStyle["justifyContent"]> = {
    start: "flex-start", center: "center", end: "flex-end",
    between: "space-between", around: "space-around", evenly: "space-evenly",
  };

  const style: ViewStyle = {
    flexDirection: direction === "horizontal" ? "row" : "column",
    gap,
    alignItems: node.align ? alignMap[node.align] : undefined,
    justifyContent: node.justify ? justifyMap[node.justify] : undefined,
    flexWrap: node.wrap ? "wrap" : undefined,
    ...modifiersToStyle(node.modifiers),
  };

  return (
    <View style={style}>
      {(node.children as SdNode[]).map((child, i) => (
        <SduiRenderer key={child.id || `child-${i}`} node={child} theme={theme as "light" | "dark"} />
      ))}
    </View>
  );
}

function SdCardRenderer({ node, theme }: { node: SdCardNode; theme: string }) {
  const colors = getSemanticColors(theme as "light" | "dark");
  const style: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...elevation.md,
    ...modifiersToStyle(node.modifiers),
  };

  const content = (
    <View style={style}>
      {node.image && (
        <Image
          source={{ uri: node.image }}
          style={{ width: "100%", aspectRatio: node.imageAspectRatio || 16 / 9 }}
          resizeMode="cover"
        />
      )}
      <View style={{ padding: spacing.lg }}>
        {node.badge && (
          <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, alignSelf: "flex-start", marginBottom: spacing.sm }}>
            <Text style={{ color: "#ffffff", fontSize: fontSize.xs, fontWeight: fontWeight.semibold as TextStyle["fontWeight"] }}>{node.badge}</Text>
          </View>
        )}
        {node.title && <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold as TextStyle["fontWeight"], color: colors.text, marginBottom: spacing.xs }}>{node.title}</Text>}
        {node.subtitle && <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{node.subtitle}</Text>}
        {node.children && (node.children as SdNode[]).map((child, i) => (
          <SduiRenderer key={child.id || `card-child-${i}`} node={child} theme={theme as "light" | "dark"} />
        ))}
      </View>
    </View>
  );

  if (node.onPress) {
    return <TouchableOpacity onPress={() => dispatchAction(node.onPress!)} activeOpacity={0.8}>{content}</TouchableOpacity>;
  }
  return content;
}

function SdCarouselRenderer({ node, theme }: { node: SdCarouselNode; theme: string }) {
  const items = node.children as SdNode[];
  const itemWidth = node.itemWidth || 280;

  return (
    <View style={modifiersToStyle(node.modifiers)}>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + spacing.md}
        decelerationRate="fast"
        keyExtractor={(_, i) => `carousel-${i}`}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <View style={{ width: itemWidth }}>
            <SduiRenderer node={item} theme={theme as "light" | "dark"} />
          </View>
        )}
      />
    </View>
  );
}

function SdGridRenderer({ node, theme }: { node: SdGridNode; theme: string }) {
  const gap = node.spacing ? (spacing as any)[node.spacing] ?? spacing.md : spacing.md;
  const cols = node.columns;
  const children = node.children as SdNode[];

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap, ...modifiersToStyle(node.modifiers) }}>
      {children.map((child, i) => (
        <View key={child.id || `grid-${i}`} style={{ width: `${(100 / cols) - 2}%` as any }}>
          <SduiRenderer node={child} theme={theme as "light" | "dark"} />
        </View>
      ))}
    </View>
  );
}

function SdMapRenderer({ node, theme }: { node: SdMapNode; theme: string }) {
  const colors = getSemanticColors(theme as "light" | "dark");
  return (
    <View style={{ height: node.height || 200, backgroundColor: colors.elevated, borderRadius: borderRadius.lg, alignItems: "center", justifyContent: "center", ...modifiersToStyle(node.modifiers) }}>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
        Map: {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
        {node.markers && ` (${node.markers.length} markers)`}
      </Text>
    </View>
  );
}

export function SduiRenderer({ node, theme = "light" }: SduiRendererProps) {
  switch (node.type) {
    case "text":
      return <SdTextRenderer node={node as SdTextNode} theme={theme} />;
    case "button":
      return <SdButtonRenderer node={node as SdButtonNode} theme={theme} />;
    case "image":
      return <SdImageRenderer node={node as SdImageNode} />;
    case "stack":
      return <SdStackRenderer node={node as SdStackNode} theme={theme} />;
    case "card":
      return <SdCardRenderer node={node as SdCardNode} theme={theme} />;
    case "carousel":
      return <SdCarouselRenderer node={node as SdCarouselNode} theme={theme} />;
    case "grid":
      return <SdGridRenderer node={node as SdGridNode} theme={theme} />;
    case "map":
      return <SdMapRenderer node={node as SdMapNode} theme={theme} />;
    default:
      return null;
  }
}
