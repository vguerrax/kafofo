# Kapanga — Relação com a arquitetura

## ADRs aplicáveis

| ADR | Aplicação |
| --- | --- |
| [0001](../../adr/0001-arquitetura-monolito-modular.md) | Módulo interno do monólito; contratos explícitos e independência lógica |
| [0002](../../adr/0002-monorepo-pnpm.md) | Frontend, backend e contratos no monorepo pnpm; pacotes exatos não definidos |
| [0003](../../adr/0003-backend-fastify-typescript.md) | Regras financeiras no backend Fastify/TypeScript |
| [0004](../../adr/0004-frontend-react-typescript-vite.md) | Interface React/TypeScript/Vite integrada ao contexto |
| [0005](../../adr/0005-banco-postgresql.md) e [0006](../../adr/0006-drizzle-migracoes.md) | PostgreSQL com Drizzle ORM/Kit; schema e migrações a implementar |
| [0007](../../adr/0007-contratos-typebox-openapi.md) | Schemas TypeBox e OpenAPI 3.1; valores, estados e contexto precisam de contratos verificáveis |
| [0008](../../adr/0008-autenticacao-better-auth.md) e [0009](../../adr/0009-nucleos-autorizacao.md) | Identidade comum e autorização contextual; Better Auth segue condicionado à POC |
| [0010](../../adr/0010-ciclo-dados-exportacao.md) | Exclusão lógica/exportação; divergências de retenção e auditoria precisam de revisão explícita |
| [0012](../../adr/0012-processamento-assincrono.md) | Geração assíncrona inicialmente no Fastify com persistência PostgreSQL; sem broker obrigatório |
| [0013](../../adr/0013-testes-vitest-playwright.md) a [0015](../../adr/0015-ci-github-actions.md) | Vitest, Playwright, qualidade estática e contratos verificados no CI |
| [0016](../../adr/0016-deploy-compose-multiarch.md) a [0018](../../adr/0018-logs-pino.md) | Mesma implantação Compose amd64/arm64, proxy Caddy e logs Pino; sem serviço financeiro separado obrigatório |
| [0019](../../adr/0019-web-pwa-integracoes.md) | Web/PWA online no MVP e integrações externas sem obrigar migração |
| [0020](../../adr/0020-bibliotecas-frontend.md) a [0022](../../adr/0022-licenca.md) | Bibliotecas complementares, CD e licença continuam pendentes; Kapanga não fecha essas escolhas |

ADR-0011 não cria armazenamento de comprovantes: anexos continuam fora do escopo do módulo.

## Limites internos propostos

| Responsabilidade do Kapanga | Contrato externo a respeitar |
| --- | --- |
| Despesas, pagamento e reversão | Identidade e autorização fornecidas pela plataforma; regras financeiras validadas no módulo |
| Recorrências e parcelas | Persistência e processamento comuns; deduplicação e encerramento consistentes |
| Categorias e formas de pagamento | Isolamento do contexto; administração conforme matriz conhecida |
| Exclusão/restauração | Política comum de ciclo de dados sem perder histórico financeiro |
| Indicadores | Dados tipados e autorizados para consulta própria e Okape |
| Auditoria e exportação | Eventos e dados de domínio delimitados; não depender exclusivamente de logs operacionais |

A divisão é uma proposta de responsabilidades, não estrutura de pastas de código aprovada. Não cria microsserviço, event sourcing, contabilidade por partidas dobradas ou um motor financeiro genérico.

## Contratos a especificar

Cadastro e edição de despesa; confirmação de pagamento; reversão com motivo; exclusão individual e de cadeia; restauração seletiva; configuração/encerramento de recorrência; criação de parcelamento; filtros e agregados contextuais; exportação pessoal.

A lista organiza capacidades existentes, sem fixar URLs, verbos HTTP, códigos de erro ou contratos ainda inexistentes. A semântica de cancelamento e das transições não fechadas deve ser resolvida antes de publicar seus contratos.

## Persistência e execução — propostas técnicas

Manter origens/vínculos explícitos, separar situação financeira de exclusão lógica e não contar o original do parcelamento como nova despesa. Definir restrições de unicidade para geração e estratégia transacional para estado/auditoria. Proteger campos pagos no backend, inclusive em alterações de configuração e operações em lote.

Esses são pontos de implementação derivados; mecanismo físico, transações por registro ou por lote, política de retomada e schema final ainda requerem refinamento.
