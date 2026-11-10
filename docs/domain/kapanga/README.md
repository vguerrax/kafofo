# Kapanga — Documentação do módulo

**Produto:** Kafofo · **Área:** Despesas domésticas · **Escopo:** MVP · **Consolidação:** 2026-11-03.

Levantamento funcional consolidado com refinamentos técnicos e algumas ambiguidades ainda abertas. A documentação descreve o comportamento esperado; não comprova implementação ou testes aprovados.

## Índice

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](overview.md) | Objetivo, identidade, fronteiras e escopo |
| [Entidades](entities.md) | Dados, relações e invariantes conceituais |
| [Requisitos funcionais](functional-requirements.md) | RF-149 a RF-193, com redações atualizadas |
| [Regras de negócio](business-rules.md) | RN-063 a RN-114, preservando os IDs |
| [Permissões](permissions.md) | Operações comuns, administrativas e contexto pessoal |
| [Estados e pagamentos](states-and-payments.md) | Situações, imutabilidade, reversão e exclusão |
| [Recorrência e parcelamento](recurrence-and-installments.md) | Geração, datas, independência e encerramento |
| [Indicadores e consultas](indicators-and-queries.md) | Filtros, mês corrente, vencimentos e limites de cálculo |
| [Fluxos](user-flows.md) | Uso do módulo e operações administrativas |
| [Serviços transversais](cross-cutting-services.md) | Auditoria, Okape, exportação e ciclo de dados |
| [Requisitos não funcionais](non-functional-requirements.md) | Herança da plataforma e orientações derivadas |
| [Arquitetura](architecture-alignment.md) | ADRs aplicáveis, limites e contratos a especificar |
| [Aceitação](acceptance-criteria.md) | Cenários verificáveis, sem alegação de execução |
| [Rastreabilidade](traceability.md) | Fontes, IDs, documentos e alterações consolidadas |
| [Pendências](open-questions.md) | Lacunas restantes, conflitos e riscos |

## Critério de consolidação

A fonte contém definições iniciais e atualizações sucessivas no mesmo arquivo. A redação atual incorpora as atualizações explícitas finais: recorrências são sempre sem término predefinido; `CANCELADO` substitui `EXCLUIDO`; exclusão lógica é independente da situação financeira; data de lançamento e de vencimento ficam bloqueadas quando pago.

Os IDs originais foram preservados, sem duplicar requisitos superados. Referências usam o escopo `kapanga/RF-190` e `kapanga/RN-113`. As pendências antigas resolvidas no próprio arquivo não são reapresentadas como abertas. Lacunas não resolvidas permanecem identificadas, sem novas regras aprovadas por inferência.

A documentação detalha Kapanga. A [plataforma](../platform/README.md) e as [ADRs](../../adr/README.md) acompanham o pacote como referência, sem alteração dos documentos entregues anteriormente.
