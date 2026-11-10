# Kitanda — Documentação do módulo

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


**Produto:** Kafofo · **Área:** Listas de compras · **Escopo:** MVP · **Levantamento:** concluído · **Consolidação:** 2026-11-03.

A documentação organiza as definições aprovadas para implementação, com refinamentos locais ainda necessários. Não comprova código implementado nem testes executados.

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](overview.md) | Objetivo, identidade e escopo |
| [Entidades](entities.md) | Lista, item, contexto, compartilhamento e histórico |
| [Requisitos funcionais](functional-requirements.md) | 22 RF da especificação atual |
| [Regras de negócio](business-rules.md) | 35 RN atuais e duas restrições herdadas identificadas |
| [Permissões](permissions.md) | Participação, edição, exclusão e restauração |
| [Ciclo de vida](list-and-item-lifecycle.md) | Compra, limpeza, exclusão, restauração e reutilização |
| [Organização e colaboração](organization-and-collaboration.md) | Duplicados, ordem compartilhada, progresso e atualização |
| [Fluxos](user-flows.md) | Operações de uso |
| [Serviços comuns](cross-cutting-services.md) | Plataforma, auditoria, notificações e portabilidade |
| [Requisitos não funcionais](non-functional-requirements.md) | Herança da plataforma e orientações técnicas |
| [Arquitetura](architecture-alignment.md) | ADRs, responsabilidades e contratos a refinar |
| [Aceitação](acceptance-criteria.md) | Cenários verificáveis derivados |
| [Rastreabilidade](traceability.md) | IDs, fontes e equivalências históricas |
| [Pendências](open-questions.md) | Refinamentos de implementação e conflitos delimitados |

Os IDs vigentes são RF-144–147 e RF-296–313; RN-062 e RN-227–260. RN-060/061, do levantamento anterior, proíbem templates e recorrência automática; continuam compatíveis com as restrições atuais e aparecem separadamente como herdadas.

A especificação detalhada refinou os significados de RF-145/146 e não repetiu RF-148: as equivalências históricas estão na rastreabilidade. Não criar um requisito novo para preencher esse número.

Referências usam escopo, como `kitanda/RF-145`, sem alterar a numeração fornecida. Modelo conceitual, cenários e orientações técnicas são derivados, não novas decisões aprovadas. A [plataforma](../platform/README.md) e as [ADRs](../../adr/README.md) acompanham o pacote sem alteração.

## Refinamentos da Alpha 1

O [contrato aprovado](alpha-1.md) consolida as decisões das issues [#1](https://github.com/vguerrax/kafofo/issues/1) e [#3](https://github.com/vguerrax/kafofo/issues/3), com alcance, adiamentos e aceitação complementar. O backlog e as evidências de execução permanecem nas Issues e no Project.
