# Autorização do PXOne

Documento canônico. Se algo neste projeto verifica acesso e não está descrito aqui, está errado.

## Conceitos

| Conceito | Onde vive | Responsabilidade |
| --- | --- | --- |
| **Usuário** | `auth.users` | Identidade única (login/senha Supabase). |
| **Tipo / nível** | `user_roles` (`app_role`) | Posição hierárquica e comportamento administrativo. **Não é permissão.** |
| **Perfil** | `px_perfis` + `px_usuario_perfis` | Conjunto reutilizável de sistemas, módulos e ações. |
| **Sistema** | `px_perfil_sistemas`, `px_usuario_sistemas` | Onde o usuário pode entrar (`pxone-erp`, `pxlog-tms`, `pxmed`, `pxfarma`, `platform`). |
| **Módulo** | `px_modulos` (catálogo) | Área dentro do sistema (`financeiro`, `viagens`, ...). |
| **Permissão** | `px_perfil_permissoes`, `px_usuario_permissoes` | `sistema / modulo / recurso / acao`. `*` é coringa em qualquer nível. |
| **Empresa** | `px_usuario_empresas` | Isolamento multiempresa (validado no banco, não no navegador). |

Cadeia: `usuário → tipo → perfil → sistema → módulo → ação → empresa → RLS`.

**Permissão efetiva = união** das concessões diretas ao usuário e de todos os perfis dele.
Não existe deny implícito: se algum perfil concede, o acesso existe.

## MASTER_ADMIN e ADMIN

- `MASTER_ADMIN` é o nível global. Resolvido **no banco** por `px_is_master()`. Acessa todos os
  sistemas, módulos e ações sem precisar de nenhum checkbox marcado.
- `ADMIN` (e os demais níveis) **não** têm poder implícito: recebem exatamente o que perfil e
  concessões diretas definem. Quem administra a plataforma é quem tem
  `platform / usuarios / usuarios / update` — verificado por `px_is_admin()`.
- Nunca compare strings de role em componentes. Use `px_is_admin()` / `useAuthz().isAdmin`.

## Camadas

1. **Banco (segurança real)** — funções `SECURITY DEFINER`:
   `px_is_master`, `px_is_admin`, `px_has_system`, `px_has_module`, `px_can`, `px_has_empresa`,
   `px_effective_access`, `px_effective_systems`. Todas as policies RLS chamam essas funções.
2. **Server functions (segurança real)** — `src/authz/authz.server.ts`:
   `assertCan`, `assertSystem`, `assertAdmin`, `assertEmpresa`. Toda operação crítica chama uma delas
   depois de `requireSupabaseAuth`.
3. **Frontend (experiência)** — `src/authz/authz-context.tsx` (`useAuthz`) alimentado por
   `getMyAccess()`. Serve para esconder botões e menus. Nunca é a proteção.
4. **Rotas** — gate único em `src/routes/_authenticated/route.tsx` usando o mapa
   `src/authz/route-map.ts`. Acesso direto por URL é validado ali; sem acesso vai para
   `/acesso-negado`.

## Como proteger uma rota nova

Adicione o caminho ao mapa em `src/authz/route-map.ts` (`ERP_MODULE`, `TMS_MODULE`, `PLATFORM_MODULE`).
Nada mais é necessário: o gate já cobre o restante.

## Como proteger uma server function nova

```ts
export const excluirAlgo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertCan(context.supabase, "pxlog-tms", "viagens", "tms_viagens", "delete");
    // ...
  });
```

Para operações administrativas use `assertAdmin(context.supabase)`.
Quando a operação grava `empresa_id` vindo do cliente, chame `assertEmpresa(context.supabase, empresaId)`.

## Como criar uma permissão nova

1. Se for um módulo novo, insira em `px_modulos` e adicione a chave em `src/authz/catalog.ts`.
2. Conceda pelo perfil (`px_perfil_permissoes`) na tela de Perfis, ou diretamente ao usuário
   (`px_usuario_permissoes`) na tela de Usuários.
3. Use a permissão via `assertCan(...)` no servidor e `useAuthz().can(...)` na interface.

## Cache e sessão

`getMyAccess()` é cacheado por 60s na chave `["px","authz","me"]`. Depois de alterar perfis,
permissões, sistemas ou empresa, chame `useAuthz().refresh()` (as telas administrativas já fazem).
Logout limpa o cache de queries; troca de usuário nunca herda acesso porque a chave é recarregada
a partir do token novo.

## Regras que não podem voltar

- `USING (true)` / `WITH CHECK (true)` em tabela de domínio.
- `role === "admin"` em componente.
- `service_role` no navegador.
- `as any` para calar o TypeScript em autorização.
- Confiar no `localStorage` (empresa ativa) como autorização.
