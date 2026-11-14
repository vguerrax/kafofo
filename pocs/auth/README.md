# Laboratório de autenticação

Experimento reproduzível da [issue #5](https://github.com/vguerrax/kafofo/issues/5), conforme o refinamento aprovado nessa issue. Não integra as rotas da API nem a interface normal do Kafofo. A decisão e seus limites ficam na [ADR-0008](../../docs/adr/0008-autenticacao-better-auth.md); regras funcionais na [Alpha 1](../../docs/domain/platform/alpha-1.md).

## Resultado da decisão

A revisão da POC foi aceita pelo mantenedor em 2026-11-06: Better Auth/adaptador 1.7.18 são viáveis para a Alpha 1 com a camada de adaptação demonstrada. A ADR-0008 registra a decisão, as obrigações de manutenção e as validações restantes da implementação. Esta aceitação não entrega autenticação às aplicações normais.

## Preparação

Usar Node 24.x, pnpm 11.25.0, PostgreSQL 17 e Chromium do Playwright. Better Auth e seu adaptador Drizzle estão fixados em **1.7.18**. As versões da fundação foram preservadas; o lockfile inclui a resolução dos novos peers transitivos.

```bash
pnpm install --frozen-lockfile
cp pocs/auth/.env.example pocs/auth/.env
```

Configure `POC_AUTH_SECRET` com segredo aleatório de pelo menos 32 caracteres e `POC_DATABASE_URL` com banco **exclusivo**, cujo nome termine em `_auth_poc`. Por precaução, o nome não pode coincidir com o de banco normal/teste informado ao processo, mesmo por outro alias de host/porta. Não usar dados reais. Uma opção temporária, sem volume persistente, é:

```bash
docker run --rm --detach --name kafofo-auth-poc-db \
  --publish 127.0.0.1:55405:5432 \
  --env POSTGRES_USER=poc --env POSTGRES_DB=kafofo_auth_poc \
  --env POSTGRES_HOST_AUTH_METHOD=trust postgres:17
pnpm --filter @kafofo/auth-poc db:migrate
```

Esse container aceita conexão local sem senha, exclusivamente para o laboratório com contas fictícias. Outro PostgreSQL 17 pode ser usado com credenciais próprias. O servidor não migra automaticamente. Migrações e metadados são exclusivos de `auth_poc`/`auth_poc_migrations`; a segunda migração explicita timestamps com fuso. PostgreSQL do exemplo usa UTC.

## Verificação reproduzível

Executar sequencialmente, sem outra instância usando esse banco:

```bash
pnpm --filter @kafofo/auth-poc test
pnpm --filter @kafofo/auth-poc test:integration
pnpm exec playwright install chromium
pnpm --filter @kafofo/auth-poc test:e2e
pnpm check
```

Os testes de integração aplicam/reaplicam migrações e criam contas fictícias com identificadores únicos. O cenário de bootstrap limpa **somente** o registro singleton de bootstrap desse banco para repetir a prova. A injeção de falha cria e remove um trigger temporário no schema do laboratório. Não executar os testes contra uma sessão manual em uso. Os limites por origem usam endereços sintéticos exclusivos por execução para evitar que avanços de relógio de um teste afetem os seguintes. Contas/evidências sintéticas permanecem no banco até descarte do container.

O percurso de navegador inicia API em `127.0.0.1:4505` e Vite em `127.0.0.1:5505`, sem reutilizar serviços existentes. Cria sua própria conta e demonstra login, cookie, recuperação e revogação. É possível selecionar Chromium com `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Para provar `Secure` com HTTPS real no navegador:

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout /tmp/kafofo-auth-poc-key.pem -out /tmp/kafofo-auth-poc-cert.pem \
  -days 1 -subj /CN=127.0.0.1 -addext subjectAltName=IP:127.0.0.1
POC_TLS_CERT=/tmp/kafofo-auth-poc-cert.pem \
POC_TLS_KEY=/tmp/kafofo-auth-poc-key.pem \
pnpm --filter @kafofo/auth-poc test:e2e
```

Playwright aceita o certificado local apenas nesse experimento. Não é evidência de implantação Caddy/TLS em produção. Traces, screenshots e vídeos ficam desabilitados para não capturar credenciais ou links.

## Operação manual

Em dois terminais, execute `pnpm --filter @kafofo/auth-poc serve` e `pnpm --filter @kafofo/auth-poc client`. Abra `http://127.0.0.1:5505`. As contas fictícias criadas pelos testes são descartáveis; criar outras contas internas só é permitido pelo código do laboratório ou pelo bootstrap, não existe cadastro livre HTTP.

```bash
pnpm --filter @kafofo/auth-poc operator bootstrap-code
pnpm --filter @kafofo/auth-poc operator recover <username-do-administrador-global>
```

O primeiro comando emite/reemite o código inicial. Seu consumo é demonstrado nos testes pelo serviço `bootstrap` e pelo endpoint `POST /lab/bootstrap` com `token`, `username` e `password`; não há tela de configuração inicial nesta POC. O segundo comando devolve um link para o titular definir a senha na interface. O operador local só recupera administrador global; o administrador global autenticado usa `POST /lab/recovery` com `userId` para outra conta. Administrador de núcleo e pessoa comum são recusados. O administrador entrega o link manualmente após verificar a identidade; nunca escolhe a senha.

A saída explícita do comando local e a resposta administrativa contêm o segredo destinado à entrega. Não encaminhar essas saídas a logs ou anexos. Senhas não são argumentos do comando local. Tokens são colocados no fragmento do link; o frontend os envia no corpo de POST e remove o fragmento após sucesso. Logs HTTP e da biblioteca estão desabilitados. O registro demonstrativo de auditoria guarda ação, ator, alvo e momento, sem segredo. Não implementa a retenção/auditoria definitiva da #15.

## Evidências e adaptações

| Contrato                    | Mecanismo e evidência                                                                                                                                                                                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Username sem e-mail pessoal | Username plugin; servidor gera UUID sob `.invalid`, sem SMTP/verificação; projeção pública não expõe esse campo. Testes de login em caixa diferente, colisão concorrente e limites.                                                                                                                             |
| Unicidade global            | Canonização ASCII em minúsculas e constraint SQL única. 3–30 caracteres, letras/números/ponto/hífen/sublinhado; espaços e acentos recusados. Nome de exibição separado.                                                                                                                                         |
| Senha                       | Hash/verificação nativos; validação local de 8–128 unidades UTF-16, sem whitespace, sem trim/truncamento/composição obrigatória. Testes de limites e controles. A contagem de caracteres segue a API JavaScript da biblioteca; graphemes Unicode não são contados separadamente.                                |
| Sessões                     | Sete dias, `disableSessionRefresh`, sem cookie cache. Relógio controlado prova atividade depois de dois dias e os instantes antes/no vencimento. Guarda local recusa `expiresAt <= agora`; a biblioteca sozinha aceita o instante de igualdade.                                                                 |
| Troca autenticada           | Exige senha atual; Better Auth revoga/rotaciona cookies. Adaptador mantém o prazo absoluto original no banco e encaminha todos os `Set-Cookie`. Outro navegador perde acesso; o atual recebe cookie substituto.                                                                                                 |
| Recuperação                 | API nativa de reset com callback local e revogação; transação externa PostgreSQL usa a mesma conexão Drizzle. Estado local serializa emissão/uso, invalida reemissão e a quinta senha inválida; limite de três emissões/hora. Testes concorrentes e trigger de falha comprovam rollback de senha/token/sessões. |
| Administração/local         | Papéis fictícios persistidos no banco; autorização no servidor; comando local real testado por subprocesso. Não há rota HTTP de operador.                                                                                                                                                                       |
| Tentativas                  | Contadores PostgreSQL e locks transacionais: cinco falhas/conta em 15 min, suspensão de 15 min; 60 tentativas/origem/min entre contas. Sessões válidas sobrevivem. Nova instância lê a suspensão persistida.                                                                                                    |
| Tokens desconhecidos        | Limite adicional experimental de 30 POSTs de reset/origem/min; bootstrap, dez/origem/min. Proxy não é confiado: origem é o peer da conexão, nunca `X-Forwarded-For`. Produção precisa configurar a cadeia Caddy expressamente.                                                                                  |
| Cookies/origem              | HTTP e HTTPS Chromium verificam `HttpOnly`, `SameSite=Lax` e `Secure` conforme o transporte; sem `Domain` de compartilhamento. Mutação exige `Origin` exata e recusa `Sec-Fetch-Site: cross-site`. Não há CORS aberto.                                                                                          |
| Superfícies alternativas    | Handler genérico nativo não é montado. Somente `/lab/*` explícitos; cadastro, e-mail, reset e update-user nativos recebem 404. Redirect de recuperação é fixo.                                                                                                                                                  |
| Bootstrap                   | Transação externa e lock singleton: código de uso único, 30 min, reemissão e uma criação concorrente. Não cria núcleo/residência.                                                                                                                                                                               |

Os contratos executáveis estão em [policies.test.ts](tests/policies.test.ts), [lab.integration.test.ts](tests/lab.integration.test.ts) e [browser.spec.ts](tests/browser.spec.ts). Comandos e resultados exatos da execução ficam na issue/PR; não existe cópia local do status do trabalho.

O adaptador da biblioteca usa `transaction: false` **porque as operações compostas do laboratório já estão dentro de uma transação externa com `PoolClient`**. Copiar essa configuração para operações sem essa transação perde a garantia demonstrada. Login, troca e recuperação usam o mesmo lock por conta. A revogação do logout é uma operação simples. Não chamar diretamente as APIs mutáveis de `createAuth` fora dos serviços demonstrados.

A limpeza de verificações antigas na reemissão depende do schema/identificador `reset-password:` da versão fixada. É acoplamento explícito a revalidar em upgrade. A solução tem adaptações próprias; instalar Better Auth com os defaults não entrega o contrato do Kafofo.

## Limites da conclusão

Viabilidade de autenticação no laboratório não comprova autorização contextual, convites, criação real de núcleos/residências, auditoria completa, retenção, recuperação operacional de backups ou homologação Alpha 1. Não foi feita auditoria criptográfica, teste de carga, análise de canais laterais ou teste de proxy real. Nenhum segredo/conta da POC deve ser migrado ao produto. Adaptações devem ser revisitadas nas #7/#10; não importar este laboratório inteiro como implementação definitiva.

Fontes primárias: [Username](https://better-auth.com/docs/plugins/username), [sessões](https://better-auth.com/docs/concepts/session-management), [senha/reset](https://better-auth.com/docs/authentication/email-password), [Drizzle](https://better-auth.com/docs/adapters/drizzle) e [Fastify](https://better-auth.com/docs/integrations/fastify). O código instalado e fixado em 1.7.18 foi inspecionado para rotação de sessão e consumo do token; documentação corrente não substitui os testes dessa versão.
