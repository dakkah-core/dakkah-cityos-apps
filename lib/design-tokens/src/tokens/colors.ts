export const colors = {
  primary: {
    navy: "#0a1628",
    navyLight: "#1a2a42",
    blue: "#3182ce",
    blueDark: "#2b6cb0",
    blueLight: "#4299e1",
  },
  extended: {
    purple: "#7c3aed",
    purpleLight: "#8b5cf6",
    teal: "#0d9488",
    tealLight: "#14b8a6",
    amber: "#d97706",
    amberLight: "#f59e0b",
    rose: "#e11d48",
    roseLight: "#fb7185",
  },
  semantic: {
    success: "#10b981",
    successLight: "#34d399",
    warning: "#f59e0b",
    warningLight: "#fbbf24",
    error: "#ef4444",
    errorLight: "#f87171",
    info: "#3b82f6",
    infoLight: "#60a5fa",
  },
  neutral: {
    gray50: "#fafafa",
    gray100: "#f4f4f5",
    gray200: "#e4e4e7",
    gray300: "#d4d4d8",
    gray400: "#a1a1aa",
    gray500: "#71717a",
    gray600: "#52525b",
    gray700: "#3f3f46",
    gray800: "#27272a",
    gray900: "#18181b",
  },
  surface: {
    light: {
      background: "#ffffff",
      card: "#ffffff",
      elevated: "#fafafa",
      overlay: "rgba(0,0,0,0.5)",
    },
    dark: {
      background: "#0f1923",
      card: "#1b2838",
      elevated: "#253347",
      overlay: "rgba(0,0,0,0.7)",
    },
  },
  text: {
    light: {
      primary: "#1c1917",
      secondary: "#78716c",
      muted: "#a8a29e",
      inverse: "#fafaf9",
    },
    dark: {
      primary: "#e8e6e3",
      secondary: "#9ca3af",
      muted: "#6b7280",
      inverse: "#1c1917",
    },
  },
  border: {
    light: {
      default: "#e4e4e7",
      subtle: "#f4f4f5",
    },
    dark: {
      default: "#2a3a4e",
      subtle: "#1b2838",
    },
  },
} as const;

export type Colors = typeof colors;
