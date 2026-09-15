import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { NAV_SPRING } from "@/components/motion/tokens";

type NavItemProps = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  /** Shared layout id — the indicator slides between items that share it. */
  indicatorId: string;
  collapsed?: boolean;
  reduced?: boolean;
  onClick?: () => void;
};

/**
 * Single navigation item.
 * Motion owns the shared active indicator (layoutId) so it SLIDES from the
 * previous item to the new one. CSS owns hover/press/icon micro-interactions,
 * on different elements — no two libraries write the same property.
 */
export function NavItem({ to, label, icon: Icon, active, indicatorId, collapsed = false, reduced = false, onClick }: NavItemProps) {
  return (
    <Link
      to={to as never}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "nav-item group relative flex items-center rounded-md text-sm outline-none",
        collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId={indicatorId}
          transition={reduced ? { duration: 0 } : NAV_SPRING}
          className="absolute inset-y-0.5 left-0 right-0 rounded-md border-l-2 border-brand bg-brand/10"
        />
      )}
      <span aria-hidden="true" className="nav-item-hover" />
      <Icon className={cn("nav-item-icon relative size-4 shrink-0", active && "text-brand")} />
      {!collapsed && <span className="relative min-w-0 flex-1 truncate font-medium">{label}</span>}
      {collapsed && <span role="tooltip" className="nav-tooltip">{label}</span>}
    </Link>
  );
}
