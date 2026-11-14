# Urukum — Relação com a arquitetura

| ADR | Aplicação |
| --- | --- |
| [0001](../../adr/0001-arquitetura-monolito-modular.md) e [0002](../../adr/0002-monorepo-pnpm.md) | Módulo interno do monólito, no monorepo pnpm, com limites explícitos |
| [0003](../../adr/0003-backend-fastify-typescript.md) e [0004](../../adr/0004-frontend-react-typescript-vite.md) | Fastify/TypeScript e React/TypeScript/Vite para notas/contextos |
| [0005](../../adr/0005-banco-postgresql.md) e [0006](../../adr/0006-drizzle-migracoes.md) | PostgreSQL e Drizzle ORM/Kit; schema de notas, versões e preferências a implementar |
| [0007](../../adr/0007-contratos-typebox-openapi.md) | Contratos TypeBox/OpenAPI 3.1, incluindo conteúdo, estado, contexto e autorização |
| [0008](../../adr/0008-autenticacao-better-auth.md) e [0009](../../adr/0009-nucleos-autorizacao.md) | Identidade comum e isolamento; Better Auth segue condicionado à POC |
| [0010](../../adr/0010-ciclo-dados-exportacao.md) | Exclusão lógica, recuperação e exportação; conciliar adiamento de auditoria com versões exigidas |
| [0013](../../adr/0013-testes-vitest-playwright.md) a [0015](../../adr/0015-ci-github-actions.md) | Vitest/Playwright, qualidade estática e CI para contratos, regras e fluxos |
| [0016](../../adr/0016-deploy-compose-multiarch.md) a [0019](../../adr/0019-web-pwa-integracoes.md) | Mesma operação Compose amd64/arm64, Caddy, Pino e PWA online |
| [0020](../../adr/0020-bibliotecas-frontend.md) a [0022](../../adr/0022-licenca.md) | Bibliotecas complementares, CD e licença continuam pendentes |

ADR-0011 não acrescenta anexos às notas. ADR-0012 pode apoiar expurgo conforme política global quando necessário, mas não cria lembretes ou notificações para Urukum.

## Responsabilidades propostas

Urukum controla nota, tags, estado, versão e preferências individuais. Plataforma fornece identidade, contextos, papéis e ciclo comum de dados. Editor pode ser componente comum, preservando independência funcional dos módulos.

Separar persistência de conteúdo compartilhado das preferências por usuário. Nova versão deve representar edição da nota sem vazar organização individual. Duplicação deve criar nova identidade e histórico próprio, sem compartilhar objeto mutável de conteúdo com original.

Essas orientações não fixam tabelas, tipo de armazenamento do editor, lock, event sourcing ou biblioteca. Snapshot completo não exige um motor distribuído de documentos nem CRDT.

## Contratos a especificar

Cadastro/edição, tags e associação, busca/filtros/ordenação, preferências individuais, duplicação, arquivamento/desarquivamento, histórico somente leitura, exclusão/lixeira/restauração e retenção. Definir quem pode alterar o quê por contexto antes de publicar API.

## Verificação proposta

Vitest pode verificar estado, snapshots, isolamento e duplicação; Playwright pode validar preferências distintas de dois usuários, filtros com fixadas, consulta de versão e restauração ativa. Testar concorrência de edição e perda de acesso quando implementados. Não há código de aplicação ou testes novos nesta entrega.
