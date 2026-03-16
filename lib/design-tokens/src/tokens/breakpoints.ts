export const breakpoints = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const screenClass = {
  mobile: { min: 0, max: 479 },
  mobileLarge: { min: 480, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: 1279 },
  desktopWide: { min: 1280, max: 1535 },
  ultrawide: { min: 1536, max: Infinity },
} as const;

export type Breakpoints = typeof breakpoints;
