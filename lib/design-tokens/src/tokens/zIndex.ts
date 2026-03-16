export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
  max: 9999,
} as const;

export type ZIndex = typeof zIndex;
