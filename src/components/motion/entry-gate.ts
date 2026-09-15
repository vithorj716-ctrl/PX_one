/**
 * Should an entry timeline actually animate?
 *
 * FAIL-SAFE IS VISIBLE CONTENT: nothing is ever hidden waiting for JavaScript.
 * The consequence is that on a server-rendered first load the screen may already
 * be painted by the time hydration runs the timeline — animating from opacity 0
 * at that point reads as a flicker ("the page jumped back").
 *
 * So: on the very first client mount we animate only when hydration landed while
 * the paint is still fresh; after that (every client-side navigation, every
 * remount) entries always animate, exactly like a client-rendered app.
 */
const FRESH_PAINT_MS = 700;

let hydrated = false;

export function canAnimateEntry(): boolean {
  if (typeof window === "undefined") return false;
  if (hydrated) return true;
  hydrated = true;
  return performance.now() < FRESH_PAINT_MS;
}
