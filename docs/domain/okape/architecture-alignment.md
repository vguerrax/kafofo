# Okape — Relação com a arquitetura

| ADR | Aplicação |
| --- | --- |
| [0001](../../adr/0001-arquitetura-monolito-modular.md) e [0002](../../adr/0002-monorepo-pnpm.md) | Módulo de composição do monólito, com contratos entre fontes e visuais no monorepo pnpm |
| [0003](../../adr/0003-backend-fastify-typescript.md) e [0004](../../adr/0004-frontend-react-typescript-vite.md) | Fastify/TypeScript e frontend React/TypeScript/Vite único |
| [0005](../../adr/0005-banco-postgresql.md) e [0006](../../adr/0006-drizzle-migracoes.md) | PostgreSQL e Drizzle ORM/Kit para composições/configurações; schema não definido |
| [0007](../../adr/0007-contratos-typebox-openapi.md) | TypeBox/OpenAPI 3.1 para contratos de API; formatos dos conjuntos e compatibilidade a especificar |
| [0008](../../adr/0008-autenticacao-better-auth.md) e [0009](../../adr/0009-nucleos-autorizacao.md) | Conta e contexto comuns; Better Auth condicionado à POC; autorização individual das fontes |
| [0010](../../adr/0010-ciclo-dados-exportacao.md) | Exclusão lógica e exportação pessoal; recuperação de composição a refinar |
| [0013](../../adr/0013-testes-vitest-playwright.md) a [0015](../../adr/0015-ci-github-actions.md) | Vitest/Playwright, qualidade e CI para contratos, regras e fluxos |
| [0016](../../adr/0016-deploy-compose-multiarch.md) a [0019](../../adr/0019-web-pwa-integracoes.md) | Mesma implantação Compose amd64/arm64, Caddy, Pino e PWA online |
| [0020](../../adr/0020-bibliotecas-frontend.md) a [0022](../../adr/0022-licenca.md) | Bibliotecas de grade/gráfico/estado, CD e licença não são escolhidas por esta documentação |

## Limites propostos

Okape mantém painéis, instâncias, layout, catálogo e preferências. Fontes mantêm regras de domínio, acesso, schema e intervalo de atualização. Evitar consultas diretas às tabelas internas de outro módulo para reconstruir indicadores.

A composição pessoal não justifica um serviço de BI separado, event sourcing, um broker externo ou um sistema público de extensões. ADR-0012 pode apoiar trabalho assíncrono quando necessário, mas atualização de um componente não exige por si só job persistente de backend.

## Contratos a especificar

Catálogo de fontes e tipos visuais; metadados de compatibilidade; consulta/configuração da fonte no contexto; composição e layout; cópia; permissões de painel; compartilhamento pessoal; administração compartilhada; padrão/ordem/ativação; estado de erro/incompatibilidade.

Versão de schema e política de cache são refinamentos, não contratos existentes. Catálogo fixo no MVP deve permitir evolução arquitetural sem executar código de terceiros.

## Verificação proposta

Vitest pode cobrir compatibilidade, cópia independente, autorização e regra de substituição de padrão. Playwright pode verificar prévia, composição, grade, compartilhamento e falhas preservando configuração. Garantir cenários com dono e convidado tendo permissões diferentes na fonte.

Não há aplicação ou testes novos nesta entrega. Biblioteca de drag-and-drop, grade ou gráficos não foi escolhida.
