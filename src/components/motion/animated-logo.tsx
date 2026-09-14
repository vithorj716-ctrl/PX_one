import { gsap } from "gsap";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AnimatedLogo({ children, className = "" }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.1, clearProps: "opacity" });
        return;
      }
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(root, { opacity: 0, scale: 0.92, y: 8, filter: "blur(4px)" }, { opacity: 1, scale: 0.985, y: 0, filter: "blur(0px)", duration: 0.42 })
        .to(root, { scale: 1, duration: 0.16, ease: "power2.out", clearProps: "transform,filter,opacity" })
        .fromTo("[data-logo-sheen]", { xPercent: -240, opacity: 0 }, { xPercent: 620, opacity: 0.72, duration: 0.72, ease: "power2.inOut", clearProps: "transform,opacity" }, "-=0.03");
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={cn("px-logo-idle relative isolate overflow-hidden", className)}>
      {children}
      <span aria-hidden="true" data-logo-sheen className="px-sheen-layer px-sheen-manual" />
    </div>
  );
}
