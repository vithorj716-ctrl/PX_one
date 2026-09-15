// PXOne — provider único de autorização no frontend.
// Só controla experiência/navegação. A autorização real é do banco e das server functions.
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccess } from "./access.functions";
import {
  EMPTY_ACCESS,
  can as canAccess,
  hasEmpresaAccess,
  hasModuleAccess,
  hasSystemAccess,
  type EffectiveAccess,
} from "./access";
import type { Action, SystemKey } from "./catalog";

export const ACCESS_QUERY_KEY = ["px", "authz", "me"] as const;

type Ctx = {
  access: EffectiveAccess;
  loading: boolean;
  isMaster: boolean;
  isAdmin: boolean;
  hasSystem: (system: SystemKey | string) => boolean;
  hasModule: (system: SystemKey | string, module: string) => boolean;
  can: (system: SystemKey | string, module: string, resource: string, action: Action) => boolean;
  hasEmpresa: (empresaId: string | null) => boolean;
  refresh: () => Promise<void>;
};

const AuthzCtx = createContext<Ctx | null>(null);

export function AuthzProvider({ children }: { children: ReactNode }) {
  const fetchAccess = useServerFn(getMyAccess);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ACCESS_QUERY_KEY,
    queryFn: () => fetchAccess(),
    staleTime: 60_000,
    retry: false,
  });

  const access = data ?? EMPTY_ACCESS;

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY });
  }, [queryClient]);

  const value = useMemo<Ctx>(
    () => ({
      access,
      loading: isLoading,
      isMaster: access.isMaster,
      isAdmin: access.isAdmin,
      hasSystem: (system) => hasSystemAccess(access, system),
      hasModule: (system, module) => hasModuleAccess(access, system, module),
      can: (system, module, resource, action) => canAccess(access, system, module, resource, action),
      hasEmpresa: (empresaId) => hasEmpresaAccess(access, empresaId),
      refresh,
    }),
    [access, isLoading, refresh],
  );

  return <AuthzCtx.Provider value={value}>{children}</AuthzCtx.Provider>;
}

export function useAuthz() {
  const ctx = useContext(AuthzCtx);
  if (!ctx) throw new Error("useAuthz deve estar dentro de <AuthzProvider>");
  return ctx;
}
