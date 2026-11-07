# Integração contínua

O workflow [CI](../../.github/workflows/ci.yml), implementado na issue #6 conforme a [ADR-0015](../adr/0015-ci-github-actions.md), executa em todos os pull requests e em pushes para `develop`. Não há filtros por caminhos: uma alteração somente documental também recebe os checks previstos para integração.

## Checks para integração

| Check                    | Verificações                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Qualidade`              | Instalação com lockfile fixado; lint, formatação, TypeScript estrito, testes unitários, build e OpenAPI por `pnpm check`                      |
| `Integração e navegador` | PostgreSQL 17 descartável; migrações/reexecução da fundação; integração da autenticação; Chromium na fundação e na POC, em HTTP e HTTPS local |

Ambos devem passar no commit proposto antes da integração, além da revisão. Qualquer comando que falhe interrompe seu job; não há `continue-on-error`. Timeout e cancelamento de uma execução antiga não equivalem a aprovação. O CI não publica versões nem encerra issues.

A exigência automática de checks depende de uma regra de proteção/ruleset de `develop`, configurada pelo mantenedor no GitHub. Este workflow **não altera essa política de acesso**. Na regra, selecione `Qualidade` e `Integração e navegador` depois que aparecerem na primeira execução; não confundir documentação de exigência com bloqueio já ativado. Renomear esses checks requer ajustar a regra. Restrições de plano ou de permissões do repositório devem ser conferidas pelo mantenedor.

## Forks e permissões

O evento é `pull_request`, sem `pull_request_target` ou execução privilegiada por `workflow_run`. O token tem somente `contents: read`, e o checkout não persiste credenciais. Os jobs usam runners hospedados descartáveis, sem segredos do repositório, ambientes de produção ou acesso de escrita. Ações são fixadas por SHA; revise novas versões antes de trocar esses commits. Não há cache ou publicação de artefatos com arquivos de banco, cookies, links ou chaves da POC.

O GitHub pode exigir aprovação do mantenedor para iniciar workflows de contribuidores externos, conforme as configurações de Actions. Isso é uma autorização de execução no runner, sem conceder segredos ou privilégios adicionais. A compatibilidade com forks deve ser confirmada com um PR real de fork; um PR interno não comprova essa condição.

## Isolamento e reprodução local

Cada execução de integração recebe um PostgreSQL 17 novo, sem volume persistente. A fundação usa `kafofo_test`; a POC usa `kafofo_auth_poc`, com schema e migrações próprios. A credencial SQL do workflow serve somente ao serviço descartável. O segredo da POC é aleatório por execução e mascarado. Nenhuma credencial operacional deve ser usada nesses testes.

Com Node 24, pnpm fixado em `packageManager`, PostgreSQL 17 e Chromium disponíveis, execute na raiz:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:db
pnpm --filter @kafofo/auth-poc test:integration
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
pnpm --filter @kafofo/auth-poc test:e2e
```

Configure previamente `TEST_DATABASE_URL` e o banco exclusivo `POC_DATABASE_URL`, além de `POC_AUTH_SECRET`, conforme os guias de [desenvolvimento](README.md) e do [laboratório](../../pocs/auth/README.md). Esses comandos não criam os bancos locais. Aplique as instruções do laboratório para o percurso HTTPS com certificado temporário. Execute os testes do laboratório sequencialmente, sem compartilhar seu banco com uma sessão manual em uso.

O check de qualidade inclui os testes unitários da POC; banco e navegador são comandos separados. HTTPS local verifica cookies/transporte no experimento, sem comprovar Caddy ou implantação real. Os limites da conclusão da POC e as regressões de atualização permanecem na [ADR-0008](../adr/0008-autenticacao-better-auth.md).
