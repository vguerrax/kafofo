# Decisões de arquitetura do Kafofo

Este diretório consolida as decisões conhecidas do projeto em registros individuais. Os documentos descrevem a arquitetura pretendida; não comprovam implementação, testes executados ou infraestrutura em funcionamento.

**Data desta consolidação:** 2026-11-03.

## Como interpretar

- **Aceita:** escolha registrada como aprovada no contexto recuperado do projeto.
- **Condicionada à POC:** escolha candidata, dependente de demonstração técnica antes da adoção definitiva.
- **Pendente:** registro de uma decisão ainda não tomada; não autoriza adotar uma alternativa.

As datas de aprovação não foram reconstruídas quando não estavam disponíveis. As razões, riscos, alternativas de referência e orientações de validação foram desenvolvidos nesta consolidação. Não constituem histórico literal da conversa nem novas aprovações do autor.

A base utilizada foi o contexto do projeto e a recuperação das definições anteriores de “Conceito do Kafofo”. Parte das escolhas técnicas foi recuperada de sínteses anteriores, sem a mensagem original de aprovação; os registros são uma consolidação documental, não uma transcrição auditável. Não foram usados detalhes das aplicações Tupã, Potira, Jaci, Moara ou Zuri para completar lacunas.

## Índice

| ADR | Decisão | Status |
| --- | --- | --- |
| 0001 | [Monólito modular](0001-arquitetura-monolito-modular.md) | Aceita |
| 0002 | [Monorepo com pnpm Workspaces](0002-monorepo-pnpm.md) | Aceita |
| 0003 | [Backend com Fastify e TypeScript](0003-backend-fastify-typescript.md) | Aceita |
| 0004 | [Frontend com React, TypeScript e Vite](0004-frontend-react-typescript-vite.md) | Aceita |
| 0005 | [PostgreSQL como banco de dados](0005-banco-postgresql.md) | Aceita |
| 0006 | [Drizzle ORM e Drizzle Kit](0006-drizzle-migracoes.md) | Aceita |
| 0007 | [Contratos com TypeBox e OpenAPI 3.1](0007-contratos-typebox-openapi.md) | Aceita |
| 0008 | [Autenticação sem e-mail pessoal e avaliação do Better Auth](0008-autenticacao-better-auth.md) | Aceita para a Alpha 1 |
| 0009 | [Múltiplos núcleos e níveis de administração](0009-nucleos-autorizacao.md) | Aceita |
| 0010 | [Exclusão lógica, retenção e exportação individual](0010-ciclo-dados-exportacao.md) | Parcialmente substituída na Alpha 1 por 0023 |
| 0011 | [Armazenamento de arquivos em disco local](0011-arquivos-disco-local.md) | Aceita |
| 0012 | [Processamento assíncrono no processo Fastify com PostgreSQL](0012-processamento-assincrono.md) | Aceita |
| 0013 | [Testes com Vitest e Playwright](0013-testes-vitest-playwright.md) | Aceita |
| 0014 | [TypeScript estrito e ferramentas de qualidade](0014-padroes-qualidade.md) | Aceita |
| 0015 | [Integração contínua com GitHub Actions](0015-ci-github-actions.md) | Aceita |
| 0016 | [Implantação com Docker Compose e imagens multi-arquitetura](0016-deploy-compose-multiarch.md) | Aceita |
| 0017 | [Caddy como proxy reverso](0017-proxy-caddy.md) | Aceita |
| 0018 | [Logs estruturados com Pino](0018-logs-pino.md) | Aceita |
| 0019 | [Web responsiva, PWA e evolução por integrações](0019-web-pwa-integracoes.md) | Aceita |
| 0020 | [Bibliotecas complementares do frontend](0020-bibliotecas-frontend.md) | Pendente |
| 0021 | [Entrega e implantação contínuas](0021-entrega-implantacao-continua.md) | Pendente |
| 0022 | [Licença de distribuição](0022-licenca.md) | Escolha aprovada, validação de distribuição pendente |
| 0023 | [Histórico de domínio e retenção por categoria na Alpha 1](0023-auditoria-retencao-alpha-1.md) | Aceita para a Alpha 1 |

## Pontos que precisam de acompanhamento

1. Preservar as adaptações e regressões do Better Auth aceitas na ADR-0008; validar autorização contextual e operação real durante a implementação.
2. Detalhar o mecanismo de isolamento dos dados entre núcleos e a matriz de autorização.
3. Definir persistência, retomada, concorrência e idempotência do processamento assíncrono.
4. Especificar backup e restauração conjuntos de PostgreSQL e arquivos; não há ferramenta ou política aprovada neste conjunto.
5. Definir bibliotecas complementares do frontend, CD e licença.
6. Detalhar política de versões da API, retenção/expurgo e protocolos de integração.

Esses pontos não invalidam as escolhas já feitas, mas limitam o quanto se pode considerar a arquitetura pronta para implementação e operação.

## Uso no repositório

Copiar este diretório para `docs/adr/`. Os links entre documentos são relativos e funcionam após a extração do ZIP.

Ao mudar uma decisão aceita, criar outra ADR com novo número e indicar a substituição em ambas. Ao concluir uma pendência ou POC, registrar evidências e a data da alteração de status. Preservar o histórico de decisões em vez de reescrevê-lo como se a escolha sempre tivesse sido a mesma.

Requisitos detalhados dos módulos — como estados de despesas, parcelamento e recorrência — pertencem à documentação de domínio. Foram mantidos fora deste conjunto para não transformar regras operacionais em decisões de arquitetura.


## Refinamento da primeira entrega

Em 2026-11-06, a ADR-0023 substitui parcialmente a ADR-0010 para a Alpha 1. Naquele refinamento, a aprovação de políticas de acesso não aceitava automaticamente o Better Auth. Após a revisão da POC #5 e aprovação do mantenedor em 2026-11-06, a ADR-0008 passa a Aceita para a Alpha 1, limitada à versão e às adaptações demonstradas no PR #22.
