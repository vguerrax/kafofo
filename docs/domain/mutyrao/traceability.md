# Mutyrão — Rastreabilidade

## Fontes

- Especificação detalhada recebida como `Texto colado (3).txt`, copiada sem alteração para [mutyrao-original.md](../../reference/mutyrao-original.md). SHA-256: `a043fef5fa52f5337e38e3b6ebe3a9edf7595bf998c811c7ffc5c29a9cc3367f`.
- [Plataforma](../platform/README.md) e [ADRs](../../adr/README.md), incluídas sem alteração.
- [Levantamento anterior](../../reference/levantamento-original.md), usado para identificar refinamentos, sem sobrepor a especificação detalhada.
- Definições de marca fornecidas pelo autor, para nome e personalidade.

## Refinamentos do resumo anterior

| Tema | Resumo anterior | Especificação detalhada vigente |
| --- | --- | --- |
| RF-141 / atribuição | Responsável opcional | Zero, um ou vários; RF-269/293/294 e RN-187–189/219–222 detalham comportamento |
| Status | Quatro status inicialmente propostos | Especificação mantém Pendente, Em andamento, Concluída e Cancelada e define ações; máquina completa ainda não formalizada |
| Dados | Nome, responsável, status e histórico | Descrição formatada/checklist, prazo, prioridade e categorias incluídos na especificação detalhada |
| RN-057 | Responsável opcional | Capacidade mantida por RF-293; ID antigo não repetido no catálogo atual |
| RN-058 | Sem recorrência | Mantida expressamente na especificação atual |
| RN-059 | Sem comentários | Mantida funcionalmente por RN-211; ID antigo não duplicado no catálogo vigente |
| Visualizações | Sem detalhamento equivalente | Lista, quadro e calendário próprios; não importar proibição de Kanban do Kitanda |

O levantamento detalhado está concluído. Refinamentos de implementação não mudam os IDs nem invalidam as decisões explícitas. RF e RN dos catálogos foram extraídos diretamente da fonte atual; não foram criados números novos.

## Requisitos funcionais

| ID | Documento principal | Aceitação inicial |
| --- | --- | --- |

| RF-139 | [entities.md](entities.md) | CA-M01 |
| RF-140 | [entities.md](entities.md) | CA-M01 |
| RF-141 | [permissions.md](permissions.md) | CA-M05–07 |
| RF-142 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12 |
| RF-143 | [cross-cutting-services.md](cross-cutting-services.md) | CA-M33 |
| RF-268 | [permissions.md](permissions.md) | CA-M03–04 |
| RF-269 | [entities.md](entities.md) | CA-M05 |
| RF-270 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M10–11 |
| RF-271 | [checklist-and-views.md](checklist-and-views.md) | CA-M01, CA-M13 |
| RF-272 | [checklist-and-views.md](checklist-and-views.md) | CA-M13 |
| RF-273 | [entities.md](entities.md) | CA-M01, CA-M16–17 |
| RF-274 | [checklist-and-views.md](checklist-and-views.md) | CA-M02 |
| RF-275 | [checklist-and-views.md](checklist-and-views.md) | CA-M18 |
| RF-276 | [checklist-and-views.md](checklist-and-views.md) | CA-M14–15 |
| RF-277 | [checklist-and-views.md](checklist-and-views.md) | CA-M19 |
| RF-278 | [checklist-and-views.md](checklist-and-views.md) | CA-M19–21 |
| RF-279 | [checklist-and-views.md](checklist-and-views.md) | CA-M19 |
| RF-280 | [checklist-and-views.md](checklist-and-views.md) | CA-M20–21 |
| RF-281 | [checklist-and-views.md](checklist-and-views.md) | CA-M22 |
| RF-282 | [checklist-and-views.md](checklist-and-views.md) | CA-M16–17, CA-M22 |
| RF-283 | [checklist-and-views.md](checklist-and-views.md) | CA-M23 |
| RF-284 | [checklist-and-views.md](checklist-and-views.md) | CA-M23 |
| RF-285 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M24 |
| RF-286 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M25 |
| RF-287 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M26 |
| RF-288 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M27 |
| RF-289 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M27 |
| RF-290 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M28 |
| RF-291 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M28 |
| RF-292 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M29 |
| RF-293 | [user-flows.md](user-flows.md) | CA-M01, CA-M06 |
| RF-294 | [user-flows.md](user-flows.md) | CA-M07 |
| RF-295 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M31–32 |

## Regras de negócio

| ID | Documento principal | Aceitação inicial |
| --- | --- | --- |
| RN-058 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-184 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-185 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-186 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-187 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-188 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-189 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-190 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-191 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-192 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-193 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-194 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-195 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-196 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-197 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-198 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-199 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-200 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-201 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-202 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-203 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-204 | [checklist-and-views.md](checklist-and-views.md) | CA-M02 |
| RN-205 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-206 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-207 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-208 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-209 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-210 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-211 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-212 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-213 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-214 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-215 | [checklist-and-views.md](checklist-and-views.md) | CA-M13–15, CA-M18–23, CA-M34 |
| RN-216 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M24–30 |
| RN-217 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M24–30 |
| RN-218 | [reminders-and-notifications.md](reminders-and-notifications.md) | CA-M24–30 |
| RN-219 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-220 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-221 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-222 | [permissions.md](permissions.md) | CA-M03–07, CA-M35 |
| RN-223 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-224 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-225 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |
| RN-226 | [states-and-lifecycle.md](states-and-lifecycle.md) | CA-M08–12, CA-M16–17, CA-M31–33 |

## Arquitetura e verificação

ADRs 0001–0009 delimitam módulo, stack, contratos e autorização; ADR-0010 trata ciclo de dados e possui divergência já registrada sobre auditoria específica; ADR-0012 orienta processamento de notificações/lembretes; ADRs 0013–0019 orientam validação e operação. RNF são herdados da plataforma, sem IDs novos no Mutyrão.

São 33 RF, 44 RN e 36 cenários de aceitação. Matrizes apontam cobertura inicial, não uma suíte executada ou completa. Definições textuais sem ID próprio, como preservação das tarefas abertas no quadro e ausência de templates, também foram incorporadas.

## Limites de consolidação

Não importar regra de categoria exclusiva de administrador do Kapanga, compartilhamento restrito do Kitanda, exceção de painéis pessoais do Okape ou ordenação individual do Urukum. Regras específicas de Mutyrão permanecem neste domínio; estado do checklist, status da tarefa e exclusão lógica são conceitos separados.
