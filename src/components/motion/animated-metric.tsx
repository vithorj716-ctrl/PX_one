import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AnimatedMetric({ label, value, icon, className, index = 0 }: { label: string; value: ReactNode; icon?: ReactNode; className?: string; index?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.38, delay: reduced ? 0 : Math.min(index * 0.045, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn("panel-slab p-4", className)}
    >
      <div className="flex items-center justify-between gap-2 label-xs">{label}{icon}</div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={String(value)}
          initial={reduced ? { opacity: 0.7 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
          transition={{ duration: reduced ? 0.1 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="num-display mt-2"
        >{value}</motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
