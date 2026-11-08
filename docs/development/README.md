# Desenvolvimento local

Além da fundação da #4, a [#7](https://github.com/vguerrax/kafofo/issues/7) integra configuração inicial, login, sessão, logout e troca de senha na API e no frontend. A #8 acrescenta núcleos, residências e autorização contextual. A #9 acrescenta convites de núcleo; a #10 acrescenta recuperação de senha; a #11 acrescenta metadados e compartilhamento de listas de residência; a #12 acrescenta itens e progresso; a #13 acrescenta colaboração e conflitos; histórico e demais capacidades permanecem nas respectivas tarefas. Better Auth/adaptador 1.7.18 seguem as adaptações e os limites da [ADR-0008](../adr/0008-autenticacao-better-auth.md).

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

O namespace SQL `platform` é organização de módulo, não isolamento de tenants. A migração `0001` cria identidade, credenciais, sessões, verificações, singleton de configuração e limites de autenticação. Tabelas de domínio e autorização contextual pertencem às próximas tarefas. O produto não importa o laboratório de autenticação.

## Autenticação local

Para habilitar o acesso, configure em `apps/api/.env` `DATABASE_URL`, `AUTH_SECRET` com pelo menos 32 caracteres aleatórios e `AUTH_BASE_URL=http://127.0.0.1:5304`. Gere o segredo, por exemplo, com `openssl rand -hex 32`. Não o versione ou use prefixo `VITE_`. Em outro host, use origem HTTPS exata, sem path, query ou credenciais. Configuração parcial é recusada; sem autenticação configurada, health/OpenAPI permanecem disponíveis e `/api/auth/*` responde 503.

Depois de aplicar as migrações explicitamente, emita o código no terminal do operador:

```bash
pnpm --filter @kafofo/api auth:bootstrap
```

Esse comando imprime somente o código, com validade de 30 minutos e uso único. Reemissão invalida o anterior. Não encaminhe sua saída para logs. Abra a interface, preencha código, usuário e senha; após configurar, entre pelo login. O administrador ainda não possui núcleo/residência; criação desses contextos pertence à #8. Depois de configurar, o comando recusa nova emissão. Não apagar o singleton para reabrir cadastro; recuperação pertence à #10.

| Endpoint                  | Comportamento                                                  |
| ------------------------- | -------------------------------------------------------------- |
| `GET /api/auth/setup`     | Apenas informa se a instalação foi configurada                 |
| `POST /api/auth/setup`    | Consome código e cria administrador sem iniciar sessão         |
| `POST /api/auth/login`    | Usuário/senha, cookie e perfil público mínimo                  |
| `GET /api/auth/session`   | Própria conta e vencimento; 401 sem sessão vigente             |
| `POST /api/auth/logout`   | Revoga sessão atual e limpa cookie; idempotente                |
| `POST /api/auth/password` | Senha atual/nova; preserva prazo atual e revoga outras sessões |

Corpos e respostas constam em `/api/openapi.json`. Mutações exigem `Origin` exatamente igual a `AUTH_BASE_URL` e não permitem `Sec-Fetch-Site: cross-site`. Cookies são host-only, `HttpOnly`, `SameSite=Lax` e `Secure` em HTTPS. A sessão expira sete dias após login, sem renovação por atividade ou cache que prolongue acesso revogado. Não há handler nativo genérico ou cadastro livre. A recuperação usa somente as rotas específicas da #10, descritas abaixo.

Cinco falhas de login/conta em 15 minutos suspendem o login por 15 minutos, sem revogar sessões válidas. Limite adicional: 60 tentativas/origem/minuto. Na troca, o contador independente de senha atual bloqueia a troca por 15 minutos e revoga todas as sessões na quinta falha; novo login não limpa esse bloqueio. Bootstrap HTTP aceita até dez submissões/origem/minuto. Erros 429 informam `Retry-After`.

`TRUSTED_PROXIES` recebe IPs/CIDRs separados por vírgula; por padrão nenhum cabeçalho de proxy define a origem. Nunca usar confiança universal. A cadeia explicitamente confiável é verificada na API; sua configuração real com Caddy e restrição de acesso direto ao backend pertencem à #16. HTTPS local de teste não comprova implantação.

Operações compostas usam uma transação e conexão únicas, lock por conta ou singleton e resposta/cookies somente após commit. Pool de cinco conexões, aquisição de dois segundos, lock de um segundo e statement timeout de dois segundos limitam espera; ocupação excessiva retorna 503 sem fila própria ilimitada nem repetição automática da mutação. Esses parâmetros não representam teste de carga.

Limpeza ao iniciar e a cada minuto, sem sobreposição e em lotes de até 500 registros por tabela, remove contadores inativos e sessões/verificações expiradas. Não remove bloqueios futuros, sessões válidas ou o marcador de configuração concluída. Digest inicial expirado é descartado sem reabrir instalação. O timer é encerrado com a API. Eventos e retenção de auditoria de segurança continuam na #15.

### Testes da autenticação

Configure `AUTH_TEST_DATABASE_URL` no ambiente com banco **descartável e exclusivo**, cujo nome termine em `_auth_test`, diferente das URLs de uso normal, teste da fundação e POC. Integração e navegador limpam as tabelas de autenticação desse banco para comprovar a configuração inicial; não use dados reais nem execute as duas suítes simultaneamente contra o mesmo banco. O guard também recusa o mesmo nome de banco informado nas outras URLs. `pnpm check` inclui políticas/unitários; PostgreSQL e navegador são explícitos:

```bash
pnpm --filter @kafofo/api test:auth
pnpm test:auth:e2e
```

API/Vite exclusivos usam portas 4407/5407, sem reutilizar servidores; a API é iniciada sem modo watch ou leitura do `.env` de desenvolvimento. O teste global prepara o banco antes dos cenários de navegador. Chromium percorre configuração, login obrigatório, troca, revogação de outro navegador, quinta falha, novo login com bloqueio remanescente e logout, em viewport móvel e com navegação por Tab. Falhas de rede e respostas 503 permitem tentar novamente por teclado. Traces, screenshots, vídeos e snapshots automáticos de DOM desses percursos ficam desabilitados para não capturar segredos. Execute navegador separadamente de instalações, builds e alterações de arquivos que possam provocar recarga do Vite.

Para verificar cookie `Secure` no navegador em HTTPS local:

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout /tmp/kafofo-auth-key.pem -out /tmp/kafofo-auth-cert.pem \
  -days 1 -subj /CN=127.0.0.1 -addext subjectAltName=IP:127.0.0.1
AUTH_TLS_CERT=/tmp/kafofo-auth-cert.pem \
AUTH_TLS_KEY=/tmp/kafofo-auth-key.pem pnpm test:auth:e2e
```

O certificado temporário é aceito só pela configuração de teste. A POC mantém seus próprios comandos, migrações e banco; nenhuma conta do laboratório é migrada para o produto. Evidências de execução ficam na issue/PR, sem status paralelo neste guia.

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

## Núcleos e residências

A [#8](https://github.com/vguerrax/kafofo/issues/8) usa a migração `0002`, aplicada explicitamente por `pnpm db:migrate`. Após entrar, crie um núcleo e uma residência; responsável inicial é uma escolha explícita entre membros ativos. O seletor mostra as participações atuais. Administradores também veem metadados de residência para nomear responsáveis, sem acesso automático ao conteúdo.

As rotas ficam sob `/api/platform`: contextos, criação de núcleo/residência, membros e acessos. Corpos e respostas constam no OpenAPI. São aplicadas as mesmas proteções de origem/cookies da autenticação. Conta sem participação não consulta nem modifica outro contexto; papéis retornados são atuais, sem cache de autorização.

Configure `CONTEXT_TEST_DATABASE_URL` no ambiente com banco descartável exclusivo terminado em `_context_test`, diferente dos bancos normal, fundação, autenticação e POC. A suíte trunca tabelas desse banco para isolar cenários e nunca deve usar dados reais. Execute sequencialmente contra o mesmo banco:

```bash
pnpm --filter @kafofo/api test:contexts
pnpm test:contexts:e2e
```

Navegador usa portas 4408/5408, API sem watch e fixtures internas, sem abrir cadastro público. Cobre criação e retomada, celular, teclado, nomeação/gestão por papéis, revogação em outra sessão e recuperação de 503. `AUTH_TLS_CERT`/`AUTH_TLS_KEY` também habilitam HTTPS local nessa suíte, conforme o procedimento da autenticação. Capturas de segredos permanecem desabilitadas. Não executar builds/instalações em paralelo com navegador.

A integração prova FKs multínúcleo, rollback real, revogação, reingresso com ID novo, último administrador concorrente e revalidação de sessão/papel após espera por lock. Testes não comprovam listas privadas, convites, auditoria definitiva ou publicação; essas capacidades ficam nas respectivas tarefas.

## Convites de núcleo

A [#9](https://github.com/vguerrax/kafofo/issues/9) acrescenta a migração `0003` e gestão de convites para administradores ativos do núcleo. Aplique `pnpm db:migrate` explicitamente. O link aparece uma vez na emissão; consultas posteriores mostram metadados e estado. Posse do link permite uma entrada como membro comum em sete dias, sem residência automática.

O fragmento é removido da URL ao abrir e o token permanece somente em memória. Recarregar antes de aceitar exige reabrir o link original. Cadastro e aceitação confirmam juntos, sem iniciar sessão; depois, entre pelo login. Participante ativo mantém seu papel e não consome o convite.

Configure `INVITATION_TEST_DATABASE_URL` com banco descartável exclusivo terminado em `_invitation_test`, diferente dos demais bancos, e execute sequencialmente:

```bash
pnpm --filter @kafofo/api test:invitations
pnpm test:invitations:e2e
```

Navegador usa portas 4409/5409, sem capturas de segredos. `AUTH_TLS_CERT` e `AUTH_TLS_KEY` habilitam o percurso HTTPS local. As operações públicas têm limite compartilhado de 60 requisições/origem/minuto e cadastro tem adicional de dez/origem/minuto. Respostas 429 informam `Retry-After`; os contadores persistem mesmo quando a operação é revertida. Não executar builds ou instalações junto ao navegador.

## Recuperação de acesso

A [#10](https://github.com/vguerrax/kafofo/issues/10) usa a migração `0004`, aplicada explicitamente por `pnpm db:migrate`. O administrador global encontra “Recuperar outra conta” após login. Antes de emitir, confirme a identidade da pessoa por um canal conhecido; confira o username e entregue o link manualmente em canal privado. Não solicite nem defina a senha do titular. Administrador de núcleo não pode emitir. Não há recuperação pública por username nem envio de e-mail.

Para recuperar um administrador global, o operador autorizado executa no servidor, com a configuração da instalação:

```bash
pnpm --filter @kafofo/api auth:recover <username-do-administrador-global>
```

O comando não recebe senha. Identifica o operador pelo UID local no evento e imprime o link somente em stdout; não encaminhe a saída a logs, tickets ou histórico compartilhado. Em uma instalação com wrapper de logging, use uma sessão administrativa privada sem captura da saída. O acesso ao ambiente e às credenciais do banco é a autoridade operacional; não exponha esse comando por HTTP. Erros são genéricos em stderr e não incluem conexão ou link.

Os dois canais compartilham três emissões por conta-alvo em uma hora. Reemissão bem-sucedida invalida o link anterior, mas não revoga sessões até a senha ser redefinida. Link vale 30 minutos. Ao abrir, a página valida por POST sem consumir e remove o fragmento; após recarga, reabra o original. Cinco senhas inválidas pelo link válido o revogam. Conclusão encerra todas as sessões e exige login com a nova senha. Emissão e uso geram eventos sem segredos; consulta e gestão da auditoria pertencem à #15.

Configure `RECOVERY_TEST_DATABASE_URL` com banco descartável exclusivo terminado em `_recovery_test`, diferente dos demais bancos. Execute sequencialmente:

```bash
pnpm --filter @kafofo/api test:recovery
pnpm test:recovery:e2e
```

Navegador usa servidores exclusivos nas portas 4410/5410, sem capturas de segredos. `AUTH_TLS_CERT`/`AUTH_TLS_KEY` habilitam HTTPS local. Integração inclui comando local, concorrência, rollback e auditoria. Os limites de consulta e envio são separados, 30 requisições/origem/minuto cada, com `Retry-After`; cadastro ou login não limpam esses contadores. A emissão HTTP também tem limite de 30/origem/minuto, além da cota por alvo. Não execute builds/instalações junto ao navegador.

## Listas de residência do Kitanda

A [#11](https://github.com/vguerrax/kafofo/issues/11) usa a migração `0005`, aplicada explicitamente por `pnpm db:migrate`. Ela cria o namespace `kitanda`, listas e compartilhamentos, e acrescenta unicidade composta às concessões residenciais da plataforma para as FKs entre módulos. Não reescreve migrações anteriores.

Selecione núcleo e residência em “Núcleos e residências”. O painel de listas aparece somente para uma residência à qual a conta tem acesso. Responsável/colaborador cria lista privada e edita metadados; o criador com papel de escrita compartilha com pessoas da mesma residência ou revoga compartilhamento. Visualizador somente consulta. Cargos administrativos não tornam listas privadas visíveis.

A tela atualiza as consultas ao retornar ou pelo botão “Atualizar listas”. Revogação impede novas operações imediatamente no backend. A autoria permanece após reingresso, mas o papel atual limita ações; participantes precisam receber novo compartilhamento para a nova concessão residencial. Itens e progresso são acrescentados pela #12, descrita abaixo. Links públicos, transferência, notificações e lixeira não fazem parte deste recorte. A integração do histórico da #15 é requisito antes da publicação dessas operações.

Configure `KITANDA_TEST_DATABASE_URL` com banco descartável exclusivo terminado em `_kitanda_test`, diferente dos demais bancos, e execute sequencialmente:

```bash
pnpm --filter @kafofo/api test:kitanda
pnpm test:kitanda:e2e
```

Navegador usa portas exclusivas 4411/5411, duas sessões, celular e teclado. `AUTH_TLS_CERT`/`AUTH_TLS_KEY` habilitam HTTPS local. Capturas de conteúdo ficam desabilitadas. Não executar builds/instalações em paralelo com navegador. Integração testa privacidade, integridade entre residências, papéis, reingresso, revogação e locks. O guia de [CI](ci.md) descreve as regressões da plataforma.

## Itens e progresso do Kitanda

A [#12](https://github.com/vguerrax/kafofo/issues/12) usa a migração `0006`, aplicada explicitamente por `pnpm db:migrate`. Acrescenta itens com quantidade `NUMERIC(9,3)` e exclusão lógica. Não há unicidade de nome: itens iguais permanecem separados.

Abra uma lista e adicione nome, quantidade/unidade independentes e observação opcional. A interface aceita `0,5` ou `0.5`; envia texto decimal com ponto. A API não aceita número JSON, expoente, separador de milhar ou mais de três casas. Recusa excesso sem arredondar. Opcionais vazios ficam null. PATCH preserva omitidos e aceita null para limpar opcionais.

Marcar/desmarcar envia o estado desejado; repetir não inverte nem muda timestamp. Pendentes e comprados ficam separados. Cartões exibem residência e totais atuais; uma compra em três itens mostra 33,3%, independentemente da quantidade de cada item. Vazio não tem percentual. Remover preserva o registro e o exclui de coleções/contagens. Não há restauração individual. A lista continua disponível após 100%.

`pnpm --filter @kafofo/api test:kitanda` executa sequencialmente integrações de listas e itens no mesmo `KITANDA_TEST_DATABASE_URL` descartável exclusivo, terminado em `_kitanda_test`. Para navegador, execute também:

```bash
pnpm test:kitanda:e2e
pnpm test:items:e2e
```

A suíte de itens usa 4412/5412, reutiliza a fixture e o banco descartável do Kitanda e limpa os dados ao preparar o percurso. Não execute essas suítes simultaneamente contra o mesmo banco nem use dados reais. `AUTH_TLS_CERT`/`AUTH_TLS_KEY` habilitam HTTPS local. Capturas de conteúdo ficam desabilitadas. Não executar builds/instalações junto ao navegador.

Os percursos cobrem vírgula/ponto, grupos, edição, remoção, percentual, celular, teclado, preservação de formulário após erro e visualizador sem escrita. Repetição automática de criação, conflitos e polling ficam na #13; limpeza/lixeira na #14; histórico/auditoria na #15, cuja integração é requisito antes da publicação das operações com histórico.

## Colaboração, conflitos e confirmação

A [#13](https://github.com/vguerrax/kafofo/issues/13) usa a migração `0007`, aplicada explicitamente por `pnpm db:migrate`. Itens existentes recebem versão 1; comprovantes operacionais têm retenção de 24 horas. A API limpa expirados ao iniciar e a cada minuto, sem sobreposição, até 500 por lote. Encerra a limpeza antes de fechar o banco.

Criação de lista e mutações de itens exigem cabeçalho `Idempotency-Key` UUID. PATCH de item, PUT de compra e DELETE enviam `expectedVersion`; DELETE tem corpo JSON com esse campo. As confirmações devolvem somente identificador e versão confirmada, sem conteúdo anterior. DELETE preserva 204 e informa `X-Resource-Id`/`X-Item-Version`. GET dos itens retorna `{list, items}` com permissões atuais. Consulte schemas no OpenAPI; clientes anteriores precisam acompanhar esses contratos.

Com a lista aberta e visível, a tela atualiza a cada cinco segundos. Aba oculta suspende consultas periódicas; retorno consulta imediatamente. Atualizações preservam rascunho e foco. Conflito mantém o que foi digitado, permite comparar os valores atuais e exige revisão explícita antes de novo envio. Itens removidos não podem ser sobrescritos. Perda de acesso encerra consultas e retira os dados; visualizador continua lendo, sem escrever.

Em gravação sem confirmação, use “Tentar confirmar novamente”: a página reutiliza o mesmo payload e chave. Não altere a operação pendente nem recarregue antes de esclarecer o resultado. Após 24 horas, atualize e confira o que foi confirmado antes de liberar uma nova operação. Rascunhos e chaves pendentes existem só na memória da página; não há fila offline ou recuperação após recarga.

A integração `pnpm --filter @kafofo/api test:kitanda` inclui conflitos e comprovantes no banco descartável exclusivo. Navegador adicional:

```bash
pnpm test:collaboration:e2e
```

Usa `KITANDA_TEST_DATABASE_URL`, fixture do Kitanda e portas 4413/5413. Execute sequencialmente com as suítes de listas/itens, sem dados reais e sem builds/instalações simultâneos. `AUTH_TLS_CERT`/`AUTH_TLS_KEY` habilitam HTTPS local. Capturas de conteúdo permanecem desabilitadas. Os testes incluem duas sessões, cadência/pausa, revisão, foco, resposta perdida após commit, repetição e revogação. `pnpm check` inclui testes do coordenador de consultas. Limpeza de comprados e histórico consultável continuam nas #14/#15.

## Limpeza, lixeira e expurgo

A [#14](https://github.com/vguerrax/kafofo/issues/14) usa a migração `0008`, aplicada por `pnpm db:migrate`, sem reescrever as anteriores. Listas existentes recebem revisão de ciclo 1. Contratos de seleção, revisão, resposta e prazo estão no [domínio](../domain/kitanda/alpha-1.md#contrato-técnico-do-ciclo-de-vida) e no OpenAPI. Clientes devem acompanhar o novo campo obrigatório `lifecycleRevision`.

O expurgo inicia com a API e repete a cada hora. Processa até 50 itens removidos e 50 listas excluídas vencidos por ciclo, em transações independentes. Ignora unidades com lock ocupado e tenta novamente depois; uma falha não descarta o candidato nem impede os demais. O encerramento aguarda a rotina antes de fechar o pool. A fonte de trabalho são os timestamps persistidos; reinício não depende de fila em memória. O prazo usa o relógio do banco, com 720 horas por categoria. Não há expurgo manual pela interface nem restauração individual de item.

`pnpm --filter @kafofo/api test:kitanda` inclui os contratos de ciclo de vida e regressões anteriores em PostgreSQL descartável. Os testes de retenção incluem lote limitado, falha/rollback, duas instâncias, revalidação após lock e retomada. O ponto de integração do histórico usa tabela de contrato exclusiva do teste; o histórico real, sua redação e remoção precisam ser validados com a #15 antes da publicação.

```bash
pnpm test:lifecycle:e2e
```

Usa as portas 4414/5414, `KITANDA_TEST_DATABASE_URL` e a fixture comum do Kitanda. Execute sequencialmente com os demais navegadores no mesmo banco descartável. `AUTH_TLS_CERT`/`AUTH_TLS_KEY` habilitam HTTPS; capturas permanecem desabilitadas. Os percursos exercitam duas sessões, seleção alterada, novos comprados, respostas perdidas, lixeira autorizada, visualizador, revogação, teclado e celular. O CI executa os protocolos HTTP e HTTPS junto às regressões da #13. `pnpm check` inclui o agendador inicial/horário, ausência de sobreposição e drenagem no encerramento.
