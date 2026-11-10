# Mutyrão — Documentação do módulo

**Produto:** Kafofo · **Área:** Tarefas domésticas · **Escopo:** MVP · **Levantamento:** concluído · **Consolidação:** 2026-11-03.

Documentação estruturada para implementação, preservando os requisitos e delimitando refinamentos locais. Não comprova funcionalidades implementadas ou testes aprovados.

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](overview.md) | Finalidade, identidade, responsabilidades e escopo |
| [Entidades](entities.md) | Tarefa, responsáveis, contexto, checkboxes e lembretes |
| [Requisitos funcionais](functional-requirements.md) | Catálogo dos 33 RF vigentes |
| [Regras de negócio](business-rules.md) | Catálogo das 44 RN da especificação detalhada |
| [Permissões](permissions.md) | Acesso, edição colaborativa, atribuição, ações e restauração |
| [Estados e ciclo de vida](states-and-lifecycle.md) | Conclusão, cancelamento, reabertura, exclusão e recuperação |
| [Descrição e visualizações](checklist-and-views.md) | Texto formatado, checkboxes, lista, quadro, calendário e filtros |
| [Lembretes e notificações](reminders-and-notifications.md) | Eventos, canais, preferências e configurações individuais |
| [Fluxos](user-flows.md) | Uso do módulo e resultados esperados |
| [Serviços comuns](cross-cutting-services.md) | Plataforma, histórico, retenção, portabilidade e limites de integração |
| [Requisitos não funcionais](non-functional-requirements.md) | Herança da plataforma e orientações técnicas derivadas |
| [Arquitetura](architecture-alignment.md) | ADRs, responsabilidades e contratos a especificar |
| [Aceitação](acceptance-criteria.md) | Cenários para verificação futura |
| [Rastreabilidade](traceability.md) | Fontes, IDs, equivalências históricas e cobertura inicial |
| [Refinamentos](open-questions.md) | Lacunas de implementação e conflitos delimitados |

Referências usam escopo, por exemplo `mutyrao/RF-141`, sem renumerar os IDs originais. O catálogo vigente vem da [especificação detalhada fornecida](../../reference/mutyrao-original.md), que refina o resumo anterior. Modelo conceitual, cenários e sugestões técnicas são derivados; não são novas aprovações.

A [plataforma](../platform/README.md) e as [ADRs](../../adr/README.md) acompanham o pacote como referências sem alteração. Os trinta dias de exibição de tarefas encerradas no quadro são uma preferência visual; não equivalem à política de retenção de excluídos da plataforma.
