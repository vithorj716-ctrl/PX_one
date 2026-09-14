# Correção cirúrgica de movimento do PX One

## Objetivo

Eliminar travamentos, ghosting e perda de contraste sem alterar identidade, páginas, rotas, autenticação, Supabase ou regras de negócio.

## Causas confirmadas na auditoria

- `SidebarInner` e `Navigation` são declarados dentro dos shells; suas identidades mudam em cada render e remontam logo e navegação.
- A logo combina GSAP com uma animação CSS contínua sobreposta; o efeito altera sua leitura depois da entrada.
- A transição de página aplica blur ao conteúdo inteiro, aumentando custo de composição e deixando rastros visuais.
- O Canvas mantém até 200 partículas, múltiplas ondas, gradientes radiais e resposta ao ponteiro em todos os quadros.
- O CRUD anima cada linha da tabela individualmente, inclusive após filtros e recargas.
- Há superfícies e indicadores com animações contínuas que não agregam ao fluxo operacional.

## Implementação

1. **Logo previsível**
   - Remover o efeito CSS contínuo e qualquer camada persistente sobre a imagem.
   - Manter somente a entrada GSAP, com `opacity 0→1`, `scale 0.94→0.985→1` e `y 8→0`.
   - Fixar explicitamente o estado final em `opacity: 1`, `transform: none` e `filter: none`, com cleanup por `gsap.context().revert()`.
   - No login, excluir a logo da timeline do painel para que apenas `AnimatedLogo` controle sua entrada.

2. **Shells persistentes**
   - Extrair a sidebar do PX One e a navegação do TMS para componentes no escopo do módulo.
   - Passar apenas estado e callbacks necessários, preservando a árvore durante mudanças de rota e estado.
   - Manter o indicador ativo com um único `layoutId` por navegação e não reiniciar a logo durante trocas internas.

3. **Transição única de conteúdo**
   - Manter `PageTransition` somente dentro dos shells persistentes.
   - Remover blur e usar apenas opacity/y: entrada em 280ms e saída em 170ms.
   - Preservar `mode="wait"`, chave estável por pathname e bloqueio de interação no elemento em saída.
   - Simplificar a troca de título para evitar presenças aninhadas desnecessárias.

4. **Redução de carga**
   - Reduzir partículas, ondas, DPR e frequência efetiva do Canvas, mantendo pausa por visibilidade e cleanup.
   - Tornar estática a superfície com gradiente contínuo e remover o pulso decorativo do relógio.
   - Substituir animação por linha do CRUD por uma única entrada do contêiner da tabela.
   - Retirar blur dos overlays tocados, mantendo fades e deslocamentos curtos.

5. **Validação real**
   - Testar a entrada e permanência visual da logo no login, AppShell e TMS.
   - Fazer login e percorrer repetidamente Dashboard, Solicitações, Embarque, Recebimento, Entregas, Viagens, Tracking, Ocorrências, Clientes e Financeiro.
   - Repetir navegação rápida em 1024, 1280, 1440, 1920, 320, 375, 390, 430 e 768 px.
   - Verificar DOM e imagens para sidebar/header únicos, ausência de conteúdo antigo clicável, overlays residuais, overflow, flicker e telas vazias.
   - Repetir com reduced motion e conferir console, erros de página e respostas com falha.

## Limites

- Sem bibliotecas novas.
- Sem mudanças visuais, funcionais, de rotas, banco, autenticação, permissões, APIs ou regras do TMS.
- Sem Lovable Cloud.