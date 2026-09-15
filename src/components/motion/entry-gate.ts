/**
 * Should an entry timeline actually animate?
 *
 * Yes — always, in the browser. An earlier version gated the entry on a
 * "fresh paint" window (700ms after load) to avoid a theoretical flicker on
 * server-rendered first paint. On real machines hydration regularly lands
 * later than that, so the gate silently downgraded every entry animation to a
 * barely visible variant — which is exactly why the brand mark read as static.
 *
 * FAIL-SAFE IS STILL VISIBLE CONTENT: nothing is hidden waiting for JS; the
 * timelines only ever animate elements that are already painted.
 */
export function canAnimateEntry(): boolean {
  return typeof window !== "undefined";
}
