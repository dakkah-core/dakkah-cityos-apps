import React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import type { ViewStyle, TextStyle, ImageStyle, DimensionValue } from "react-native";
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
} from "@cityos/sdui-protocol";
import { fontSize, fontWeight, spacing, elevation, borderRadius } from "@cityos/design-tokens/native";
import { getSemanticColors } from "@cityos/design-tokens";
import { modifiersToStyle } from "./ModifierStyles";
import { dispatchAction } from "./ActionHandler";

interface SduiRendererProps {
  node: SdNode;
  theme?: "light" | "dark";
  MapViewComponent?: React.ComponentType<MapViewProps>;
}

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: number;
  markers?: SdMapNode["markers"];
  style?: ViewStyle;
}

type FontWeightValue = TextStyle["fontWeight"];
type SpacingKey = keyof typeof spacing;
type BorderRadiusKey = keyof typeof borderRadius;

const textVariantStyles: Record<string, TextStyle> = {
  h1: { fontSize: fontSize["3xl"], fontWeight: fontWeight.bold as FontWeightValue },
  h2: { fontSize: fontSize["2xl"], fontWeight: fontWeight.bold as FontWeightValue },
  h3: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold as FontWeightValue },
  h4: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold as FontWeightValue },
  body: { fontSize: fontSize.base, fontWeight: fontWeight.normal as FontWeightValue },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.normal as FontWeightValue },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium as FontWeightValue },
  overline: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold as FontWeightValue, textTransform: "uppercase", letterSpacing: 1 },
};

function SdTextRenderer({ node, theme }: { node: SdTextNode; theme: "light" | "dark" }) {
  const colors = getSemanticColors(theme);
  const variantStyle = textVariantStyles[node.variant] || textVariantStyles.body;
  const style: TextStyle = {
    ...variantStyle,
    color: node.color || colors.text,
    textAlign: node.align,
    ...(modifiersToStyle(node.modifiers) as TextStyle),
  };
  if (node.weight) style.fontWeight = fontWeight[node.weight] as FontWeightValue;

  const content = <Text style={style} numberOfLines={node.numberOfLines}>{node.content}</Text>;
  if (node.onPress) {
    return <TouchableOpacity onPress={() => dispatchAction(node.onPress!)}>{content}</TouchableOpacity>;
  }
  return content;
}

function SdButtonRenderer({ node, theme }: { node: SdButtonNode; theme: "light" | "dark" }) {
  const colors = getSemanticColors(theme);
  const btnColor = node.color || colors.primary;
  const variant = node.variant || "solid";
  const size = node.size || "md";

  const paddingMap: Record<string, number> = { sm: spacing.sm, md: spacing.md, lg: spacing.lg };
  const fontSizeMap: Record<string, number> = { sm: fontSize.sm, md: fontSize.base, lg: fontSize.lg };

  const containerStyle: ViewStyle = {
    paddingVertical: paddingMap[size] - 4,
    paddingHorizontal: paddingMap[size] * 1.5,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    opacity: node.disabled ? 0.5 : 1,
    ...(variant === "solid" ? { backgroundColor: btnColor } : {}),
    ...(variant === "outline" ? { borderWidth: 1.5, borderColor: btnColor } : {}),
    ...modifiersToStyle(node.modifiers),
  };

  const textStyle: TextStyle = {
    fontSize: fontSizeMap[size],
    fontWeight: fontWeight.semibold as FontWeightValue,
    ...(variant === "solid" ? { color: "#ffffff" } : { color: btnColor }),
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
    width: (node.width || "100%") as DimensionValue,
    height: node.height,
    aspectRatio: node.aspectRatio,
    borderRadius: node.borderRadius ? (borderRadius[node.borderRadius as BorderRadiusKey] ?? 0) : 0,
    ...(modifiersToStyle(node.modifiers) as ImageStyle),
  };

  const resizeMode = node.contentMode === "cover" ? "cover"
    : node.contentMode === "contain" ? "contain"
    : node.contentMode === "fill" ? "stretch"
    : "center";

  return <Image source={{ uri: node.src }} style={style} resizeMode={resizeMode} accessibilityLabel={node.alt} />;
}

function SdStackRenderer({ node, theme, MapViewComponent }: { node: SdStackNode; theme: "light" | "dark"; MapViewComponent?: React.ComponentType<MapViewProps> }) {
  const direction = node.direction || "vertical";
  const gap = node.spacing ? (spacing[node.spacing as SpacingKey] ?? spacing.md) : spacing.md;

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
      {node.children.map((child, i) => (
        <SduiRenderer key={child.id || `child-${i}`} node={child} theme={theme} MapViewComponent={MapViewComponent} />
      ))}
    </View>
  );
}

function SdCardRenderer({ node, theme, MapViewComponent }: { node: SdCardNode; theme: "light" | "dark"; MapViewComponent?: React.ComponentType<MapViewProps> }) {
  const colors = getSemanticColors(theme);
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
          style={{ width: "100%" as DimensionValue, aspectRatio: node.imageAspectRatio || 16 / 9 }}
          resizeMode="cover"
        />
      )}
      <View style={{ padding: spacing.lg }}>
        {node.badge && (
          <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, alignSelf: "flex-start", marginBottom: spacing.sm }}>
            <Text style={{ color: "#ffffff", fontSize: fontSize.xs, fontWeight: fontWeight.semibold as FontWeightValue }}>{node.badge}</Text>
          </View>
        )}
        {node.title && <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold as FontWeightValue, color: colors.text, marginBottom: spacing.xs }}>{node.title}</Text>}
        {node.subtitle && <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{node.subtitle}</Text>}
        {node.children && node.children.map((child, i) => (
          <SduiRenderer key={child.id || `card-child-${i}`} node={child} theme={theme} MapViewComponent={MapViewComponent} />
        ))}
      </View>
    </View>
  );

  if (node.onPress) {
    return <TouchableOpacity onPress={() => dispatchAction(node.onPress!)} activeOpacity={0.8}>{content}</TouchableOpacity>;
  }
  return content;
}

function SdCarouselRenderer({ node, theme, MapViewComponent }: { node: SdCarouselNode; theme: "light" | "dark"; MapViewComponent?: React.ComponentType<MapViewProps> }) {
  const items = node.children;
  const itemWidth = node.itemWidth || 280;

  return (
    <View style={modifiersToStyle(node.modifiers)}>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + spacing.md}
        decelerationRate="fast"
        keyExtractor={(item, i) => item.id || `carousel-${i}`}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <View style={{ width: itemWidth }}>
            <SduiRenderer node={item} theme={theme} MapViewComponent={MapViewComponent} />
          </View>
        )}
      />
    </View>
  );
}

function SdGridRenderer({ node, theme, MapViewComponent }: { node: SdGridNode; theme: "light" | "dark"; MapViewComponent?: React.ComponentType<MapViewProps> }) {
  const gap = node.spacing ? (spacing[node.spacing as SpacingKey] ?? spacing.md) : spacing.md;
  const cols = node.columns;
  const children = node.children;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap, ...modifiersToStyle(node.modifiers) }}>
      {children.map((child, i) => (
        <View key={child.id || `grid-${i}`} style={{ width: `${Math.floor(100 / cols) - 2}%` as DimensionValue }}>
          <SduiRenderer node={child} theme={theme} MapViewComponent={MapViewComponent} />
        </View>
      ))}
    </View>
  );
}

function SdMapRenderer({ node, theme, MapViewComponent }: { node: SdMapNode; theme: "light" | "dark"; MapViewComponent?: React.ComponentType<MapViewProps> }) {
  const colors = getSemanticColors(theme);
  const mapStyle: ViewStyle = {
    height: node.height || 200,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...modifiersToStyle(node.modifiers),
  };

  if (MapViewComponent) {
    return (
      <MapViewComponent
        latitude={node.latitude}
        longitude={node.longitude}
        zoom={node.zoom}
        height={node.height}
        markers={node.markers}
        style={mapStyle}
      />
    );
  }

  return (
    <View style={{ ...mapStyle, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
        Map: {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
        {node.markers ? ` (${node.markers.length} markers)` : ""}
      </Text>
    </View>
  );
}

export function SduiRenderer({ node, theme = "light", MapViewComponent }: SduiRendererProps) {
  switch (node.type) {
    case "text":
      return <SdTextRenderer node={node} theme={theme} />;
    case "button":
      return <SdButtonRenderer node={node} theme={theme} />;
    case "image":
      return <SdImageRenderer node={node} />;
    case "stack":
      return <SdStackRenderer node={node} theme={theme} MapViewComponent={MapViewComponent} />;
    case "card":
      return <SdCardRenderer node={node} theme={theme} MapViewComponent={MapViewComponent} />;
    case "carousel":
      return <SdCarouselRenderer node={node} theme={theme} MapViewComponent={MapViewComponent} />;
    case "grid":
      return <SdGridRenderer node={node} theme={theme} MapViewComponent={MapViewComponent} />;
    case "map":
      return <SdMapRenderer node={node} theme={theme} MapViewComponent={MapViewComponent} />;
    default:
      return null;
  }
}
