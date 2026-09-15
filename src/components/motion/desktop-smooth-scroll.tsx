import Lenis from "lenis";
import { useEffect, type RefObject } from "react";
import { detectCapabilities, onReducedMotionChange } from "@/lib/browser-capabilities";
import { isScrollLocked, subscribeScrollLock } from "@/components/motion/scroll-lock";

/**
 * Smooth wheel scrolling for the main content area on pointer-fine viewports.
 * - Single RAF loop, always cancelled on unmount (no orphan loops).
 * - Stops driving the scroller while a drawer/dialog holds the scroll lock.
 * - Never runs on touch/coarse pointers or under prefers-reduced-motion.
 * - Recreated when the reduced-motion preference changes.
 */
export function useDesktopSmoothScroll(wrapperRef: RefObject<HTMLElement | null>, contentRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !(content instanceof HTMLElement)) return;

    let lenis: Lenis | null = null;
    let frame = 0;

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lenis?.destroy();
      lenis = null;
    };

    const start = () => {
      if (lenis) return;
      const caps = detectCapabilities();
      // Coarse pointers keep native momentum scrolling; reduced motion opts out entirely.
      if (caps.reducedMotion || !caps.finePointer) return;
      if (typeof window === "undefined" || window.innerWidth < 1024) return;

      lenis = new Lenis({
        wrapper,
        content,
        duration: 0.9,
        smoothWheel: true,
        // Let nested scrollers (tables, drawers, dialogs) keep their own scrolling.
        prevent: (node) => node instanceof HTMLElement && node.closest("[data-lenis-prevent]") !== null,
      });
      if (isScrollLocked()) lenis.stop();

      const loop = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    };

    start();

    const unsubscribeLock = subscribeScrollLock((locked) => {
      if (!lenis) return;
      if (locked) lenis.stop();
      else lenis.start();
    });

    const unsubscribeReduced = onReducedMotionChange(() => {
      stop();
      start();
    });

    const onResize = () => {
      if (window.innerWidth < 1024) stop();
      else start();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      unsubscribeLock();
      unsubscribeReduced();
      window.removeEventListener("resize", onResize);
      stop();
    };
  }, [contentRef, wrapperRef]);
}
