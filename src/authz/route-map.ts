// PXOne — mapa único rota -> (sistema, módulo).
// Toda proteção de rota passa por aqui; não espalhe checagens pelas páginas.
import type { SystemKey } from "./catalog";

export type RouteRequirement = { system: SystemKey; module: string | null } | null;

const TMS_MODULE: Record<string, string> = {
  solicitacoes: "solicitacoes",
  minutas: "minutas",
  etiquetas: "minutas",
  conferencia: "minutas",
  recebimento: "minutas",
  embarque: "viagens",
  viagens: "viagens",
  tracking: "viagens",
  lm: "last-mile",
  entregas: "last-mile",
  ocorrencias: "last-mile",
  clientes: "clientes",
  "tabela-frete": "fretes",
  financeiro: "financeiro",
};

const ERP_MODULE: Record<string, string> = {
  "": "dashboard",
  aplicacoes: "dashboard",
  platform: "dashboard",
  consolidado: "financeiro",
  "financial-intelligence": "financeiro",
  investor: "financeiro",
  custos: "custos",
  markup: "custos",
  kpis: "indicadores",
  growth: "indicadores",
  "ai-analyst": "indicadores",
  okr: "estrategia",
  "business-plan": "estrategia",
  decisions: "estrategia",
  documents: "estrategia",
  risk: "estrategia",
  timeline: "estrategia",
  valuation: "estrategia",
  payback: "estrategia",
  empresas: "cadastros",
  registry: "cadastros",
};

const PLATFORM_MODULE: Record<string, string> = {
  usuarios: "usuarios",
  perfis: "perfis",
  "px-api": "api",
  auditoria: "auditoria",
};

/** Rotas públicas ou sem exigência de sistema (login, launcher, conta, 403). */
const OPEN_PATHS = new Set(["/login", "/auth", "/launcher", "/conta", "/acesso-negado"]);

export function requirementForPath(pathname: string): RouteRequirement {
  if (OPEN_PATHS.has(pathname)) return null;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] ?? "";

  if (first === "admin") {
    const sub = segments[1] ?? "";
    return { system: "platform", module: PLATFORM_MODULE[sub] ?? "usuarios" };
  }
  if (first === "tms") {
    const sub = segments[1] ?? "";
    return { system: "pxlog-tms", module: TMS_MODULE[sub] ?? null };
  }
  if (first === "pxmed") return { system: "pxmed", module: null };
  if (first === "pxfarma") return { system: "pxfarma", module: null };
  return { system: "pxone-erp", module: ERP_MODULE[first] ?? null };
}
