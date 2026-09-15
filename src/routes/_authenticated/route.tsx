import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PersistentAppShell } from "@/components/app-shell";
import { PersistentTmsShell } from "@/components/tms/tms-shell";
import { AuthzProvider } from "@/authz/authz-context";
import { getMyAccess } from "@/authz/access.functions";
import { hasModuleAccess, hasSystemAccess } from "@/authz/access";
import { requirementForPath } from "@/authz/route-map";

// PX Platform — gate único: sessão + acesso ao sistema + acesso ao módulo.
// Nenhuma página deve repetir estas checagens; use o mapa em src/authz/route-map.ts.
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

    const requirement = requirementForPath(location.pathname);
    if (requirement) {
      const access = await getMyAccess();
      if (!hasSystemAccess(access, requirement.system)) {
        throw redirect({ to: "/acesso-negado", search: { sistema: requirement.system } });
      }
      if (requirement.module && !hasModuleAccess(access, requirement.system, requirement.module)) {
        throw redirect({
          to: "/acesso-negado",
          search: { sistema: requirement.system, modulo: requirement.module },
        });
      }
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
    return <AuthzProvider><PersistentTmsShell><Outlet /></PersistentTmsShell></AuthzProvider>;
  }
  const root = pathname === "/" ? "/" : `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  if (ERP_ROOTS.has(root)) {
    return <AuthzProvider><PersistentAppShell><Outlet /></PersistentAppShell></AuthzProvider>;
  }
  return <AuthzProvider><Outlet /></AuthzProvider>;
}
