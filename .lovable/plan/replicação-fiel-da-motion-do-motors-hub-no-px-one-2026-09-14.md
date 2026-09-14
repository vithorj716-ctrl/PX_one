# Replicação fiel da motion do Motors Hub no PX One

## Referência confirmada

Usar o código real do **Golden Watch / Motors Hub** (`beta1hub.lovable.app`) como fonte de comportamento, timings e easing. Preservar integralmente cores, tipografia, componentes, logo e identidade do PX One.

## Diagnóstico da implementação atual

- Os shells PX One e TMS já são persistentes e a troca principal está corretamente isolada no conteúdo; essa arquitetura será preservada.
- A logo atual usa uma sequência mais curta e diferente da referência, sem wordmark/linha coordenados e sem o sheen recorrente do Motors Hub.
- Login, logo e demais transições usam números repetidos e curvas parcialmente divergentes; serão alinhados aos valores reais da referência sem compartilhar propriedades entre GSAP, Motion e CSS.
- O Canvas já possui limites e cleanup adequados; receberá apenas comparação e ajustes mínimos de intensidade.
- O projeto ainda não possui Lenis; ele será adicionado somente para scroll desktop, com uma instância global, desligada no mobile e em movimento reduzido.
- Não há hoje AnimatePresence duplicado na troca de rota. Overlays locais continuarão independentes da transição de página.

## Implementação

1. **Centralizar a disciplina de movimento**
   - Criar tokens compartilhados para easing, durações, springs e stagger usados por Motion/GSAP.
   - Manter a regra: GSAP para logo/login/dashboard específico; Motion para presença, layout e drawers; CSS para hover/press; Canvas para ambiente.
   - Remover apenas animações CSS ou transições amplas que concorram com essas responsabilidades.

2. **Marca com o comportamento real do Motors Hub**
   - Evoluir o componente de logo para uma lockup reutilizável: marca, wordmark opcional e linha/indicador opcional.
   - Reproduzir a entrada GSAP da referência: marca em 0,7s com `power3.out`, sheen sobreposto em 0,9s, wordmark em 0,45s com stagger de 0,08s e linha em 0,6s.
   - Manter a imagem original intacta e o wrapper de contraste discreto já existente.
   - Implementar um único sheen cyan/azul recorrente e muito sutil, desligado em movimento reduzido, com cleanup completo.
   - Garantir estado final fixo da imagem e montagem persistente nas sidebars.

3. **Login sincronizado sem disputa**
   - Deixar o componente de marca controlar somente marca e sheen.
   - Fazer a timeline da página controlar somente título, divisor, campos e botão, com a sobreposição e os deslocamentos da referência.
   - Eliminar delay mágico desconectado e coordenar a sequência por tokens compartilhados.
   - Manter conteúdo imediatamente utilizável e estado final explícito.

4. **Navegação, header e transição de conteúdo**
   - Ajustar `PageTransition` para a sensação do Motors Hub usando somente opacity + pequeno deslocamento vertical e a curva `[0.22, 1, 0.36, 1]`, sem blur.
   - Preservar uma única transição principal por shell e chaves baseadas somente no pathname.
   - Manter `layoutId` e spring 420/36 nos indicadores ativos, com namespaces separados para desktop/mobile e PX One/TMS.
   - Adicionar compactação suave do header mobile ao rolar, sem spring e sem salto de layout.
   - Adicionar navegação inferior mobile somente se compatível com os destinos atuais e sem duplicar o drawer; o conteúdo e as rotas existentes não serão alterados.

5. **Scroll, drawers e microinterações**
   - Adicionar Lenis 1.3.26, como na referência, em uma única instância global apenas no desktop e fora de `prefers-reduced-motion`.
   - Integrar corretamente com os scroll containers dos shells, sem afetar o scroll nativo mobile, com RAF e instância destruídos no cleanup.
   - Alinhar drawers, modais, press e sheen de botões aos tempos da referência, sem bounce, blur pesado ou animação contínua indevida.
   - Unificar o bloqueio de scroll dos overlays para impedir desbloqueio prematuro ou camada invisível residual.

6. **Dashboard, métricas, gráficos e listas**
   - Aplicar a entrada real do Motors Hub apenas ao dashboard principal: KPIs em 0,5s com stagger 0,045s; gráficos equivalentes com crescimento curto a partir da base.
   - Executar entradas somente na montagem real ou mudança real de dados.
   - Preservar tabelas grandes estáticas; no máximo animar o container ou poucas linhas visíveis uma única vez.
   - Manter count-up entre 300–500ms e impedir reinício por rerenders não relacionados.

7. **Canvas, loading e acessibilidade**
   - Manter o Canvas ambiental discreto e limitado, confirmando pausa em aba oculta, ausência no mobile reduzido, baixo DPR e cancelamento de RAF.
   - Preservar apenas loops semanticamente úteis, como status ativo; remover decoração contínua que prejudique fluidez.
   - Garantir que skeletons e feedbacks existam somente durante carregamento real.
   - Em movimento reduzido: logo e conteúdo visíveis, Canvas e sheen recorrente desligados, transições funcionais de 80–120ms.

8. **Validação real obrigatória**
   - Testar login completo, launcher, PX One, TMS e retorno entre sistemas.
   - Repetir rapidamente as sequências ERP e TMS indicadas, verificando persistência do mesmo nó de logo/sidebar/header/background e ausência de páginas antigas ou overlays residuais.
   - Verificar logo após entrada e após dez trocas de módulo, além de drawers, modais, tabelas, filtros, métricas e gráficos.
   - Validar 320, 375, 390, 430, 768, 1024, 1280, 1440 e 1920 px; Lenis somente no desktop.
   - Conferir console, DOM duplicado, listeners/RAF, erros React/Motion/GSAP/TanStack, lint, typecheck e build de produção.

## Limites preservados

Nenhuma alteração em Supabase, banco, RLS, autenticação, permissões, RBAC, APIs, consultas, mutations, cálculos, regras TMS, estrutura de dados, rotas funcionais, identidade, arquivos da logo ou conteúdo das páginas. Não haverá reformulação visual nem efeitos decorativos adicionais fora dos padrões reais confirmados no Motors Hub.
