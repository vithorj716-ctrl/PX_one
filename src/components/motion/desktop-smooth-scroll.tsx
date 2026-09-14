import Lenis from "lenis";
import { useEffect, type RefObject } from "react";

export function useDesktopSmoothScroll(wrapperRef: RefObject<HTMLElement | null>) {

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = wrapper?.firstElementChild;
    if (!wrapper || !(content instanceof HTMLElement)) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ wrapper, content, duration: 0.9, smoothWheel: true });
    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [wrapperRef]);
}
