# Arakatu — Relação com a arquitetura

| ADR | Aplicação |
| --- | --- |
| [0001](../../adr/0001-arquitetura-monolito-modular.md) e [0002](../../adr/0002-monorepo-pnpm.md) | Módulo interno no monólito modular e monorepo pnpm; dependências externas exigem avaliação específica |
| [0003](../../adr/0003-backend-fastify-typescript.md) e [0004](../../adr/0004-frontend-react-typescript-vite.md) | Fastify/TypeScript e React/TypeScript/Vite como stack comum |
| [0005](../../adr/0005-banco-postgresql.md) e [0006](../../adr/0006-drizzle-migracoes.md) | PostgreSQL e Drizzle ORM/Kit para persistência própria; schema ainda não definido |
| [0007](../../adr/0007-contratos-typebox-openapi.md) | TypeBox e OpenAPI 3.1 para API; contratos de calendário ainda a especificar |
| [0008](../../adr/0008-autenticacao-better-auth.md) e [0009](../../adr/0009-nucleos-autorizacao.md) | Identidade comum e autorização contextual; Better Auth condicionado à POC |
| [0010](../../adr/0010-ciclo-dados-exportacao.md) | Exclusão lógica, retenção e exportação individual; recuperação de série/exceção a detalhar |
| [0012](../../adr/0012-processamento-assincrono.md) | Processamento inicialmente no Fastify com persistência PostgreSQL para tarefas assíncronas necessárias |
| [0013](../../adr/0013-testes-vitest-playwright.md) a [0015](../../adr/0015-ci-github-actions.md) | Vitest, Playwright, qualidade e CI verificam regras, contratos e fluxos implementados |
| [0016](../../adr/0016-deploy-compose-multiarch.md) a [0018](../../adr/0018-logs-pino.md) | Compose amd64/arm64, Caddy e Pino; sem serviço extra de calendário aprovado |
| [0019](../../adr/0019-web-pwa-integracoes.md) | Web/PWA online; agenda sem migração obrigatória, integração unidirecional no MVP |
| [0020](../../adr/0020-bibliotecas-frontend.md) a [0022](../../adr/0022-licenca.md) | Bibliotecas complementares, CD e licença seguem pendentes |

## Reutilização e escolha técnica

RN-051 prioriza avaliar soluções open-source. FullCalendar, Radicale e Nextcloud Calendar são candidatos citados, não escolhas. A fonte não aprova servidor CalDAV obrigatório nem implementação completa própria. Avaliação deve resolver a necessidade funcional antes de registrar nova ADR ou alterar status.

A documentação não faz comparação atual de versões/licenças dos candidatos; isso exige pesquisa específica na etapa de decisão. Nenhuma dependência nova foi selecionada aqui.

## Limites propostos

Arakatu é responsável por identidade de evento/origem, série/exceções e semântica de lembretes. Plataforma fornece identidade de usuário, contexto, autorização e canais. Adaptadores externos devem ter contratos explícitos de direção, identidade, atualização e falha isolada.

Não delegar autorização apenas ao componente visual nem tratar tipos TypeScript como validação de arquivos externos. Também não exigir event sourcing, microsserviço, broker externo ou um servidor de e-mail para administrar eventos.

## Contratos a refinar

CRUD de evento e agenda, compartilhamento, ocorrência versus série, importação/exportação, assinatura, origem e lembretes. A lista organiza capacidades e lacunas; não aprova endpoints, enums, campos obrigatórios ou política de versões.

## Verificação proposta

Testar origem e isolamento, exceção isolada, alteração de série, identidade em importação repetida, fronteiras de fuso e persistência/reagendamento. Usar fixtures de calendário e relógio controlável quando os contratos forem definidos. Não existe código de aplicação ou teste novo nesta etapa.
