import type { ViewStyle } from "react-native";
import type { SdModifiers } from "@cityos/sdui-protocol";
import { spacing, borderRadius as borderRadiusTokens, borderWidth as borderWidthTokens } from "@cityos/design-tokens/native";

type SpacingKey = keyof typeof spacing;
type RadiusKey = keyof typeof borderRadiusTokens;
type WidthKey = keyof typeof borderWidthTokens;

export function modifiersToStyle(modifiers?: SdModifiers): ViewStyle {
  if (!modifiers) return {};
  const style: ViewStyle = {};

  if (modifiers.padding) {
    style.padding = spacing[modifiers.padding as SpacingKey] ?? 0;
  }
  if (modifiers.paddingX) {
    style.paddingHorizontal = spacing[modifiers.paddingX as SpacingKey] ?? 0;
  }
  if (modifiers.paddingY) {
    style.paddingVertical = spacing[modifiers.paddingY as SpacingKey] ?? 0;
  }
  if (modifiers.margin) {
    style.margin = spacing[modifiers.margin as SpacingKey] ?? 0;
  }
  if (modifiers.marginX) {
    style.marginHorizontal = spacing[modifiers.marginX as SpacingKey] ?? 0;
  }
  if (modifiers.marginY) {
    style.marginVertical = spacing[modifiers.marginY as SpacingKey] ?? 0;
  }
  if (modifiers.backgroundColor) style.backgroundColor = modifiers.backgroundColor;
  if (modifiers.borderRadius) style.borderRadius = borderRadiusTokens[modifiers.borderRadius as RadiusKey] ?? 0;
  if (modifiers.borderWidth) style.borderWidth = borderWidthTokens[modifiers.borderWidth as WidthKey] ?? 0;
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
