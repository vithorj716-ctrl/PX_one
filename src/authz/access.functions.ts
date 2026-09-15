// PXOne — acesso efetivo exposto ao frontend (uma única server function).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { loadEffectiveAccess } from "./authz.server";
import type { EffectiveAccess } from "./access";

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EffectiveAccess> => {
    return loadEffectiveAccess(context.supabase, context.userId);
  });

/** Acesso efetivo de outro usuário — somente administradores (tela de usuários). */
export const getUserAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => {
    if (!d?.userId) throw new Error("userId obrigatório");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./authz.server");
    await assertAdmin(context.supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [access, systems, roles, empresas] = await Promise.all([
      supabaseAdmin.rpc("px_effective_access" as never, { _user_id: data.userId } as never),
      supabaseAdmin.rpc("px_effective_systems" as never, { _user_id: data.userId } as never),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", data.userId),
      supabaseAdmin.from("px_usuario_empresas" as never).select("empresa_id").eq("user_id", data.userId),
    ]);
    const levels = (roles.data ?? []).map((r) => String(r.role));
    return {
      userId: data.userId,
      levels,
      isMaster: levels.includes("master_admin"),
      isAdmin: levels.includes("master_admin"),
      permissions: (access.data ?? []) as EffectiveAccess["permissions"],
      systems: (systems.data ?? []) as EffectiveAccess["systems"],
      empresas: ((empresas.data ?? []) as Array<{ empresa_id: string }>).map((e) => e.empresa_id),
    } satisfies EffectiveAccess;
  });
