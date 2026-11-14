# Okape — Rastreabilidade

## Fonte

- Especificação recebida como `Texto colado.txt`, preservada em [okape-original.md](../../reference/okape-original.md); SHA-256: `2495fbb9a4fea79acfc1cad61018d83a0b9a27dbea01d29f82898920df793fc2`.
- [Plataforma](../platform/README.md) e [ADRs](../../adr/README.md), incluídas sem alterações.
- Fonte define 14 RN, oito RNF e 23 itens de aceitação; não numera RF. As 27 capacidades CF-O e os 32 cenários CA-O são organização documental derivada.

## Identificação e limites

Usar `okape/RN-01` e `okape/RNF-01` para distinguir IDs locais dos da plataforma ou de Urukum. Não acrescentar zeros nem atribuir RF globais a capacidades sem ID original.

Os itens do checklist original foram preservados em aceitação. Modelo conceitual, matriz consolidada e sugestões de sequência são derivados dos comportamentos textuais, com ambiguidades explícitas. Não se criou licença, biblioteca de gráficos, grade, cache ou sistema de plugins como decisão aprovada.

## Capacidades funcionais derivadas

| ID documental | Seção da fonte | Documento principal | Aceitação inicial |
| --- | --- | --- | --- |

| CF-O01 | 2.1–2.2 | [overview.md](overview.md) | CA-O01 |
| CF-O02 | 2.1 | [permissions.md](permissions.md) | CA-O02–03 |
| CF-O03 | 2.3 | [permissions.md](permissions.md) | CA-O04 |
| CF-O04 | 2.3 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O06 |
| CF-O05 | 2.4 | [permissions.md](permissions.md) | CA-O07, CA-O09 |
| CF-O06 | 2.4 | [permissions.md](permissions.md) | CA-O08 |
| CF-O07 | 3.1 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O10 |
| CF-O08 | 3.1 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O12 |
| CF-O09 | 3.2 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O10–11 |
| CF-O10 | 3.2 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O11 |
| CF-O11 | 3.2 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O13 |
| CF-O12 | 4.1 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O14 |
| CF-O13 | 4.2 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O15 |
| CF-O14 | 4.3 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O16 |
| CF-O15 | 4.3 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O17 |
| CF-O16 | 4.4 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O18 |
| CF-O17 | 4.5 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O19 |
| CF-O18 | 4.5 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O20 |
| CF-O19 | 5 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O21–22 |
| CF-O20 | 6 | [refresh-and-resilience.md](refresh-and-resilience.md) | CA-O23 |
| CF-O21 | 6 | [refresh-and-resilience.md](refresh-and-resilience.md) | CA-O24 |
| CF-O22 | 7.1 | [refresh-and-resilience.md](refresh-and-resilience.md) | CA-O25 |
| CF-O23 | 7.2 | [refresh-and-resilience.md](refresh-and-resilience.md) | CA-O26 |
| CF-O24 | 7.3 | [refresh-and-resilience.md](refresh-and-resilience.md) | CA-O27 |
| CF-O25 | 2.3 e 8 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O05, CA-O29 |
| CF-O26 | 8 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O28 |
| CF-O27 | 1 e 12 | [overview.md](overview.md) | CA-O15, CA-O30 |

## Regras de negócio originais

| ID original | Documento principal | Aceitação inicial |
| --- | --- | --- |
| RN-01 | [permissions.md](permissions.md) | CA-O01–03 |
| RN-02 | [permissions.md](permissions.md) | CA-O02 |
| RN-03 | [permissions.md](permissions.md) | CA-O03 |
| RN-04 | [permissions.md](permissions.md) | CA-O07 |
| RN-05 | [permissions.md](permissions.md) | CA-O07 |
| RN-06 | [permissions.md](permissions.md) | CA-O04–06 |
| RN-07 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O12 |
| RN-08 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O13 |
| RN-09 | [permissions.md](permissions.md) | CA-O09, CA-O14, CA-O26 |
| RN-10 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O18 |
| RN-11 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O20 |
| RN-12 | [data-sources-and-components.md](data-sources-and-components.md) | CA-O28 |
| RN-13 | [refresh-and-resilience.md](refresh-and-resilience.md) | CA-O25–27, CA-O31 |
| RN-14 | [panel-lifecycle-and-navigation.md](panel-lifecycle-and-navigation.md) | CA-O29 |

## RNF originais

| ID | Cobertura inicial |
| --- | --- |
| RNF-01 | CA-O21, CA-O32 |
| RNF-02 | CA-O09, CA-O14, CA-O26, CA-O32 |
| RNF-03 | CA-O02–03, CA-O09, CA-O32 |
| RNF-04 | CA-O30 |
| RNF-05 | CA-O17, CA-O27 |
| RNF-06 | CA-O25–27, CA-O31 |
| RNF-07 | Revisão arquitetural de catálogo/contratos; sem requisito de instalar extensões no MVP |
| RNF-08 | CA-O15 |

## Relação com o levantamento anterior

A plataforma descreve dashboard contextual e fornecimento de cartões/indicadores. A especificação do Okape detalha composição independente, múltiplos painéis vazios, catálogo e contratos. Não converter o dashboard em painel fixo preconfigurado nem deslocar regras de domínio das fontes para Okape.

O documento de marca lista quatro módulos domésticos; Okape está nomeado na especificação própria. Ampliação do catálogo nominal já está registrada na plataforma; não há etimologia ou visual de marca detalhados para documentar aqui.

## Limite de verificação

A cobertura é inicial, não suíte completa nem testes executados. Refinamentos sobre padrão, administração órfã, acesso, cache e ativação estão em [pendências](open-questions.md). IDs e enunciados originais permanecem preservados.
