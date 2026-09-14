import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PersistentAppShell } from "@/components/app-shell";
import { PersistentTmsShell } from "@/components/tms/tms-shell";

// PX Platform — exige sessão. Sem auto-login: a tela /login é responsável.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/login" });
    }
    // Ao entrar diretamente em "/" (raiz) sem sistema escolhido, manda ao Launcher.
    if (location.pathname === "/") {
      let active: string | null = null;
      try { active = sessionStorage.getItem("px:active-system"); } catch {}
      if (!active) throw redirect({ to: "/launcher" });
    }
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

const ERP_ROOTS = new Set([
  "/", "/ai-analyst", "/aplicacoes", "/business-plan", "/consolidado", "/custos",
  "/decisions", "/documents", "/empresas", "/financial-intelligence", "/growth",
  "/investor", "/kpis", "/markup", "/okr", "/payback", "/platform", "/risk",
  "/registry", "/timeline", "/valuation",
]);

function AuthenticatedLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isStandaloneTms = pathname.startsWith("/tms/etiquetas/") || pathname.startsWith("/tms/lm/motorista/");
  if (pathname === "/tms" || (pathname.startsWith("/tms/") && !isStandaloneTms)) {
    return <PersistentTmsShell><Outlet /></PersistentTmsShell>;
  }
  const root = pathname === "/" ? "/" : `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  if (ERP_ROOTS.has(root)) return <PersistentAppShell><Outlet /></PersistentAppShell>;
  return <Outlet />;
}
