# Urukum — Rastreabilidade

## Fonte

- Especificação recebida como `Texto colado (2)(2).txt`, preservada em [urukum-original.md](../../reference/urukum-original.md). SHA-256: `648d5fd51bc6a628d8b5fabcf16fccc327dbde9b5fb4381fd1ee97a5cc5a8e72`.
- [Plataforma](../platform/README.md) e [ADRs](../../adr/README.md), incluídas sem alteração.
- Referência textual da fonte ao editor de Mutyrão/Kitanda, usada para registrar necessidade de consistência e Q-U03, sem escolher biblioteca ou ampliar módulos.

São 26 RF, 18 RN e nove RNF originais, com numeração local preservada. O checklist original tem 28 itens e está mantido sem alteração. Os 32 cenários CA-U, o modelo conceitual e as sugestões técnicas são derivados desta consolidação.

Usar escopo `urukum` para distinguir RF-01/RN-01/RNF-01 dos mesmos números em outros módulos. Não converter os IDs para catálogo global sem decisão explícita.

## Requisitos funcionais

| ID original | Documento principal | Aceitação inicial |
| --- | --- | --- |

| RF-01 | [entities.md](entities.md) | CA-U01–03 |
| RF-02 | [history-and-duplication.md](history-and-duplication.md) | CA-U03, CA-U19–21 |
| RF-03 | [organization-and-tags.md](organization-and-tags.md) | CA-U04 |
| RF-04 | [organization-and-tags.md](organization-and-tags.md) | CA-U05 |
| RF-05 | [organization-and-tags.md](organization-and-tags.md) | CA-U06 |
| RF-06 | [organization-and-tags.md](organization-and-tags.md) | CA-U06 |
| RF-07 | [organization-and-tags.md](organization-and-tags.md) | CA-U07 |
| RF-08 | [organization-and-tags.md](organization-and-tags.md) | CA-U07–08 |
| RF-09 | [organization-and-tags.md](organization-and-tags.md) | CA-U09–10 |
| RF-10 | [organization-and-tags.md](organization-and-tags.md) | CA-U11 |
| RF-11 | [organization-and-tags.md](organization-and-tags.md) | CA-U12 |
| RF-12 | [organization-and-tags.md](organization-and-tags.md) | CA-U13 |
| RF-13 | [organization-and-tags.md](organization-and-tags.md) | CA-U10, CA-U14 |
| RF-14 | [organization-and-tags.md](organization-and-tags.md) | CA-U14 |
| RF-15 | [history-and-duplication.md](history-and-duplication.md) | CA-U15–16 |
| RF-16 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U17 |
| RF-17 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U17 |
| RF-18 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U18 |
| RF-19 | [history-and-duplication.md](history-and-duplication.md) | CA-U20–21 |
| RF-20 | [history-and-duplication.md](history-and-duplication.md) | CA-U19–21 |
| RF-21 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U22 |
| RF-22 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U23 |
| RF-23 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U24–25 |
| RF-24 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U26 |
| RF-25 | [permissions.md](permissions.md) | CA-U01–02, CA-U27 |
| RF-26 | [permissions.md](permissions.md) | CA-U02, CA-U17–18, CA-U22–25 |

## Regras de negócio

| ID original | Documento principal | Aceitação inicial |
| --- | --- | --- |
| RN-01 | [entities.md](entities.md) | CA-U01–02 |
| RN-02 | [entities.md](entities.md) | CA-U03 |
| RN-03 | [permissions.md](permissions.md) | CA-U02, CA-U27 |
| RN-04 | [permissions.md](permissions.md) | CA-U02 |
| RN-05 | [history-and-duplication.md](history-and-duplication.md) | CA-U19–21 |
| RN-06 | [history-and-duplication.md](history-and-duplication.md) | CA-U20 |
| RN-07 | [organization-and-tags.md](organization-and-tags.md) | CA-U12 |
| RN-08 | [organization-and-tags.md](organization-and-tags.md) | CA-U07–08 |
| RN-09 | [organization-and-tags.md](organization-and-tags.md) | CA-U09–10 |
| RN-10 | [history-and-duplication.md](history-and-duplication.md) | CA-U15–16 |
| RN-11 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U17 |
| RN-12 | [permissions.md](permissions.md) | CA-U17–18 |
| RN-13 | [permissions.md](permissions.md) | CA-U22 |
| RN-14 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U22–23 |
| RN-15 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U24–25 |
| RN-16 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-U26 |
| RN-17 | [overview.md](overview.md) | CA-U29 |
| RN-18 | [overview.md](overview.md) | CA-U30 |

## Requisitos não funcionais

| ID original | Cobertura inicial |
| --- | --- |
| RNF-01 | CA-U06, CA-U32 |
| RNF-02 | CA-U04, CA-U32 |
| RNF-03 | CA-U01–02, CA-U12–13, CA-U27–28 |
| RNF-04 | CA-U01, CA-U28 |
| RNF-05 | CA-U19–21 |
| RNF-06 | CA-U07–09, CA-U25 |
| RNF-07 | CA-U22–26 |
| RNF-08 | CA-U17–26 |
| RNF-09 | CA-U06, CA-U32; rapidez sem metas numéricas aprovadas |

## Definições complementares preservadas

| Tema textual | Consolidação |
| --- | --- |
| Fixação aparece na estrutura da nota | Regras posteriores explicitam preferência individual; modelo separa de conteúdo compartilhado |
| Tags “uma ou mais” | Q-U01 mantém ambiguidade de cadastro sem tag, sem apagar a redação original |
| Restauração retorna ativa | Fluxo explícito da seção 10.2, inclusive se nota era arquivada |
| Versões antigas | Consulta no MVP; restauração futura não é antecipada |
| Cópia | Conteúdo/metadados preservados, novo ID/criação/histórico e fixação independente |
| Retenção | Trinta dias configuráveis para excluídas; relação com versões ativas precisa de refinamento |

## Arquitetura e limites

ADRs 0001–0009 delimitam stack/contratos/autorização; ADR-0010 rege ciclo de dados com divergência registrada sobre histórico específico; ADRs 0013–0019 orientam qualidade e operação. RNF da plataforma são herdados sem renumeração.

Não foram importados compartilhamento pessoal do Okape, restauração administrativa exclusiva do Kapanga, ordem compartilhada do Kitanda ou status de tarefas do Mutyrão. Urukum permanece módulo de notas, com contexto e preferências próprios. Marca cultural/visual detalhada não foi inventada.

Matrizes indicam cobertura inicial, não suíte completa ou testes executados. Refinamentos estão em [pendências](open-questions.md).
