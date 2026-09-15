import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, ShieldCheck, KeyRound, Eye, EyeOff, UserPlus, Trash2, Save, ListTree } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  listPlatformUsers,
  setUserRoles,
  resetUserPassword,
  createPlatformUser,
  updatePlatformUser,
  deletePlatformUser,
  APP_ROLES,
} from "@/lib/px-users-admin.functions";
import { listAuthzCatalog, setUserAuthz, getUserAuthz, type PermissionRow } from "@/authz/admin.functions";
import { getUserAccess } from "@/authz/access.functions";
import { ACTION_LABEL, USER_LEVEL_LABEL, type Action } from "@/authz/catalog";
import { useAuthz } from "@/authz/authz-context";
import { PX_SYSTEMS } from "@/px-platform/systems";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({ meta: [{ title: "Administração — Usuários" }] }),
  component: AdminUsuarios,
});

type Usuario = {
  id: string;
  email: string;
  login: string;
  nome: string | null;
  cargo: string | null;
  situacao: string | null;
  last_sign_in_at: string | null;
  roles: string[];
  perfis: string[];
  sistemas: string[];
};

type EffectiveRow = { sistema_key: string; modulo_key: string; recurso: string; acao: string; origem: string };

function systemLabel(key: string) {
  if (key === "platform") return "PX Platform";
  if (key === "*") return "Todos os sistemas";
  return PX_SYSTEMS.find((s) => s.key === key)?.nome ?? key;
}

function AdminUsuarios() {
  const navigate = useNavigate();
  const { isAdmin, loading: authzLoading, refresh: refreshAuthz } = useAuthz();
  const fetchUsers = useServerFn(listPlatformUsers);
  const saveRoles = useServerFn(setUserRoles);
  const resetPwd = useServerFn(resetUserPassword);
  const createUser = useServerFn(createPlatformUser);
  const updateUser = useServerFn(updatePlatformUser);
  const removeUser = useServerFn(deletePlatformUser);
  const fetchCatalog = useServerFn(listAuthzCatalog);
  const saveAuthz = useServerFn(setUserAuthz);
  const fetchUserAuthz = useServerFn(getUserAuthz);
  const fetchUserAccess = useServerFn(getUserAccess);

  const [rows, setRows] = useState<Usuario[]>([]);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState<Array<{ id: string; nome: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [pwdFor, setPwdFor] = useState<string | null>(null);
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [novoOpen, setNovoOpen] = useState(false);
  const [novo, setNovo] = useState({ login: "", nome: "", cargo: "", password: "", roles: [] as string[], sistemas: ["pxone-erp"] as string[] });
  const [criando, setCriando] = useState(false);
  const [editFor, setEditFor] = useState<string | null>(null);
  const [edit, setEdit] = useState({ nome: "", cargo: "", situacao: "ativo" });
  const [tabFor, setTabFor] = useState<{ userId: string; tab: "nivel" | "perfis" | "sistemas" | "efetivos" } | null>(null);
  const [vinculos, setVinculos] = useState<{ perfis: string[]; sistemas: string[]; permissoes: PermissionRow[] } | null>(null);
  const [efetivos, setEfetivos] = useState<EffectiveRow[] | null>(null);

  function toggleIn(list: string[], value: string) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  async function submitNovo() {
    setCriando(true);
    try {
      await createUser({ data: novo });
      toast.success(`Usuário ${novo.login} criado.`);
      setNovo({ login: "", nome: "", cargo: "", password: "", roles: [], sistemas: ["pxone-erp"] });
      setNovoOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao criar usuário.");
    } finally {
      setCriando(false);
    }
  }

  async function submitEdit(u: Usuario) {
    try {
      await updateUser({ data: { userId: u.id, nome: edit.nome, cargo: edit.cargo, situacao: edit.situacao } });
      toast.success(`Dados de ${u.login} atualizados.`);
      setEditFor(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao atualizar usuário.");
    }
  }

  async function excluir(u: Usuario) {
    if (!window.confirm(`Excluir definitivamente o usuário ${u.login}?`)) return;
    try {
      await removeUser({ data: { userId: u.id } });
      toast.success(`Usuário ${u.login} excluído.`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao excluir usuário.");
    }
  }

  async function load() {
    setLoading(true);
    setErro(null);
    try {
      const [data, catalog] = await Promise.all([fetchUsers(), fetchCatalog()]);
      setRows(data as Usuario[]);
      setPerfisDisponiveis(catalog.perfis.map((p) => ({ id: p.id, nome: p.nome })));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  async function openTab(u: Usuario, tab: "nivel" | "perfis" | "sistemas" | "efetivos") {
    setTabFor({ userId: u.id, tab });
    if (tab === "efetivos") {
      setEfetivos(null);
      const access = await fetchUserAccess({ data: { userId: u.id } });
      setEfetivos(access.permissions as EffectiveRow[]);
      return;
    }
    setVinculos(null);
    const v = await fetchUserAuthz({ data: { userId: u.id } });
    setVinculos({ perfis: v.perfis, sistemas: v.sistemas, permissoes: v.permissoes });
  }

  async function persistVinculos(u: Usuario, patch: { perfis?: string[]; sistemas?: string[] }) {
    setSaving(u.id);
    try {
      await saveAuthz({ data: { userId: u.id, ...patch } });
      setVinculos((prev) => (prev ? { ...prev, ...patch } : prev));
      setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, ...patch } : r)));
      toast.success(`Acessos de ${u.login} atualizados.`);
      await refreshAuthz();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao atualizar acessos.");
    } finally {
      setSaving(null);
    }
  }

  async function toggleRole(u: Usuario, role: string) {
    const next = u.roles.includes(role) ? u.roles.filter((r) => r !== role) : [...u.roles, role];
    setSaving(u.id);
    try {
      await saveRoles({ data: { userId: u.id, roles: next } });
      setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, roles: next } : r)));
      toast.success(`Nível de ${u.login} atualizado.`);
      await refreshAuthz();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao atualizar nível.");
    } finally {
      setSaving(null);
    }
  }

  async function submitPassword(u: Usuario) {
    try {
      await resetPwd({ data: { userId: u.id, password: pwd } });
      toast.success(`Senha de ${u.login} alterada.`);
      setPwdFor(null);
      setPwd("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao alterar senha.");
    }
  }

  const efetivosAgrupados = useMemo(() => {
    if (!efetivos) return [];
    const map = new Map<string, EffectiveRow[]>();
    for (const row of efetivos) {
      const key = `${row.sistema_key}|${row.modulo_key}`;
      map.set(key, [...(map.get(key) ?? []), row]);
    }
    return [...map.entries()].map(([key, list]) => {
      const [sistema, modulo] = key.split("|");
      return { sistema, modulo, list };
    });
  }, [efetivos]);

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
          <div className="text-sm font-semibold">Usuários & Níveis de Acesso</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setNovoOpen((v) => !v)} className="text-xs px-2.5 py-1.5 rounded-md ring-1 ring-brand text-brand inline-flex items-center gap-1.5">
            <UserPlus className="size-3.5" /> Novo usuário
          </button>
          <button onClick={load} className="text-xs px-2.5 py-1.5 rounded-md ring-1 ring-border inline-flex items-center gap-1.5">
            <RefreshCw className="size-3.5" /> Atualizar
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {erro && <div className="text-xs text-red-400 rounded-md ring-1 ring-red-500/30 p-3">{erro}</div>}

        {novoOpen && (
          <div className="rounded-xl ring-1 ring-brand/30 bg-surface/40 p-4 space-y-3">
            <div className="text-sm font-semibold">Novo usuário</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={novo.login} onChange={(e) => setNovo((s) => ({ ...s, login: e.target.value }))} placeholder="Login (ex.: joao)" className="bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand" />
              <input value={novo.nome} onChange={(e) => setNovo((s) => ({ ...s, nome: e.target.value }))} placeholder="Nome completo" className="bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand" />
              <input value={novo.cargo} onChange={(e) => setNovo((s) => ({ ...s, cargo: e.target.value }))} placeholder="Cargo" className="bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand" />
              <input type="password" value={novo.password} onChange={(e) => setNovo((s) => ({ ...s, password: e.target.value }))} placeholder="Senha (mín. 8)" className="bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand" />
            </div>
            <div>
              <div className="text-[11px] uppercase text-muted-foreground mb-1.5">Nível hierárquico</div>
              <div className="flex flex-wrap gap-1.5">
                {APP_ROLES.map((role) => {
                  const on = novo.roles.includes(role);
                  return (
                    <button key={role} onClick={() => setNovo((s) => ({ ...s, roles: toggleIn(s.roles, role) }))} className={`text-xs px-2.5 py-1 rounded-full ring-1 ${on ? "ring-brand text-brand bg-brand/10" : "ring-border text-muted-foreground"}`}>
                      {USER_LEVEL_LABEL[role]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-muted-foreground mb-1.5">Sistemas liberados</div>
              <div className="flex flex-wrap gap-1.5">
                {PX_SYSTEMS.map((s) => {
                  const on = novo.sistemas.includes(s.key);
                  return (
                    <button key={s.key} onClick={() => setNovo((st) => ({ ...st, sistemas: toggleIn(st.sistemas, s.key) }))} className={`text-xs px-2.5 py-1 rounded-full ring-1 ${on ? "ring-brand text-brand bg-brand/10" : "ring-border text-muted-foreground"}`}>
                      {s.nome}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={submitNovo} disabled={criando || novo.login.trim().length < 3 || novo.password.length < 8} className="text-xs px-3 py-2 rounded-md ring-1 ring-brand text-brand disabled:opacity-50">
              {criando ? "Criando…" : "Criar usuário"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum usuário encontrado.</div>
        ) : (
          rows.map((u) => {
            const activeTab = tabFor?.userId === u.id ? tabFor.tab : null;
            return (
              <div key={u.id} className="rounded-xl ring-1 ring-border bg-surface/40 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {u.login}
                      {u.roles.includes("master_admin") && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase px-1.5 py-0.5 rounded ring-1 ring-emerald-500/30 text-emerald-400">
                          <ShieldCheck className="size-3" /> Master admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.nome ?? "—"} · {u.email}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setPwdFor(pwdFor === u.id ? null : u.id); setPwd(""); }} className="text-xs px-2.5 py-1.5 rounded-md ring-1 ring-border inline-flex items-center gap-1.5">
                      <KeyRound className="size-3.5" /> Senha
                    </button>
                    <button onClick={() => { setEditFor(editFor === u.id ? null : u.id); setEdit({ nome: u.nome ?? "", cargo: u.cargo ?? "", situacao: u.situacao ?? "ativo" }); }} className="text-xs px-2.5 py-1.5 rounded-md ring-1 ring-border inline-flex items-center gap-1.5">
                      <Save className="size-3.5" /> Editar
                    </button>
                    <button onClick={() => excluir(u)} className="text-xs px-2.5 py-1.5 rounded-md ring-1 ring-red-500/30 text-red-400 inline-flex items-center gap-1.5">
                      <Trash2 className="size-3.5" /> Excluir
                    </button>
                  </div>
                </div>

                {editFor === u.id && (
                  <div className="grid gap-2 sm:grid-cols-3 pt-1">
                    <input value={edit.nome} onChange={(e) => setEdit((s) => ({ ...s, nome: e.target.value }))} placeholder="Nome" className="bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand" />
                    <input value={edit.cargo} onChange={(e) => setEdit((s) => ({ ...s, cargo: e.target.value }))} placeholder="Cargo" className="bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand" />
                    <div className="flex items-center gap-2">
                      <select value={edit.situacao} onChange={(e) => setEdit((s) => ({ ...s, situacao: e.target.value }))} className="flex-1 bg-background ring-1 ring-border rounded-md px-3 py-2 text-sm outline-none focus:ring-brand">
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                      <button onClick={() => submitEdit(u)} className="text-xs px-3 py-2 rounded-md ring-1 ring-brand text-brand">Salvar</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
                  {([
                    ["nivel", "Nível"],
                    ["perfis", "Perfis"],
                    ["sistemas", "Sistemas"],
                    ["efetivos", "Acessos efetivos"],
                  ] as const).map(([tab, label]) => (
                    <button
                      key={tab}
                      onClick={() => (activeTab === tab ? setTabFor(null) : void openTab(u, tab))}
                      className={`text-xs px-2.5 py-1 rounded-md ring-1 ${activeTab === tab ? "ring-brand text-brand bg-brand/10" : "ring-border text-muted-foreground"}`}
                    >
                      {tab === "efetivos" ? <span className="inline-flex items-center gap-1"><ListTree className="size-3" /> {label}</span> : label}
                    </button>
                  ))}
                </div>

                {activeTab === "nivel" && (
                  <div className="flex flex-wrap gap-1.5">
                    {APP_ROLES.map((role) => {
                      const on = u.roles.includes(role);
                      return (
                        <button key={role} disabled={saving === u.id} onClick={() => toggleRole(u, role)} className={`text-xs px-2.5 py-1 rounded-full ring-1 disabled:opacity-50 ${on ? "ring-brand text-brand bg-brand/10" : "ring-border text-muted-foreground hover:bg-surface/60"}`}>
                          {USER_LEVEL_LABEL[role]}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeTab === "perfis" && (
                  vinculos ? (
                    <div className="flex flex-wrap gap-1.5">
                      {perfisDisponiveis.length === 0 && <div className="text-xs text-muted-foreground">Nenhum perfil cadastrado.</div>}
                      {perfisDisponiveis.map((p) => {
                        const on = vinculos.perfis.includes(p.id);
                        return (
                          <button key={p.id} disabled={saving === u.id} onClick={() => persistVinculos(u, { perfis: toggleIn(vinculos.perfis, p.id) })} className={`text-xs px-2.5 py-1 rounded-full ring-1 disabled:opacity-50 ${on ? "ring-brand text-brand bg-brand/10" : "ring-border text-muted-foreground"}`}>
                            {p.nome}
                          </button>
                        );
                      })}
                    </div>
                  ) : <div className="text-xs text-muted-foreground">Carregando vínculos…</div>
                )}

                {activeTab === "sistemas" && (
                  vinculos ? (
                    <div className="flex flex-wrap gap-1.5">
                      {PX_SYSTEMS.map((s) => {
                        const on = vinculos.sistemas.includes(s.key);
                        return (
                          <button key={s.key} disabled={saving === u.id} onClick={() => persistVinculos(u, { sistemas: toggleIn(vinculos.sistemas, s.key) })} className={`text-xs px-2.5 py-1 rounded-full ring-1 disabled:opacity-50 ${on ? "ring-brand text-brand bg-brand/10" : "ring-border text-muted-foreground"}`}>
                            {s.nome}
                          </button>
                        );
                      })}
                    </div>
                  ) : <div className="text-xs text-muted-foreground">Carregando vínculos…</div>
                )}

                {activeTab === "efetivos" && (
                  efetivos ? (
                    efetivos.length === 0 ? (
                      <div className="text-xs text-muted-foreground">Nenhum acesso efetivo. Vincule um perfil ou sistema.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="text-muted-foreground">
                            <tr>
                              <th className="text-left py-1.5 px-2">Sistema</th>
                              <th className="text-left py-1.5 px-2">Módulo</th>
                              <th className="text-left py-1.5 px-2">Recurso</th>
                              <th className="text-left py-1.5 px-2">Ação</th>
                              <th className="text-left py-1.5 px-2">Origem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {efetivosAgrupados.flatMap((grupo) =>
                              grupo.list.map((row, i) => (
                                <tr key={`${grupo.sistema}-${grupo.modulo}-${row.recurso}-${row.acao}-${i}`} className="border-t border-border">
                                  <td className="py-1.5 px-2">{systemLabel(row.sistema_key)}</td>
                                  <td className="py-1.5 px-2">{row.modulo_key === "*" ? "Todos" : row.modulo_key}</td>
                                  <td className="py-1.5 px-2">{row.recurso === "*" ? "Todos" : row.recurso}</td>
                                  <td className="py-1.5 px-2">{row.acao === "*" ? "Todas" : (ACTION_LABEL[row.acao as Action] ?? row.acao)}</td>
                                  <td className="py-1.5 px-2 text-muted-foreground">{row.origem}</td>
                                </tr>
                              )),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : <div className="text-xs text-muted-foreground">Calculando acessos efetivos…</div>
                )}

                {pwdFor === u.id && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1 max-w-xs">
                      <input type={showPwd ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Nova senha (mín. 8)" className="w-full bg-background ring-1 ring-border rounded-md pl-3 pr-9 py-2 text-sm outline-none focus:ring-brand" />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}>
                        {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <button onClick={() => submitPassword(u)} disabled={pwd.length < 8} className="text-xs px-3 py-2 rounded-md ring-1 ring-border disabled:opacity-50">Salvar senha</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
