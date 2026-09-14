export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const MOTION = {
  fast: 0.12,
  routeEnter: 0.3,
  routeExit: 0.18,
  drawerEnter: 0.26,
  drawerExit: 0.2,
  reduced: 0.1,
  dashboard: 0.5,
  dashboardStagger: 0.045,
} as const;

export const NAV_SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;

export const BRAND_MOTION = {
  markDuration: 0.7,
  sheenDuration: 0.9,
  wordDuration: 0.45,
  wordStagger: 0.08,
  lineDuration: 0.6,
  recurringSheenDuration: 1.1,
  recurringSheenDelay: 3,
  recurringSheenRepeatDelay: 4.5,
  loginContentDelay: 0.34,
} as const;
