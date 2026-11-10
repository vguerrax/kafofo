# Plataforma — Relação com as decisões de arquitetura

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


**Natureza:** aplicação documental das ADRs existentes. Não aprova novas bibliotecas, estrutura física de pastas, endpoints ou topologia de isolamento.

## Decisões aplicáveis

| ADR | Decisão / situação | Consequência para a plataforma |
| --- | --- | --- |
| [0001](../../adr/0001-arquitetura-monolito-modular.md) | Monólito modular | Identidade, organização e serviços comuns têm limites internos; não exigem microsserviços |
| [0002](../../adr/0002-monorepo-pnpm.md) | Monorepo pnpm Workspaces | Frontend, backend e contratos evoluem no mesmo repositório; pacotes exatos pendentes |
| [0003](../../adr/0003-backend-fastify-typescript.md) | Fastify e TypeScript | API e aplicação de regras no backend |
| [0004](../../adr/0004-frontend-react-typescript-vite.md) | React, TypeScript e Vite | Uma interface integrada e responsiva |
| [0005](../../adr/0005-banco-postgresql.md) | PostgreSQL | Persistência transacional; isolamento físico/lógico a detalhar |
| [0006](../../adr/0006-drizzle-migracoes.md) | Drizzle ORM e Kit | Evolução versionada de persistência; migrações ainda precisam de política operacional |
| [0007](../../adr/0007-contratos-typebox-openapi.md) | TypeBox e OpenAPI 3.1 | Contratos verificáveis; schemas e endpoints não criados por esta documentação |
| [0008](../../adr/0008-autenticacao-better-auth.md) | Better Auth condicionado à POC | Login username/senha sem e-mail pessoal; provar recuperação e sessões antes da adoção definitiva |
| [0009](../../adr/0009-nucleos-autorizacao.md) | Núcleos e administração | Separar privilégios globais, do núcleo e da residência |
| [0010](../../adr/0010-ciclo-dados-exportacao.md) | Exclusão lógica, retenção e exportação | Padrão de trinta dias e exportação pessoal; divergência sobre auditoria de módulos a revisar |
| [0011](../../adr/0011-arquivos-disco-local.md) | Disco local | Arquivos persistentes com política de acesso e recuperação a detalhar |
| [0012](../../adr/0012-processamento-assincrono.md) | Assíncrono no Fastify/PostgreSQL | Sem Redis ou RabbitMQ obrigatórios; garantias de execução pendentes |
| [0013](../../adr/0013-testes-vitest-playwright.md) | Vitest e Playwright | Verificar regras, integrações e fluxos; priorizar autorização e recuperação |
| [0014](../../adr/0014-padroes-qualidade.md) | Strict, ESLint, Prettier, Husky e lint-staged | Verificação estática e convenções; hooks não substituem CI |
| [0015](../../adr/0015-ci-github-actions.md) | CI em Pull Requests | Testes, análise estática, tipos, build e contratos OpenAPI |
| [0016](../../adr/0016-deploy-compose-multiarch.md) | Compose, amd64/arm64 | Operação self-hosted com imagens compatíveis |
| [0017](../../adr/0017-proxy-caddy.md) | Caddy | Entrada HTTP/HTTPS; guia local/remoto ainda a detalhar |
| [0018](../../adr/0018-logs-pino.md) | Pino no Fastify | Logs estruturados e níveis configuráveis; auditoria de domínio é responsabilidade separada |
| [0019](../../adr/0019-web-pwa-integracoes.md) | PWA e integrações | Online no MVP; serviços externos sem obrigar migração |
| [0020](../../adr/0020-bibliotecas-frontend.md) | Pendente | Biblioteca visual, formulários e estado não fixados |
| [0021](../../adr/0021-entrega-implantacao-continua.md) | Pendente | Não presumir publicação ou atualização automática |
| [0022](../../adr/0022-licenca.md) | Pendente | Não acrescentar licença arbitrária ao pacote |

## Limites internos propostos para implementação

Esta decomposição organiza responsabilidades; não representa diretórios ou pacotes aprovados.

| Área lógica proposta | Responsabilidade | Fronteira |
| --- | --- | --- |
| Identidade e acesso | Conta, autenticação, 2FA, sessões, recuperação | Não decide regras financeiras, de tarefas ou de notas |
| Organização doméstica | Núcleos, residências, participações, convites e papéis | Não lê dados privados apenas para administrar estrutura |
| Política de contexto | Resolver escopo e validar acesso | Não transforma contexto enviado pelo cliente em autorização |
| Catálogo de módulos | Disponibilidade e habilitação | Não incorpora regras específicas dos módulos |
| Notificações | Preferências, leitura, roteamento e canais | Módulo define evento e relevância |
| Auditoria e privacidade | Eventos administrativos, segurança, exportação e ciclo de dados | Histórico específico continua sob responsabilidade do domínio |
| Integrações | Contratos de acesso e falha isolada | Protocolos específicos permanecem delimitados |

## Contratos a especificar na implementação

Definir contratos internos e schemas públicos somente após fechar as lacunas relevantes: resolução de contexto, autorização por ação/recurso, publicação de evento, emissão de notificação, exportação pessoal de cada módulo, exclusão/recuperação e fornecimento de dados ao Okape.

**Orientações derivadas:** não permitir acesso indiscriminado às tabelas internas de outros módulos; manter validação no backend; combinar transações e efeitos assíncronos sem perder registros críticos; sanitizar conteúdo formatado conforme biblioteca escolhida; evitar credenciais e conteúdo doméstico sensível nos logs.

Não há justificativa nesta documentação para acrescentar DDD completo, CQRS, barramento externo, event sourcing, microfrontends ou outra tecnologia como obrigação do MVP.

## Validação esperada, ainda não executada

Vitest pode cobrir regras e integração com persistência; Playwright pode verificar fluxos de cadastro, convites, contexto, sessões e recuperação. O contrato OpenAPI deve acompanhar os schemas TypeBox e ser validado no CI. As estratégias exatas de fixtures, banco de teste, navegadores e versionamento da API permanecem abertas.
