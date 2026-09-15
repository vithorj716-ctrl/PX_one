// PXOne — autorização no servidor. Única implementação; server functions dependem daqui.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Action } from "./catalog";
import { EMPTY_ACCESS, type EffectiveAccess, type PermissionGrant, type SystemGrant } from "./access";

/**
 * As RPCs de autorização foram criadas depois da geração de `Database`.
 * Este é o ÚNICO ponto do projeto que faz a ponte de tipos até a regeneração dos tipos.
 */
type AuthzRpc = {
  rpc(
    fn: "px_can",
    args: { _sistema: string; _modulo: string; _recurso: string; _acao: string },
  ): PromiseLike<{ data: boolean | null; error: { message: string } | null }>;
  rpc(
    fn: "px_has_system" | "px_has_module" | "px_is_master" | "px_is_admin" | "px_has_empresa",
    args: Record<string, string | null>,
  ): PromiseLike<{ data: boolean | null; error: { message: string } | null }>;
  rpc(
    fn: "px_effective_access" | "px_effective_systems" | "get_my_effective_access",
    args?: Record<string, string>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
  from(table: string): {
    select(cols: string): PromiseLike<{ data: Array<Record<string, string>> | null; error: unknown }>;
  };
};

function authzClient(supabase: SupabaseClient<never> | unknown): AuthzRpc {
  return supabase as AuthzRpc;
}

export class AuthorizationError extends Error {
  constructor(message = "Você não possui permissão para esta operação.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Carrega o acesso efetivo do usuário autenticado. Fonte única: get_my_effective_access(). */
export async function loadEffectiveAccess(
  supabase: unknown,
  userId: string,
): Promise<EffectiveAccess> {
  const client = authzClient(supabase);
  const { data, error } = await client.rpc("get_my_effective_access");
  if (error) throw new AuthorizationError(`Falha ao carregar autorização: ${error.message}`);
  const raw = (data ?? null) as null | {
    roles: string[] | null;
    is_master_admin: boolean;
    is_admin: boolean;
    systems: SystemGrant[] | null;
    permissions: PermissionGrant[] | null;
    empresas: string[] | null;
  };
  if (!raw) throw new AuthorizationError("Falha ao carregar autorização: resposta vazia.");
  return {
    ...EMPTY_ACCESS,
    userId,
    levels: raw.roles ?? [],
    isMaster: raw.is_master_admin === true,
    isAdmin: raw.is_admin === true,
    systems: raw.systems ?? [],
    permissions: raw.permissions ?? [],
    empresas: (raw.empresas ?? []).map((e) => String(e)),
  };
}

/** Autorização real: o banco decide, nunca o frontend. */
export async function assertCan(
  supabase: unknown,
  system: string,
  module: string,
  resource: string,
  action: Action,
): Promise<void> {
  const { data, error } = await authzClient(supabase).rpc("px_can", {
    _sistema: system,
    _modulo: module,
    _recurso: resource,
    _acao: action,
  });
  if (error) throw new AuthorizationError(error.message);
  if (data !== true) {
    throw new AuthorizationError(
      `Sem permissão: ${system} / ${module} / ${resource} / ${action}.`,
    );
  }
}

export async function assertSystem(supabase: unknown, system: string): Promise<void> {
  const { data, error } = await authzClient(supabase).rpc("px_has_system", { _sistema: system });
  if (error) throw new AuthorizationError(error.message);
  if (data !== true) throw new AuthorizationError(`Sem acesso ao sistema ${system}.`);
}

export async function assertAdmin(supabase: unknown): Promise<void> {
  const { data, error } = await authzClient(supabase).rpc("px_is_admin", {});
  if (error) throw new AuthorizationError(error.message);
  if (data !== true) throw new AuthorizationError("Apenas administradores da plataforma.");
}

export async function assertEmpresa(supabase: unknown, empresaId: string | null): Promise<void> {
  if (!empresaId) return;
  const { data, error } = await authzClient(supabase).rpc("px_has_empresa", {
    _empresa_id: empresaId,
  });
  if (error) throw new AuthorizationError(error.message);
  if (data !== true) throw new AuthorizationError("Sem acesso a esta empresa.");
}
