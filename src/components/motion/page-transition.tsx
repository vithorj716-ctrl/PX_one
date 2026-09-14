import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { MOTION, MOTION_EASE } from "@/components/motion/tokens";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false} presenceAffectsLayout={false}>
      <motion.div
        key={pathname}
        className="min-h-full"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0, pointerEvents: "none" } : { opacity: 0, y: -4, pointerEvents: "none" }}
        transition={reduced ? { duration: MOTION.reduced } : {
          opacity: { duration: MOTION.routeExit, ease: MOTION_EASE },
          y: { duration: MOTION.routeEnter, ease: MOTION_EASE },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
