# Kitanda — Relação com a arquitetura

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


| ADR | Aplicação |
| --- | --- |
| [0001](../../adr/0001-arquitetura-monolito-modular.md) e [0002](../../adr/0002-monorepo-pnpm.md) | Módulo interno do monólito no monorepo pnpm, com contratos explícitos |
| [0003](../../adr/0003-backend-fastify-typescript.md) e [0004](../../adr/0004-frontend-react-typescript-vite.md) | Backend Fastify/TypeScript e frontend React/TypeScript/Vite integrado |
| [0005](../../adr/0005-banco-postgresql.md) e [0006](../../adr/0006-drizzle-migracoes.md) | PostgreSQL e Drizzle ORM/Kit para listas, itens, vínculos e histórico |
| [0007](../../adr/0007-contratos-typebox-openapi.md) | Schemas TypeBox e OpenAPI 3.1; metadados/compartilhamento definidos na #11, demais operações nos incrementos correspondentes |
| [0008](../../adr/0008-autenticacao-better-auth.md) e [0009](../../adr/0009-nucleos-autorizacao.md) | Identidade comum e autorização contextual; Better Auth/adaptador 1.7.18 aceitos para Alpha 1 com as adaptações da ADR-0008 |
| [0010](../../adr/0010-ciclo-dados-exportacao.md) | Exclusão lógica, retenção e exportação; conflito com adiamento de auditoria de módulo registrado |
| [0012](../../adr/0012-processamento-assincrono.md) | Serviço comum de processamento quando necessário; não cria recorrência automática de listas |
| [0013](../../adr/0013-testes-vitest-playwright.md) a [0015](../../adr/0015-ci-github-actions.md) | Vitest, Playwright e CI para regras, contratos e fluxos relevantes |
| [0016](../../adr/0016-deploy-compose-multiarch.md) a [0019](../../adr/0019-web-pwa-integracoes.md) | Mesma operação Compose amd64/arm64, Caddy, Pino e PWA online da plataforma |
| [0020](../../adr/0020-bibliotecas-frontend.md) a [0022](../../adr/0022-licenca.md) | Bibliotecas complementares, CD e licença continuam pendentes |

## Responsabilidades propostas

Kitanda controla lista, item, situação de compra, duplicidades, ordem compartilhada, histórico e cálculo de progresso. Plataforma fornece conta, contexto, papéis, ativação, canais e ciclo de dados. Não acessar internamente dados de outros módulos para montar catálogo de produtos ou informações financeiras.

## Contratos a detalhar

Gerenciamento de listas/itens; concessão e revogação de compartilhamento; identificação e consolidação opcional de duplicados; marcação/desmarcação; ordenação; limpar comprados; esvaziar; excluir/restaurar lista; pesquisar/filtrar; resumo e histórico.

A lista organiza capacidades existentes, sem fixar endpoints, verbos HTTP, códigos de erro ou pacotes. Atualização compartilhada exige escolha técnica; WebSocket, SSE, polling e infraestrutura adicional não foram aprovados por esta documentação.

## Integridade e verificação derivadas

Mutação e histórico precisam de consistência. Soma opcional não deve perder alterações concorrentes; limpeza precisa de política para alterações feitas entre confirmação e execução; reordenação deve evitar duplicar/perder posições visíveis. Transações, controle de versão e mecanismos exatos ficam para refinamento.

Vitest pode cobrir cálculo, regras e persistência; Playwright pode verificar compartilhamento, marcação, confirmações e contexto. Os cenários do MVP não comprovam implementação ou execução; evidências permanecem nas Issues e PRs. A ADR-0011 não cria obrigação de anexos na lista.

## Integração de listas da Alpha 1

A [#11](https://github.com/vguerrax/kafofo/issues/11) introduz o namespace SQL `kitanda`, com listas e compartilhamentos. Não representa isolamento de tenants por schema: a residência e as concessões atuais continuam sendo verificadas no backend. A migração sucessora acrescenta também uma chave composta à concessão residencial da plataforma para impedir FKs cruzadas.

O módulo usa somente a interface interna pública `platform/public.ts` para escopo autenticado, serialização, candidatos e referências de integridade. Não importa implementações internas de autenticação ou contextos. Kitanda mantém seus dados, validação e política comum em seu módulo; `createListAccess` combina essa política com o escopo da plataforma e deve proteger futuras operações das #12–15. Contratos HTTP ficam em `@kafofo/contracts`; frontend não importa o backend. As rotas de metadados e compartilhamentos constam no OpenAPI.
