import { useRouterState } from "@tanstack/react-router";
import { gsap } from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { CONTENT_ENTER, DURATION, MOTION_EASE, GSAP_EASE } from "@/components/motion/tokens";
import { useIsomorphicLayoutEffect } from "@/components/motion/use-isomorphic-layout-effect";

/**
 * The ONE route transition of the app. Rendered once, at the layout level, around
 * <Outlet /> — never inside a shell, so header/sidebar/background never take part.
 *
 * `mode="popLayout"` (not "wait") is the whole point: the outgoing page is pulled
 * out of layout flow and fades in 140ms while the incoming page is ALREADY
 * entering. There is no "exit finishes, then enter starts" queue, so a click never
 * reads as click -> wait -> screen appears.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduced = useReducedMotion() ?? false;

  return (
    <AnimatePresence mode="popLayout" initial={false} presenceAffectsLayout={false}>
      <motion.div
        key={pathname}
        className="min-h-full w-full"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced
          ? { opacity: 0, pointerEvents: "none" }
          : { opacity: 0, y: -6, filter: "blur(4px)", pointerEvents: "none" }}
        transition={reduced
          ? { duration: DURATION.reduced }
          : { duration: DURATION.page, ease: MOTION_EASE, opacity: { duration: DURATION.page * 0.7, ease: MOTION_EASE } }}
      >
        <ContentEnter key={`enter-${pathname}`}>{children}</ContentEnter>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Staggered entry of the page's own top-level blocks (title, cards, panels).
 * GSAP owns opacity/transform of these children; Motion owns the wrapper only —
 * two different elements, so nothing is written twice. clearProps hands them
 * straight back to CSS, so hover/press states survive.
 */
function ContentEnter({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const blocks = Array.from(root.children).slice(0, CONTENT_ENTER.maxTargets) as HTMLElement[];
      if (!blocks.length) return;
      gsap.fromTo(blocks, { opacity: 0, y: CONTENT_ENTER.y }, {
        opacity: 1,
        y: 0,
        duration: CONTENT_ENTER.duration,
        stagger: CONTENT_ENTER.stagger,
        ease: GSAP_EASE,
        overwrite: "auto",
        clearProps: "opacity,transform",
      });
    }, root);

    return () => ctx.revert();
    // Mount-only: a state/query/filter change must never restart this.
  }, []);

  return <div ref={ref} className="contents">{children}</div>;
}
