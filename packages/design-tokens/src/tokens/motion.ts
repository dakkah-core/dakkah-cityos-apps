export const duration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

export const easing = {
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export type Duration = typeof duration;
export type Easing = typeof easing;
