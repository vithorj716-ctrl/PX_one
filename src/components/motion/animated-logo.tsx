import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AnimatedLogo({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: reduced ? 0.18 : 0.78, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduced ? undefined : { scale: 1.03 }}
      className={cn("relative isolate overflow-hidden", className)}
    >
      {children}
      <span aria-hidden="true" className="px-sheen-layer" />
    </motion.div>
  );
}
