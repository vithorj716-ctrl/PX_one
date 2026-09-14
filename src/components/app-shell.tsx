import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard, Target, Calculator, TrendingUp, Gavel, ShieldAlert,
  Users, Sparkles, Goal, Rocket, FileText, Clock, Wallet, Building2,
  PanelLeftClose, PanelLeftOpen, Search, Tag, Brain, Menu, X, PanelRight, Boxes,
  Grid3x3,
} from "lucide-react";
import { ExportButton } from "@/components/executive-share";
import { InstallAppButton } from "@/components/install-app-button";
import { EmpresaSelector } from "@/components/empresa-selector";
import { useSystem } from "@/px-platform/system-context";
import { AnimatedLogo } from "@/components/motion/animated-logo";
import { GrupoPxLogo } from "@/components/pxlog-logo";
import { PageTransition } from "@/components/motion/page-transition";
import { MobileDrawer } from "@/components/motion/mobile-drawer";
import { useDesktopSmoothScroll } from "@/components/motion/desktop-smooth-scroll";
import { MOTION_EASE, NAV_SPRING } from "@/components/motion/tokens";
import { ShellMotionProvider, ShellPage, useShellMotion } from "@/components/motion/shell-motion-context";

const navGroups = [
  {
    label: "Inteligência",
    items: [
      { to: "/", label: "Executive Command", icon: LayoutDashboard, exact: true },
      { to: "/business-plan", label: "Business Plan", icon: Target },
      { to: "/valuation", label: "Valuation Engine", icon: TrendingUp },
      { to: "/payback", label: "Payback Center", icon: Calculator },
      { to: "/kpis", label: "KPI Center", icon: Goal },
    ],
  },
  {
    label: "Operação",
    items: [
      { to: "/empresas", label: "Empresas", icon: Building2 },
      { to: "/custos", label: "Central de Custos", icon: Wallet },
      { to: "/markup", label: "Markup Engine", icon: Tag },
      { to: "/financial-intelligence", label: "Financial Intelligence", icon: Brain },
    ],
  },
  {
    label: "Governança",
    items: [
      { to: "/decisions", label: "Decision Center", icon: Gavel },
      { to: "/risk", label: "Risk Center", icon: ShieldAlert },
      { to: "/okr", label: "OKR Center", icon: Goal },
      { to: "/investor", label: "Investor Room", icon: Users },
    ],
  },
  {
    label: "Crescimento",
    items: [
      { to: "/growth", label: "Growth Center", icon: Rocket },
      { to: "/ai-analyst", label: "Conselheiro IA", icon: Sparkles },
      { to: "/documents", label: "Documentos", icon: FileText },
      { to: "/timeline", label: "Timeline", icon: Clock },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { to: "/platform", label: "PX Platform", icon: Boxes },
      { to: "/aplicacoes", label: "Aplicações", icon: Boxes },
      { to: "/consolidado", label: "Visão Consolidada", icon: LayoutDashboard },
    ],
  },
] as const;

type NavLink = { to: string; label: string; icon: any; exact?: boolean };
const ALL_LINKS: NavLink[] = navGroups.flatMap((g) => g.items as unknown as NavLink[]);

interface AppSidebarContentProps {
  collapsed: boolean;
  pathname: string;
  mobile?: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}

function AppSidebarContent({ collapsed, pathname, mobile = false, onToggleCollapse, onNavigate }: AppSidebarContentProps) {
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <>
      <div className="p-4 flex items-center justify-between">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2 overflow-hidden">
          <AnimatedLogo wordmark={collapsed ? undefined : "PXOne"} submark={collapsed ? undefined : "Corporate OS"} className={collapsed ? "w-10 shrink-0 rounded-sm" : "min-w-0 shrink-0"}>
            <GrupoPxLogo height={collapsed ? 32 : 50} priority className="w-full" />
          </AnimatedLogo>
        </Link>
        <button
          onClick={onToggleCollapse}
          className="hidden lg:inline-flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/60 transition-colors"
          title={collapsed ? "Expandir (Ctrl+B)" : "Recolher (Ctrl+B)"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
        {onNavigate && (
          <button onClick={onNavigate} className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto thin-scroll pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && <p className="px-2 pt-4 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">{group.label}</p>}
            {collapsed && <div className="my-3 mx-3 h-px bg-border/60" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to, "exact" in item ? item.exact : false);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={`group relative w-full flex items-center py-2.5 rounded-md text-sm transition-[color,background-color] duration-200 ${collapsed ? "justify-center px-2" : "px-3"} ${active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface/60"}`}
                  >
                    {active && <motion.span layoutId={mobile ? "pxone-nav-mobile" : "pxone-nav-desktop"} transition={NAV_SPRING} className="absolute inset-y-1 left-0 right-0 rounded-md bg-brand/8 border-l-2 border-brand" />}
                    <Icon className={`size-4 shrink-0 ${active ? "text-brand" : ""} ${collapsed ? "" : "mr-2.5"}`} />
                    {!collapsed && <span className="relative font-medium truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-2 p-2 rounded-lg bg-surface/60 ring-1 ring-border ${collapsed ? "justify-center" : ""}`}>
          <div className="size-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
            <GrupoPxLogo height={28} className="w-full" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">Sistema Corporativo PXOne</p>
              <p className="text-[10px] text-muted-foreground truncate">Modo Interno</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  rightPanel?: ReactNode;
  headerActions?: ReactNode;
}

export function AppShell({ children, title, subtitle, rightPanel, headerActions }: AppShellProps) {
  const persistentShell = useShellMotion();
  if (persistentShell?.persistent) {
    return <ShellPage header={{ title, subtitle, rightPanel, headerActions }}>{children}</ShellPage>;
  }
  return <AppShellFrame title={title} subtitle={subtitle} rightPanel={rightPanel} headerActions={headerActions}>{children}</AppShellFrame>;
}

export function PersistentAppShell({ children }: { children: ReactNode }) {
  return (
    <ShellMotionProvider initialHeader={{ title: "PXOne" }}>
      <AppShellFrame title="PXOne"><PageTransition>{children}</PageTransition></AppShellFrame>
    </ShellMotionProvider>
  );
}

function AppShellFrame({ children, title: fallbackTitle, subtitle: fallbackSubtitle, rightPanel: fallbackRightPanel, headerActions: fallbackActions }: AppShellProps) {
  const shell = useShellMotion();
  const title = shell?.header.title ?? fallbackTitle;
  const subtitle = shell?.header.subtitle ?? fallbackSubtitle;
  const rightPanel = shell?.header.rightPanel ?? fallbackRightPanel;
  const headerActions = shell?.header.headerActions ?? fallbackActions;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [now, setNow] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileHeaderCompact, setMobileHeaderCompact] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setActiveSystem, activeSystem } = useSystem();
  useDesktopSmoothScroll(mainRef, mainContentRef);

  useEffect(() => {
    if (!activeSystem || activeSystem.key !== "pxone-erp") {
      setActiveSystem("pxone-erp");
    }
  }, [activeSystem, setActiveSystem]);

  function trocarSistema() {
    setActiveSystem(null);
    navigate({ to: "/launcher" });
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pxone:sidebar-collapsed");
      if (saved === "1") setCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    const t = () => setNow(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    t();
    const id = setInterval(t, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearch((s) => !s);
      } else if (e.key === "Escape") {
        setShowSearch(false);
        setMobileNavOpen(false);
        setMobileRightOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close mobile drawers on route change
  useEffect(() => {
    setMobileNavOpen(false);
    setMobileRightOpen(false);
  }, [pathname]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const onScroll = () => setMobileHeaderCompact(main.scrollTop > 12);
    onScroll();
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, []);

  // The shared drawer primitive owns drawer scroll locking.
  useEffect(() => {
    if (showSearch) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [showSearch]);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("pxone:sidebar-collapsed", next ? "1" : "0"); } catch {}
  }

  const filteredLinks = search.trim()
    ? ALL_LINKS.filter((l) => l.label.toLowerCase().includes(search.toLowerCase()))
    : ALL_LINKS;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex border-r border-border flex-col shrink-0 bg-sidebar transition-[width] duration-300 ease-[var(--ease-px)] ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <AppSidebarContent collapsed={collapsed} pathname={pathname} onToggleCollapse={toggleCollapse} />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div className="lg:hidden">
        <MobileDrawer open={mobileNavOpen} label="Navegação" onClose={() => setMobileNavOpen(false)} className="relative w-72 max-w-[85vw] bg-sidebar border-r border-border flex flex-col h-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <AppSidebarContent mobile collapsed={false} pathname={pathname} onToggleCollapse={toggleCollapse} onNavigate={() => setMobileNavOpen(false)} />
        </MobileDrawer>
      </div>

      {/* Main */}
      <main ref={mainRef} className="flex-1 overflow-y-auto thin-scroll bg-background min-w-0">
        <div ref={mainContentRef}>
        <header className={`sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background/85 backdrop-blur-xl px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 transition-[height] duration-300 ease-[var(--ease-px)] ${mobileHeaderCompact ? "h-12 lg:h-14" : "h-14"}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => { setMobileRightOpen(false); setMobileNavOpen(true); }}
              className="lg:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/60"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex items-center gap-2">
              <h1 className={`font-semibold truncate transition-[font-size] duration-300 ease-[var(--ease-px)] ${mobileHeaderCompact ? "text-xs lg:text-sm" : "text-sm"}`}>{title}</h1>
              {subtitle && (
                <>
                  <div className="h-3.5 w-px bg-border hidden sm:block" />
                  <span className="text-sm text-muted-foreground truncate hidden sm:inline">{subtitle}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowSearch(true)}
              className="hidden md:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md ring-1 ring-border bg-surface/60 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Buscar módulo (Ctrl+K)"
            >
              <Search className="size-3.5" /> Buscar
              <kbd className="ml-2 px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-mono">⌘K</kbd>
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/60"
              aria-label="Buscar"
            >
              <Search className="size-5" />
            </button>
            {headerActions}
            <button
              onClick={trocarSistema}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ring-1 ring-border text-xs text-muted-foreground hover:text-foreground"
              title="Trocar Sistema"
            >
              <Grid3x3 className="size-3.5" /> Trocar Sistema
            </button>
            <EmpresaSelector />
            <InstallAppButton />
            <ExportButton />
            {rightPanel && (
              <button
                 onClick={() => { setMobileNavOpen(false); setMobileRightOpen(true); }}
                className="xl:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/60"
                aria-label="Abrir painel"
              >
                <PanelRight className="size-5" />
              </button>
            )}
            <span className="text-[11px] text-muted-foreground tabular-nums hidden lg:inline">
              <span className="size-1.5 rounded-full bg-brand inline-block mr-1.5" /> {now}
            </span>
          </div>
        </header>
        <div className="p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">{children}</div>
        </div>
      </main>

      {/* Right panel — desktop */}
      {rightPanel && (
        <motion.aside initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.34, ease: MOTION_EASE }} className="hidden xl:block w-80 border-l border-border bg-sidebar/40 shrink-0 p-6 overflow-y-auto thin-scroll">
          {rightPanel}
        </motion.aside>
      )}

      {/* Right panel — mobile drawer */}
      <div className="xl:hidden">
      {rightPanel && <MobileDrawer open={mobileRightOpen} side="right" label="Painel lateral" onClose={() => setMobileRightOpen(false)} className="relative w-80 max-w-[90vw] bg-sidebar border-l border-border h-full overflow-y-auto thin-scroll pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-sidebar z-10">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Painel</span>
              <button onClick={() => setMobileRightOpen(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-5">{rightPanel}</div>
      </MobileDrawer>}
      </div>

      {/* Command palette */}
      <AnimatePresence>
      {showSearch && (
        <motion.div role="dialog" aria-modal="true" aria-label="Buscar módulo" className="fixed inset-0 z-[var(--z-dialog)] bg-[var(--overlay)] flex items-start justify-center pt-16 sm:pt-32 px-3" onClick={() => setShowSearch(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: "none" }}>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.22, ease: MOTION_EASE }}
            className="w-full max-w-lg bg-surface ring-1 ring-border rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ir para módulo…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-mono text-muted-foreground hidden sm:inline">ESC</kbd>
            </div>
            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto thin-scroll p-1">
              {filteredLinks.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Nada encontrado</div>
              ) : (
                filteredLinks.map((l) => {
                  const Icon = l.icon;
                  return (
                    <button
                      key={l.to}
                      onClick={() => { setShowSearch(false); setSearch(""); navigate({ to: l.to as any }); }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon className="size-4" /> {l.label}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
