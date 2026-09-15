## Animation and navigation stabilization
- [x] Audit route, shell, Motion, GSAP, CSS, overlays, loading, and production behavior
- [x] Establish one content-only route transition with stable shell/header/sidebar
- [x] Fix logo and navigation sequencing without animation conflicts
- [x] Normalize overlays, loading states, tables, metrics, and reduced motion
- [x] Validate rapid authenticated navigation, mobile, desktop, console, and production build

## Surgical animation correction
- [x] Stabilize ERP and TMS sidebar/navigation component identities
- [x] Make the logo animation single-run, static after entry, and fully visible
- [x] Simplify content-only page transitions and remove ghosting sources
- [x] Reduce Canvas and continuous CSS animation costs
- [x] Stop per-row table animation and simplify overlays
- [x] Validate login and repeated TMS navigation across required viewport sizes

## Definitive motion stabilization
- [x] Complete animation ownership audit across authenticated routes and shared UI
- [x] Centralize logo contrast treatment and single-run logo motion
- [x] Stabilize route content transitions, shells, headers, drawers, and overlays
- [x] Remove duplicate page entrances and unsafe broad CSS transitions
- [x] Bound metric and Canvas work, including reduced-motion behavior
- [x] Validate login, repeated navigation, overlays, mobile, desktop, console, typecheck, and production build (lint unavailable: no ESLint configuration)

## Motors Hub motion parity
- [x] Centralize timing, easing, spring, and stagger values from the confirmed reference
- [x] Match brand and login sequencing without competing animation owners
- [x] Match route, navigation, drawer, press, and desktop scroll behavior

## Autorização única (usuário -> nível -> perfil -> sistema -> módulo -> ação -> empresa)
- [x] Cadeia canônica no banco com funções SECURITY DEFINER e RLS por permissão
- [x] Módulo src/authz como fonte única no código (catálogo, acesso efetivo, provider, gate de rotas)
- [x] Telas de usuários e perfis gravando perfis, sistemas e permissões reais
- [x] docs/autorizacao.md e testes da matriz de autorização
- [ ] Apply restrained dashboard metric/chart entry and preserve stable tables
- [ ] Verify Canvas, reduced motion, cleanup, and overlay lifecycle
- [ ] Validate login, ERP/TMS rapid navigation, all required viewports, console, lint, typecheck, and production build

## Acesso efetivo (launcher)
- [x] RPC única `get_my_effective_access()` (SECURITY DEFINER, auth.uid()) como fonte de verdade
- [x] SystemProvider e AuthzProvider consomem a mesma query; sem lógica paralela
- [x] Erro de carregamento ≠ ausência de acesso (launcher mostra erro + "Tentar novamente")
- [x] MASTER_ADMIN vê todos os sistemas ativos sem linhas em px_usuario_sistemas (testado com rollback)
- [x] Validado no navegador: login, /launcher, /tms, /admin/usuarios, /admin/perfis, ERP — console sem erros
