import { colors } from "./colors";

export function getSemanticColors(mode: "light" | "dark") {
  const isDark = mode === "dark";
  return {
    primary: colors.primary.blue,
    primaryDark: colors.primary.blueDark,
    primaryLight: colors.primary.blueLight,
    primaryTint: isDark ? "#1a2744" : "#ebf4ff",
    darkNavy: colors.primary.navy,
    surface: isDark ? colors.surface.dark.background : colors.surface.light.background,
    surfaceWhite: isDark ? colors.surface.dark.background : colors.surface.light.background,
    card: isDark ? colors.surface.dark.card : colors.surface.light.card,
    elevated: isDark ? colors.surface.dark.elevated : colors.surface.light.elevated,
    border: isDark ? colors.border.dark.default : colors.border.light.default,
    borderLight: isDark ? colors.border.dark.subtle : colors.border.light.subtle,
    text: isDark ? colors.text.dark.primary : colors.text.light.primary,
    textSecondary: isDark ? colors.text.dark.secondary : colors.text.light.secondary,
    textMuted: isDark ? colors.text.dark.muted : colors.text.light.muted,
    textInverse: isDark ? colors.text.dark.inverse : colors.text.light.inverse,
    success: isDark ? colors.semantic.successLight : colors.semantic.success,
    warning: isDark ? colors.semantic.warningLight : colors.semantic.warning,
    danger: isDark ? colors.semantic.errorLight : colors.semantic.error,
    info: isDark ? colors.semantic.infoLight : colors.semantic.info,
    suggest: isDark ? colors.extended.purpleLight : colors.extended.purple,
    propose: isDark ? colors.semantic.warningLight : colors.semantic.warning,
    execute: isDark ? colors.semantic.successLight : colors.semantic.success,
    userBubble: isDark ? colors.primary.blue : colors.primary.navy,
    assistantBubble: isDark ? colors.surface.dark.card : colors.surface.light.card,
    chipBg: isDark ? colors.surface.dark.elevated : colors.surface.light.elevated,
    chipBorder: isDark ? colors.border.dark.default : colors.border.light.default,
    overlay: isDark ? colors.surface.dark.overlay : colors.surface.light.overlay,
    online: isDark ? colors.semantic.successLight : "#22c55e",
  };
}

export type SemanticColors = ReturnType<typeof getSemanticColors>;
