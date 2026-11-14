# Distribuição e código-fonte

A [ADR-0022](../adr/0022-licenca.md) adota a [GNU AGPL v3](../../LICENSE) para o Kafofo. A primeira release pública fica para depois da Alpha 2, com a navegação da [#41](https://github.com/vguerrax/kafofo/issues/41) validada no candidato a publicar. A Alpha 1 foi homologada como piloto privado.

## Revisão preliminar da Alpha 1

O lockfile do candidato homologado foi usado em uma instalação de produção com pnpm 11.25.0, incluindo dependências opcionais Linux glibc para AMD64 e ARM64. O levantamento abrange os workspaces da API, frontend e contratos. Ele inclui pacotes que podem ficar fora do bundle ou da imagem final.

| Licença declarada | Pacotes |
| ----------------- | ------: |
| MIT               |     134 |
| BSD-3-Clause      |       6 |
| ISC               |       6 |
| Apache-2.0        |       4 |
| MPL-2.0           |       3 |

A triagem dos metadados não apontou incompatibilidade evidente nas dependências permissivas. Os três pacotes MPL 2.0 são Lightning CSS e os dois bindings Linux. Verificar se entram nos artefatos distribuídos e, caso entrem, preservar sua licença e disponibilizar o código dos componentes cobertos conforme a MPL.

Os [avisos coletados](../../THIRD-PARTY-NOTICES.txt) preservam os textos encontrados nos pacotes. Para 14 pacotes, a inspeção preliminar não encontrou um arquivo de licença ou aviso na raiz do pacote npm. Verificar os arquivos em subdiretórios e nas fontes oficiais da versão correspondente se esses pacotes estiverem na distribuição.

O Dockerfile usa Node sobre Debian no serviço de API e Caddy sobre Alpine no serviço web. O Compose referencia também a imagem oficial PostgreSQL sobre Debian. A revisão preliminar não inspecionou o conteúdo dessas imagens. A inspeção por digest e arquitetura pertence à validação do candidato público.

## Antes de publicar

1. Fixar a tag, o commit e os digests das imagens a publicar. Inventariar as dependências que realmente entram nos bundles e nas imagens AMD64 e ARM64, incluindo componentes das bases. Revisar separadamente a imagem PostgreSQL se ela for redistribuída como parte do pacote.
2. Conferir a licença e os avisos originais dos componentes inventariados, resolver lacunas ou incompatibilidades e distribuir os avisos exigidos junto dos artefatos.
3. Oferecer, nas notas da release e junto ao ponto de download, acesso sem cobrança adicional ao código-fonte correspondente aos binários e imagens publicados. Vincular o código ao commit exato e disponibilizar os arquivos necessários para gerar, instalar e executar a versão, incluindo Dockerfile, Compose, manifestos, lockfile, scripts e migrações. Quando o código de componentes de terceiros for exigido, indicar como obtê-lo conforme a licença aplicável.
4. Identificar a versão servida pela aplicação e oferecer um link para seu código-fonte correspondente. Operadores que disponibilizarem pela rede uma versão modificada devem apontar para a fonte dessa versão, conforme a seção 13 da AGPL v3.
