import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="min-h-full"
        initial={reduced ? { opacity: 0.98 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0.98 } : { opacity: 0, y: -8, filter: "blur(6px)" }}
        transition={{ duration: reduced ? 0.12 : 0.42, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
