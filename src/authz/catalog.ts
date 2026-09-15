// PXOne — catálogo canônico de autorização.
// Fonte única de sistemas, módulos, recursos e ações. Não crie strings soltas fora daqui.

export const ACTIONS = ["read", "create", "update", "delete", "export", "approve"] as const;
export type Action = (typeof ACTIONS)[number];

export const SYSTEMS = ["platform", "pxone-erp", "pxlog-tms", "pxmed", "pxfarma"] as const;
export type SystemKey = (typeof SYSTEMS)[number];

export const MODULES = {
  platform: ["usuarios", "perfis", "api", "auditoria", "empresas"],
  "pxone-erp": ["dashboard", "financeiro", "custos", "indicadores", "estrategia", "cadastros"],
  "pxlog-tms": ["solicitacoes", "minutas", "viagens", "last-mile", "clientes", "fretes", "financeiro"],
  pxmed: [],
  pxfarma: [],
} as const satisfies Record<SystemKey, readonly string[]>;

export type ModuleKey<S extends SystemKey = SystemKey> = (typeof MODULES)[S][number];

/** Coringa aceito no banco em qualquer nível (sistema, módulo, recurso, ação). */
export const ANY = "*";

/** Níveis hierárquicos (tipo de usuário). NÃO são permissões. */
export const USER_LEVELS = [
  "master_admin",
  "admin",
  "socio",
  "diretor",
  "gestor",
  "consultor",
  "auditor",
] as const;
export type UserLevel = (typeof USER_LEVELS)[number];

export const USER_LEVEL_LABEL: Record<UserLevel, string> = {
  master_admin: "Master admin",
  admin: "Administrador",
  socio: "Sócio",
  diretor: "Diretor",
  gestor: "Gestor",
  consultor: "Consultor",
  auditor: "Auditor",
};

export const ACTION_LABEL: Record<Action, string> = {
  read: "Consultar",
  create: "Criar",
  update: "Editar",
  delete: "Excluir",
  export: "Exportar",
  approve: "Aprovar",
};

export function modulesOf(system: SystemKey): readonly string[] {
  return MODULES[system] ?? [];
}
