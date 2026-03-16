import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "dakkah_theme";

export type ThemeMode = "light" | "dark";

const LIGHT_PALETTE = {
  primary: "#0A9396",
  primaryDark: "#087F82",
  primaryLight: "#0AB3B6",
  primaryTint: "#E6F6F6",
  darkNavy: "#0D1B2A",
  surface: "#F5F5F4",
  surfaceWhite: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E7E5E4",
  borderLight: "#F5F5F4",
  text: "#1C1917",
  textSecondary: "#78716C",
  textMuted: "#A8A29E",
  textInverse: "#FAFAF9",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  suggest: "#8B5CF6",
  propose: "#F59E0B",
  execute: "#10B981",
  userBubble: "#0D1B2A",
  assistantBubble: "#FFFFFF",
  chipBg: "#F5F5F4",
  chipBorder: "#E7E5E4",
  overlay: "rgba(0,0,0,0.5)",
  online: "#22C55E",
};

const DARK_PALETTE = {
  primary: "#0AB3B6",
  primaryDark: "#0A9396",
  primaryLight: "#0CC7CA",
  primaryTint: "#0D2A2B",
  darkNavy: "#0D1B2A",
  surface: "#1B2838",
  surfaceWhite: "#0F1923",
  card: "#1B2838",
  border: "#2A3A4E",
  borderLight: "#1B2838",
  text: "#E8E6E3",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  textInverse: "#1C1917",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#60A5FA",
  suggest: "#A78BFA",
  propose: "#FBBF24",
  execute: "#34D399",
  userBubble: "#0A9396",
  assistantBubble: "#1B2838",
  chipBg: "#2A3A4E",
  chipBorder: "#374151",
  overlay: "rgba(0,0,0,0.7)",
  online: "#34D399",
};

export type ColorPalette = typeof LIGHT_PALETTE;

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorPalette;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  colors: LIGHT_PALETTE,
  toggle: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === "dark" || val === "light") setModeState(val);
    }).catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  const colors = mode === "dark" ? DARK_PALETTE : LIGHT_PALETTE;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
