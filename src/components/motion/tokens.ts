/**
 * Single source of truth for PXOne motion timing.
 * Every duration/easing used by GSAP, Motion or CSS comes from here.
 * Values are seconds (Motion/GSAP). Use `ms()` for CSS/inline styles.
 */

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
export const MOTION_EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
export const GSAP_EASE = "power3.out";

/** Named duration scale — no ad-hoc numbers anywhere else. */
export const DURATION = {
  instant: 0.08,
  fast: 0.12,
  micro: 0.16,
  base: 0.24,
  enter: 0.3,
  exit: 0.18,
  menu: 0.2,
  drawer: 0.26,
  drawerExit: 0.19,
  modal: 0.22,
  modalExit: 0.15,
  page: 0.34,
  pageExit: 0.14,
  emphasis: 0.5,
  reduced: 0.1,
} as const;

/** Back-compat alias used across the shells. */
export const MOTION = {
  fast: DURATION.fast,
  routeEnter: DURATION.page,
  routeExit: DURATION.pageExit,
  drawerEnter: DURATION.drawer,
  drawerExit: DURATION.drawerExit,
  reduced: DURATION.reduced,
  dashboard: DURATION.emphasis,
  dashboardStagger: 0.045,
  sidebar: DURATION.base,
} as const;

export const ms = (seconds: number) => `${Math.round(seconds * 1000)}ms`;

/** Shared-indicator spring — used by the nav layoutId indicator only. */
export const NAV_SPRING = { type: "spring", stiffness: 420, damping: 36, mass: 0.9 } as const;
/** Slightly softer spring for tabs and secondary indicators. */
export const TAB_SPRING = { type: "spring", stiffness: 380, damping: 34 } as const;

/** Route content: stagger applied to the immediate blocks of the incoming page. */
export const CONTENT_ENTER = {
  duration: 0.36,
  stagger: 0.045,
  y: 10,
  maxTargets: 14,
} as const;

export const BRAND_MOTION = {
  markDuration: 0.7,
  markBlur: 6,
  sheenDuration: 0.9,
  wordDuration: 0.45,
  wordStagger: 0.08,
  lineDuration: 0.6,
  recurringSheenDuration: 1.1,
  recurringSheenDelay: 3,
  recurringSheenRepeatDelay: 4.5,
  
} as const;

/** Reusable Motion variants so presence animations stay consistent. */
export const OVERLAY_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, pointerEvents: "none" as const },
};

export const DIALOG_MOTION = {
  initial: { opacity: 0, y: 8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.985 },
};

export const DROPDOWN_MOTION = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
};
