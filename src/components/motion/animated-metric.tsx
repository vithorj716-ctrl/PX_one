import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MOTION, MOTION_EASE } from "@/components/motion/tokens";

export function AnimatedMetric({ label, value, icon, className, index = 0 }: { label: string; value: ReactNode; icon?: ReactNode; className?: string; index?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? MOTION.reduced : MOTION.dashboard, delay: reduced ? 0 : Math.min(index * MOTION.dashboardStagger, 0.18), ease: MOTION_EASE }}
      className={cn("panel-slab p-4", className)}
    >
      <div className="flex items-center justify-between gap-2 label-xs">{label}{icon}</div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={String(value)}
          initial={reduced ? { opacity: 0.7 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
          transition={{ duration: reduced ? MOTION.reduced : 0.2, ease: MOTION_EASE }}
          className="num-display mt-2"
        >{value}</motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
