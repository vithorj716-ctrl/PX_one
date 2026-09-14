// Administração de usuários da plataforma — apenas executivos (master_admin/socio/diretor).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const APP_ROLES = ["master_admin", "socio", "diretor", "gestor", "consultor", "auditor"] as const;
export type AppRole = (typeof APP_ROLES)[number];

async function assertExecutivo(ctx: any) {
  const { data, error } = await ctx.supabase.rpc("is_executive", { _user_id: ctx.userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Apenas administradores podem gerenciar usuários.");
}

export const listPlatformUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertExecutivo(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw new Error(error.message);

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { data: metas } = await supabaseAdmin
      .from("px_usuarios_meta")
      .select("user_id, nome, login, cargo, situacao");

    const rolesByUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    }
    const metaByUser = new Map((metas ?? []).map((m: any) => [m.user_id, m]));

    return list.users.map((u) => {
      const meta: any = metaByUser.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        login: meta?.login ?? (u.email ?? "").split("@")[0],
        nome: meta?.nome ?? null,
        cargo: meta?.cargo ?? null,
        situacao: meta?.situacao ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        roles: rolesByUser.get(u.id) ?? [],
      };
    });
  });

export const setUserRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; roles: string[] }) => {
    if (!d?.userId) throw new Error("userId obrigatório");
    const roles = (d.roles ?? []).filter((r) => (APP_ROLES as readonly string[]).includes(r));
    return { userId: d.userId, roles };
  })
  .handler(async ({ data, context }) => {
    await assertExecutivo(context);
    if (data.userId === context.userId && !data.roles.includes("master_admin")) {
      throw new Error("Você não pode remover o seu próprio acesso de administrador total.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: delErr } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    if (delErr) throw new Error(delErr.message);
    if (data.roles.length > 0) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert(data.roles.map((role) => ({ user_id: data.userId, role: role as AppRole })));
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; password: string }) => {
    if (!d?.userId) throw new Error("userId obrigatório");
    if (!d?.password || d.password.length < 8) throw new Error("Senha deve ter ao menos 8 caracteres.");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertExecutivo(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createPlatformUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    login: string; password: string; nome?: string; cargo?: string;
    roles?: string[]; sistemas?: string[]; email?: string;
  }) => {
    const login = (d?.login ?? "").trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,}$/.test(login)) throw new Error("Login inválido (mín. 3, letras/números/._-).");
    if (!d?.password || d.password.length < 8) throw new Error("Senha deve ter ao menos 8 caracteres.");
    const email = (d.email ?? "").trim() || `${login}@px.local`;
    return {
      login,
      email,
      password: d.password,
      nome: (d.nome ?? login).trim(),
      cargo: (d.cargo ?? "").trim() || null,
      roles: (d.roles ?? []).filter((r) => (APP_ROLES as readonly string[]).includes(r)),
      sistemas: (d.sistemas ?? []).filter((s) => typeof s === "string" && s.length > 0),
    };
  })
  .handler(async ({ data, context }) => {
    await assertExecutivo(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { login: data.login, nome: data.nome },
    });
    if (error || !created?.user) throw new Error(error?.message ?? "Falha ao criar usuário.");
    const userId = created.user.id;

    const { error: metaErr } = await supabaseAdmin
      .from("px_usuarios_meta")
      .upsert({ user_id: userId, login: data.login, nome: data.nome, cargo: data.cargo, situacao: "ativo" }, { onConflict: "user_id" });
    if (metaErr) throw new Error(metaErr.message);

    if (data.roles.length > 0) {
      const { error: rErr } = await supabaseAdmin
        .from("user_roles")
        .insert(data.roles.map((role) => ({ user_id: userId, role: role as AppRole })));
      if (rErr) throw new Error(rErr.message);
    }
    if (data.sistemas.length > 0) {
      const { error: sErr } = await supabaseAdmin
        .from("px_usuario_sistemas")
        .upsert(data.sistemas.map((sistema_key) => ({ user_id: userId, sistema_key, ativo: true })), { onConflict: "user_id,sistema_key" });
      if (sErr) throw new Error(sErr.message);
    }
    return { ok: true, userId };
  });

export const updatePlatformUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; nome?: string; cargo?: string; situacao?: string; sistemas?: string[] }) => {
    if (!d?.userId) throw new Error("userId obrigatório");
    return {
      userId: d.userId,
      nome: (d.nome ?? "").trim() || null,
      cargo: (d.cargo ?? "").trim() || null,
      situacao: d.situacao === "inativo" ? "inativo" : "ativo",
      sistemas: d.sistemas ? d.sistemas.filter((s) => typeof s === "string" && s.length > 0) : null,
    };
  })
  .handler(async ({ data, context }) => {
    await assertExecutivo(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const patch: Record<string, unknown> = { situacao: data.situacao, updated_at: new Date().toISOString() };
    if (data.nome) patch["nome"] = data.nome;
    patch["cargo"] = data.cargo;
    const { error } = await supabaseAdmin.from("px_usuarios_meta").update(patch).eq("user_id", data.userId);
    if (error) throw new Error(error.message);

    if (data.sistemas) {
      await supabaseAdmin.from("px_usuario_sistemas").delete().eq("user_id", data.userId);
      if (data.sistemas.length > 0) {
        const { error: sErr } = await supabaseAdmin
          .from("px_usuario_sistemas")
          .insert(data.sistemas.map((sistema_key) => ({ user_id: data.userId, sistema_key, ativo: true })));
        if (sErr) throw new Error(sErr.message);
      }
    }
    return { ok: true };
  });

export const deletePlatformUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => {
    if (!d?.userId) throw new Error("userId obrigatório");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertExecutivo(context);
    if (data.userId === context.userId) throw new Error("Você não pode excluir o seu próprio usuário.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("px_usuario_sistemas").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("px_usuarios_meta").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
