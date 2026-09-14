import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type DesktopSmoothScrollProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DesktopSmoothScroll({ children, className, contentClassName }: DesktopSmoothScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;
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
  }, []);

  return (
    <div ref={wrapperRef} className={cn("min-h-0 flex-1 overflow-y-auto thin-scroll", className)}>
      <div ref={contentRef} className={contentClassName}>{children}</div>
    </div>
  );
}
