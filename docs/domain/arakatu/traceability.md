# Arakatu — Rastreabilidade

## Proveniência e limites

- Base principal: seção 18 de `Markdown colado.md`; SHA-256 do arquivo de origem local: `e736b1437dde18d75c7dc08890fbec13e202f61aa13a680834dcb617cdda52cd`. O [extrato](../../reference/arakatu-extrato-levantamento.md) preserva a seção lida; o [levantamento integral](../../reference/levantamento-original.md) acompanha a plataforma.
- Seção 22 do levantamento identifica pendências de calendário: implementação, importação/assinatura/atualização, exceções/fusos e administração de importados.
- [Plataforma](../platform/README.md) e [ADRs](../../adr/README.md), incluídas sem alterações. ADR-0019 confirma agenda utilizável, PWA e integração unidirecional, sem fixar protocolo por conta própria.
- Documento de marca fornecido na conversa: nome definitivo e ressalva linguística de Arakatu.
- Busca adicional entre arquivos disponíveis não localizou uma especificação funcional detalhada separada para Arakatu. O arquivo conhecido como `Texto colado (2).txt` foi conferido e é uma versão de Kapanga, não de calendário.

Não há alegação de acesso a requisitos adicionais não fornecidos. Os 15 RF e seis RN vêm diretamente dos títulos da seção 18; o detalhamento usa somente texto dessa seção e regras comuns identificadas. Não foram inventados RF-194 em diante ou RN-115 em diante para preencher intervalos de outros módulos.

## Requisitos funcionais

| ID | Documento principal | Aceitação inicial |
| --- | --- | --- |

| RF-124 | [overview.md](overview.md) | CA-A01 |
| RF-125 | [calendar-integrations.md](calendar-integrations.md) | CA-A03 |
| RF-126 | [permissions.md](permissions.md) | CA-A01–02 |
| RF-127 | [permissions.md](permissions.md) | CA-A01–02 |
| RF-128 | [calendar-integrations.md](calendar-integrations.md) | CA-A04, CA-A08 |
| RF-129 | [calendar-integrations.md](calendar-integrations.md) | CA-A06–07, CA-A24 |
| RF-130 | [calendar-integrations.md](calendar-integrations.md) | CA-A03 |
| RF-131 | [calendar-integrations.md](calendar-integrations.md) | CA-A05, CA-A08–09 |
| RF-132 | [events-and-recurrence.md](events-and-recurrence.md) | CA-A12–16 |
| RF-133 | [events-and-recurrence.md](events-and-recurrence.md) | CA-A12 |
| RF-134 | [events-and-recurrence.md](events-and-recurrence.md) | CA-A13–14 |
| RF-135 | [events-and-recurrence.md](events-and-recurrence.md) | CA-A15–16 |
| RF-136 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-A17–19 |
| RF-137 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-A17 |
| RF-138 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-A18 |

## Regras de negócio

| ID | Documento principal | Aceitação inicial |
| --- | --- | --- |
| RN-051 | [architecture-alignment.md](architecture-alignment.md) | CA-A22 |
| RN-052 | [overview.md](overview.md) | CA-A10–11 |
| RN-053 | [calendar-integrations.md](calendar-integrations.md) | CA-A04 |
| RN-054 | [calendar-integrations.md](calendar-integrations.md) | CA-A05 |
| RN-055 | [calendar-integrations.md](calendar-integrations.md) | CA-A09 |
| RN-056 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-A17–19 |

## Definições textuais sem ID separado

| Definição | Documento |
| --- | --- |
| Origem identificável e criação/administração própria | [Eventos](events-and-recurrence.md) |
| Assinatura prioritária e candidatos não escolhidos | [Integrações](calendar-integrations.md) |
| Exceção não modifica demais ocorrências | [Recorrência](events-and-recurrence.md) |
| Preferências individuais para lembretes | [Lembretes](reminders-and-notifications.md) |
| Agenda sem migração obrigatória | [Visão geral](overview.md) |

## Herança e aceitação

RNF da plataforma são referenciados sem renumeração. ADRs se aplicam conforme documento de arquitetura, sem aprovar FullCalendar, Radicale, Nextcloud Calendar ou servidor CalDAV. São 24 cenários de aceitação, não executados; referências apontam cobertura inicial, não suíte completa.

## Distinções preservadas

Importação/exportação não equivalem automaticamente a assinatura/sincronização. Integração unidirecional não define sozinha direção de todos os fluxos. Agenda de eventos não herda ajustes financeiros de recorrência, categorias de tarefas ou proibição particular de compartilhamento das listas de compras.

O status documental do Arakatu reflete a base consolidada disponível; as lacunas estão em [pendências](open-questions.md), sem declaração de levantamento detalhado encerrado.
