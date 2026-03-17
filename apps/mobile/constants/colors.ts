import { colors, getSemanticColors } from "@cityos/design-tokens/native";

export const COLORS = getSemanticColors("light");

export const BRAND = {
  navy: colors.primary.navy,
  navyLight: colors.primary.navyLight,
  blue: colors.primary.blue,
  blueDark: colors.primary.blueDark,
  blueLight: colors.primary.blueLight,
  teal: colors.extended.teal,
  tealLight: colors.extended.tealLight,
  amber: colors.extended.amber,
  amberLight: colors.extended.amberLight,
  rose: colors.extended.rose,
  roseLight: colors.extended.roseLight,
  purple: colors.extended.purple,
  purpleLight: colors.extended.purpleLight,
  success: colors.semantic.success,
  warning: colors.semantic.warning,
  error: colors.semantic.error,
  info: colors.semantic.info,
} as const;
