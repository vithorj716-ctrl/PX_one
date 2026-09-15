/**
 * Feature detection for the PXOne motion layer.
 * Never sniff user agents — only ask the browser what it supports.
 * Safe to import from SSR modules: every read is lazy and guarded.
 */

export type MotionCapabilities = {
  backdropFilter: boolean;
  colorMix: boolean;
  oklch: boolean;
  dvh: boolean;
  smoothScroll: boolean;
  finePointer: boolean;
  reducedMotion: boolean;
  /** Coarse hint for "keep the ambient effects light" — never used to gate a whole animation. */
  lightweight: boolean;
};

export const DEFAULT_CAPABILITIES: MotionCapabilities = {
  backdropFilter: true,
  colorMix: true,
  oklch: true,
  dvh: true,
  smoothScroll: true,
  finePointer: true,
  reducedMotion: false,
  lightweight: false,
};

function supportsCss(property: string, value: string) {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  try {
    return CSS.supports(property, value) || CSS.supports(`-webkit-${property}`, value);
  } catch {
    return false;
  }
}

function matches(query: string) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

export function detectCapabilities(): MotionCapabilities {
  if (typeof window === "undefined") return DEFAULT_CAPABILITIES;
  const reducedMotion = matches("(prefers-reduced-motion: reduce)");
  const finePointer = matches("(pointer: fine)");
  // Small viewport is the only "lightweight" signal we trust. Privacy-hardened
  // browsers (Brave and friends) report a fake hardwareConcurrency/deviceMemory,
  // so those values must never decide whether an animation runs at all.
  const lightweight = matches("(max-width: 767px)") || matches("(update: slow)");
  return {
    backdropFilter: supportsCss("backdrop-filter", "blur(4px)"),
    colorMix: supportsCss("color", "color-mix(in oklab, red 50%, blue)"),
    oklch: supportsCss("color", "oklch(0.5 0.1 200)"),
    dvh: supportsCss("height", "100dvh"),
    smoothScroll: supportsCss("scroll-behavior", "smooth"),
    finePointer,
    reducedMotion,
    lightweight,
  };
}

const FLAGS: Array<[keyof MotionCapabilities, string]> = [
  ["backdropFilter", "no-backdrop-filter"],
  ["colorMix", "no-color-mix"],
  ["oklch", "no-oklch"],
  ["dvh", "no-dvh"],
  ["reducedMotion", "reduced-motion"],
  ["lightweight", "light-motion"],
];

/**
 * Writes capability classes on <html> so CSS can degrade gracefully, and keeps
 * the reduced-motion flag live. Call once from the root component's effect.
 */
export function initCapabilityFlags(): () => void {
  if (typeof document === "undefined") return () => {};
  const root = document.documentElement;
  const apply = () => {
    const caps = detectCapabilities();
    for (const [key, className] of FLAGS) {
      root.classList.toggle(className, key === "reducedMotion" || key === "lightweight" ? Boolean(caps[key]) : !caps[key]);
    }
  };
  apply();

  const queries = ["(prefers-reduced-motion: reduce)", "(max-width: 767px)"]
    .map((query) => {
      try {
        return window.matchMedia(query);
      } catch {
        return null;
      }
    })
    .filter((mq): mq is MediaQueryList => Boolean(mq));

  for (const mq of queries) mq.addEventListener("change", apply);
  return () => {
    for (const mq of queries) mq.removeEventListener("change", apply);
  };
}

/** Live reduced-motion subscription usable outside React. */
export function onReducedMotionChange(handler: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  let mq: MediaQueryList;
  try {
    mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  } catch {
    return () => {};
  }
  const listener = () => handler(mq.matches);
  mq.addEventListener("change", listener);
  return () => mq.removeEventListener("change", listener);
}
