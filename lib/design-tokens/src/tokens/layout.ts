export const contentWidth = {
  narrow: 640,
  default: 768,
  wide: 1024,
  full: 1280,
} as const;

export const sidebarWidth = {
  collapsed: 64,
  default: 256,
  wide: 320,
} as const;

export const headerHeight = {
  mobile: 56,
  desktop: 64,
} as const;

export type ContentWidth = typeof contentWidth;
