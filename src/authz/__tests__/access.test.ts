import { describe, expect, it } from "vitest";
import { EMPTY_ACCESS, can, hasEmpresaAccess, hasModuleAccess, hasSystemAccess, grantOrigin, type EffectiveAccess } from "../access";
import { requirementForPath } from "../route-map";

function access(partial: Partial<EffectiveAccess>): EffectiveAccess {
  return { ...EMPTY_ACCESS, userId: "u1", ...partial };
}

const master = access({
  isMaster: true,
  levels: ["master_admin"],
  systems: [{ sistema_key: "*", origem: "Tipo de usuário MASTER_ADMIN" }],
  permissions: [{ sistema_key: "*", modulo_key: "*", recurso: "*", acao: "*", origem: "Tipo de usuário MASTER_ADMIN" }],
});

const gestor = access({
  levels: ["gestor"],
  systems: [{ sistema_key: "pxlog-tms", origem: "Perfil Gestor Operacional" }],
  permissions: [
    { sistema_key: "pxlog-tms", modulo_key: "viagens", recurso: "*", acao: "read", origem: "Perfil Gestor Operacional" },
    { sistema_key: "pxlog-tms", modulo_key: "viagens", recurso: "*", acao: "update", origem: "Perfil Gestor Operacional" },
  ],
  empresas: ["emp-1"],
});

const semAcesso = access({ levels: ["auditor"] });

describe("matriz de autorização", () => {
  it("master acessa qualquer sistema, módulo e ação", () => {
    expect(hasSystemAccess(master, "pxone-erp")).toBe(true);
    expect(hasModuleAccess(master, "platform", "usuarios")).toBe(true);
    expect(can(master, "pxlog-tms", "financeiro", "qualquer", "delete")).toBe(true);
    expect(hasEmpresaAccess(master, "emp-9")).toBe(true);
  });

  it("usuário sem concessão não acessa nada", () => {
    expect(hasSystemAccess(semAcesso, "pxone-erp")).toBe(false);
    expect(hasModuleAccess(semAcesso, "pxone-erp", "financeiro")).toBe(false);
    expect(can(semAcesso, "pxone-erp", "financeiro", "custos", "read")).toBe(false);
  });

  it("permissão é limitada ao sistema, módulo e ação concedidos", () => {
    expect(hasSystemAccess(gestor, "pxlog-tms")).toBe(true);
    expect(hasSystemAccess(gestor, "pxone-erp")).toBe(false);
    expect(hasModuleAccess(gestor, "pxlog-tms", "viagens")).toBe(true);
    expect(hasModuleAccess(gestor, "pxlog-tms", "financeiro")).toBe(false);
    expect(can(gestor, "pxlog-tms", "viagens", "tms_viagens", "read")).toBe(true);
    expect(can(gestor, "pxlog-tms", "viagens", "tms_viagens", "delete")).toBe(false);
  });

  it("coringa de recurso vale para qualquer recurso do módulo", () => {
    expect(can(gestor, "pxlog-tms", "viagens", "outro_recurso", "update")).toBe(true);
  });

  it("combinação de perfis é união, sem deny implícito", () => {
    const combinado = access({
      systems: [
        { sistema_key: "pxlog-tms", origem: "Perfil A" },
        { sistema_key: "pxone-erp", origem: "Perfil B" },
      ],
      permissions: [
        { sistema_key: "pxlog-tms", modulo_key: "viagens", recurso: "*", acao: "read", origem: "Perfil A" },
        { sistema_key: "pxone-erp", modulo_key: "financeiro", recurso: "*", acao: "export", origem: "Perfil B" },
      ],
    });
    expect(can(combinado, "pxlog-tms", "viagens", "x", "read")).toBe(true);
    expect(can(combinado, "pxone-erp", "financeiro", "x", "export")).toBe(true);
  });

  it("isolamento por empresa", () => {
    expect(hasEmpresaAccess(gestor, "emp-1")).toBe(true);
    expect(hasEmpresaAccess(gestor, "emp-2")).toBe(false);
  });

  it("origem da permissão é rastreável", () => {
    expect(grantOrigin(gestor, "pxlog-tms", "viagens", "x", "read")).toBe("Perfil Gestor Operacional");
    expect(grantOrigin(gestor, "pxlog-tms", "viagens", "x", "delete")).toBeNull();
  });
});

describe("mapa de rotas", () => {
  it("mapeia áreas administrativas para o sistema platform", () => {
    expect(requirementForPath("/admin")).toEqual({ system: "platform", module: "usuarios" });
    expect(requirementForPath("/admin/perfis")).toEqual({ system: "platform", module: "perfis" });
    expect(requirementForPath("/admin/px-api")).toEqual({ system: "platform", module: "api" });
  });

  it("mapeia TMS e ERP", () => {
    expect(requirementForPath("/tms/viagens/123")).toEqual({ system: "pxlog-tms", module: "viagens" });
    expect(requirementForPath("/consolidado")).toEqual({ system: "pxone-erp", module: "financeiro" });
    expect(requirementForPath("/kpis")).toEqual({ system: "pxone-erp", module: "indicadores" });
  });

  it("não exige sistema em rotas abertas", () => {
    expect(requirementForPath("/login")).toBeNull();
    expect(requirementForPath("/launcher")).toBeNull();
    expect(requirementForPath("/conta")).toBeNull();
  });
});
