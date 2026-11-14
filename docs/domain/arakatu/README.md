# Arakatu — Documentação do módulo

**Produto:** Kafofo · **Área:** Calendário e agenda · **Escopo:** MVP aprovado no levantamento consolidado · **Consolidação:** 2026-11-03.

Esta entrega estrutura a base funcional disponível: 15 requisitos funcionais, RF-124–138, e seis regras de negócio, RN-051–056. Não foi localizada uma especificação detalhada separada de Arakatu entre as fontes consultadas. O módulo não recebe por inferência o status de levantamento detalhado concluído dos demais módulos.

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](overview.md) | Objetivo, identidade, capacidades e limites |
| [Entidades](entities.md) | Agenda, evento, ocorrência, origem e lembrete |
| [Requisitos funcionais](functional-requirements.md) | IDs e detalhamento sustentado pela fonte |
| [Regras de negócio](business-rules.md) | Regras aprovadas e definições complementares |
| [Permissões](permissions.md) | Contextos, compartilhamento e limites ainda não detalhados |
| [Eventos e recorrência](events-and-recurrence.md) | Autoria, séries, ocorrências e exceções |
| [Integrações](calendar-integrations.md) | Importação/exportação, assinatura e unidirecionalidade |
| [Lembretes e notificações](reminders-and-notifications.md) | Múltiplos lembretes, preferências e refinamentos temporais |
| [Fluxos](user-flows.md) | Uso esperado e dependências abertas |
| [Serviços comuns](cross-cutting-services.md) | Plataforma, dados, retenção e independência |
| [Requisitos não funcionais](non-functional-requirements.md) | Herança da plataforma e orientações derivadas |
| [Arquitetura](architecture-alignment.md) | ADRs, candidatos e decisões pendentes |
| [Aceitação](acceptance-criteria.md) | Cenários de verificação futura |
| [Rastreabilidade](traceability.md) | Proveniência, IDs e cobertura inicial |
| [Pendências](open-questions.md) | Lacunas funcionais e refinamentos de implementação |

Os IDs originais não foram renumerados. Referências usam escopo `arakatu/RF-124`. Requisitos aprovados, modelos conceituais derivados e pontos pendentes são identificados. Não foram criados IDs para requisitos ausentes nem endpoints fictícios.

A [plataforma](../platform/README.md) e as [ADRs](../../adr/README.md) acompanham o pacote sem alterações. Os documentos descrevem comportamento pretendido; não comprovam implementação, conformidade ou testes executados.
