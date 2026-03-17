export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
} as const;

export const containerWidths = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const sectionPadding = {
  mobile: 16,
  tablet: 24,
  desktop: 32,
} as const;

export const gridGaps = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export type Spacing = typeof spacing;
