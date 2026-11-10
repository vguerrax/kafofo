# Mutyrão — Relação com a arquitetura

| ADR | Aplicação |
| --- | --- |
| [0001](../../adr/0001-arquitetura-monolito-modular.md) e [0002](../../adr/0002-monorepo-pnpm.md) | Módulo interno do monólito modular no monorepo pnpm, com contratos explícitos |
| [0003](../../adr/0003-backend-fastify-typescript.md) e [0004](../../adr/0004-frontend-react-typescript-vite.md) | Fastify/TypeScript para regras e React/TypeScript/Vite para experiência integrada |
| [0005](../../adr/0005-banco-postgresql.md) e [0006](../../adr/0006-drizzle-migracoes.md) | PostgreSQL e Drizzle ORM/Kit; schema de tarefas, atribuições e histórico a implementar |
| [0007](../../adr/0007-contratos-typebox-openapi.md) | Schemas TypeBox/OpenAPI 3.1 para validação e contratos; não fixa rotas nesta documentação |
| [0008](../../adr/0008-autenticacao-better-auth.md) e [0009](../../adr/0009-nucleos-autorizacao.md) | Identidade comum e autorização por contexto; Better Auth condicionado à POC |
| [0010](../../adr/0010-ciclo-dados-exportacao.md) | Exclusão lógica e exportação; divergência sobre adiamento de histórico/auditoria registrada |
| [0012](../../adr/0012-processamento-assincrono.md) | Lembretes/alertas no processamento comum, inicialmente Fastify com persistência PostgreSQL |
| [0013](../../adr/0013-testes-vitest-playwright.md) a [0015](../../adr/0015-ci-github-actions.md) | Vitest, Playwright, qualidade e CI para contratos, regras e fluxos |
| [0016](../../adr/0016-deploy-compose-multiarch.md) a [0019](../../adr/0019-web-pwa-integracoes.md) | Compose amd64/arm64, Caddy, Pino e PWA online; sem serviço de tarefas separado obrigatório |
| [0020](../../adr/0020-bibliotecas-frontend.md) a [0022](../../adr/0022-licenca.md) | Bibliotecas complementares, CD e licença continuam pendentes |

ADR-0011 não cria anexos para tarefas: continuam fora do MVP.

## Responsabilidades propostas

Mutyrão controla tarefa, atribuições, estados, descrição/checklist, categorias, prazos e eventos. Plataforma fornece identidade, contexto, papéis, módulos, notificações e política comum de dados. Agendamento usa infraestrutura comum, com regras de destinatário e relevância definidas pelo domínio.

Não são exigidos microsserviço, motor de workflow, CRDT, broker externo ou ferramenta de gerenciamento de projetos. A decomposição é conceitual, sem impor pacotes ou estrutura física de código.

## Contratos a detalhar

Cadastro/edição; atribuição/remoção/substituição; compartilhamento; conclusão/cancelamento/reabertura; descrição e checkbox; exclusão/restauração; consulta/filtros/ordenação; categorias; lembrete individual; histórico e emissão de eventos de notificação.

Fechar status inicial, destino da reabertura e autorização antes de publicar esses contratos. Formato do conteúdo, data/horário de vencimento, erros e semântica de concorrência precisam de refinamento. Não criar rotas ou enums técnicos arbitrários apenas para preencher documentação.

## Validação técnica proposta

Vitest pode verificar regras, autorização contextual, atraso e persistência; Playwright pode validar atribuição compartilhada, ações com motivos, vistas e preferências individuais. Agendamentos exigem relógio controlável, testes de reinício e mudanças de acesso quando implementados. Não há código de aplicação ou testes novos nesta entrega.
