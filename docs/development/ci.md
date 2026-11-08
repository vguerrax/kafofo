# Integração contínua

O workflow [CI](../../.github/workflows/ci.yml), implementado na issue #6 conforme a [ADR-0015](../adr/0015-ci-github-actions.md), executa em todos os pull requests e em pushes para `develop`. Não há filtros por caminhos: uma alteração somente documental também recebe os checks previstos para integração.

## Checks para integração

| Check                    | Verificações                                                                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Qualidade`              | Instalação com lockfile fixado; lint, formatação, TypeScript estrito, testes unitários, build e OpenAPI por `pnpm check`                                                           |
| `Integração e navegador` | PostgreSQL 17 descartável; migrações/reexecução; integração da autenticação do produto e da POC; Chromium na fundação, no produto e na POC, com autenticação em HTTP e HTTPS local |

Ambos devem passar no commit proposto antes da integração, além da revisão. Qualquer comando que falhe interrompe seu job; não há `continue-on-error`. Timeout e cancelamento de uma execução antiga não equivalem a aprovação. O CI não publica versões nem encerra issues.

A exigência automática de checks depende de uma regra de proteção/ruleset de `develop`, configurada pelo mantenedor no GitHub. Este workflow **não altera essa política de acesso**. Na regra, selecione `Qualidade` e `Integração e navegador` depois que aparecerem na primeira execução; não confundir documentação de exigência com bloqueio já ativado. Renomear esses checks requer ajustar a regra. Restrições de plano ou de permissões do repositório devem ser conferidas pelo mantenedor.

## Forks e permissões

O evento é `pull_request`, sem `pull_request_target` ou execução privilegiada por `workflow_run`. O token tem somente `contents: read`, e o checkout não persiste credenciais. Os jobs usam runners hospedados descartáveis, sem segredos do repositório, ambientes de produção ou acesso de escrita. Ações são fixadas por SHA; revise novas versões antes de trocar esses commits. Não há cache ou publicação de artefatos com arquivos de banco, cookies, links ou chaves da POC.

O GitHub pode exigir aprovação do mantenedor para iniciar workflows de contribuidores externos, conforme as configurações de Actions. Isso é uma autorização de execução no runner, sem conceder segredos ou privilégios adicionais. A compatibilidade com forks deve ser confirmada com um PR real de fork; um PR interno não comprova essa condição.

## Isolamento e reprodução local

Cada execução de integração recebe um PostgreSQL 17 novo, sem volume persistente. A fundação usa `kafofo_test`; a POC usa `kafofo_auth_poc`, com schema e migrações próprios. A autenticação do produto usa `kafofo_auth_test`, exclusivo e descartável, configurado em `AUTH_TEST_DATABASE_URL`. Suas suítes limpam as tabelas de autenticação para testar o primeiro acesso e não podem compartilhar dados reais ou executar simultaneamente contra esse banco. A credencial SQL do workflow serve somente ao serviço descartável. Segredos do produto e da POC são independentes, aleatórios por execução e mascarados. Nenhuma credencial operacional deve ser usada nesses testes.

Com Node 24, pnpm fixado em `packageManager`, PostgreSQL 17 e Chromium disponíveis, execute na raiz:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:db
pnpm --filter @kafofo/auth-poc test:integration
pnpm --filter @kafofo/api test:auth
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
pnpm --filter @kafofo/auth-poc test:e2e
pnpm test:auth:e2e
```

Configure previamente `TEST_DATABASE_URL`, `AUTH_TEST_DATABASE_URL`, `POC_DATABASE_URL` e `POC_AUTH_SECRET`, conforme os guias de [desenvolvimento](README.md) e do [laboratório](../../pocs/auth/README.md). Esses comandos não criam os bancos locais. O navegador do produto gera segredo descartável se ausente e inicia API/Vite nas portas exclusivas 4407/5407. Aplique as instruções de cada guia para repetir os percursos HTTPS com certificado temporário; o CI executa ambos. Execute testes de cada banco sequencialmente, sem compartilhar com uma sessão manual em uso. Traces, vídeos e screenshots da autenticação do produto estão desabilitados; não publicar segredos como artefatos.

O check de qualidade inclui os testes unitários da POC; banco e navegador são comandos separados. HTTPS local verifica cookies/transporte no experimento, sem comprovar Caddy ou implantação real. Os limites da conclusão da POC e as regressões de atualização permanecem na [ADR-0008](../adr/0008-autenticacao-better-auth.md).

A #8 acrescenta integração e navegador de núcleos/residências: `pnpm --filter @kafofo/api test:contexts` e `pnpm test:contexts:e2e`, com PostgreSQL exclusivo `kafofo_context_test` em `CONTEXT_TEST_DATABASE_URL`. O navegador roda em HTTP e HTTPS local, sem compartilhar o banco da #7/POC ou capturar segredos.

A #9 acrescenta `pnpm --filter @kafofo/api test:invitations` e `pnpm test:invitations:e2e`, com banco exclusivo `kafofo_invitation_test` em `INVITATION_TEST_DATABASE_URL`. O CI executa integração e navegador em HTTP/HTTPS local; os servidores usam portas 4409/5409, sem capturas de segredos.

A #10 acrescenta integração de recuperação e navegador HTTP/HTTPS: `pnpm --filter @kafofo/api test:recovery` e `pnpm test:recovery:e2e`. O banco exclusivo `kafofo_recovery_test` é configurado em `RECOVERY_TEST_DATABASE_URL`. Servidores usam 4410/5410 e não capturam segredos. A suíte de integração testa também o comando local, sem usar o banco do produto.

A #11 acrescenta `pnpm --filter @kafofo/api test:kitanda` e `pnpm test:kitanda:e2e`, em PostgreSQL exclusivo `kafofo_kitanda_test` configurado por `KITANDA_TEST_DATABASE_URL`. O CI executa integração e percursos HTTP/HTTPS em 4411/5411, além das regressões da plataforma. Capturas de conteúdo e segredos ficam desabilitadas.
