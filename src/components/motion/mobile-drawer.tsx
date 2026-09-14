import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { MOTION, MOTION_EASE } from "@/components/motion/tokens";

type MobileDrawerProps = {
  open: boolean;
  side?: "left" | "right";
  label: string;
  onClose: () => void;
  children: ReactNode;
  className: string;
};

export function MobileDrawer({ open, side = "left", label, onClose, children, className }: MobileDrawerProps) {
  const reduced = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  const hiddenX = side === "left" ? "-100%" : "100%";

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={`fixed inset-0 z-[var(--z-drawer)] flex ${side === "right" ? "justify-end" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: reduced ? MOTION.reduced : MOTION.routeExit, ease: MOTION_EASE }}
        >
          <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { x: hiddenX }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: hiddenX }}
            transition={{ duration: reduced ? MOTION.reduced : (open ? MOTION.drawerEnter : MOTION.drawerExit), ease: MOTION_EASE }}
            className={className}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}