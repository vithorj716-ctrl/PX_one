import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DURATION, MOTION, MOTION_EASE } from "@/components/motion/tokens";
import { AnimatedNumber } from "@/components/motion/animated-number";
import type { Format } from "@number-flow/react";

type AnimatedMetricProps = {
  label: string;
  /** Pre-formatted display value. Ignored when `numeric` is provided. */
  value?: ReactNode;
  /** Raw number — renders with digit-level transitions instead of a fade swap. */
  numeric?: number;
  format?: Format;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  className?: string;
  index?: number;
};

export function AnimatedMetric({ label, value, numeric, format, prefix, suffix, icon, className, index = 0 }: AnimatedMetricProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? MOTION.reduced : MOTION.dashboard, delay: reduced ? 0 : Math.min(index * MOTION.dashboardStagger, 0.18), ease: MOTION_EASE }}
      className={cn("panel-slab p-4", className)}
    >
      <div className="flex items-center justify-between gap-2 label-xs">{label}{icon}</div>
      {typeof numeric === "number" ? (
        <div className="num-display mt-2">
          <AnimatedNumber value={numeric} format={format} prefix={prefix} suffix={suffix} />
        </div>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={String(value)}
            initial={reduced ? { opacity: 0.7 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
            transition={{ duration: reduced ? MOTION.reduced : DURATION.menu, ease: MOTION_EASE }}
            className="num-display mt-2"
          >{value}</motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
