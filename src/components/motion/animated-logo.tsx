import { gsap } from "gsap";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BRAND_MOTION } from "@/components/motion/tokens";

type AnimatedLogoProps = {
  children: ReactNode;
  className?: string;
  wordmark?: string;
  submark?: string;
  variant?: "brand" | "login";
};

export function AnimatedLogo({ children, className = "", wordmark, submark, variant = "brand" }: AnimatedLogoProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(root.querySelectorAll("[data-logo-mark], [data-logo-word], [data-logo-line]"), { opacity: 1, transform: "none", filter: "none" });
        gsap.set(root.querySelector("[data-logo-sheen]"), { opacity: 0 });
        return;
      }
      // Alvos ausentes (sem wordmark/submark) não entram na timeline: evita avisos do GSAP.
      const pick = (sel: string) => (root.querySelectorAll(sel).length ? sel : null);
      const markSel = pick("[data-logo-mark]");
      const sheenSel = pick("[data-logo-sheen]");
      const wordSel = pick("[data-logo-word]");
      const lineSel = pick("[data-logo-line]");
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      const login = variant === "login";
      if (markSel) timeline
        .fromTo(markSel, {
          opacity: 0,
          y: login ? 18 : 6,
          scale: login ? 0.86 : 0.94,
          filter: `blur(${login ? 10 : 6}px)`,
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: login ? 0.9 : BRAND_MOTION.markDuration,
        })
      if (sheenSel) timeline
        .fromTo(sheenSel, { xPercent: -140, opacity: 0.12 }, {
          xPercent: 140,
          opacity: 0.12,
          duration: BRAND_MOTION.sheenDuration,
          ease: "power2.inOut",
        }, "-=0.35");
      if (wordSel) timeline
        .fromTo(wordSel, { opacity: 0, x: -8 }, {
          opacity: 1,
          x: 0,
          duration: BRAND_MOTION.wordDuration,
          stagger: BRAND_MOTION.wordStagger,
        }, "-=0.7");
      if (lineSel) timeline
        .fromTo(lineSel, { scaleX: 0 }, {
          scaleX: 1,
          duration: BRAND_MOTION.lineDuration,
          transformOrigin: "left center",
        }, "-=0.4");
      if (sheenSel) timeline.set(sheenSel, { opacity: 0 });
      timeline.set([markSel, wordSel, lineSel].filter(Boolean) as string[], { opacity: 1, transform: "none", filter: "none" });

      if (sheenSel) gsap.fromTo(sheenSel, { xPercent: -140, opacity: 0 }, {
        xPercent: 140,
        opacity: 0.1,
        duration: BRAND_MOTION.recurringSheenDuration,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: BRAND_MOTION.recurringSheenRepeatDelay,
        delay: BRAND_MOTION.recurringSheenDelay,
      });
    }, root);
    return () => {
      ctx.kill();
      ctx.revert();
    };
  }, [variant]);

  return (
    <div ref={rootRef} className={cn(wordmark ? "flex min-w-0 items-center gap-3" : "", className)}>
      <div data-logo-mark className="relative isolate overflow-hidden shrink-0">
        {children}
        <span aria-hidden="true" data-logo-sheen className="logo-sheen-layer" />
      </div>
      {wordmark && (
        <div className="min-w-0 leading-none">
          <div data-logo-word className="truncate text-sm font-semibold">{wordmark}</div>
          {submark && <div className="mt-1.5 flex items-center gap-2"><span data-logo-line className="h-px w-5 bg-brand" /><span data-logo-word className="truncate text-[9px] uppercase tracking-widest text-brand">{submark}</span></div>}
        </div>
      )}
    </div>
  );
}
