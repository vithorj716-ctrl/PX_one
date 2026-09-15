// PXOne — provider único de autorização no frontend.
// Só controla experiência/navegação. A autorização real é do banco e das server functions.
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ACCESS_QUERY_KEY,
  EMPTY_PAYLOAD,
  fetchMyEffectiveAccess,
  type EffectiveAccessPayload,
} from "./access-client";
import {
  can as canAccess,
  hasEmpresaAccess,
  hasModuleAccess,
  hasSystemAccess,
} from "./access";
import type { Action, SystemKey } from "./catalog";

export { ACCESS_QUERY_KEY };

type Ctx = {
  access: EffectiveAccessPayload;
  loading: boolean;
  error: Error | null;
  isMaster: boolean;
  isAdmin: boolean;
  isExecutive: boolean;
  hasSystem: (system: SystemKey | string) => boolean;
  hasModule: (system: SystemKey | string, module: string) => boolean;
  can: (system: SystemKey | string, module: string, resource: string, action: Action) => boolean;
  hasEmpresa: (empresaId: string | null) => boolean;
  refresh: () => Promise<void>;
};

const AuthzCtx = createContext<Ctx | null>(null);

/** Hook base — usado pelo AuthzProvider e pelo SystemProvider (mesma query, um só fetch). */
export function useEffectiveAccessQuery() {
  return useQuery({
    queryKey: ACCESS_QUERY_KEY,
    queryFn: fetchMyEffectiveAccess,
    staleTime: 60_000,
    retry: false,
  });
}

export function AuthzProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useEffectiveAccessQuery();

  const access = data ?? EMPTY_PAYLOAD;

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY });
  }, [queryClient]);

  const value = useMemo<Ctx>(
    () => ({
      access,
      loading: isLoading,
      error: (error as Error | null) ?? null,
      isMaster: access.isMaster,
      isAdmin: access.isAdmin,
      isExecutive: access.isExecutive,
      hasSystem: (system) => hasSystemAccess(access, system),
      hasModule: (system, module) => hasModuleAccess(access, system, module),
      can: (system, module, resource, action) => canAccess(access, system, module, resource, action),
      hasEmpresa: (empresaId) => hasEmpresaAccess(access, empresaId),
      refresh,
    }),
    [access, isLoading, error, refresh],
  );

  return <AuthzCtx.Provider value={value}>{children}</AuthzCtx.Provider>;
}

export function useAuthz() {
  const ctx = useContext(AuthzCtx);
  if (!ctx) throw new Error("useAuthz deve estar dentro de <AuthzProvider>");
  return ctx;
}
