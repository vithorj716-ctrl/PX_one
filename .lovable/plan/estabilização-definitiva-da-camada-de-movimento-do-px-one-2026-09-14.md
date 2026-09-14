# Estabilização definitiva da camada de movimento do PX One

## Objetivo

Corrigir a implementação atual sem redesenhar o produto: manter os shells persistentes, reduzir efeitos concorrentes, recuperar a leitura da marca e garantir transições rápidas sem ghosting.

## Implementação

1. **Propriedade e ciclo de vida das animações**
   - Consolidar o inventário de GSAP, Motion e CSS por elemento/propriedade.
   - Remover entradas duplicadas em páginas já cobertas pela transição de rota.
   - Restringir `transition-all`, `will-change`, blur e animações contínuas aos poucos casos realmente necessários.

2. **Marca e login**
   - Centralizar no componente da marca uma superfície discreta que preserve as cores originais e dê contraste às áreas escuras.
   - Manter uma única timeline GSAP para entrada, settle e sheen único da logo, com estado final explícito e cleanup seguro.
   - Ajustar a timeline do login para controlar apenas texto, divisor, campos, botão e erro, sem bloquear a interação.

3. **Shells e troca de conteúdo**
   - Confirmar `PersistentAppShell` e `PersistentTmsShell` como únicos donos de sidebar, header e área principal em cada família de rotas.
   - Manter uma única `PageTransition` por shell, chaveada apenas pelo pathname, sem blur, zoom ou spring.
   - Evitar sobreposição, conteúdo antigo clicável, salto de geometria e remontagem da marca durante navegação interna.

4. **Drawers, overlays e componentes operacionais**
   - Trocar springs dos drawers móveis por transições determinísticas de opacity/transform e aplicar reduced motion.
   - Garantir desmontagem, scroll lock, foco, pointer-events e camadas corretas em drawers, dialogs, busca, exportação e seletores.
   - Manter tabelas estáticas por linha, métricas animadas apenas na entrada ou mudança real e superfícies operacionais sem movimento contínuo.

5. **Performance e acessibilidade**
   - Reduzir o Canvas para o orçamento solicitado, limitar a 20–30 fps, simplificar gradientes e desligar completamente em aba oculta ou reduced motion.
   - Preservar somente microinterações curtas de hover, foco e press, sem disputa com Motion ou GSAP.

6. **Validação real**
   - Executar typecheck, lint disponível e build de produção.
   - Testar login, contraste e permanência da logo, navegação rápida TMS/ERP, markup, tabela, dropdown, modal e drawers.
   - Conferir DOM, overlays, eventos, erros de console e estabilidade visual em 320, 375, 390, 430, 768, 1024, 1280, 1440 e 1920 px.

## Limites preservados

Nenhuma alteração em Supabase, banco, autenticação, permissões, RLS, APIs, regras de negócio, cálculos, rotas, nomes de módulos, dados, funcionalidades, arquivos originais da logo ou identidade visual.