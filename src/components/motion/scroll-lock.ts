/**
 * Tiny reference-counted scroll lock.
 * Drawers, dialogs and the command palette register here so the desktop smooth
 * scroll (Lenis) can stop driving the page while an overlay owns the scroll.
 */

let locks = 0;
const listeners = new Set<(locked: boolean) => void>();

function emit() {
  const locked = locks > 0;
  for (const listener of listeners) listener(locked);
}

export function acquireScrollLock(): () => void {
  locks += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    emit();
  };
}

export function isScrollLocked() {
  return locks > 0;
}

export function subscribeScrollLock(listener: (locked: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
