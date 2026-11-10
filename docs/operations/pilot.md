# Homologação de um piloto privado

Roteiro operacional da [#17](https://github.com/vguerrax/kafofo/issues/17), após integrar suas dependências. Os contratos de [plataforma](../domain/platform/alpha-1.md) e [Kitanda](../domain/kitanda/alpha-1.md) definem os resultados esperados. A matriz executada fica na issue; este guia não mantém status do backlog nem comprova uma execução.

## Candidato e isolamento

Escolha um commit integrado e confira o CI desse commit. Atribua `APP_VERSION` como referência operacional privada, sem criar release ou tag pública por inferência. Preserve um checkout limpo desse candidato para o build. Os scripts de homologação podem estar em outra branch: diferencie o commit do roteiro do commit efetivamente executado nas imagens.

Prepare, fora dos checkouts, um diretório 0700 com três configurações baseadas em [`.env.example`](../../deploy/.env.example):

| Arquivo       | Projeto obrigatório | Uso                                                                    |
| ------------- | ------------------- | ---------------------------------------------------------------------- |
| `pilot.env`   | `kafofo17-pilot`    | Piloto privado, Caddy HTTPS e três contas fictícias                    |
| `restore.env` | `kafofo17-restore`  | Restauração, origem/rede/volumes próprios                              |
| `clock.env`   | `kafofo17-clock`    | Clone descartável para retenção; nunca altera o relógio do host/piloto |

Use portas, sub-redes e faixas dinâmicas livres, próprias de cada projeto. Confirme RAM/disco disponíveis e serviços preexistentes. O piloto deve se limitar ao endereço privado escolhido; API e PostgreSQL não publicam portas. Para o celular, o nome DNS precisa resolver nesse aparelho para o endereço privado do host. Use um nome DNS para TLS/SNI; acesso direto por IP não substitui esse teste. Não modifique firewall, DNS ou outros projetos por inferência.

Siga o [procedimento de instalação](README.md#instalação-limpa) para construir/instalar o candidato. Use `TLS_MODE=internal` para CA local. Confie explicitamente na CA ao validar cadeia e nome; instalar uma CA nos clientes é uma operação do responsável por cada cliente. A chave privada permanece no volume Caddy. Pode-se disponibilizar temporariamente **apenas o certificado público**, em diretório separado sem links/credenciais, para o celular.

Crie `accounts.json` restrito (0600) com senhas independentes e válidas para `piloto-ana`, `piloto-beto` e `piloto-caio`. As contas serão criadas pelo fluxo real, não por inserção direta no banco. Não use contas ou senhas reais. Não publique esse arquivo, códigos iniciais, links temporários ou dumps.

## Instalação, identidade e fluxo integrado

Na branch que contém o roteiro, configure os dois caminhos absolutos:

```bash
python3 deploy/tests/pilot.py --candidate-root /caminho/candidato-limpo \
  --private-directory /caminho/operacao-restrita prepare

PILOT_CONFIG_FILE=/caminho/operacao-restrita/config.json pnpm test:pilot:e2e

python3 deploy/tests/pilot.py --candidate-root /caminho/candidato-limpo \
  --private-directory /caminho/operacao-restrita inventory
```

`prepare` exige instalação inicial ainda aberta, valida frontend/saúde por HTTPS com a CA explicitamente confiada e guarda o código inicial em arquivo restrito. O navegador não inicia API/Vite nem executa fixtures que truncam tabelas. Usa os containers instalados e faz configuração inicial, convite/cadastro, compra compartilhada, permissões, concorrência, repetição, lixeira, recuperação, reinício e exportação. Não execute contra uma instalação com dados reais nem simultaneamente com uma homologação manual nos mesmos registros.

Traces, vídeos e capturas automáticas estão desabilitados. O Chromium isolado usa exceção de confiança para a CA privada; o helper verifica cadeia/nome separadamente sem ignorar TLS. O teste físico deve validar a confiança no aparelho. As únicas imagens explícitas mostram a área de itens com dados fictícios. Resultados e eventuais diagnósticos ficam no diretório restrito, inclusive contextos de erro. Não publique logs brutos.

Os cenários H01–H09 geram `evidence-browser.json` e `fixture.json`. Cada registro identifica critério, candidato, ambiente, esperado, observado e resultado. Falha não vira aprovação por inferência. Se corrigir apenas o roteiro, preserve o candidato e identifique a nova execução. `PILOT_RESUME_FROM=7`, por exemplo, só reaproveita cenários anteriores que tenham resultado aprovado para o mesmo commit e usa `checkpoint.json`; não refaz instalação nem apaga dados. Mudança no produto exige novo candidato e repetição dos checks/cenários afetados.

O inventário confere arquitetura, labels e digests dos containers em execução. Para imagens locais, `configDigest` é o SHA-256 da configuração (ID da imagem), que referencia suas camadas. `repoDigests` só existe quando há referência de registry; não apresentar ID/configuração ou hash de um tar como digest de manifesto publicado.

## Backup e restauração

Após H01–H09, execute sequencialmente:

```bash
python3 deploy/tests/pilot.py --candidate-root /caminho/candidato-limpo \
  --private-directory /caminho/operacao-restrita backup-and-revoke

python3 deploy/tests/pilot.py --candidate-root /caminho/candidato-limpo \
  --private-directory /caminho/operacao-restrita restore

python3 deploy/tests/pilot.py --candidate-root /caminho/candidato-limpo \
  --private-directory /caminho/operacao-restrita clock
```

O backup usa o wrapper operacional do candidato e seu lock de projeto, interrompe escritores e valida dump, arquivos e manifesto. O roteiro registra depois quatro mudanças reais pelas APIs: revogação de compartilhamento, remoção de vínculo de núcleo, revogação de acesso residencial e rebaixamento de papel. O registro posterior ao backup é independente da auditoria contida na cópia antiga.

A restauração mantém Caddy fechado até conferir invalidação de sessões/links, reaplicar as quatro mudanças com as APIs internas existentes e verificar contas, permissões, lista/itens, histórico e arquivo sentinela. Só então grava confirmação operacional e usa `open --reconciliation`. Confere novamente três logins por HTTPS. Volumes e origem não podem ser compartilhados com o piloto.

Para representar tempo transcorrido, somente os timestamps dos registros fictícios na **cópia isolada** são ajustados. O piloto e o relógio do host permanecem intactos. O clone `clock` verifica recuperação antes de 720 horas, recusa no limite, redação antes do expurgo físico e retenção de 2160 horas nas duas fontes de segurança. Depois drena os expurgos e remove exclusivamente seus próprios containers/volumes. O ambiente de restauração conserva o checkpoint e os resultados para revisão.

O helper captura falhas em `diagnostic.log`, restrito ao operador. Uma restauração interrompida deve continuar sem entrada externa até corrigir/repetir as verificações; não contorne o marcador operacional com `install` ou Compose direto. Não repita `restore` sobre volumes existentes nem execute limpeza global. Preserve backup, configuração e secrets separadamente até a revisão.

## Celular físico e saída

Reserve uma lista fictícia separada para o teste manual depois da janela de backup. Registre modelo, sistema, navegador, confiança TLS e o resultado de inclusão/edição, marcação/desmarcação, limpeza e reutilização. Observe distância até os produtos, número de telas/rolagem, formulário antes da lista, botões, foco, rascunhos e mensagens. Emulação não comprova uso no aparelho. Se a tela única impedir concluir a compra, registre bloqueio da Alpha 1.

Anexe à #17 a matriz sanitizada, o CI do candidato, referência operacional, commit completo, arquitetura, PostgreSQL e digests realmente executados. Inclua duração da manutenção/restauração, reconciliação, resultados físicos e limitações. Guarde dumps, exportações, links e credenciais apenas no armazenamento restrito. Conclua a homologação somente com os critérios obrigatórios aprovados e sem falha aberta que os comprometa.

O resultado privado não aciona distribuição pública. A licença permanece sujeita à [ADR-0022](../adr/0022-licenca.md) e à decisão/política aplicável. Não publicar registry, release, escolher licença ou encerrar outras demandas automaticamente por executar este roteiro.
