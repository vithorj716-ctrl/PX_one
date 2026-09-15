# Autorização do PXOne

Documento canônico. Existe **uma única** definição de acesso efetivo; frontend, rotas,
server functions e RLS usam a mesma.

## Cadeia de decisão

```
usuário (auth.users)
  → nível/role (user_roles: master_admin, admin, socio, diretor, gestor, consultor, auditor)
  → perfis (px_usuario_perfis → px_perfis)
      → sistemas do perfil (px_perfil_sistemas)
      → permissões do perfil (px_perfil_permissoes)
  → concessões diretas (px_usuario_sistemas, px_usuario_permissoes)
  → empresas (px_usuario_empresas)
  → RLS por sistema/módulo/empresa
```

União, sem deny implícito: qualquer origem que conceda, concede.

## Fonte única: `public.get_my_effective_access()`

`SECURITY DEFINER`, `SET search_path = public`, **sem parâmetros** — usa `auth.uid()`.
`EXECUTE` apenas para `authenticated` e `service_role` (anon revogado).

Retorna JSON: `user_id`, `authenticated`, `active`, `roles`, `is_master_admin`,
`is_admin`, `is_executive`, `systems[{sistema_key,origem}]`, `profiles[{id,nome}]`,
`permissions[{sistema_key,modulo_key,recurso,acao,origem}]`, `empresas[]`.

Compõe as funções de base: `px_is_master`, `px_is_admin`, `is_executive`,
`px_effective_systems`, `px_effective_access`.

Migração: `db/migrations/20260915_px_get_my_effective_access.sql`.

## MASTER_ADMIN

`user_roles.role = 'master_admin'` → `is_master_admin = true` e o banco devolve o
curinga `*` em `systems`/`permissions`. O frontend expande `*` para **todos os sistemas
com `status = "ativo"`** em `src/px-platform/systems.ts`. MASTER_ADMIN **não depende**
de linhas em `px_usuario_sistemas`. Nenhum usuário é promovido automaticamente.

`is_executive()` (master_admin, socio, diretor) continua existindo, mas **não** substitui
permissões: executivo ≠ acesso global.

## Acesso a sistema ≠ permissão

- `hasSystemAccess(system)` — pode entrar no sistema.
- `hasModuleAccess(system, module)` — pode ver o módulo.
- `can(system, module, resource, action)` — pode executar a ação
  (`read|create|update|delete|export|approve`).

## Camadas no código

| Camada | Arquivo | Papel |
| --- | --- | --- |
| Cálculo puro | `src/authz/access.ts` | `hasSystemAccess`, `hasModuleAccess`, `can`, `hasEmpresaAccess`, `grantOrigin` |
| Catálogo | `src/authz/catalog.ts` | sistemas, módulos, ações, níveis |
| Browser | `src/authz/access-client.ts` | `fetchMyEffectiveAccess()`, `AccessLoadError`, `clearAuthorization()` |
| Provider | `src/authz/authz-context.tsx` | `AuthzProvider`, `useAuthz()`, `useEffectiveAccessQuery()` |
| Rotas | `src/authz/route-map.ts` + `src/routes/_authenticated/route.tsx` | gate único rota → (sistema, módulo) |
| Servidor | `src/authz/authz.server.ts` | `loadEffectiveAccess`, `assertCan/assertSystem/assertAdmin/assertEmpresa` |
| Admin | `src/authz/admin.functions.ts` | perfis, permissões e vínculos (sempre com `assertAdmin`) |

`SystemProvider` (`src/px-platform/system-context.tsx`) **não** decide autorização:
consome a mesma query (`["px","authz","me"]`) e só expõe sistema ativo e navegação.
`sessionStorage` guarda apenas preferência de navegação.

## Erro ≠ sem acesso

Estados distintos: `loading`, `authorized`, `unauthorized`, `error`.
Falha de RPC lança `AccessLoadError`, registra `[PX AUTH] Falha ao carregar autorização`
(código, mensagem, details, hint, etapa, user id — nunca token/senha) e a UI mostra
**"Não foi possível carregar seus acessos."** com "Tentar novamente".
Nunca `data ?? []` quando houver `error`.

## Launcher

`loading` → carregando; `error` → mensagem de erro + retry; zero sistemas sem falha →
"Você ainda não possui acesso a nenhum sistema."; um sistema → entra automaticamente;
vários → seleção. MASTER_ADMIN sempre vê os sistemas ativos.

## Route guards

`requirementForPath()` mapeia rota → sistema/módulo: `/tms/*` → `pxlog-tms`,
`/admin/*` → `platform` (módulo por subrota), `/pxmed`, `/pxfarma`, resto → `pxone-erp`.
Sem acesso → `/acesso-negado`. Falha de carregamento → `/launcher` (erro + retry).

## Server functions

Toda operação sensível chama `assertCan/assertSystem/assertAdmin/assertEmpresa`, que
consultam as funções do banco. `service_role` só no servidor, nunca no browser.

## RLS

Políticas geradas por `px_apply_domain_rls` (sistema + módulo + empresa) e
`px_apply_admin_rls` (dono + admin). Nenhuma política `USING (true)` de autorização.

## Cache, refresh e logout

Query `["px","authz","me"]`, `staleTime` 60s. Alterações administrativas → `refresh()`
(`AuthzProvider`/`SystemProvider`). Logout: `cancelQueries()` + `clear()` +
`signOut()` + limpa sistema ativo, para que outro usuário nunca herde acesso.
