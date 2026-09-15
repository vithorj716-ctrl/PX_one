-- PXOne — fonte única de ACESSO EFETIVO para o frontend.
-- Idempotente. Não altera dados de produção.
-- Regra: o usuário é sempre auth.uid(); nunca aceita _user_id do cliente.

create or replace function public.get_my_effective_access()
returns jsonb
language sql
stable
security definer
set search_path = public
as $function$
  with me as (select auth.uid() as uid)
  select jsonb_build_object(
    'user_id', (select uid from me),
    'authenticated', (select uid from me) is not null,
    'active', coalesce(
      (select m.situacao is null or m.situacao = 'ativo'
         from public.px_usuarios_meta m where m.user_id = (select uid from me)),
      true),
    'roles', coalesce((
      select jsonb_agg(distinct r.role::text)
      from public.user_roles r where r.user_id = (select uid from me)), '[]'::jsonb),
    'is_master_admin', public.px_is_master((select uid from me)),
    'is_admin', public.px_is_admin((select uid from me)),
    'is_executive', public.is_executive((select uid from me)),
    'systems', coalesce((
      select jsonb_agg(jsonb_build_object('sistema_key', s.sistema_key, 'origem', s.origem))
      from public.px_effective_systems((select uid from me)) s), '[]'::jsonb),
    'profiles', coalesce((
      select jsonb_agg(jsonb_build_object('id', pf.id, 'nome', pf.nome))
      from public.px_usuario_perfis up
      join public.px_perfis pf on pf.id = up.perfil_id
      where up.user_id = (select uid from me)), '[]'::jsonb),
    'permissions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'sistema_key', a.sistema_key, 'modulo_key', a.modulo_key,
        'recurso', a.recurso, 'acao', a.acao, 'origem', a.origem))
      from public.px_effective_access((select uid from me)) a), '[]'::jsonb),
    'empresas', coalesce((
      select jsonb_agg(e.empresa_id)
      from public.px_usuario_empresas e where e.user_id = (select uid from me)), '[]'::jsonb)
  )
  where (select uid from me) is not null;
$function$;

revoke all on function public.get_my_effective_access() from public;
revoke all on function public.get_my_effective_access() from anon;
grant execute on function public.get_my_effective_access() to authenticated, service_role;

-- PostgREST precisa recarregar o cache de schema para expor a função.
notify pgrst, 'reload schema';
