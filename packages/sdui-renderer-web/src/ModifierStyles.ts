import type { SdModifiers } from "@cityos/sdui-protocol";

const sizeToClass: Record<string, string> = {
  xs: "1", sm: "2", md: "3", lg: "4", xl: "6", "2xl": "8", "3xl": "12",
};

const radiusToClass: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

const borderWidthToClass: Record<string, string> = {
  none: "border-0",
  thin: "border",
  medium: "border-2",
  thick: "border-4",
};

export function modifiersToClassName(modifiers?: SdModifiers): string {
  if (!modifiers) return "";
  const classes: string[] = [];

  if (modifiers.padding) classes.push(`p-${sizeToClass[modifiers.padding] || "3"}`);
  if (modifiers.paddingX) classes.push(`px-${sizeToClass[modifiers.paddingX] || "3"}`);
  if (modifiers.paddingY) classes.push(`py-${sizeToClass[modifiers.paddingY] || "3"}`);
  if (modifiers.margin) classes.push(`m-${sizeToClass[modifiers.margin] || "3"}`);
  if (modifiers.marginX) classes.push(`mx-${sizeToClass[modifiers.marginX] || "3"}`);
  if (modifiers.marginY) classes.push(`my-${sizeToClass[modifiers.marginY] || "3"}`);
  if (modifiers.borderRadius) classes.push(radiusToClass[modifiers.borderRadius] || "rounded-md");
  if (modifiers.borderWidth) classes.push(borderWidthToClass[modifiers.borderWidth] || "border");
  if (modifiers.hidden) classes.push("hidden");

  return classes.join(" ");
}

export function modifiersToStyle(modifiers?: SdModifiers): React.CSSProperties {
  if (!modifiers) return {};
  const style: React.CSSProperties = {};

  if (modifiers.backgroundColor) style.backgroundColor = modifiers.backgroundColor;
  if (modifiers.borderColor) style.borderColor = modifiers.borderColor;
  if (modifiers.opacity !== undefined) style.opacity = modifiers.opacity;
  if (modifiers.minWidth !== undefined) style.minWidth = modifiers.minWidth;
  if (modifiers.maxWidth !== undefined) style.maxWidth = modifiers.maxWidth;
  if (modifiers.minHeight !== undefined) style.minHeight = modifiers.minHeight;
  if (modifiers.maxHeight !== undefined) style.maxHeight = modifiers.maxHeight;
  if (modifiers.flex !== undefined) style.flex = modifiers.flex;

  return style;
}
