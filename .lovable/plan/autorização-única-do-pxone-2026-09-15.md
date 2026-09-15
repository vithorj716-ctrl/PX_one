# Autorização única do PXOne

## O que está errado hoje (diagnóstico da auditoria)

Existem **três fontes de verdade competindo**, e nenhuma conversa com as outras:

1. **Tipo de usuário** (`user_roles`, enum com 8 valores incluindo `operador`/`user` que a tela nem mostra) — usado só para deixar entrar no painel administrativo.
2. **Acesso a sistemas** (`px_usuario_sistemas`) — é o que o Launcher usa para decidir o que aparece.
3. **Perfis e permissões** (`px_perfis`, `px_perfil_permissoes`, `px_usuario_perfis`) — as tabelas existem, a tela mostra bolinhas, **mas nenhuma linha do sistema consulta essas tabelas**. Hoje estão vazias (0 registros) e a própria tela avisa "a edição será adicionada na próxima iteração".

Daí o sintoma relatado: marcar tudo em Perfis não muda nada, porque quem decide o acesso é outra tabela; e `master_admin` não abre sistema nenhum, porque nível hierárquico e acesso a sistema não estão ligados.

Além disso: **56 de 58 regras de segurança do banco são `USING (true)`** — qualquer usuário logado lê e escreve tudo, incluindo usuários, perfis, permissões, financeiro e TMS. E o contexto de empresa vem apenas do navegador, sem validação no servidor. Há também uma consulta de sistemas sem filtro por usuário, que só "funciona" porque a regra permissiva devolve as linhas de todos.

## Arquitetura adotada

Uma cadeia única, cada nível com uma responsabilidade:

```text
usuário (auth.users)
  └─ tipo/nível        user_roles                    hierarquia e capacidade administrativa
      └─ perfis        px_usuario_perfis → px_perfis  conjunto reutilizável de acessos
          └─ sistemas  px_perfil_sistemas / px_usuario_sistemas
              └─ módulos + ações  px_perfil_permissoes (system, module, resource, action)
                  └─ empresa       px_usuario_empresas
                      └─ RLS       policies via funções SQL
```

Regra de combinação: **permissão efetiva = união** dos perfis + concessões diretas ao usuário. Sem deny implícito. `MASTER_ADMIN` é a única exceção, resolvida **no banco** (`px_is_master()`), nunca por comparação de string no frontend.

## Banco (migrations idempotentes, sem derrubar tabelas)

- Estender `px_perfil_permissoes` para o modelo `sistema_key / modulo_key / recurso / acao` preservando as linhas atuais; criar `px_perfil_sistemas`, `px_usuario_permissoes` (concessão direta), `px_usuario_empresas`, `px_modulos` (catálogo de módulos por sistema).
- Constraints, unique e índices em todas as relações; limpar referências órfãs.
- Funções `SECURITY DEFINER` canônicas: `px_is_master()`, `px_has_system(sistema)`, `px_has_module(sistema, modulo)`, `px_can(sistema, modulo, recurso, acao)`, `px_has_empresa(empresa_id)`, e a view/RPC `px_effective_access()` que devolve o acesso efetivo **com a origem** de cada permissão.
- Substituir as 56 policies `USING (true)`: cada tabela passa a exigir a permissão do seu domínio e, quando a tabela tem `empresa_id`, também o vínculo de empresa. Tabelas administrativas (usuários, perfis, permissões, API, auditoria) ficam legíveis apenas para quem administra.
- Migração de dados: os 2 usuários e 8 vínculos de sistema existentes são preservados; criação dos perfis padrão (Administração Global, Gestor Operacional, Consulta) a partir dos acessos que já existem. Nenhum usuário é promovido a MASTER_ADMIN automaticamente — só quem já é.
- Auditoria: gravação das operações administrativas e críticas via trigger/RPC, com usuário, ação, recurso, registro, empresa, resultado e contexto.

## Backend

- Um único módulo `src/authz/` com o catálogo de sistemas/módulos/recursos/ações em constantes tipadas (sem strings soltas), o cálculo de acesso efetivo e os helpers `hasSystemAccess`, `hasModuleAccess`, `can`.
- Middlewares reutilizáveis para server functions: `requirePermission(...)`, `requireAdmin()`, `requireEmpresa()`. Toda operação de criação, edição, exclusão, financeiro, TMS, crédito, usuários, perfis e configuração passa a validar no servidor.
- As telas administrativas param de escrever direto pelo navegador: passam por server functions autorizadas.

## Frontend

- Um provider único de autorização, alimentado pelo acesso efetivo do banco, com invalidação ao trocar perfil/permissão/empresa/usuário e limpeza total no logout.
- Gate central de rotas: acesso ao sistema, ao módulo e à ação, aplicado também em acesso direto por URL (`/tms`, `/tms/viagens`, `/admin`, ...). Launcher, sidebar e botões passam a ler a mesma camada — nenhuma regra própria.
- Tela de usuários reorganizada, mantendo o visual atual, separando Tipo, Perfil, Sistemas, Módulos e uma aba **Acessos efetivos** que mostra Sistema → Módulo → Recurso → Ação → origem (ex.: "concedido pelo perfil Gestor Operacional").
- Tela de perfis passa a editar de verdade sistemas, módulos e ações.

## Documentação e testes

- `docs/autorizacao.md`: o que é usuário, tipo, perfil, sistema, módulo, permissão; como MASTER_ADMIN funciona; como proteger uma rota nova, uma server function nova e criar uma permissão nova.
- Testes da matriz de autorização (Vitest) para os cenários pedidos: master acessa tudo, admin só o do perfil, URL direta bloqueada, módulo sem acesso, read sem update, update sem delete, chamada direta à API sem permissão, isolamento entre empresas, remoção de permissão removendo acesso, troca de usuário sem herdar permissão.
- Ao final: typecheck, build e verificação de que não sobrou `USING (true)`, `as any` em autorização, nem checagem de admin espalhada.

## Observações antes de começar

- É uma mudança grande e será feita em etapas; ao endurecer as regras do banco, telas que hoje leem tudo passarão a depender de permissão — por isso os perfis padrão são criados na migração para manter o funcionamento atual.
- Ponto que depende de decisão sua: hoje só existe **1 empresa** cadastrada e nenhum vínculo usuário↔empresa. Vou vincular os usuários existentes a essa empresa para não quebrar nada; se a intenção for outra, me diga.
