import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, MOTION_EASE } from "@/components/motion/tokens";

/**
 * Content-only route transition. The shell (header, sidebar, background) stays
 * mounted around it, so nothing rebuilds and nothing ghosts: `mode="wait"`
 * removes the old subtree before the new one mounts, and the exit is faster
 * than the enter so navigation never feels slow.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false} presenceAffectsLayout={false}>
      <motion.div
        key={pathname}
        className="min-h-full"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0, pointerEvents: "none" } : { opacity: 0, y: -6, scale: 0.998, pointerEvents: "none" }}
        transition={reduced ? { duration: DURATION.reduced } : {
          opacity: { duration: DURATION.pageExit, ease: MOTION_EASE },
          y: { duration: DURATION.page, ease: MOTION_EASE },
          scale: { duration: DURATION.page, ease: MOTION_EASE },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
