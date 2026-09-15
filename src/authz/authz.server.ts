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
    fn: "px_effective_access" | "px_effective_systems",
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

/** Carrega o acesso efetivo do usuário autenticado. Fonte única para app e telas. */
export async function loadEffectiveAccess(
  supabase: unknown,
  userId: string,
): Promise<EffectiveAccess> {
  const client = authzClient(supabase);
  const [perms, systems, roles, empresas, master, admin] = await Promise.all([
    client.rpc("px_effective_access"),
    client.rpc("px_effective_systems"),
    client.from("user_roles").select("role"),
    client.from("px_usuario_empresas").select("empresa_id"),
    client.rpc("px_is_master", {}),
    client.rpc("px_is_admin", {}),
  ]);

  return {
    ...EMPTY_ACCESS,
    userId,
    levels: (roles.data ?? []).map((r) => String(r.role)),
    isMaster: master.data === true,
    isAdmin: admin.data === true,
    systems: ((systems.data as SystemGrant[] | null) ?? []).map((s) => ({
      sistema_key: s.sistema_key,
      origem: s.origem,
    })),
    permissions: ((perms.data as PermissionGrant[] | null) ?? []).map((p) => ({
      sistema_key: p.sistema_key,
      modulo_key: p.modulo_key,
      recurso: p.recurso,
      acao: p.acao,
      origem: p.origem,
    })),
    empresas: (empresas.data ?? []).map((e) => String(e.empresa_id)),
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
