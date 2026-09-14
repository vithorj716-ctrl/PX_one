import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false} presenceAffectsLayout={false}>
      <motion.div
        key={pathname}
        className="min-h-full"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0, pointerEvents: "none" } : { opacity: 0, y: -2, pointerEvents: "none" }}
        transition={reduced ? { duration: 0.08 } : {
          opacity: { duration: 0.16, ease: EASE },
          y: { duration: 0.24, ease: EASE },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
