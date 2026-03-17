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

export const categoryColors = {
  all: { fg: "#78716C", bg: "#F5F5F4" },
  food: { fg: "#EA580C", bg: "#FFF7ED" },
  nightlife: { fg: "#4F46E5", bg: "#EEF2FF" },
  culture: { fg: "#E11D48", bg: "#FFF1F2" },
  wellness: { fg: "#059669", bg: "#ECFDF5" },
  shopping: { fg: "#2563EB", bg: "#EFF6FF" },
  services: { fg: "#475569", bg: "#F8FAFC" },
  transit: { fg: "#0891B2", bg: "#ECFEFF" },
  family: { fg: "#CA8A04", bg: "#FEFCE8" },
  work: { fg: "#6366F1", bg: "#EEF2FF" },
  education: { fg: "#7C3AED", bg: "#F5F3FF" },
  home: { fg: "#92400E", bg: "#FFFBEB" },
  social: { fg: "#DB2777", bg: "#FDF2F8" },
  intel: { fg: "#0D9488", bg: "#F0FDFA" },
  planning: { fg: "#65A30D", bg: "#F7FEE7" },
  outdoor: { fg: "#16A34A", bg: "#F0FDF4" },
  beauty: { fg: "#EC4899", bg: "#FDF2F8" },
  health: { fg: "#DC2626", bg: "#FEF2F2" },
  myActivity: { fg: "#0EA5E9", bg: "#F0F9FF" },
  utility: { fg: "#64748B", bg: "#F8FAFC" },
  nature: { fg: "#16A34A", bg: "#F0FDF4" },
  landmark: { fg: "#7C3AED", bg: "#F5F3FF" },
  arts: { fg: "#DB2777", bg: "#FDF2F8" },
  leisure: { fg: "#0891B2", bg: "#ECFEFF" },
} as const;

export type Colors = typeof colors;
export type CategoryColors = typeof categoryColors;
