/**
 * Pre-hydration entry arming.
 *
 * The server renders the login/brand content in its FINAL visible state, and the
 * GSAP entry timelines only start once the bundle has hydrated (measured at
 * ~1.2s on a cold load). The result was the bug reported on desktop: the page
 * paints finished, then jumps back to opacity 0 and animates — which reads as
 * "the animation did not run" or as a flicker, depending on how fast the machine
 * hydrates. A purely client-rendered app (the Motors Hub reference) never shows
 * that window, which is why the same browser looked fine there.
 *
 * The fix is CSS-owned: entry targets ship hidden in the SSR HTML and carry a
 * safety reveal that runs at 1.2s if JavaScript never boots. As soon as the
 * motion runtime is alive we mark <html data-motion="ready">, which drops the
 * safety animation so GSAP's inline styles take over cleanly. No library ever
 * writes the same property as the CSS at the same time.
 */
export function armMotionRuntime() {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-motion", "ready");
}
