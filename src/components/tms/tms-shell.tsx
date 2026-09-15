import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import {
  Truck, Package, ScanLine, FileText, Search, AlertTriangle, Users, Tag, CircleDollarSign,
  Grid3x3, LogOut, MapPin, Route as RouteIcon, Camera, BarChart3, Settings, Menu, X,
} from "lucide-react";
import { useSystem } from "@/px-platform/system-context";
import { supabase } from "@/integrations/supabase/client";
import { PxLogLogo } from "@/components/pxlog-logo";
import { AnimatedLogo } from "@/components/motion/animated-logo";

import { ShellMotionProvider, ShellPage, useShellMotion } from "@/components/motion/shell-motion-context";
import { MobileDrawer } from "@/components/motion/mobile-drawer";
import { useDesktopSmoothScroll } from "@/components/motion/desktop-smooth-scroll";
import { NavItem } from "@/components/motion/nav-item";

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

interface TmsNavigationProps {
  pathname: string;
  mobile?: boolean;
  reduced: boolean;
  onClose?: () => void;
  onSwitchSystem: () => void;
  onSignOut: () => void;
}

function TmsNavigation({ pathname, mobile = false, reduced, onClose, onSwitchSystem, onSignOut }: TmsNavigationProps) {
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <>
      <div className="p-4 flex items-center gap-2 border-b border-border bg-foreground">
        <AnimatedLogo wordmark="PXLog" submark="Transfer Hub" className="min-w-0 shrink-0 text-background"><PxLogLogo height={58} priority className="w-24" /></AnimatedLogo>
        {mobile && <button onClick={onClose} aria-label="Fechar menu" className="press ml-1 flex size-11 items-center justify-center text-background"><X className="size-5" /></button>}
      </div>
      <nav className="flex-1 px-2 space-y-2 overflow-y-auto thin-scroll pb-4">
        {Array.from(new Set(TMS_NAV.map((i) => i.group))).map((group) => (
          <div key={group} className="space-y-0.5">
            <div className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-widest text-muted-foreground/70">{group}</div>
            {TMS_NAV.filter((i) => i.group === group).map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={isActive(item.to, item.exact)}
                indicatorId={mobile ? "tms-nav-mobile" : "tms-nav-desktop"}
                reduced={reduced}
                onClick={onClose}
              />
            ))}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <button onClick={onSwitchSystem} className="press w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-brand/5"><Grid3x3 className="size-4" /> Trocar Sistema</button>
        <button onClick={onSignOut} className="press w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-brand/5"><LogOut className="size-4" /> Sair</button>
      </div>
    </>
  );
}

interface TmsShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

export function TmsShell({ children, title, subtitle, headerActions }: TmsShellProps) {
  const persistentShell = useShellMotion();
  if (persistentShell?.persistent) return <ShellPage header={{ title, subtitle, headerActions }}>{children}</ShellPage>;
  return <TmsShellFrame title={title} subtitle={subtitle} headerActions={headerActions}>{children}</TmsShellFrame>;
}

export function PersistentTmsShell({ children }: { children: ReactNode }) {
  return (
    <ShellMotionProvider initialHeader={{ title: "PXLog TMS" }}>
      {/* The route transition is declared ONCE, in the authenticated layout. */}
      <TmsShellFrame title="PXLog TMS">{children}</TmsShellFrame>
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
  const reduced = useReducedMotion() ?? false;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileHeaderCompact, setMobileHeaderCompact] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { activeSystem, setActiveSystem } = useSystem();
  useDesktopSmoothScroll(mainRef, mainContentRef);

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

  useEffect(() => { setMobileNavOpen(false); }, [pathname]);
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const onScroll = () => setMobileHeaderCompact(main.scrollTop > 12);
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background/80 text-foreground">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border shrink-0 bg-sidebar"><TmsNavigation pathname={pathname} reduced={reduced} onSwitchSystem={trocarSistema} onSignOut={sair} /></aside>
      <div className="lg:hidden"><MobileDrawer open={mobileNavOpen} label="Navegação TMS" onClose={() => setMobileNavOpen(false)} className="relative w-72 max-w-[85vw] h-full bg-sidebar border-r border-border flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"><TmsNavigation pathname={pathname} mobile reduced={reduced} onClose={() => setMobileNavOpen(false)} onSwitchSystem={trocarSistema} onSignOut={sair} /></MobileDrawer></div>

      <main ref={mainRef} className="flex-1 overflow-y-auto thin-scroll min-w-0 bg-background/80">
        <div ref={mainContentRef}>
        <header
          data-compact={mobileHeaderCompact ? "true" : "false"}
          className={`sticky top-0 z-[var(--z-sticky)] flex h-14 items-center justify-between gap-2 border-b px-3 backdrop-blur-xl transition-[background-color,border-color,box-shadow,padding] duration-[var(--motion-base)] ease-[var(--ease-px)] sm:px-4 lg:px-6 ${mobileHeaderCompact ? "border-border bg-background/92 py-1.5 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.9)]" : "border-transparent bg-background/80 py-3"}`}
        >
          <div className="min-w-0 flex items-center gap-2">
            <button onClick={() => setMobileNavOpen(true)} aria-label="Abrir menu" className="press lg:hidden flex size-11 -ml-2 items-center justify-center text-muted-foreground"><Menu className="size-5" /></button>
            <div className="contents"><h1 className="truncate text-sm font-semibold">{title}</h1>
            {subtitle && (
              <>
                <div className="h-3.5 w-px bg-border hidden sm:block" />
                <span className="text-sm text-muted-foreground truncate hidden sm:inline">{subtitle}</span>
              </>
            )}</div>
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
        </div>
      </main>
    </div>
  );
}
