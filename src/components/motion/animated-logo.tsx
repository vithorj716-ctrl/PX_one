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
        gsap.set(root, { opacity: 1, transform: "none", filter: "none" });
        return;
      }
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(root, { opacity: 0, scale: 0.94, y: 8 }, { opacity: 1, scale: 0.985, y: 0, duration: 0.48 })
        .to(root, { scale: 1, duration: 0.12, ease: "power2.out" })
        .fromTo("[data-logo-sheen]", { xPercent: -240, opacity: 0 }, { xPercent: 620, opacity: 0.14, duration: 0.52, ease: "power2.inOut" }, "-=0.02")
        .set("[data-logo-sheen]", { opacity: 0 })
        .set(root, { opacity: 1, transform: "none", filter: "none" });
    }, root);
    return () => {
      ctx.kill();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={cn("relative isolate overflow-hidden", className)}>
      {children}
      <span aria-hidden="true" data-logo-sheen className="logo-sheen-layer" />
    </div>
  );
}
