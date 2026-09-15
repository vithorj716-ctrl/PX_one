// PXOne — cálculo de acesso efetivo (puro, sem I/O).
// Usado igualmente pelo frontend, pelas server functions e pelos testes.
import { ANY, type Action, type SystemKey } from "./catalog";

export type PermissionGrant = {
  sistema_key: string;
  modulo_key: string;
  recurso: string;
  acao: string;
  origem: string;
};

export type SystemGrant = {
  sistema_key: string;
  origem: string;
};

export type EffectiveAccess = {
  userId: string;
  /** Nível hierárquico do usuário (user_roles). Não é permissão. */
  levels: string[];
  isMaster: boolean;
  isAdmin: boolean;
  systems: SystemGrant[];
  permissions: PermissionGrant[];
  empresas: string[];
};

export const EMPTY_ACCESS: EffectiveAccess = {
  userId: "",
  levels: [],
  isMaster: false,
  isAdmin: false,
  systems: [],
  permissions: [],
  empresas: [],
};

function matches(value: string, wanted: string) {
  return value === ANY || value === wanted;
}

export function hasSystemAccess(access: EffectiveAccess, system: SystemKey | string): boolean {
  if (access.isMaster) return true;
  return access.systems.some((s) => matches(s.sistema_key, system));
}

export function hasModuleAccess(
  access: EffectiveAccess,
  system: SystemKey | string,
  module: string,
): boolean {
  if (access.isMaster) return true;
  if (!hasSystemAccess(access, system)) return false;
  return access.permissions.some(
    (p) => matches(p.sistema_key, system) && matches(p.modulo_key, module),
  );
}

export function can(
  access: EffectiveAccess,
  system: SystemKey | string,
  module: string,
  resource: string,
  action: Action | string,
): boolean {
  if (access.isMaster) return true;
  if (!hasSystemAccess(access, system)) return false;
  return access.permissions.some(
    (p) =>
      matches(p.sistema_key, system) &&
      matches(p.modulo_key, module) &&
      matches(p.recurso, resource) &&
      matches(p.acao, action),
  );
}

export function hasEmpresaAccess(access: EffectiveAccess, empresaId: string | null): boolean {
  if (!empresaId) return true;
  if (access.isMaster) return true;
  return access.empresas.includes(empresaId);
}

/** Origem legível de uma permissão concedida — usado na tela de acessos efetivos. */
export function grantOrigin(
  access: EffectiveAccess,
  system: string,
  module: string,
  resource: string,
  action: string,
): string | null {
  if (access.isMaster) return "Tipo de usuário MASTER_ADMIN";
  const hit = access.permissions.find(
    (p) =>
      matches(p.sistema_key, system) &&
      matches(p.modulo_key, module) &&
      matches(p.recurso, resource) &&
      matches(p.acao, action),
  );
  return hit?.origem ?? null;
}
