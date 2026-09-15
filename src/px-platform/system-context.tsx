// PX Platform — SystemProvider: sistema ativo + navegação.
// NÃO decide autorização: consome o acesso efetivo central (get_my_effective_access).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccessQuery } from "@/authz/authz-context";
import { ACCESS_QUERY_KEY } from "@/authz/access-client";
import { ANY } from "@/authz/catalog";
import { PX_SYSTEMS, type PxSystem } from "./systems";

const STORAGE_KEY = "px:active-system"; // preferência de navegação apenas — nunca autorização.

type Ctx = {
  loading: boolean;
  error: Error | null;
  allowedSystems: PxSystem[];
  activeSystem: PxSystem | null;
  setActiveSystem: (key: string | null) => void;
  refresh: () => Promise<void>;
  touchLastAccess: (key: string) => Promise<void>;
};

const SystemCtx = createContext<Ctx | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useEffectiveAccessQuery();
  const [activeKey, setActiveKeyState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setActiveKeyState(saved);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ACCESS_QUERY_KEY });
  }, [queryClient]);

  const setActiveSystem = useCallback((key: string | null) => {
    setActiveKeyState(key);
    try {
      if (key) sessionStorage.setItem(STORAGE_KEY, key);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  // Operação de DADOS (telemetria de último acesso) — não é autorização.
  const touchLastAccess = useCallback(async (key: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    await supabase
      .from("px_usuario_sistemas")
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq("user_id", userData.user.id)
      .eq("sistema_key", key);
  }, []);

  // MASTER_ADMIN recebe "*" do banco → todos os sistemas ativos do registry.
  const allowedSystems = useMemo(() => {
    if (!data) return [];
    const keys = new Set(data.systems.map((s) => s.sistema_key));
    const global = data.isMaster || keys.has(ANY);
    return PX_SYSTEMS.filter((s) => s.status === "ativo" && (global || keys.has(s.key)));
  }, [data]);

  const activeSystem = useMemo(
    () => PX_SYSTEMS.find((s) => s.key === activeKey) ?? null,
    [activeKey],
  );

  return (
    <SystemCtx.Provider
      value={{
        loading: isLoading,
        error: (error as Error | null) ?? null,
        allowedSystems,
        activeSystem,
        setActiveSystem,
        refresh,
        touchLastAccess,
      }}
    >
      {children}
    </SystemCtx.Provider>
  );
}

export function useSystem() {
  const ctx = useContext(SystemCtx);
  if (!ctx) throw new Error("useSystem deve estar dentro de <SystemProvider>");
  return ctx;
}
