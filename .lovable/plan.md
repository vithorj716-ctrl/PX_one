# Reformulação completa do sistema de movimento do PX One

## Objetivo

Elevar o PX One para uma experiência operacional mais fluida, precisa e premium, preservando integralmente autenticação, Supabase externo, permissões, empresa e sistema ativos, regras de negócio, rotas e fluxos existentes. A identidade continua sendo PX One: preto/grafite, azul-ciano PX e cores semânticas de estado.

## Auditoria consolidada

- O app usa React 19, TanStack Start/Router, Tailwind v4, shadcn/Radix e Supabase externo.
- A autenticação e proteção de rotas permanecem em `/_authenticated`; sistema e empresa ativos possuem contextos próprios e armazenamento já consolidado.
- Existem dois shells principais: PX One corporativo e PXLog TMS. Ambos possuem navegação, cabeçalho, painéis móveis e ações próprias que serão refinados, não reconstruídos.
- Hoje o movimento é CSS disperso: fades, scale, shimmer e transições simples. Não existem Motion, GSAP, Lenis, transições coordenadas, reduced motion ou Canvas animado.
- O manifesto PWA existe e já está ligado ao documento, mas não há service worker nem estratégia de atualização/cache.
- Há resíduos de template nos metadados raiz e o idioma do documento está incorreto.
- Existem muitos pontos compartilhados de alto impacto: CRUD/tabelas, diálogos, botões, métricas, gráficos, seletor de empresa, launcher e estados de loading/empty.

## Implementação

### 1. Fundação visual e de movimento

- Ampliar os tokens globais existentes com durações, easings, superfícies técnicas, brilho, backdrop e intensidade de movimento.
- Criar utilitários semânticos para painéis integrados, divisores, rótulos, números, regra de marca, grid técnico, press, row-hover, sheen PX, status vivo e skeleton.
- Manter os tokens PX atuais; remover cores visuais avulsas somente nos pontos tocados pela reformulação.
- Adicionar uma política global de `prefers-reduced-motion`, preservando apenas feedback essencial e reduzindo deslocamento, blur e duração.

### 2. Primitivas reutilizáveis

Criar um conjunto pequeno e reutilizável:

- `AnimatedBackground`: um único Canvas fixo com brumas PX, ondas técnicas, partículas em profundidade, spot do ponteiro, adaptação mobile/low-power, DPR limitado, pausa por visibilidade e cleanup completo.
- `PageTransition`/`MotionPage`: `AnimatePresence mode="wait"`, chave por pathname, entrada/saída única e sem sobreposição pesada com páginas internas.
- `AnimatedLogo` e `PxSheen`: entrada coordenada da marca e brilho diagonal restrito a ações de destaque.
- `AnimatedMetric`/`AnimatedNumber`: entrada escalonada e troca vertical apenas quando valores mudarem.
- `LoadingRows`, `LoadingStats`, `EmptyState` e `StatusIndicator`: estados estáveis e acessíveis.
- Primitivas de painel, diálogo e drawer somente onde os componentes compartilhados atuais não fornecerem o comportamento necessário.

### 3. Shells e navegação

- Inserir o fundo reativo uma única vez na estrutura raiz, atrás de todo o conteúdo e sem capturar interação.
- Refinar AppShell e TmsShell sem alterar menus, rotas ou ações.
- Usar indicador ativo compartilhado com `layoutId` e spring `stiffness: 420`, `damping: 36`.
- Coordenar a entrada estrutural: shell, cabeçalho, título, controles e conteúdo, evitando animações duplicadas nas páginas.
- Transformar painéis móveis em drawers curtos; respeitar safe areas, bloqueio de scroll, foco e áreas de toque.
- Manter scroll nativo nos painéis da aplicação. Lenis não será adicionado porque os shells usam áreas internas roláveis e ele criaria um segundo sistema concorrente sem benefício operacional.

### 4. Login e launcher

- Reorganizar apenas apresentação e movimento do login; preservar credenciais, domínio, chamadas Supabase, mensagens e redirecionamentos.
- Criar timeline GSAP para fundo, marca, título, divisor, campos, botão e mensagens, com `gsap.context()` e `revert()`.
- Aplicar sheen PX e resposta de press ao botão principal.
- Refinar launcher e administração com a mesma linguagem técnica, entrada escalonada, estados estruturados e cards menos genéricos.

### 5. Componentes e dados

- Atualizar Button, Dialog, Table, Popover e o CRUD compartilhado para microinterações coerentes, entradas/saídas com presença, foco visível e dimensões estáveis.
- Animar linhas de tabelas discretamente no primeiro carregamento e destacar somente linhas/células alteradas.
- Aplicar entrada escalonada às métricas reutilizadas nos dashboards PX One, TMS e Last Mile.
- Animar barras, linhas e áreas de gráficos apenas na entrada ou mudança real dos dados.
- Substituir loaders isolados prioritários por skeletons estruturais e empty states com ícones Lucide e ação contextual quando já existir ação correspondente.
- Estados críticos terão pulso lento de opacidade, sem piscadas ou dependência exclusiva de animação.

### 6. PWA e acabamento institucional

- Corrigir idioma para `pt-BR` e remover metadados herdados de outro projeto.
- Garantir metadados PX One completos e únicos nas rotas de conteúdo tocadas, sem alterar URLs ou navegação.
- Integrar o service worker ao PWA existente com atualização automática, limpeza de cache antigo, `skipWaiting` e `clientsClaim`, sem duplicar manifesto ou registro.
- Preservar assets locais, instalação atual e compatibilidade com produção.

## Detalhes técnicos

- Bibliotecas: `motion` para presença, layout, springs e estados locais; `gsap` para timelines coordenadas do login e entradas estruturais específicas; Canvas 2D para o fundo.
- Easing principal: `[0.22, 1, 0.36, 1]`; GSAP com `power3.out`, `power2.out`, `power2.inOut` e `sine.inOut`.
- Transição de página: entrada `opacity 0→1`, `y 14→0`, `blur 8→0`, 0,42s; saída `opacity 1→0`, `y 0→-8`, `blur 0→6`.
- Canvas: 6 ondas desktop/4 mobile, partículas adaptativas de 12–200 com teto de 90 em hardware limitado, interpolação do ponteiro em 0,03 por quadro e DPR máximo 2/1,5.
- Nenhuma alteração de schema, migração, banco, autenticação, autorização, regra de negócio, API pública, função de servidor ou integração Supabase.
- Nenhum uso de Lovable Cloud.

## Validação

- Verificar tipos/testes existentes e ausência de erros no console.
- Testar login visualmente: sequência, foco, press, sheen, erro e fundo reativo.
- Testar navegação autenticada em desktop: indicador deslizante, troca de páginas sem flash/duplicação e scroll natural.
- Testar 320, 375, 768, 1024, 1280 e tela larga: densidade adaptativa, safe areas, drawers, inputs sem zoom e ausência de overflow.
- Verificar métricas, tabelas, gráficos, loading, empty states e atualização localizada de dados.
- Verificar reduced motion e pausa do Canvas em aba oculta.
- Verificar manifesto, service worker, assets e atualização em build de produção.
- Auditar ao final que fluxos, rotas, autenticação, permissões, empresa ativa, sistema ativo, Supabase e regras de negócio não foram modificados.

## Entrega

O resumo final listará arquivos criados e alterados, componentes de animação, bibliotecas, áreas reformuladas, testes executados e qualquer fluxo que não tenha podido ser validado por falta de sessão ou dados.
