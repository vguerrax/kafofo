# Kapanga — Rastreabilidade e proveniência

## Fontes

- Especificação funcional recebida como `Texto colado (2)(1).txt`; SHA-256: `ab21d0991b7018a4b5ae12f010abec01287092f4c50307ff345946a320faeaea`. Cópia histórica: [kapanga-original.md](../../reference/kapanga-original.md).
- Documentação da [plataforma](../platform/README.md), consolidada anteriormente; incluída sem alterações.
- [ADRs 0001–0022](../../adr/README.md), também sem alteração.
- Identidade de marca consolidada fornecida na conversa, usada somente para posicionamento e nome de Kapanga.

Não foram usados requisitos do Potira ou de outras aplicações para preencher lacunas. A estrutura documental, o modelo conceitual, as sugestões de implementação e os cenários são derivados e identificados como tal.

## Atualizações explicitamente consolidadas

| ID/tema | Redação anterior | Definição vigente |
| --- | --- | --- |
| RN-074 | Campos de data sem discriminação | Lançamento e vencimento bloqueados enquanto PAGO, além de valor e forma |
| RF-190 | Recorrência finita ou sem término | Somente sem término predefinido; fim por ação explícita |
| RN-101 | Cálculo de próximos vencimentos | Geração contínua conforme periodicidade, sem quantidade fixa |
| RN-102 | Ajuste de dia inexistente | Último dia do mês, retornando ao dia originalmente previsto quando existir |
| RN-113 | PENDENTE, PAGO, REVERTIDO, EXCLUIDO | PENDENTE, PAGO, REVERTIDO, CANCELADO; exclusão lógica separada |
| RF-185 / período | Período selecionado para resumo | RN-109 fixa indicadores no mês corrente; filtros históricos da consulta permanecem |
| RN-070 versus RN-092 | Proteção de pagas na exclusão do parcelamento; exclusão de despesa paga | Individual pode excluir paga; cadeia preserva pagas, conforme RN-106 |

Os nove itens de pendência antigos da fonte foram confrontados com a seção adicional e suas atualizações finais. A lista atual separa o que já foi resolvido do que ainda exige refinamento. Nenhuma ADR foi promovida ou substituída automaticamente.

## Requisitos funcionais

Há 45 RF vigentes, de RF-149 a RF-193. Não foram criados requisitos novos para preencher outros números do produto.

| ID | Documento principal | Aceitação inicial | ADRs relacionadas |
| --- | --- | --- | --- |

| RF-149 | [entities.md](entities.md) | CA-K01, CA-K05–10 | 0003, 0005–0009 |
| RF-150 | [entities.md](entities.md) | CA-K01, CA-K05–10 | 0003, 0005–0009 |
| RF-151 | [entities.md](entities.md) | CA-K01, CA-K05–10 | 0003, 0005–0009 |
| RF-152 | [entities.md](entities.md) | CA-K01, CA-K05–10 | 0003, 0005–0009 |
| RF-153 | [entities.md](entities.md) | CA-K01, CA-K05–10 | 0003, 0005–0009 |
| RF-154 | [entities.md](entities.md) | CA-K01, CA-K05–10 | 0003, 0005–0009 |
| RF-155 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16, CA-K22 | 0005–0007, 0012 |
| RF-156 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16, CA-K22 | 0005–0007, 0012 |
| RF-157 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16, CA-K22 | 0005–0007, 0012 |
| RF-158 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16, CA-K22 | 0005–0007, 0012 |
| RF-159 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16, CA-K22 | 0005–0007, 0012 |
| RF-160 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16, CA-K22 | 0005–0007, 0012 |
| RF-161 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16, CA-K22 | 0005–0007, 0012 |
| RF-162 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16, CA-K22 | 0005–0007, 0012 |
| RF-163 | [permissions.md](permissions.md) | CA-K03–04 | 0007, 0009 |
| RF-164 | [permissions.md](permissions.md) | CA-K03–04 | 0007, 0009 |
| RF-165 | [permissions.md](permissions.md) | CA-K03–04 | 0007, 0009 |
| RF-166 | [permissions.md](permissions.md) | CA-K03–04 | 0007, 0009 |
| RF-167 | [permissions.md](permissions.md) | CA-K03–04 | 0007, 0009 |
| RF-168 | [permissions.md](permissions.md) | CA-K03–04 | 0007, 0009 |
| RF-169 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K17–20, CA-K30 | 0005–0007 |
| RF-170 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K17–20, CA-K30 | 0005–0007 |
| RF-171 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K17–20, CA-K30 | 0005–0007 |
| RF-172 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K17–20, CA-K30 | 0005–0007 |
| RF-173 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K17–20, CA-K30 | 0005–0007 |
| RF-174 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K17–20, CA-K30 | 0005–0007 |
| RF-175 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K17–20, CA-K30 | 0005–0007 |
| RF-176 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K17–20, CA-K30 | 0005–0007 |
| RF-177 | [entities.md](entities.md) | CA-K01–02, CA-K06 | 0005–0007 |
| RF-178 | [entities.md](entities.md) | CA-K01–02, CA-K06 | 0005–0007 |
| RF-179 | [user-flows.md](user-flows.md) | CA-K24–25 | 0009–0010 |
| RF-180 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-181 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-182 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-183 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-184 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-185 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-186 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-187 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-188 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-189 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 | 0007, 0009 |
| RF-190 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–16 | 0012 |
| RF-191 | [states-and-payments.md](states-and-payments.md) | CA-K20–23 | 0009–0010 |
| RF-192 | [user-flows.md](user-flows.md) | CA-K24–25 | 0009–0010 |
| RF-193 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K29 | 0007, 0009 |

## Regras de negócio

Há 52 RN vigentes, de RN-063 a RN-114. A matriz remete à cobertura inicial por grupo; não declara completude da suíte de testes.

| ID | Documento principal | Aceitação inicial |
| --- | --- | --- |
| RN-063 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-064 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-065 | [entities.md](entities.md) | CA-K01–04 |
| RN-066 | [entities.md](entities.md) | CA-K01–04 |
| RN-067 | [entities.md](entities.md) | CA-K01–04 |
| RN-068 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-069 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-070 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-071 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-072 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-073 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-074 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-075 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-076 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-077 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-078 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-079 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-080 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-081 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-082 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-083 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-084 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-085 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-086 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-087 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-088 | [entities.md](entities.md) | CA-K01–04 |
| RN-089 | [entities.md](entities.md) | CA-K01–04 |
| RN-090 | [entities.md](entities.md) | CA-K01–04 |
| RN-091 | [entities.md](entities.md) | CA-K01–04 |
| RN-092 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-093 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-094 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-095 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-096 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-097 | [user-flows.md](user-flows.md) | CA-K24–25 |
| RN-098 | [user-flows.md](user-flows.md) | CA-K24–25 |
| RN-099 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 |
| RN-100 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-101 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-102 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-103 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-104 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-105 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |
| RN-106 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-107 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-108 | [user-flows.md](user-flows.md) | CA-K24–25 |
| RN-109 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 |
| RN-110 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 |
| RN-111 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 |
| RN-112 | [indicators-and-queries.md](indicators-and-queries.md) | CA-K26–29 |
| RN-113 | [states-and-payments.md](states-and-payments.md) | CA-K05–10, CA-K19–25, CA-K30 |
| RN-114 | [recurrence-and-installments.md](recurrence-and-installments.md) | CA-K11–22 |

## Escopo dos IDs

Nesta documentação, RF e RN sem prefixo de produto pertencem ao Kapanga. Referências de plataforma aparecem qualificadas ou na seção de RNF herdados. Os requisitos de identidade, notificações, backup e exportação não são renumerados dentro do módulo. A numeração local CA-K identifica cenários desta consolidação, sem alterar o catálogo original.
