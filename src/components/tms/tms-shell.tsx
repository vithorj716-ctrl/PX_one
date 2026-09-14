import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Truck, Package, ScanLine, FileText, Search, AlertTriangle, Users, Tag, CircleDollarSign,
  Grid3x3, LogOut, MapPin, Route as RouteIcon, Camera, BarChart3, Settings, Menu, X,
} from "lucide-react";
import { useSystem } from "@/px-platform/system-context";
import { supabase } from "@/integrations/supabase/client";
import { PxLogLogo } from "@/components/pxlog-logo";
import { AnimatedLogo } from "@/components/motion/animated-logo";
import { PageTransition } from "@/components/motion/page-transition";
import { ShellMotionProvider, ShellPage, useShellMotion } from "@/components/motion/shell-motion-context";

type NavItem = { to: string; label: string; icon: typeof Truck; exact?: boolean; group: string };

const TMS_NAV: NavItem[] = [
  { to: "/tms", label: "Dashboard", icon: Truck, exact: true, group: "Transferências" },
  { to: "/tms/solicitacoes", label: "Solicitações", icon: FileText, group: "Transferências" },
  
  { to: "/tms/embarque", label: "Embarque", icon: ScanLine, group: "Transferências" },
  { to: "/tms/recebimento", label: "Recebimento", icon: Package, group: "Transferências" },
  { to: "/tms/entregas", label: "Entregas", icon: Package, group: "Transferências" },
  { to: "/tms/viagens", label: "Viagens", icon: Truck, group: "Transferências" },
  { to: "/tms/tracking", label: "Tracking", icon: Search, group: "Transferências" },
  { to: "/tms/ocorrencias", label: "Ocorrências", icon: AlertTriangle, group: "Transferências" },
  { to: "/tms/tabela-frete", label: "Tabela de Fretes", icon: Tag, group: "Transferências" },
  { to: "/tms/clientes", label: "Clientes", icon: Users, group: "Transferências" },
  { to: "/tms/financeiro", label: "Financeiro", icon: CircleDollarSign, group: "Transferências" },
  { to: "/tms/lm", label: "Dashboard", icon: MapPin, exact: true, group: "Last Mile" },
  { to: "/tms/lm/rotas", label: "Rotas", icon: RouteIcon, group: "Last Mile" },
  { to: "/tms/lm/entregas", label: "Entregas", icon: Package, group: "Last Mile" },
  { to: "/tms/lm/separacao", label: "Separação", icon: ScanLine, group: "Last Mile" },
  { to: "/tms/lm/carregamento", label: "Carregamento", icon: Truck, group: "Last Mile" },
  { to: "/tms/lm/tracking", label: "Tracking", icon: Search, group: "Last Mile" },
  { to: "/tms/lm/ocorrencias", label: "Ocorrências", icon: AlertTriangle, group: "Last Mile" },
  { to: "/tms/lm/comprovantes", label: "Comprovantes", icon: Camera, group: "Last Mile" },
  { to: "/tms/lm/relatorios", label: "Relatórios", icon: BarChart3, group: "Last Mile" },
  { to: "/tms/lm/configuracoes", label: "Configurações", icon: Settings, group: "Last Mile" },
];

interface TmsShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

export function TmsShell({ children, title, subtitle, headerActions }: TmsShellProps) {
  const persistentShell = useShellMotion();
  if (persistentShell) return <ShellPage header={{ title, subtitle, headerActions }}>{children}</ShellPage>;
  return <TmsShellFrame title={title} subtitle={subtitle} headerActions={headerActions}>{children}</TmsShellFrame>;
}

export function PersistentTmsShell({ children }: { children: ReactNode }) {
  return (
    <ShellMotionProvider initialHeader={{ title: "PXLog TMS" }}>
      <TmsShellFrame title="PXLog TMS"><PageTransition>{children}</PageTransition></TmsShellFrame>
    </ShellMotionProvider>
  );
}

function TmsShellFrame({ children, title: fallbackTitle, subtitle: fallbackSubtitle, headerActions: fallbackActions }: TmsShellProps) {
  const shell = useShellMotion();
  const title = shell?.header.title ?? fallbackTitle;
  const subtitle = shell?.header.subtitle ?? fallbackSubtitle;
  const headerActions = shell?.header.headerActions ?? fallbackActions;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { activeSystem, setActiveSystem } = useSystem();

  // Garante contexto = TMS quando o usuário aterrissa via deep-link
  useEffect(() => {
    if (!activeSystem || activeSystem.key !== "pxlog-tms") {
      setActiveSystem("pxlog-tms");
    }
  }, [activeSystem, setActiveSystem]);

  function trocarSistema() {
    setActiveSystem(null);
    navigate({ to: "/launcher" });
  }

  async function sair() {
    setActiveSystem(null);
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  useEffect(() => { setMobileNavOpen(false); }, [pathname]);
  useEffect(() => {
    if (!mobileNavOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileNavOpen]);

  const Navigation = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className="p-4 flex items-center gap-2 border-b border-border bg-foreground">
        <AnimatedLogo className="shrink-0"><PxLogLogo height={28} /></AnimatedLogo>
        <div className="ml-auto text-[9px] uppercase tracking-widest text-background">Transfer Hub</div>
        {mobile && <button onClick={() => setMobileNavOpen(false)} aria-label="Fechar menu" className="press ml-1 flex size-11 items-center justify-center text-background"><X className="size-5" /></button>}
      </div>
      <nav className="flex-1 px-2 space-y-2 overflow-y-auto thin-scroll pb-4">
        {Array.from(new Set(TMS_NAV.map((i) => i.group))).map((group) => (
          <div key={group} className="space-y-0.5">
            <div className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-widest text-muted-foreground/70">{group}</div>
            {TMS_NAV.filter((i) => i.group === group).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return <Link key={item.to} to={item.to} className={`relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-brand/5"}`}>
                {active && <motion.span layoutId={mobile ? "tms-nav-mobile" : "tms-nav-desktop"} transition={{ type: "spring", stiffness: 420, damping: 36 }} className="absolute inset-y-0.5 left-0 right-0 rounded-md border-l-2 border-brand bg-brand/8" />}
                <Icon className={`relative size-4 shrink-0 ${active ? "text-brand" : ""}`} />
                <span className="relative font-medium truncate">{item.label}</span>
              </Link>;
            })}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <button onClick={trocarSistema} className="press w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-brand/5"><Grid3x3 className="size-4" /> Trocar Sistema</button>
        <button onClick={sair} className="press w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-brand/5"><LogOut className="size-4" /> Sair</button>
      </div>
    </>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border shrink-0 bg-sidebar"><Navigation /></aside>
      <AnimatePresence>{mobileNavOpen && <motion.div role="dialog" aria-modal="true" aria-label="Navegação TMS" className="lg:hidden fixed inset-0 z-[var(--z-drawer)] flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: "none" }}><div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} /><motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 38 }} className="relative w-72 max-w-[85vw] h-full bg-sidebar border-r border-border flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"><Navigation mobile /></motion.aside></motion.div>}</AnimatePresence>

      <main className="flex-1 overflow-y-auto thin-scroll min-w-0 bg-background/80">
        <header className="sticky top-0 z-[var(--z-sticky)] h-14 border-b border-border px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 backdrop-blur-xl bg-background/85">
          <div className="min-w-0 flex items-center gap-2">
            <button onClick={() => setMobileNavOpen(true)} aria-label="Abrir menu" className="press lg:hidden flex size-11 -ml-2 items-center justify-center text-muted-foreground"><Menu className="size-5" /></button>
            <AnimatePresence mode="wait" initial={false}><motion.div key={`${title}:${subtitle ?? ""}`} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }} transition={{ duration: 0.16 }} className="contents"><h1 className="text-sm font-semibold truncate">{title}</h1>
            {subtitle && (
              <>
                <div className="h-3.5 w-px bg-border hidden sm:block" />
                <span className="text-sm text-muted-foreground truncate hidden sm:inline">{subtitle}</span>
              </>
            )}</motion.div></AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              onClick={trocarSistema}
              className="text-xs px-2.5 py-1.5 rounded-md ring-1 ring-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
            >
              <Grid3x3 className="size-3.5" /> Trocar Sistema
            </button>
          </div>
        </header>
        <div className="p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">{children}</div>
      </main>
    </div>
  );
}
