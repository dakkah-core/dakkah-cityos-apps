import type { ViewStyle } from "react-native";
import type { SdModifiers } from "@workspace/sdui-protocol";
import { spacing, borderRadius as borderRadiusTokens, borderWidth as borderWidthTokens } from "@workspace/design-tokens/native";

const sizeMap: Record<string, number> = {
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
  "2xl": spacing["2xl"],
  "3xl": spacing["3xl"],
};

const radiusMap: Record<string, number> = {
  none: borderRadiusTokens.none,
  sm: borderRadiusTokens.sm,
  md: borderRadiusTokens.md,
  lg: borderRadiusTokens.lg,
  xl: borderRadiusTokens.xl,
  "2xl": borderRadiusTokens["2xl"],
  full: borderRadiusTokens.full,
};

const widthMap: Record<string, number> = {
  none: borderWidthTokens.none,
  thin: borderWidthTokens.thin,
  medium: borderWidthTokens.medium,
  thick: borderWidthTokens.thick,
};

export function modifiersToStyle(modifiers?: SdModifiers): ViewStyle {
  if (!modifiers) return {};
  const style: ViewStyle = {};

  if (modifiers.padding) {
    const v = sizeMap[modifiers.padding] ?? 0;
    style.padding = v;
  }
  if (modifiers.paddingX) {
    const v = sizeMap[modifiers.paddingX] ?? 0;
    style.paddingHorizontal = v;
  }
  if (modifiers.paddingY) {
    const v = sizeMap[modifiers.paddingY] ?? 0;
    style.paddingVertical = v;
  }
  if (modifiers.margin) {
    const v = sizeMap[modifiers.margin] ?? 0;
    style.margin = v;
  }
  if (modifiers.marginX) {
    const v = sizeMap[modifiers.marginX] ?? 0;
    style.marginHorizontal = v;
  }
  if (modifiers.marginY) {
    const v = sizeMap[modifiers.marginY] ?? 0;
    style.marginVertical = v;
  }
  if (modifiers.backgroundColor) style.backgroundColor = modifiers.backgroundColor;
  if (modifiers.borderRadius) style.borderRadius = radiusMap[modifiers.borderRadius] ?? 0;
  if (modifiers.borderWidth) style.borderWidth = widthMap[modifiers.borderWidth] ?? 0;
  if (modifiers.borderColor) style.borderColor = modifiers.borderColor;
  if (modifiers.opacity !== undefined) style.opacity = modifiers.opacity;
  if (modifiers.minWidth !== undefined) style.minWidth = modifiers.minWidth;
  if (modifiers.maxWidth !== undefined) style.maxWidth = modifiers.maxWidth;
  if (modifiers.minHeight !== undefined) style.minHeight = modifiers.minHeight;
  if (modifiers.maxHeight !== undefined) style.maxHeight = modifiers.maxHeight;
  if (modifiers.flex !== undefined) style.flex = modifiers.flex;
  if (modifiers.hidden) style.display = "none";

  return style;
}
