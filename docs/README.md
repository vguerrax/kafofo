# Documentação do Kafofo

**Consolidação inicial:** 2026-11-04. **Integração do Kitute e fluxo de contribuição:** 2026-11-06. Este é o ponto de entrada único para os documentos da plataforma e dos sete módulos, organizados para permanecer no repositório.

## Documentação de domínio

Para executar a fundação técnica, consulte o [guia de desenvolvimento local](development/README.md). Para instalar e recuperar a Alpha 1 em servidor, consulte o [guia operacional](operations/README.md).

| Domínio    | Diretório / índice                     | Conteúdo                                                               |
| ---------- | -------------------------------------- | ---------------------------------------------------------------------- |
| Plataforma | [platform/](domain/platform/README.md) | Identidade, organização doméstica, autorização e serviços transversais |
| Kapanga    | [kapanga/](domain/kapanga/README.md)   | Despesas, pagamentos, recorrência e parcelamento                       |
| Kitanda    | [kitanda/](domain/kitanda/README.md)   | Listas de compras e atualização compartilhada                          |
| Mutyrão    | [mutyrao/](domain/mutyrao/README.md)   | Tarefas, responsáveis, estados, notificações e lembretes               |
| Arakatu    | [arakatu/](domain/arakatu/README.md)   | Agenda, recorrência e integração de calendários                        |
| Okape      | [okape/](domain/okape/README.md)       | Painéis, fontes de dados e componentes visuais                         |
| Urukum     | [urukum/](domain/urukum/README.md)     | Notas, tags, preferências individuais, versões e lixeira               |
| Kitute     | [kitute/](domain/kitute/README.md)     | Cadernos de receitas pessoais, da residência e do núcleo               |

Cada domínio possui índice próprio, visão geral, entidades, requisitos ou capacidades funcionais, regras, permissões, fluxos, critérios de aceitação, rastreabilidade e pendências. Documentos especializados detalham o comportamento de cada módulo.

## Arquitetura, marca e fontes

- [ADRs](adr/README.md): 23 registros e respectivos status, em uma única cópia compartilhada.
- [Identidade de marca](brand/README.md): extrato documentado da plataforma e nomes disponíveis.
- [Referências](reference/README.md): fontes históricas e especificações utilizadas.

## Como interpretar

Definições aprovadas permanecem distintas de orientações derivadas e pontos pendentes. IDs são preservados, com qualificação de domínio para evitar colisões: `plataforma/RF-001`, `urukum/RF-01`, `okape/RN-01`. Okape não recebeu IDs RF na fonte; seus CF-O são identificadores documentais derivados.

Arakatu está baseado na seção de agenda do levantamento consolidado; não foi localizada uma especificação detalhada separada. Essa limitação permanece explícita no próprio módulo. Critérios de aceitação descrevem verificações futuras e não comprovam implementação.

## Resultado da consolidação

Foram reunidos 140 arquivos existentes, eliminando 234 cópias repetidas byte a byte. Os conteúdos de domínio, ADRs, marca e fontes existentes foram preservados; não foram resolvidas pendências funcionais ou arquiteturais por essa operação.

Foram criados índices de navegação neste conjunto. Os arquivos de leitura única e os ZIPs individuais não são repetidos na árvore do repositório, pois seu conteúdo já está nos documentos separados. Os README de embalagem de cada pacote foram substituídos pelo README geral; os índices próprios de domínio foram mantidos.

## Uso no repositório

Extrair o ZIP na raiz produz `README.md` e `docs/`, sem diretório adicional de embalagem. Se o repositório já possuir README próprio, incorporar os links do README fornecido ao existente. Nenhuma estrutura de aplicação, configuração de CI, licença ou dependência foi criada por esta consolidação.

## Planejamento e contribuição

- [Contrato do backlog](contributing/backlog.md).
- [Primeira entrega](planning/README.md).
- [Proveniência da importação](reference/importacao-repositorio.md).

O backlog está nas Issues; estes documentos não mantêm cópias de tarefas ou status.

## Contratos da Alpha 1

- [Plataforma: acesso, segurança, exportação e operação](domain/platform/alpha-1.md).
- [Kitanda: listas de residência, compartilhamento e compras](domain/kitanda/alpha-1.md).
- [ADR-0023: histórico e retenção por categoria](adr/0023-auditoria-retencao-alpha-1.md).

Estes contratos fixam o alcance aprovado do incremento; não comprovam implementação ou encerramento do MVP.
