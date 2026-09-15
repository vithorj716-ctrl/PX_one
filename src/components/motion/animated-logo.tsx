import { gsap } from "gsap";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BRAND_MOTION, GSAP_EASE } from "@/components/motion/tokens";
import { useIsomorphicLayoutEffect } from "@/components/motion/use-isomorphic-layout-effect";
import { canAnimateEntry } from "@/components/motion/entry-gate";

type AnimatedLogoProps = {
  children: ReactNode;
  className?: string;
  wordmark?: string;
  submark?: string;
  variant?: "brand" | "login";
};

/**
 * GSAP owns the entry timeline of the mark/wordmark/rule.
 * CSS owns the hover micro-interaction, and it is applied to an OUTER wrapper
 * so the two never write `transform` on the same element.
 * Runs once per variant — route changes do not restart it, because the shells
 * that render this component stay mounted across navigations.
 */
export function AnimatedLogo({ children, className = "", wordmark, submark, variant = "brand" }: AnimatedLogoProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // `late` = the screen was already painted before hydration ran. The entry then
    // plays a softened variant that never drops to opacity 0, so the mark still
    // moves but nothing ever un-paints.
    const late = !canAnimateEntry();
    const all = "[data-logo-mark], [data-logo-word], [data-logo-line]";

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(all, { clearProps: "all", opacity: 1 });
        gsap.set("[data-logo-sheen]", { opacity: 0 });
        return;
      }
      // Absent targets (collapsed sidebar has no wordmark) stay out of the timeline.
      const pick = (selector: string) => (root.querySelectorAll(selector).length ? selector : null);
      const markSel = pick("[data-logo-mark]");
      const sheenSel = pick("[data-logo-sheen]");
      const wordSel = pick("[data-logo-word]");
      const lineSel = pick("[data-logo-line]");
      const login = variant === "login";
      const timeline = gsap.timeline({
        defaults: { ease: GSAP_EASE },
        // clearProps removes every inline transform/opacity/filter GSAP wrote, so
        // CSS hover/active states keep working after the entry finishes.
        onComplete: () => {
          const finals = [markSel, wordSel, lineSel].filter(Boolean) as string[];
          if (finals.length) gsap.set(finals, { clearProps: "opacity,transform,filter" });
        },
      });

      if (markSel) {
        timeline.fromTo(markSel, {
          opacity: late ? 0.55 : 0,
          y: late ? 5 : (login ? 16 : 8),
          scale: late ? 0.975 : (login ? 0.9 : 0.95),
          filter: `blur(${late ? 3 : (login ? 10 : BRAND_MOTION.markBlur)}px)`,
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: late ? 0.5 : (login ? 0.85 : BRAND_MOTION.markDuration),
        });
      }
      if (sheenSel) {
        timeline.fromTo(sheenSel, { xPercent: -140, opacity: 0.12 }, {
          xPercent: 140,
          opacity: 0.12,
          duration: BRAND_MOTION.sheenDuration,
          ease: "power2.inOut",
        }, "-=0.35");
      }
      if (wordSel) {
        timeline.fromTo(wordSel, { opacity: late ? 0.6 : 0, x: late ? -4 : -8 }, {
          opacity: 1,
          x: 0,
          duration: BRAND_MOTION.wordDuration,
          stagger: BRAND_MOTION.wordStagger,
        }, "-=0.7");
      }
      if (lineSel) {
        timeline.fromTo(lineSel, { scaleX: late ? 0.25 : 0 }, {
          scaleX: 1,
          duration: BRAND_MOTION.lineDuration,
          transformOrigin: "left center",
        }, "-=0.4");
      }
      if (sheenSel) {
        timeline.set(sheenSel, { opacity: 0 });
        gsap.fromTo(sheenSel, { xPercent: -140, opacity: 0 }, {
          xPercent: 140,
          opacity: 0.1,
          duration: BRAND_MOTION.recurringSheenDuration,
          ease: "power2.inOut",
          repeat: -1,
          repeatDelay: BRAND_MOTION.recurringSheenRepeatDelay,
          delay: BRAND_MOTION.recurringSheenDelay,
        });
      }
    }, root);

    return () => {
      ctx.revert();
    };
  }, [variant]);

  return (
    <div data-logo-hover className={cn("logo-hover", wordmark ? "flex min-w-0 items-center gap-3" : "", className)}>
      <div ref={rootRef} className={cn("contents")}>
        <div data-logo-mark className="relative isolate shrink-0 overflow-hidden">
          {children}
          <span aria-hidden="true" data-logo-sheen className="logo-sheen-layer" />
        </div>
        {wordmark && (
          <div className="min-w-0 leading-none">
            <div data-logo-word className="truncate text-sm font-semibold">{wordmark}</div>
            {submark && (
              <div className="mt-1.5 flex items-center gap-2">
                <span data-logo-line className="h-px w-5 bg-brand" />
                <span data-logo-word className="truncate text-[9px] uppercase tracking-widest text-brand">{submark}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
