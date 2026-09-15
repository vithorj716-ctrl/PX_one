// PXOne — server functions de administração de autorização (perfis, permissões, vínculos).
// Toda escrita passa por assertAdmin: o banco é a autoridade, o frontend só exibe.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./authz.server";
import { ANY } from "./catalog";

/** Ponte de tipos única: as tabelas de autorização foram criadas após a geração de `Database`. */
type LooseTable = {
  select: (cols: string) => any;
  insert: (rows: unknown) => any;
  update: (patch: unknown) => any;
  delete: () => any;
};
async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return {
    table: (name: string): LooseTable => (supabaseAdmin as any).from(name) as LooseTable,
    raw: supabaseAdmin,
  };
}

export type PermissionRow = {
  sistema_key: string;
  modulo_key: string;
  recurso: string;
  acao: string;
};

function normalizePermissions(list: unknown): PermissionRow[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: PermissionRow[] = [];
  for (const item of list) {
    const p = item as Partial<PermissionRow>;
    if (!p?.sistema_key || !p?.acao) continue;
    const row: PermissionRow = {
      sistema_key: String(p.sistema_key),
      modulo_key: String(p.modulo_key ?? ANY),
      recurso: String(p.recurso ?? ANY),
      acao: String(p.acao),
    };
    const key = `${row.sistema_key}|${row.modulo_key}|${row.recurso}|${row.acao}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

export const listAuthzCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase);
    const db = await admin();
    const [modulos, perfis, perfilPerms, perfilSistemas, empresas] = await Promise.all([
      db.table("px_modulos").select("sistema_key, modulo_key, nome, ordem"),
      db.table("px_perfis").select("id, nome, descricao, is_system"),
      db.table("px_perfil_permissoes").select("perfil_id, sistema_key, modulo_key, recurso, acao"),
      db.table("px_perfil_sistemas").select("perfil_id, sistema_key"),
      db.table("empresas").select("id, nome"),
    ]);
    return {
      modulos: (modulos.data ?? []) as Array<{ sistema_key: string; modulo_key: string; nome: string; ordem: number }>,
      perfis: (perfis.data ?? []) as Array<{ id: string; nome: string; descricao: string | null; is_system: boolean }>,
      perfilPermissoes: (perfilPerms.data ?? []) as Array<PermissionRow & { perfil_id: string }>,
      perfilSistemas: (perfilSistemas.data ?? []) as Array<{ perfil_id: string; sistema_key: string }>,
      empresas: (empresas.data ?? []) as Array<{ id: string; nome: string }>,
    };
  });

export const savePerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    perfilId?: string | null;
    nome: string;
    descricao?: string | null;
    sistemas: string[];
    permissoes: PermissionRow[];
  }) => {
    const nome = (d?.nome ?? "").trim();
    if (nome.length < 2) throw new Error("Informe o nome do perfil.");
    return {
      perfilId: d.perfilId ?? null,
      nome,
      descricao: (d.descricao ?? "")?.toString().trim() || null,
      sistemas: (d.sistemas ?? []).filter((s) => typeof s === "string" && s.length > 0),
      permissoes: normalizePermissions(d.permissoes),
    };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase);
    const db = await admin();

    let perfilId = data.perfilId;
    if (perfilId) {
      const { error } = await db
        .table("px_perfis")
        .update({ nome: data.nome, descricao: data.descricao })
        .eq("id", perfilId);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await db
        .table("px_perfis")
        .insert({ nome: data.nome, descricao: data.descricao, is_system: false })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      perfilId = created.id as string;
    }

    await db.table("px_perfil_permissoes").delete().eq("perfil_id", perfilId);
    await db.table("px_perfil_sistemas").delete().eq("perfil_id", perfilId);

    if (data.permissoes.length > 0) {
      const { error } = await db
        .table("px_perfil_permissoes")
        .insert(data.permissoes.map((p) => ({ ...p, perfil_id: perfilId })));
      if (error) throw new Error(error.message);
    }
    // Sistemas do perfil = seleção explícita + sistemas implicados pelas permissões.
    const sistemas = new Set([...data.sistemas, ...data.permissoes.map((p) => p.sistema_key)]);
    sistemas.delete(ANY);
    if (sistemas.size > 0) {
      const { error } = await db
        .table("px_perfil_sistemas")
        .insert([...sistemas].map((sistema_key) => ({ perfil_id: perfilId, sistema_key })));
      if (error) throw new Error(error.message);
    }
    return { ok: true, perfilId };
  });

export const deletePerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { perfilId: string }) => {
    if (!d?.perfilId) throw new Error("perfilId obrigatório");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase);
    const db = await admin();
    const { data: perfil } = await db.table("px_perfis").select("is_system").eq("id", data.perfilId).single();
    if (perfil?.is_system) throw new Error("Perfis padrão do sistema não podem ser excluídos.");
    await db.table("px_usuario_perfis").delete().eq("perfil_id", data.perfilId);
    await db.table("px_perfil_permissoes").delete().eq("perfil_id", data.perfilId);
    await db.table("px_perfil_sistemas").delete().eq("perfil_id", data.perfilId);
    const { error } = await db.table("px_perfis").delete().eq("id", data.perfilId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Vínculos de autorização de um usuário: perfis, permissões diretas, sistemas e empresas. */
export const setUserAuthz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    userId: string;
    perfis?: string[] | null;
    permissoes?: PermissionRow[] | null;
    sistemas?: string[] | null;
    empresas?: string[] | null;
  }) => {
    if (!d?.userId) throw new Error("userId obrigatório");
    return {
      userId: d.userId,
      perfis: d.perfis ? d.perfis.filter((p) => typeof p === "string" && p.length > 0) : null,
      permissoes: d.permissoes ? normalizePermissions(d.permissoes) : null,
      sistemas: d.sistemas ? d.sistemas.filter((s) => typeof s === "string" && s.length > 0) : null,
      empresas: d.empresas ? d.empresas.filter((e) => typeof e === "string" && e.length > 0) : null,
    };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase);
    const db = await admin();

    if (data.perfis) {
      await db.table("px_usuario_perfis").delete().eq("user_id", data.userId);
      if (data.perfis.length > 0) {
        const { error } = await db
          .table("px_usuario_perfis")
          .insert(data.perfis.map((perfil_id) => ({ user_id: data.userId, perfil_id })));
        if (error) throw new Error(error.message);
      }
    }
    if (data.permissoes) {
      await db.table("px_usuario_permissoes").delete().eq("user_id", data.userId);
      if (data.permissoes.length > 0) {
        const { error } = await db
          .table("px_usuario_permissoes")
          .insert(data.permissoes.map((p) => ({ ...p, user_id: data.userId })));
        if (error) throw new Error(error.message);
      }
    }
    if (data.sistemas) {
      await db.table("px_usuario_sistemas").delete().eq("user_id", data.userId);
      if (data.sistemas.length > 0) {
        const { error } = await db
          .table("px_usuario_sistemas")
          .insert(data.sistemas.map((sistema_key) => ({ user_id: data.userId, sistema_key, ativo: true })));
        if (error) throw new Error(error.message);
      }
    }
    if (data.empresas) {
      await db.table("px_usuario_empresas").delete().eq("user_id", data.userId);
      if (data.empresas.length > 0) {
        const { error } = await db
          .table("px_usuario_empresas")
          .insert(data.empresas.map((empresa_id) => ({ user_id: data.userId, empresa_id })));
        if (error) throw new Error(error.message);
      }
    }
    return { ok: true };
  });

/** Vínculos atuais de um usuário (para preencher a tela administrativa). */
export const getUserAuthz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => {
    if (!d?.userId) throw new Error("userId obrigatório");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase);
    const db = await admin();
    const [perfis, permissoes, sistemas, empresas] = await Promise.all([
      db.table("px_usuario_perfis").select("perfil_id").eq("user_id", data.userId),
      db.table("px_usuario_permissoes").select("sistema_key, modulo_key, recurso, acao").eq("user_id", data.userId),
      db.table("px_usuario_sistemas").select("sistema_key").eq("user_id", data.userId).eq("ativo", true),
      db.table("px_usuario_empresas").select("empresa_id").eq("user_id", data.userId),
    ]);
    return {
      perfis: ((perfis.data ?? []) as Array<{ perfil_id: string }>).map((p) => p.perfil_id),
      permissoes: (permissoes.data ?? []) as PermissionRow[],
      sistemas: ((sistemas.data ?? []) as Array<{ sistema_key: string }>).map((s) => s.sistema_key),
      empresas: ((empresas.data ?? []) as Array<{ empresa_id: string }>).map((e) => e.empresa_id),
    };
  });
