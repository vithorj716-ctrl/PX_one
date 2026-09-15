import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listAuthzCatalog, savePerfil, deletePerfil, type PermissionRow } from "@/authz/admin.functions";
import { ACTIONS, ACTION_LABEL, ANY, SYSTEMS } from "@/authz/catalog";
import { useAuthz } from "@/authz/authz-context";
import { PX_SYSTEMS } from "@/px-platform/systems";

export const Route = createFileRoute("/_authenticated/admin/perfis")({
  head: () => ({ meta: [{ title: "Administração — Perfis" }] }),
  component: AdminPerfis,
});

const CATALOG_KEY = ["px", "authz", "catalog"] as const;

function systemLabel(key: string) {
  if (key === "platform") return "PX Platform";
  return PX_SYSTEMS.find((s) => s.key === key)?.nome ?? key;
}

function permKey(p: PermissionRow) {
  return `${p.sistema_key}|${p.modulo_key}|${p.recurso}|${p.acao}`;
}

function AdminPerfis() {
  const navigate = useNavigate();
  const { isAdmin, loading: authzLoading, refresh } = useAuthz();
  const fetchCatalog = useServerFn(listAuthzCatalog);
  const persist = useServerFn(savePerfil);
  const remove = useServerFn(deletePerfil);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: CATALOG_KEY,
    queryFn: () => fetchCatalog(),
    enabled: isAdmin,
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const modulesBySystem = useMemo(() => {
    const map = new Map<string, Array<{ modulo_key: string; nome: string }>>();
    for (const m of data?.modulos ?? []) {
      map.set(m.sistema_key, [...(map.get(m.sistema_key) ?? []), { modulo_key: m.modulo_key, nome: m.nome }]);
    }
    return map;
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const permissoes: PermissionRow[] = [...selected].map((k) => {
        const [sistema_key, modulo_key, recurso, acao] = k.split("|");
        return { sistema_key, modulo_key, recurso, acao };
      });
      await persist({
        data: {
          perfilId: editing,
          nome,
          descricao,
          sistemas: [...new Set(permissoes.map((p) => p.sistema_key))],
          permissoes,
        },
      });
    },
    onSuccess: async () => {
      toast.success("Perfil salvo.");
      setEditing(null);
      setSelected(new Set());
      setNome("");
      setDescricao("");
      await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
      await refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Falha ao salvar perfil."),
  });

  function startEdit(perfilId: string | null) {
    if (!perfilId) {
      setEditing(null);
      setNome("");
      setDescricao("");
      setSelected(new Set());
      return;
    }
    const perfil = data?.perfis.find((p) => p.id === perfilId);
    setEditing(perfilId);
    setNome(perfil?.nome ?? "");
    setDescricao(perfil?.descricao ?? "");
    setSelected(
      new Set(
        (data?.perfilPermissoes ?? [])
          .filter((p) => p.perfil_id === perfilId)
          .map((p) => permKey(p)),
      ),
    );
  }

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /** "Marcar tudo" grava permissões reais (coringa por módulo), não apenas visual. */
  function toggleAllSystem(sistema: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      const modulos = modulesBySystem.get(sistema) ?? [];
      for (const m of modulos) {
        for (const acao of ACTIONS) {
          const key = `${sistema}|${m.modulo_key}|${ANY}|${acao}`;
          if (on) next.add(key);
          else next.delete(key);
        }
      }
      return next;
    });
  }

  if (authzLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Verificando permissões…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="text-sm text-muted-foreground">Acesso restrito aos administradores da plataforma.</div>
        <button onClick={() => navigate({ to: "/launcher" })} className="text-xs px-3 py-1.5 rounded-md ring-1 ring-border">Voltar ao Launcher</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 px-4 sm:px-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/admin" })} className="p-2 rounded-md hover:bg-surface/60 text-muted-foreground">
            <ArrowLeft className="size-4" />
          </button>
          <div className="text-sm font-semibold">Perfis & Permissões</div>
        </div>
        <button
          onClick={() => { startEdit(null); setNome("Novo perfil"); }}
          className="text-xs px-2.5 py-1.5 rounded-md ring-1 ring-brand text-brand inline-flex items-center gap-1.5"
        >
          <Plus className="size-3.5" /> Novo perfil
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] items-center rounded-xl ring-1 ring-brand/30 bg-surface/40 p-4">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do perfil"
                className="bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand"
              />
              <input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição"
                className="bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand"
              />
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending || nome.trim().length < 2}
                className="text-xs px-3 py-2 rounded-md ring-1 ring-brand text-brand inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="size-3.5" /> {editing ? "Salvar perfil" : "Criar perfil"}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(data?.perfis ?? []).map((p) => (
                <div key={p.id} className="inline-flex items-center gap-1">
                  <button
                    onClick={() => startEdit(p.id)}
                    className={`text-xs px-2.5 py-1 rounded-full ring-1 ${editing === p.id ? "ring-brand text-brand bg-brand/10" : "ring-border text-muted-foreground"}`}
                  >
                    {p.nome}
                  </button>
                  {!p.is_system && (
                    <button
                      aria-label={`Excluir perfil ${p.nome}`}
                      onClick={async () => {
                        if (!window.confirm(`Excluir o perfil ${p.nome}?`)) return;
                        try {
                          await remove({ data: { perfilId: p.id } });
                          toast.success("Perfil excluído.");
                          await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Falha ao excluir.");
                        }
                      }}
                      className="p-1 rounded text-red-400/70 hover:text-red-400"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {SYSTEMS.filter((s) => (modulesBySystem.get(s) ?? []).length > 0).map((sistema) => (
              <div key={sistema} className="rounded-xl ring-1 ring-border bg-surface/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm">{systemLabel(sistema)}</div>
                  <div className="flex gap-1.5">
                    <button onClick={() => toggleAllSystem(sistema, true)} className="text-[11px] px-2 py-1 rounded ring-1 ring-border text-muted-foreground">Marcar tudo</button>
                    <button onClick={() => toggleAllSystem(sistema, false)} className="text-[11px] px-2 py-1 rounded ring-1 ring-border text-muted-foreground">Limpar</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-muted-foreground">
                      <tr>
                        <th className="text-left py-1.5 px-2">Módulo</th>
                        {ACTIONS.map((a) => <th key={a} className="px-2 py-1.5 text-center">{ACTION_LABEL[a]}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(modulesBySystem.get(sistema) ?? []).map((m) => (
                        <tr key={m.modulo_key} className="border-t border-border">
                          <td className="py-1.5 px-2">{m.nome}</td>
                          {ACTIONS.map((a) => {
                            const key = `${sistema}|${m.modulo_key}|${ANY}|${a}`;
                            return (
                              <td key={a} className="px-2 py-1.5 text-center">
                                <input
                                  type="checkbox"
                                  aria-label={`${systemLabel(sistema)} ${m.nome} ${ACTION_LABEL[a]}`}
                                  checked={selected.has(key)}
                                  onChange={() => toggle(key)}
                                  className="accent-[hsl(var(--brand))]"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
