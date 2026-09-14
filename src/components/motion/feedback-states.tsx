import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function LoadingRows({ rows = 4, columns = 4 }: { rows?: number; columns?: number }) {
  return <div className="space-y-2" aria-label="Carregando dados" role="status">{Array.from({ length: rows }).map((_, row) => <div key={row} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }).map((__, col) => <div key={col} className="h-9 skeleton" />)}</div>)}</div>;
}

export function LoadingStats({ count = 4 }: { count?: number }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-3" aria-label="Carregando indicadores" role="status">{Array.from({ length: count }).map((_, i) => <div key={i} className="panel-slab p-4"><div className="h-3 w-20 skeleton" /><div className="h-7 w-28 skeleton mt-3" /></div>)}</div>;
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description?: string; icon?: LucideIcon; action?: ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-40 flex-col items-center justify-center text-center px-6"><Icon className="size-5 text-brand" /><h3 className="mt-3 text-sm font-medium">{title}</h3>{description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}{action && <div className="mt-4">{action}</div>}</motion.div>;
}

export function StatusIndicator({ label, tone = "live", className }: { label: string; tone?: "live" | "warning" | "critical"; className?: string }) {
  return <span className={cn("status-indicator", `status-${tone}`, className)}><span className="live-dot" aria-hidden="true" />{label}</span>;
}
