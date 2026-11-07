# Desenvolvimento local

Esta fundação implementa a estrutura da issue #4: API mínima, frontend inicial, contratos e ferramentas. Não implementa autenticação, núcleos ou listas. Better Auth/adaptador 1.7.18 foram aceitos para a Alpha 1 após a POC #5, com as adaptações e limites da [ADR-0008](../adr/0008-autenticacao-better-auth.md). A integração à aplicação permanece nas tarefas correspondentes.

O [laboratório de autenticação da #5](../../pocs/auth/README.md) possui banco, migrações, servidor, interface e verificações próprios. `pnpm dev` não inicia o laboratório; a API normal não recebe suas rotas. Testes de banco/navegador da POC são explícitos; suas verificações unitárias, tipos e build participam de `pnpm check`.

## Requisitos

- Node.js 24.x, conforme `.node-version` e `.nvmrc`.
- pnpm 11.25.0, fixado em `packageManager`. Com Corepack disponível: `corepack enable` e `corepack install`.
- PostgreSQL 17 para o ambiente de desenvolvimento, instalado localmente ou pelo Compose abaixo.
- Docker Compose apenas se optar pelo serviço de banco fornecido. Não há dependência de Docker para executar a API ou os testes de contrato.

Instale dependências na raiz:

```bash
pnpm install --frozen-lockfile
```

TypeScript 6.0 é usado por compatibilidade com a versão fixada do typescript-eslint; versões resolvidas constam no lockfile. Não atualizar ferramentas implicitamente. Hooks Husky executam lint-staged em arquivos preparados para commit. Hooks não substituem as verificações do [CI](ci.md).

## PostgreSQL e variáveis

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Preencha `POSTGRES_PASSWORD` no `.env` da raiz e `DATABASE_URL` no `apps/api/.env` com a conexão correspondente. Não commitar esses arquivos. Usuário, senha, host, porta e banco da URL devem corresponder ao seu ambiente; caracteres reservados nas credenciais precisam de codificação de URL. Nenhuma senha operacional é fornecida pelo repositório.

```bash
docker compose -f compose.dev.yaml up -d db
pnpm db:migrate
pnpm dev
```

O Compose publica PostgreSQL somente em loopback, com volume persistente. É ferramenta local, não implantação de produção. Evite apagar o volume se houver dados que queira preservar.

Interface: `http://127.0.0.1:5304`. API: `http://127.0.0.1:4304`. Vite encaminha `/api` ao backend; não é necessário habilitar CORS irrestrito. Se alterar a porta da API, informe `API_PROXY_TARGET` ao iniciar o frontend. `HOST`, `PORT`, `LOG_LEVEL` e `DATABASE_URL` são variáveis de servidor; não usar prefixo `VITE_` para segredos.

| Endpoint            | Significado                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `/api/health`       | Liveness do processo; funciona sem banco                             |
| `/api/ready`        | Verifica conexão PostgreSQL; retorna 503 quando ausente/indisponível |
| `/api/openapi.json` | Documento OpenAPI 3.1 gerado dos schemas das rotas                   |

Readiness de conexão não comprova migrações aplicadas, permissões, autenticação ou conclusão do produto. Sem `DATABASE_URL`, a API inicia para desenvolvimento/contratos, mas readiness permanece 503. Com URL inválida, configuração é recusada sem repetir credenciais no erro.

## Estrutura e limites

| Caminho                         | Responsabilidade                                                        |
| ------------------------------- | ----------------------------------------------------------------------- |
| `apps/api/src/modules/platform` | Rotas e serviços do módulo de plataforma                                |
| `apps/api/src/database`         | Pool PostgreSQL, Drizzle e comandos explícitos de migração/verificação  |
| `apps/web/src`                  | Aplicação React única                                                   |
| `packages/contracts/src`        | Schemas TypeBox e tipos públicos da API, sem banco ou regras de domínio |
| `tests/e2e`                     | Percursos no navegador por Playwright                                   |

Frontend importa somente contratos públicos; não importa código interno da API. `exports` limita a superfície do pacote compartilhado e o lint rejeita imports conhecidos de internals. Essa regra é uma proteção inicial, não prova de isolamento entre módulos futuros; revisar dependências a cada módulo introduzido. Não criar um pacote compartilhado genérico com todas as regras de negócio.

O namespace SQL `platform` é organização de módulo, não isolamento de tenants. As tabelas de identidade e domínio serão criadas pelas respectivas tarefas após a POC e o refinamento técnico. Não há tabela fictícia de usuários ou núcleo nesta fundação.

## Migrações

Migrações versionadas ficam em `apps/api/drizzle`. A primeira migração cria apenas o namespace `platform`, gerado a partir do schema exportado pelo Drizzle Kit; SQL e snapshot são revisados no Git. A API nunca executa migração automaticamente e nenhum comando de inicialização chama `drizzle-kit push`.

Ao alterar o schema:

```bash
pnpm db:generate
# Revise o SQL e os metadados gerados antes de aplicar.
pnpm db:migrate
```

Para uma migração SQL customizada:

```bash
pnpm --filter @kafofo/api exec drizzle-kit generate --custom --name=nome-da-migracao
```

Edite somente a migração nova antes de aplicá-la. Não reescreva SQL já distribuído; crie migração sucessora. Drizzle registra migrações executadas para evitar reaplicação. Faça backup e planeje recuperação antes de qualquer migração destrutiva; a ferramenta não torna alterações reversíveis automaticamente.

## Verificações

O [guia de CI](ci.md) descreve os checks de pull requests, o isolamento dos testes e os comandos locais equivalentes.

```bash
pnpm check
```

Executa lint, formatação, tipos, testes Vitest, build e validação OpenAPI. Não inclui PostgreSQL ou navegador, que têm comandos explícitos:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright inicia API na porta 4404 e Vite na porta 5404, com proxy para essa API, e testa conexão real entre frontend/backend, layout móvel e recuperação de erro por teclado. Os testes usam servidores exclusivos e falham se as portas estiverem ocupadas, sem reutilizar serviços existentes. Assim, podem executar junto ao desenvolvimento nas portas 4304/5304. Esse teste não exige banco porque usa liveness; não constitui homologação funcional da Alpha 1.

Crie um banco separado para verificar PostgreSQL, por exemplo com o serviço de desenvolvimento:

```bash
docker compose -f compose.dev.yaml exec db createdb -U kafofo kafofo_test
```

Configure `TEST_DATABASE_URL` em `apps/api/.env` apontando para ele e execute:

```bash
pnpm test:db
```

Esse comando exige configuração explícita, aplica migrações, executa novamente verificando ausência de duplicação e confere namespace/conectividade. Não exclui tabelas nem limpa o banco. Se ele já existir, não é necessário executar `createdb` novamente. Use um banco de teste separado e não uma base com dados de uso real.

## Build e contratos

```bash
pnpm build
pnpm --filter @kafofo/api start
pnpm openapi:check
```

`pnpm build` respeita a ordem dos pacotes: contratos antes das aplicações. Para executar diretamente um pacote a partir de um checkout limpo, construa os contratos primeiro. Em desenvolvimento, `pnpm dev` faz esse build inicial e observa os três pacotes.

OpenAPI é gerado das mesmas rotas/schemas usados na validação, em `artifacts/openapi.json`, e validado pelo Redocly. O arquivo gerado não é outra fonte editável de contratos nem é versionado. Não há versão de API pública aprovada por esta fundação; `0.0.0` identifica somente o scaffold.

Logs Pino usam nível configurável. Serializadores de requisição não incluem URL, cabeçalhos ou corpo; erros internos não expõem mensagem/stack potencialmente sensível; campos conhecidos de segredo recebem redação. Isso não permite registrar objetos arbitrários de domínio sem revisão. Logs técnicos não substituem a auditoria/histórico da #15. Retenção e rotação operacional serão implementadas na #16.
