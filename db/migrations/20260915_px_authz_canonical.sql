-- PXOne — Arquitetura canônica de autorização.
-- Idempotente. Não derruba tabelas nem apaga dados existentes.
-- Cadeia: usuário -> tipo (user_roles) -> perfis -> sistemas -> módulos -> ações -> empresa -> RLS.

-- ============================================================ 1. CATÁLOGO DE MÓDULOS
create table if not exists public.px_modulos (
  id uuid primary key default gen_random_uuid(),
  sistema_key text not null,
  modulo_key text not null,
  nome text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists px_modulos_uk on public.px_modulos (sistema_key, modulo_key);
grant select on public.px_modulos to authenticated;
grant all on public.px_modulos to service_role;
alter table public.px_modulos enable row level security;

-- ============================================================ 2. PERFIS
alter table public.px_perfil_permissoes add column if not exists modulo_key text not null default '*';
alter table public.px_perfil_permissoes add column if not exists recurso text not null default '*';
create unique index if not exists px_perfil_permissoes_uk
  on public.px_perfil_permissoes (perfil_id, sistema_key, modulo_key, recurso, acao);

create table if not exists public.px_perfil_sistemas (
  perfil_id uuid not null references public.px_perfis(id) on delete cascade,
  sistema_key text not null,
  created_at timestamptz not null default now(),
  primary key (perfil_id, sistema_key)
);
grant select on public.px_perfil_sistemas to authenticated;
grant all on public.px_perfil_sistemas to service_role;
alter table public.px_perfil_sistemas enable row level security;

-- ============================================================ 3. CONCESSÕES DIRETAS
create table if not exists public.px_usuario_permissoes (
  user_id uuid not null references auth.users(id) on delete cascade,
  sistema_key text not null,
  modulo_key text not null default '*',
  recurso text not null default '*',
  acao text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, sistema_key, modulo_key, recurso, acao)
);
grant select on public.px_usuario_permissoes to authenticated;
grant all on public.px_usuario_permissoes to service_role;
alter table public.px_usuario_permissoes enable row level security;

create table if not exists public.px_usuario_empresas (
  user_id uuid not null references auth.users(id) on delete cascade,
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, empresa_id)
);
grant select on public.px_usuario_empresas to authenticated;
grant all on public.px_usuario_empresas to service_role;
alter table public.px_usuario_empresas enable row level security;

create unique index if not exists px_usuario_sistemas_uk on public.px_usuario_sistemas (user_id, sistema_key);
create index if not exists px_usuario_perfis_perfil_idx on public.px_usuario_perfis (perfil_id);
alter table public.px_usuario_perfis enable row level security;
delete from public.px_usuario_perfis p where not exists (select 1 from public.px_perfis x where x.id = p.perfil_id);
delete from public.px_perfil_permissoes p where not exists (select 1 from public.px_perfis x where x.id = p.perfil_id);

-- ============================================================ 4. FUNÇÕES CANÔNICAS
create or replace function public.px_is_master(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles r where r.user_id = _user_id and r.role = 'master_admin');
$$;

create or replace function public.px_can(
  _sistema text, _modulo text, _recurso text, _acao text, _user_id uuid default auth.uid()
) returns boolean language sql stable security definer set search_path = public as $$
  select _user_id is not null and (
    public.px_is_master(_user_id)
    or exists (
      select 1 from public.px_usuario_permissoes p
      where p.user_id = _user_id
        and p.sistema_key in (_sistema, '*') and p.modulo_key in (_modulo, '*')
        and p.recurso in (_recurso, '*') and p.acao in (_acao, '*')
    )
    or exists (
      select 1 from public.px_usuario_perfis up
      join public.px_perfil_permissoes pp on pp.perfil_id = up.perfil_id
      where up.user_id = _user_id
        and pp.sistema_key in (_sistema, '*') and pp.modulo_key in (_modulo, '*')
        and pp.recurso in (_recurso, '*') and pp.acao in (_acao, '*')
    )
  );
$$;

create or replace function public.px_has_system(_sistema text, _user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select _user_id is not null and (
    public.px_is_master(_user_id)
    or exists (select 1 from public.px_usuario_sistemas s
               where s.user_id = _user_id and s.ativo and s.sistema_key = _sistema)
    or exists (select 1 from public.px_usuario_perfis up
               join public.px_perfil_sistemas ps on ps.perfil_id = up.perfil_id
               where up.user_id = _user_id and ps.sistema_key in (_sistema, '*'))
  );
$$;

create or replace function public.px_has_module(_sistema text, _modulo text, _user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select public.px_has_system(_sistema, _user_id) and (
    public.px_is_master(_user_id)
    or exists (select 1 from public.px_usuario_permissoes p
               where p.user_id = _user_id and p.sistema_key in (_sistema,'*') and p.modulo_key in (_modulo,'*'))
    or exists (select 1 from public.px_usuario_perfis up
               join public.px_perfil_permissoes pp on pp.perfil_id = up.perfil_id
               where up.user_id = _user_id and pp.sistema_key in (_sistema,'*') and pp.modulo_key in (_modulo,'*'))
  );
$$;

create or replace function public.px_is_admin(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select public.px_is_master(_user_id)
      or public.px_can('platform','usuarios','usuarios','update', _user_id);
$$;

create or replace function public.px_has_empresa(_empresa_id uuid, _user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select _empresa_id is null or public.px_is_master(_user_id)
    or exists (select 1 from public.px_usuario_empresas ue
               where ue.user_id = _user_id and ue.empresa_id = _empresa_id)
    or exists (select 1 from public.px_usuarios_meta m
               where m.user_id = _user_id and m.empresa_id = _empresa_id);
$$;

-- Compat: is_executive continua existindo, agora derivada da fonte única.
create or replace function public.is_executive(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.px_is_admin(_user_id);
$$;

create or replace function public.px_effective_access(_user_id uuid default auth.uid())
returns table (sistema_key text, modulo_key text, recurso text, acao text, origem text)
language sql stable security definer set search_path = public as $$
  select '*','*','*','*','Tipo de usuário MASTER_ADMIN'
  where public.px_is_master(_user_id)
  union all
  select p.sistema_key, p.modulo_key, p.recurso, p.acao, 'Concessão direta ao usuário'
  from public.px_usuario_permissoes p where p.user_id = _user_id
  union all
  select pp.sistema_key, pp.modulo_key, pp.recurso, pp.acao, 'Perfil ' || pf.nome
  from public.px_usuario_perfis up
  join public.px_perfil_permissoes pp on pp.perfil_id = up.perfil_id
  join public.px_perfis pf on pf.id = up.perfil_id
  where up.user_id = _user_id;
$$;

create or replace function public.px_effective_systems(_user_id uuid default auth.uid())
returns table (sistema_key text, origem text)
language sql stable security definer set search_path = public as $$
  select '*','Tipo de usuário MASTER_ADMIN' where public.px_is_master(_user_id)
  union all
  select s.sistema_key, 'Acesso direto ao sistema' from public.px_usuario_sistemas s
  where s.user_id = _user_id and s.ativo
  union all
  select ps.sistema_key, 'Perfil ' || pf.nome
  from public.px_usuario_perfis up
  join public.px_perfil_sistemas ps on ps.perfil_id = up.perfil_id
  join public.px_perfis pf on pf.id = up.perfil_id
  where up.user_id = _user_id;
$$;

grant execute on function public.px_is_master(uuid) to authenticated, service_role;
grant execute on function public.px_is_admin(uuid) to authenticated, service_role;
grant execute on function public.px_has_system(text,uuid) to authenticated, service_role;
grant execute on function public.px_has_module(text,text,uuid) to authenticated, service_role;
grant execute on function public.px_can(text,text,text,text,uuid) to authenticated, service_role;
grant execute on function public.px_has_empresa(uuid,uuid) to authenticated, service_role;
grant execute on function public.px_effective_access(uuid) to authenticated, service_role;
grant execute on function public.px_effective_systems(uuid) to authenticated, service_role;
grant execute on function public.is_executive(uuid) to authenticated, service_role;

-- ============================================================ 5. MÓDULOS
insert into public.px_modulos (sistema_key, modulo_key, nome, ordem) values
  ('platform','usuarios','Usuários',10),
  ('platform','perfis','Perfis & Permissões',20),
  ('platform','api','PX API',30),
  ('platform','auditoria','Auditoria',40),
  ('platform','empresas','Empresas',50),
  ('pxone-erp','dashboard','Dashboard',10),
  ('pxone-erp','financeiro','Financeiro',20),
  ('pxone-erp','custos','Custos & Markup',30),
  ('pxone-erp','indicadores','Indicadores & KPIs',40),
  ('pxone-erp','estrategia','Estratégia & Governança',50),
  ('pxone-erp','cadastros','Cadastros',60),
  ('pxlog-tms','solicitacoes','Solicitações',10),
  ('pxlog-tms','minutas','Minutas',20),
  ('pxlog-tms','viagens','Viagens',30),
  ('pxlog-tms','last-mile','Last Mile',40),
  ('pxlog-tms','clientes','Clientes',50),
  ('pxlog-tms','fretes','Tabela de Frete',60),
  ('pxlog-tms','financeiro','Financeiro TMS',70)
on conflict (sistema_key, modulo_key) do update set nome = excluded.nome, ordem = excluded.ordem;

-- ============================================================ 6. PERFIS PADRÃO
insert into public.px_perfis (nome, descricao, is_system)
select 'Administração Global','Acesso administrativo e operacional completo.',true
where not exists (select 1 from public.px_perfis where nome = 'Administração Global');
insert into public.px_perfis (nome, descricao, is_system)
select 'Gestor Operacional','ERP e TMS: consultar, criar, editar e exportar.',true
where not exists (select 1 from public.px_perfis where nome = 'Gestor Operacional');
insert into public.px_perfis (nome, descricao, is_system)
select 'Consulta','Somente leitura em ERP e TMS.',true
where not exists (select 1 from public.px_perfis where nome = 'Consulta');

do $$
declare v_global uuid; v_gestor uuid; v_consulta uuid; a text;
begin
  select id into v_global from public.px_perfis where nome = 'Administração Global';
  select id into v_gestor from public.px_perfis where nome = 'Gestor Operacional';
  select id into v_consulta from public.px_perfis where nome = 'Consulta';

  insert into public.px_perfil_sistemas (perfil_id, sistema_key) values (v_global,'*') on conflict do nothing;
  insert into public.px_perfil_sistemas (perfil_id, sistema_key)
    select v_gestor, k from (values ('pxone-erp'),('pxlog-tms')) t(k) on conflict do nothing;
  insert into public.px_perfil_sistemas (perfil_id, sistema_key)
    select v_consulta, k from (values ('pxone-erp'),('pxlog-tms')) t(k) on conflict do nothing;

  insert into public.px_perfil_permissoes (perfil_id, sistema_key, modulo_key, recurso, acao)
    values (v_global,'*','*','*','*') on conflict do nothing;

  foreach a in array array['read','create','update','export'] loop
    insert into public.px_perfil_permissoes (perfil_id, sistema_key, modulo_key, recurso, acao)
      select v_gestor, k, '*','*', a from (values ('pxone-erp'),('pxlog-tms')) t(k) on conflict do nothing;
  end loop;

  insert into public.px_perfil_permissoes (perfil_id, sistema_key, modulo_key, recurso, acao)
    select v_consulta, k, '*','*','read' from (values ('pxone-erp'),('pxlog-tms')) t(k) on conflict do nothing;
end $$;

-- ============================================================ 7. MIGRAÇÃO DOS DADOS EXISTENTES
insert into public.px_usuario_permissoes (user_id, sistema_key, modulo_key, recurso, acao)
select s.user_id, s.sistema_key, '*', '*', a
from public.px_usuario_sistemas s
cross join unnest(array['read','create','update','delete','export','approve']) a
where s.ativo and not public.px_is_master(s.user_id)
on conflict do nothing;

insert into public.px_usuario_permissoes (user_id, sistema_key, modulo_key, recurso, acao)
select r.user_id, 'platform', '*', '*', a
from public.user_roles r
cross join unnest(array['read','create','update','delete']) a
where r.role in ('socio','diretor')
on conflict do nothing;

insert into public.px_usuario_empresas (user_id, empresa_id)
select m.user_id, m.empresa_id from public.px_usuarios_meta m where m.empresa_id is not null
on conflict do nothing;
insert into public.px_usuario_empresas (user_id, empresa_id)
select u.id, e.id from auth.users u cross join public.empresas e
where (select count(*) from public.empresas) = 1
on conflict do nothing;

-- ============================================================ 8. RLS
create or replace function public.px_apply_domain_rls(
  _table text, _sistema text, _modulo text, _empresa_col text default null
) returns void language plpgsql security definer set search_path = public as $$
declare pol record; emp text := '';
begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename=_table loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, _table);
  end loop;
  if _empresa_col is not null then
    emp := format(' and public.px_has_empresa(%I)', _empresa_col);
  end if;
  execute format($f$create policy %I on public.%I for select to authenticated
    using (public.px_can(%L,%L,%L,'read')%s)$f$, _table||'_sel', _table, _sistema,_modulo,_table, emp);
  execute format($f$create policy %I on public.%I for insert to authenticated
    with check (public.px_can(%L,%L,%L,'create')%s)$f$, _table||'_ins', _table, _sistema,_modulo,_table, emp);
  execute format($f$create policy %I on public.%I for update to authenticated
    using (public.px_can(%L,%L,%L,'update')%s) with check (public.px_can(%L,%L,%L,'update')%s)$f$,
    _table||'_upd', _table, _sistema,_modulo,_table, emp, _sistema,_modulo,_table, emp);
  execute format($f$create policy %I on public.%I for delete to authenticated
    using (public.px_can(%L,%L,%L,'delete')%s)$f$, _table||'_del', _table, _sistema,_modulo,_table, emp);
end $$;

create or replace function public.px_apply_admin_rls(_table text, _self_col text default null)
returns void language plpgsql security definer set search_path = public as $$
declare pol record; sel text;
begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename=_table loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, _table);
  end loop;
  if _self_col is null then sel := 'public.px_is_admin()';
  else sel := format('(public.px_is_admin() or %I = auth.uid())', _self_col);
  end if;
  execute format('create policy %I on public.%I for select to authenticated using (%s)', _table||'_sel', _table, sel);
  execute format('create policy %I on public.%I for insert to authenticated with check (public.px_is_admin())', _table||'_ins', _table);
  execute format('create policy %I on public.%I for update to authenticated using (public.px_is_admin()) with check (public.px_is_admin())', _table||'_upd', _table);
  execute format('create policy %I on public.%I for delete to authenticated using (public.px_is_admin())', _table||'_del', _table);
end $$;

do $$
declare t record;
begin
  perform public.px_apply_domain_rls('custos','pxone-erp','custos','empresa_id');
  perform public.px_apply_domain_rls('categorias_custo','pxone-erp','custos');
  perform public.px_apply_domain_rls('markup_calculations','pxone-erp','custos','empresa_id');
  perform public.px_apply_domain_rls('financial_scenarios','pxone-erp','financeiro','empresa_id');
  perform public.px_apply_domain_rls('px_cliente_credito','pxone-erp','financeiro');
  perform public.px_apply_domain_rls('px_cliente_lancamentos','pxone-erp','financeiro');
  perform public.px_apply_domain_rls('kpis','pxone-erp','indicadores','empresa_id');
  perform public.px_apply_domain_rls('kpi_snapshots','pxone-erp','indicadores','empresa_id');
  perform public.px_apply_domain_rls('okrs','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('key_results','pxone-erp','estrategia');
  perform public.px_apply_domain_rls('business_plans','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('decisions','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('growth_initiatives','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('investor_updates','pxone-erp','estrategia');
  perform public.px_apply_domain_rls('payback_projects','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('risks','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('valuation_models','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('timeline_events','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('documents','pxone-erp','estrategia','empresa_id');
  perform public.px_apply_domain_rls('px_registry_clientes','pxone-erp','cadastros');
  perform public.px_apply_domain_rls('px_registry_contatos','pxone-erp','cadastros');
  perform public.px_apply_domain_rls('px_registry_enderecos','pxone-erp','cadastros');
  perform public.px_apply_domain_rls('px_registry_vinculos','pxone-erp','cadastros');
  perform public.px_apply_domain_rls('px_filiais','pxone-erp','cadastros','empresa_id');

  perform public.px_apply_domain_rls('tms_minutas','pxlog-tms','minutas','empresa_id');
  perform public.px_apply_domain_rls('tms_volumes','pxlog-tms','minutas');
  perform public.px_apply_domain_rls('tms_eventos','pxlog-tms','minutas');
  perform public.px_apply_domain_rls('tms_cancelamentos','pxlog-tms','minutas');
  perform public.px_apply_domain_rls('tms_viagens','pxlog-tms','viagens');
  perform public.px_apply_domain_rls('tms_viagem_minutas','pxlog-tms','viagens');
  perform public.px_apply_domain_rls('tms_viagem_eventos','pxlog-tms','viagens');
  perform public.px_apply_domain_rls('tms_clientes','pxlog-tms','clientes');
  perform public.px_apply_domain_rls('tms_tabela_frete','pxlog-tms','fretes');
  for t in select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
           where n.nspname='public' and c.relkind='r' and relname like 'tms_lm_%' loop
    if t.relname = 'tms_lm_rotas' then
      perform public.px_apply_domain_rls(t.relname,'pxlog-tms','last-mile','empresa_id');
    else
      perform public.px_apply_domain_rls(t.relname,'pxlog-tms','last-mile');
    end if;
  end loop;

  perform public.px_apply_admin_rls('user_roles','user_id');
  perform public.px_apply_admin_rls('px_usuarios_meta','user_id');
  perform public.px_apply_admin_rls('px_usuario_sistemas','user_id');
  perform public.px_apply_admin_rls('px_usuario_perfis','user_id');
  perform public.px_apply_admin_rls('px_usuario_permissoes','user_id');
  perform public.px_apply_admin_rls('px_usuario_empresas','user_id');
  perform public.px_apply_admin_rls('px_api_clients');
  perform public.px_apply_admin_rls('px_api_tokens');
  perform public.px_apply_admin_rls('px_api_logs','user_id');
  perform public.px_apply_admin_rls('px_api_idempotency');
  perform public.px_apply_admin_rls('px_integration_inbox');
  perform public.px_apply_admin_rls('px_integration_links');
  perform public.px_apply_admin_rls('px_events');
  perform public.px_apply_admin_rls('px_ai_usage');
  perform public.px_apply_admin_rls('px_empresa_modulos');
end $$;

do $$
declare pol record;
begin
  for pol in select tablename, policyname from pg_policies where schemaname='public'
             and tablename in ('px_perfis','px_perfil_permissoes','px_perfil_sistemas','px_modulos','empresas','px_audit_log') loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

create policy px_modulos_sel on public.px_modulos for select to authenticated using (auth.uid() is not null);
create policy px_modulos_wr on public.px_modulos for all to authenticated
  using (public.px_is_admin()) with check (public.px_is_admin());

create policy px_perfis_sel on public.px_perfis for select to authenticated using (
  public.px_is_admin() or exists (
    select 1 from public.px_usuario_perfis up where up.perfil_id = px_perfis.id and up.user_id = auth.uid()));
create policy px_perfis_wr on public.px_perfis for all to authenticated
  using (public.px_is_admin()) with check (public.px_is_admin());

create policy px_perfil_sistemas_sel on public.px_perfil_sistemas for select to authenticated using (
  public.px_is_admin() or exists (
    select 1 from public.px_usuario_perfis up where up.perfil_id = px_perfil_sistemas.perfil_id and up.user_id = auth.uid()));
create policy px_perfil_sistemas_wr on public.px_perfil_sistemas for all to authenticated
  using (public.px_is_admin()) with check (public.px_is_admin());

create policy px_perfil_permissoes_sel on public.px_perfil_permissoes for select to authenticated using (
  public.px_is_admin() or exists (
    select 1 from public.px_usuario_perfis up where up.perfil_id = px_perfil_permissoes.perfil_id and up.user_id = auth.uid()));
create policy px_perfil_permissoes_wr on public.px_perfil_permissoes for all to authenticated
  using (public.px_is_admin()) with check (public.px_is_admin());

create policy empresas_sel on public.empresas for select to authenticated using (public.px_has_empresa(id));
create policy empresas_wr on public.empresas for all to authenticated
  using (public.px_is_admin()) with check (public.px_is_admin());

create policy px_audit_log_sel on public.px_audit_log for select to authenticated using (public.px_is_admin());
create policy px_audit_log_ins on public.px_audit_log for insert to authenticated
  with check (user_id is null or user_id = auth.uid());

-- ============================================================ 9. ÍNDICES
create index if not exists px_usuario_permissoes_user_idx on public.px_usuario_permissoes (user_id, sistema_key);
create index if not exists px_perfil_permissoes_perfil_idx on public.px_perfil_permissoes (perfil_id, sistema_key);
create index if not exists px_usuario_empresas_user_idx on public.px_usuario_empresas (user_id);
