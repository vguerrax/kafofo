# Instalação e recuperação da Alpha 1

Procedimentos da [issue #16](https://github.com/vguerrax/kafofo/issues/16), conforme o [contrato de operação](../domain/platform/alpha-1.md#backup-e-operação) e as ADRs [0016](../adr/0016-deploy-compose-multiarch.md), [0017](../adr/0017-proxy-caddy.md), [0018](../adr/0018-logs-pino.md) e [0021](../adr/0021-entrega-implantacao-continua.md). As evidências efetivamente executadas ficam na issue/PR. A [#17](https://github.com/vguerrax/kafofo/issues/17) verifica a instalação piloto integrada, sua versão e commit distribuído.

Para executar a homologação com três contas fictícias, compra no celular e recuperação do piloto, use o [roteiro de piloto privado](pilot.md). Ele identifica o candidato efetivamente instalado e preserva a matriz executada na #17.

## Preparação

Servidor Linux com Docker Engine, Compose v2 (com `--wait`), Buildx, Git e Python 3.11+. O build usa Node 24.22.2 e pnpm 11.25.0 dentro do container. Não é necessário instalar Node no servidor. O checkout deve estar limpo, no commit escolhido. Sem publicação de imagens, registry ou CD automático; licença de distribuição continua pendente na ADR-0022.

Crie um diretório restrito **fora do checkout**, por exemplo `/srv/kafofo-config`, pertencente ao operador. Copie [deploy/.env.example](../../deploy/.env.example) para `installation.env`. Crie os dois arquivos de segredo com valores aleatórios independentes de ao menos 32 caracteres (por exemplo, `openssl rand -hex 32`), sem imprimir valores em terminais compartilhados. Restrinja o diretório a 0700 e os arquivos a 0600. O processo da API usa UID 1000: os arquivos montados como secrets precisam ser legíveis por esse UID no container. Em Docker rootful com outro UID do operador, ajuste somente a leitura dos dois secrets para UID 1000 por ACL; não os torne legíveis para todos. PostgreSQL lê seu secret como root antes de reduzir privilégios.

Preencha valores literais `KEY=value`, sem aspas, expansão de shell ou interpolação. O wrapper não executa o arquivo. Configure:

| Parâmetro                                              | Uso                                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `COMPOSE_PROJECT_NAME`                                 | Nome exclusivo, letras minúsculas, números e hífen; determina volumes e redes                           |
| `SOURCE_COMMIT`                                        | SHA completo de `git rev-parse HEAD`; conferido com os labels das imagens                               |
| `APP_VERSION`                                          | Referência operacional escolhida pelo operador; não cria release/tag                                    |
| `API_IMAGE`, `WEB_IMAGE`                               | Tags **locais**, exclusivas para esse commit, por exemplo `kafofo-api:<sha>` e `kafofo-web:<sha>`       |
| `DEPLOY_PLATFORM`                                      | `linux/amd64` ou `linux/arm64`; deve corresponder ao servidor para execução nativa                      |
| `AUTH_BASE_URL`                                        | Origem externa exata em HTTPS, incluindo porta se não padrão, sem caminho                               |
| `SITE_ADDRESS`                                         | Endereço de escuta do Caddy, por exemplo `https://compras.example.org` ou `https://kafofo.home.arpa`    |
| `TLS_MODE`                                             | `public` para ACME ou `internal` para CA local                                                          |
| `HTTP_PORT`, `HTTPS_PORT`, `BIND_ADDRESS`              | Portas 80/443 por padrão e endereço de bind do host; somente Caddy publica portas TCP                   |
| `DB_PASSWORD_FILE`, `AUTH_SECRET_FILE`                 | Caminhos absolutos dos secrets; nunca valores de segredo                                                |
| `PROXY_SUBNET`, `PROXY_ADDRESS`, `PROXY_DYNAMIC_RANGE` | `/24` livre por instalação; IP fixo do Caddy fora da faixa dinâmica `/25`, por exemplo `.2` e `.128/25` |

A faixa dinâmica separada permite executar comandos locais em containers temporários sem colidir com o Caddy. A API confia exclusivamente no IP configurado desse proxy. Caddy sobrescreve `X-Forwarded-*` e remove `Forwarded`; não configure outra entrada/proxy na frente sem novo desenho de confiança. A origem HTTPS continua validada pelo backend.

Não execute `docker compose config` em logs compartilhados: sua saída contém configuração operacional. O wrapper captura a configuração e passa segredos somente por arquivos montados. Erros não imprimem conexões nem credenciais.

## Instalação limpa

Na raiz do checkout, com `installation.env` preenchido:

```bash
python3 deploy/operate.py --env-file /srv/kafofo-config/installation.env build
python3 deploy/operate.py --env-file /srv/kafofo-config/installation.env install
python3 deploy/operate.py --env-file /srv/kafofo-config/installation.env status
```

`install` interrompe API/Caddy, prepara permissões dos logs, aguarda PostgreSQL, executa a migração compilada **explicitamente** e somente depois abre API e proxy. A imagem não migra no startup. Falha da migração mantém a entrada parada. Não use `compose up` como atalho para instalação/atualização.

Para comandos Compose administrativos abaixo, use o mesmo projeto, arquivo e diretório do checkout. Exemplo de função na sessão privada do operador:

```bash
kafofo_compose() {
  docker compose --env-file /srv/kafofo-config/installation.env \
    -f deploy/compose.yaml "$@"
}
kafofo_compose run --rm --no-deps api node dist/modules/platform/auth/operator.js
```

O comando imprime o código inicial de 30 minutos somente em stdout. Abra a origem configurada, crie o primeiro administrador e entre. Código inicial e links de recuperação não devem ser encaminhados a logs, tickets ou histórico compartilhado. Recuperação local administrativa usa `node dist/modules/platform/recovery/operator.js <username>` no mesmo canal privado. Consulte as regras no [guia de desenvolvimento](../development/README.md).

Confirme frontend, `/api/health`, `/api/ready`, login e `GET /api/auth/setup` com `configured: true`. Reinicie API e Caddy e repita a consulta: a configuração inicial permanece encerrada. Verifique com `docker compose ... ps` que somente Caddy publica portas; API e PostgreSQL usam redes internas. O admin HTTP do Caddy está desligado.

### HTTPS público e local

Público: configure DNS do domínio para o host, portas externas 80/443 chegando ao Caddy, `TLS_MODE=public`, `SITE_ADDRESS=https://<domínio>` e a mesma origem em `AUTH_BASE_URL`. O wrapper remove a diretiva de CA interna, permitindo HTTPS automático. Não usar o arquivo Compose diretamente com modo público: a seleção da diretiva TLS é feita pelo wrapper.

Local: use DNS local e `TLS_MODE=internal`. Extraia somente o certificado público da CA:

```bash
kafofo_compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./kafofo-root.crt
```

Instale-o como CA confiável nos clientes autorizados, pelo procedimento do respectivo sistema/navegador. Verifique nome e confiança sem desabilitar TLS. A chave privada da CA permanece no volume Caddy; não a distribua. O smoke usa uma CA local confiada explicitamente, sem `--insecure`.

## Persistência e logs

Volumes por projeto: `postgres` (dados PostgreSQL 17), `files` (`/var/lib/kafofo`, arquivos da aplicação), `caddy-data` (certificados e CA), `caddy-config` (configuração gerada) e `logs` (logs técnicos). Nenhum volume é externo ou compartilhado entre projetos. Não execute `down --volumes` em instalação com dados. A aplicação ainda não tem fluxo de upload na Alpha 1; o teste de recuperação usa um arquivo sentinela para comprovar persistência do armazenamento.

API escreve Pino com redação existente; PostgreSQL usa JSON, sem statements na mensagem de erro e com verbosidade terse; Caddy registra eventos operacionais JSON. Access logs e erros de proxy que incluem a requisição estão excluídos para evitar URLs/cookies/conteúdo. Docker logging está desligado: consulte o volume `logs`, e o estado/exit code dos containers para falhas anteriores à abertura do arquivo. Nada desses logs substitui [histórico e auditoria](../adr/0023-auditoria-retencao-alpha-1.md).

O serviço `logs` executa rotação por copy/truncate a cada dia ou ao ultrapassar 10 MiB por arquivo, verificando a cada minuto. Mantém arquivos por no máximo 30 dias desde o início do intervalo e até 256 MiB de arquivos arquivados, removendo os mais antigos. Logs correntes e o crescimento entre verificações podem exceder esse teto; monitore espaço livre. Copy/truncate pode perder linhas escritas durante a cópia; não é mecanismo de auditoria durável. A retenção continua sem tráfego e reaplica o prazo depois de reinício. Se o serviço de logs parar, a retenção fica interrompida até seu retorno: monitore seu estado. Diretórios/arquivos são restritos; inspecione apenas em sessão administrativa autorizada:

```bash
kafofo_compose run --rm --no-deps --user root --entrypoint sh api \
  -c 'ls -l /logs/archive; cat /logs/rotation.json'
```

## Backup diário e pré-atualização

Configure destino fora do checkout e, preferencialmente, em outro disco com acesso restrito. Dados não são criptografados pelo script; a proteção do disco e de qualquer transporte externo é responsabilidade operacional. Preserve separadamente os secrets e a configuração da instalação em armazenamento restrito recuperável. O backup de dados **não** contém secrets, logs ou chaves TLS do Caddy. Em restauração isolada, Caddy gera nova CA/certificado; clientes precisam confiar na nova CA. Preserve a CA original separadamente se a recuperação da origem original exigir continuidade de confiança.

```bash
python3 deploy/operate.py --env-file /srv/kafofo-config/installation.env \
  backup --destination /mnt/backup/kafofo
```

Agende exatamente uma execução por dia no servidor, no horário de manutenção escolhido. Exemplo de cron do operador, ajustando caminhos absolutos:

```cron
0 3 * * * cd /srv/kafofo && /usr/bin/python3 deploy/operate.py --env-file /srv/kafofo-config/installation.env backup --destination /mnt/backup/kafofo
```

A rotina usa lock por projeto no checkout; todas as execuções desse projeto devem usar o mesmo checkout. Não execute comandos manuais que escrevam dados durante a janela; containers temporários da API ainda ativos impedem a cópia. Bloqueia entrada, aguarda parada da API e seus trabalhos de limpeza, mantém PostgreSQL ativo, gera dump custom e tar de arquivos. Rejeita links/dispositivos no tar. Verifica dump/listagem, tar e checksums, grava manifesto (UTC, versão, commit e origem), sincroniza arquivos, promove por rename no mesmo filesystem e só então mantém as sete cópias diárias válidas mais recentes. Uma falha preserva as anteriores e retorna erro ao agendador. A cópia diária retoma somente os serviços que estavam ativos; a duração da janela é impressa. O destino precisa estar montado antes de executar: o operador deve verificar o mount para não escrever no disco errado.

Antes de atualizar:

```bash
python3 deploy/operate.py --env-file /srv/kafofo-config/installation.env \
  backup --destination /mnt/backup/kafofo --kind pre-update
```

Essa cópia é separada da rotação diária e **mantém API/Caddy parados**, inclusive em falha. Não atualize se ela falhar. Preserve a cópia e os secrets compatíveis até verificar a atualização. Enquanto a entrada está bloqueada, obtenha o novo checkout limpo, configure novas tags/SHA/versão e execute `build` e `migrate`. Verifique as migrações e só então execute `open`. Confira os percursos de conta, papéis, listas e histórico. O comando `open` aguarda saúde da API antes de iniciar Caddy; não é homologação funcional. Após validação, remova manualmente apenas a cópia pré-atualização correspondente que já não precisa ser preservada.

Se a migração falhar, mantenha a entrada parada. Não basta voltar a imagem quando o schema for incompatível. Recupere a cópia pré-atualização com o commit e secrets compatíveis no projeto isolado descrito a seguir, valide, e planeje a troca de origem explicitamente. Não existe downgrade automático de schema nem CD implícito.

## Restauração isolada

1. Escolha a cópia e o **mesmo commit** registrado em seu manifesto. Preserve a cópia original. Confira os arquivos por `verify_backup` do módulo operacional ou execute o comando de restauração, que faz essa validação antes de gravar dados.
2. Prepare outro arquivo de configuração: projeto novo, origem HTTPS própria, outras portas e outra sub-rede/faixa dinâmica/IP. Use novos volumes; o comando recusa projetos que já tenham volumes. Configure os secrets guardados separadamente; a senha PostgreSQL autentica a instalação nova e pode ser nova. Preserve o segredo de autenticação compatível até concluir a recuperação. Construa as duas imagens locais nesse checkout limpo.
3. Execute:

```bash
python3 deploy/operate.py --env-file /srv/kafofo-config/restoration.env \
  restore /mnt/backup/kafofo/daily-<instante>
```

O comando valida manifesto, checksums, formato do tar e labels/arquitetura das imagens; restaura PostgreSQL e arquivos, invalida sessões, verificações, códigos iniciais, convites e links de recuperação não consumidos. Preserva o estado `configured` e as contas/senhas. Descarta comprovantes de mutação e drena os expurgos vencidos de itens/listas/histórico e auditoria. Falha ou candidatos não processados impedem a conclusão. API/Caddy continuam parados; o marcador em `deploy/state/<projeto>.recovery.json` exige registro operacional antes de `open`. Não use `install` ou Compose diretamente para contornar esse checkpoint.

4. Reconcilie **todas** as revogações posteriores ao backup: membros de núcleo, acessos residenciais, compartilhamentos e papéis rebaixados. Use o registro operacional autorizado das alterações posteriores, e não só a auditoria contida no backup antigo. A remoção de sessões/convites não remove concessões de conteúdo. O operador aplica as alterações com as operações existentes ou SQL revisado, mantendo a ordem de locks/consistência e rastreando quem confirmou cada concessão. Sem registro confiável, mantenha a entrada bloqueada até revalidar explicitamente as concessões afetadas com os responsáveis. Não reconceda acessos antigos por reingresso.
5. Valide privadamente os dados e a API, sem publicar Caddy. Para iniciar somente a API após a reconciliação, use `kafofo_compose` adaptado ao arquivo de restauração e `up -d --wait api`. A rede da API permanece interna; use `exec -T api node ...` para consultas locais a `http://127.0.0.1:4304` com `Origin` igual à origem restaurada. Confira contas, login, papéis, rejeição de acessos revogados, listas, itens, histórico, expurgos e arquivos. Pare a API ao terminar. Emita novos convites/recuperações somente depois da reabertura. Complete os percursos de navegador/piloto na #17.
6. Copie os campos do marcador para um JSON operacional restrito e acrescente a confirmação do operador e a referência da evidência (sem conteúdo privado):

```json
{
  "backupManifestSha256": "<valor do marcador>",
  "origin": "https://origem-isolada",
  "commit": "<commit do marcador>",
  "revocationsReconciled": true,
  "checksPassed": true,
  "operator": "<identificação operacional>",
  "evidence": "<referência restrita da verificação>"
}
```

Só registre `true` depois de executar as verificações. Para reabrir:

```bash
python3 deploy/operate.py --env-file /srv/kafofo-config/restoration.env \
  open --reconciliation /srv/kafofo-config/reconciliation.json
```

A reabertura reaplica invalidação/expurgos e verifica saúde, preservando o registro de confirmação em `deploy/state`. A troca para a origem de produção e eventual recuperação das chaves TLS exigem planejamento próprio; este procedimento não troca DNS nem publica versões.

## Verificação das arquiteturas

As bases Node, PostgreSQL e Caddy são fixadas por versão e digest de índice multi-arquitetura. O build compila TypeScript/frontend no host do builder e instala o grafo de produção pelo lockfile congelado, selecionando bindings opcionais da arquitetura de destino sem executar seus scripts. Atualizações que introduzam geração nativa precisam revisar esse contrato. Base fixada e instalação congelada permitem reproduzir o código/dependências; não se promete imagem idêntica byte a byte.

Em cada arquitetura, use um checkout limpo e um env com plataforma e tags locais correspondentes e execute `build`. O Buildx também aceita exportação local por plataforma, sem registry:

```bash
docker buildx build --platform linux/arm64 --target api -f deploy/Dockerfile \
  --build-arg SOURCE_COMMIT=<sha> --build-arg APP_VERSION=<referência> \
  --load -t kafofo-api:smoke .
docker buildx build --platform linux/arm64 --target web -f deploy/Dockerfile \
  --build-arg SOURCE_COMMIT=<sha> --build-arg APP_VERSION=<referência> \
  --load -t kafofo-web:smoke .
SOURCE_COMMIT=<sha> DEPLOY_PLATFORM=linux/arm64 python3 deploy/tests/smoke.py
```

O smoke usa portas locais 18442/18443 e 19442/19443 e sub-redes 172.29.216/217; confira disponibilidade. Cria e remove somente seus dois projetos descartáveis, inclusive volumes. **Não os use para dados reais**. As tags de teste devem ter sido construídas com `APP_VERSION=validation`. Em falha, diagnósticos descartáveis ficam em `/tmp/kafofo16-smoke-diagnostics.tar`, restritos ao operador. Não publique esse arquivo.

Registre separadamente build, execução, plataforma, hardware nativo/emulação, hashes das imagens, duração da janela e limitações. Um build ARM64 feito em amd64 não comprova execução ARM64. O smoke precisa de host da arquitetura correspondente ou emulação previamente configurada pelo operador. O procedimento não instala binfmt privilegiado nem modifica a configuração global do Docker.

Validações locais de código/contratos operacionais:

```bash
pnpm check
python3 -m unittest discover -s deploy/tests
```

Os [checks de CI](../development/ci.md) e regressões PostgreSQL/navegador continuam exigidos. O smoke de Compose cobre o transporte real, persistência e recuperação; não substitui as regressões funcionais nem a homologação piloto.

Referências de implementação: [Docker multi-platform](https://docs.docker.com/build/building/multi-platform/), [cabeçalhos do reverse_proxy no Caddy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy) e [dump PostgreSQL](https://www.postgresql.org/docs/17/backup-dump.html).
