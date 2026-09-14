# Estabilização definitiva de movimento e navegação do PX One

## Diagnóstico principal

- A transição global em `__root` envolve todo o `Outlet`, enquanto cada página autenticada cria seu próprio `AppShell` ou `TmsShell`. Assim, sidebar, header e conteúdo são desmontados e remontados juntos em toda navegação.
- O `AnimatePresence mode="wait"` atual não consegue preservar o shell porque a chave é a URL inteira e o shell está dentro da árvore substituída. Isso explica piscadas, títulos sobrepostos e sensação de página antiga/nova.
- Existem entradas CSS adicionais dentro de páginas já animadas pela transição principal, causando dupla animação de `opacity` e `transform`.
- A logo do TMS é uma imagem sem wrapper animado; a logo do PX One usa Motion, mas remonta junto com cada página e o sheen roda apenas uma vez, frequentemente antes de ser percebido.
- O modo de movimento reduzido ainda mantém Canvas ativo e apenas diminui sua velocidade; deve desligar loops e movimentos contínuos.
- Modais compartilhados misturam Radix/CSS e implementações manuais; a base está funcional, mas precisa de tempos, saída, bloqueio de clique e camadas consistentes.

## Implementação

1. **Separar shell e conteúdo**
   - Criar layouts persistentes para as famílias PX One e TMS.
   - Manter sidebar e header montados enquanto somente o conteúdo filho troca.
   - Preservar launcher, login, conta, administração e telas especiais em seus fluxos atuais.
   - Remover `AppShell`/`TmsShell` duplicados das páginas filhas sem alterar consultas, formulários ou regras.

2. **Uma única transição de rota**
   - Remover a transição global do `__root`.
   - Inserir uma transição única no content area de cada shell persistente.
   - Usar chave estável baseada no pathname, `AnimatePresence mode="wait"`, saída de 160–220ms e entrada de 280–380ms.
   - Impedir interação da página em saída e manter fundo, dimensões e scroll container estáveis.

3. **Logo, sidebar e header**
   - Recriar `AnimatedLogo` com entrada visível em fases, settle discreto, sheen automático e microanimação quase imperceptível.
   - Aplicar o wrapper também à logo PXLog sem trocar o arquivo original.
   - Animar identidade e grupos de navegação somente na primeira montagem do shell.
   - Manter um único indicador ativo por sidebar com `layoutId`, hover de ícone e press curto.
   - Fazer título/subtítulo mudarem com presença controlada, sem remontar o header.

4. **Remover conflitos e normalizar microinterações**
   - Retirar entradas CSS redundantes de páginas já cobertas pela transição de conteúdo.
   - Reservar Motion para presença/layout e GSAP apenas para a sequência do login, com cleanup completo.
   - Uniformizar botões, inputs, tabelas, dropdowns, dialogs e drawers com tokens existentes e sem alterar a identidade.
   - Evitar reanimar tabelas, métricas e gráficos em atualizações comuns; limitar stagger às primeiras linhas visíveis.
   - Fazer carregamentos preservarem a estrutura e usarem crossfade curto em vez de tela vazia.

5. **Acessibilidade e desempenho**
   - Desligar Canvas e movimentos contínuos quando `prefers-reduced-motion` estiver ativo.
   - Manter apenas fades rápidos nesse modo.
   - Garantir cleanup de rAF, listeners, timelines e bloqueio de scroll.
   - Revisar z-index, portais, overlays, overflow e pointer-events.

6. **Validação real**
   - Testar login e navegação autenticada rápida por toda a sequência TMS solicitada, incluindo ida e volta repetida.
   - Verificar DOM sem sidebar/header duplicados, overlays invisíveis ou estilos residuais.
   - Testar modal, dropdown, loading, filtro e sidebar móvel.
   - Validar 320, 375, 390, 430, 768, 1024, 1280, 1440 e 1920 px.
   - Verificar console, erros do Router/Motion/React, refresh e URL direta.
   - Validar o build de produção e comportamento do PWA sem alterar Supabase, autenticação, banco, permissões ou regras de negócio.

## Limites preservados

Nenhuma mudança em Supabase, tabelas, RLS, usuários, permissões, APIs, integrações, cálculos, nomenclaturas ou identidade visual. A intervenção será restrita à arquitetura de apresentação, ciclo de vida visual e componentes compartilhados.
