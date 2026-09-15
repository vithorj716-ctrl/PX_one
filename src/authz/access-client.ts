// PXOne — carregamento do ACESSO EFETIVO no browser.
// Fonte única: RPC public.get_my_effective_access() (usa auth.uid() no banco).
// Regra de ouro: erro de consulta NUNCA é tratado como "usuário sem acesso".
import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EMPTY_ACCESS, type EffectiveAccess, type PermissionGrant, type SystemGrant } from "./access";

export const ACCESS_QUERY_KEY = ["px", "authz", "me"] as const;

export class AccessLoadError extends Error {
  constructor(
    message: string,
    readonly detail: { code?: string; details?: string; hint?: string; stage: string },
  ) {
    super(message);
    this.name = "AccessLoadError";
  }
}

export type EffectiveAccessPayload = EffectiveAccess & {
  authenticated: boolean;
  active: boolean;
  isExecutive: boolean;
  profiles: Array<{ id: string; nome: string }>;
};

export const EMPTY_PAYLOAD: EffectiveAccessPayload = {
  ...EMPTY_ACCESS,
  authenticated: false,
  active: false,
  isExecutive: false,
  profiles: [],
};

type RawAccess = {
  user_id: string | null;
  authenticated: boolean;
  active: boolean;
  roles: string[] | null;
  is_master_admin: boolean;
  is_admin: boolean;
  is_executive: boolean;
  systems: SystemGrant[] | null;
  profiles: Array<{ id: string; nome: string }> | null;
  permissions: PermissionGrant[] | null;
  empresas: string[] | null;
};

export function normalizeAccess(raw: RawAccess): EffectiveAccessPayload {
  return {
    userId: raw.user_id ?? "",
    authenticated: raw.authenticated === true,
    active: raw.active !== false,
    levels: raw.roles ?? [],
    isMaster: raw.is_master_admin === true,
    isAdmin: raw.is_admin === true,
    isExecutive: raw.is_executive === true,
    systems: raw.systems ?? [],
    profiles: raw.profiles ?? [],
    permissions: raw.permissions ?? [],
    empresas: raw.empresas ?? [],
  };
}

/** Carrega o acesso efetivo do usuário autenticado. Lança AccessLoadError em falha. */
export async function fetchMyEffectiveAccess(): Promise<EffectiveAccessPayload> {
  // Sessão ausente = visitante anônimo (não é erro de autorização).
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData.session?.user ?? null;
  if (!sessionUser) return EMPTY_PAYLOAD;

  const { data, error } = await (
    supabase as unknown as {
      rpc(fn: string): PromiseLike<{
        data: RawAccess | null;
        error: { code?: string; message: string; details?: string; hint?: string } | null;
      }>;
    }
  ).rpc("get_my_effective_access");

  if (error) {
    console.error("[PX AUTH] Falha ao carregar autorização", {
      stage: "rpc.get_my_effective_access",
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: sessionUser.id,
    });
    throw new AccessLoadError(error.message, {
      stage: "rpc.get_my_effective_access",
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  if (!data) {
    console.error("[PX AUTH] Falha ao carregar autorização", {
      stage: "rpc.get_my_effective_access",
      message: "resposta vazia",
      userId: sessionUser.id,
    });
    throw new AccessLoadError("Resposta vazia da autorização.", {
      stage: "rpc.get_my_effective_access",
    });
  }

  return normalizeAccess(data);
}

/** Limpa a autorização em cache (logout / troca de usuário). */
export function clearAuthorization(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ACCESS_QUERY_KEY });
}
