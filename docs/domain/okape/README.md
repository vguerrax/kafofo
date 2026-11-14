# Okape — Documentação do módulo

**Produto:** Kafofo · **Área:** Composição de painéis · **Escopo:** MVP da especificação fornecida · **Consolidação:** 2026-11-03.

Okape reúne dados de módulos e integrações em apresentações configuráveis, preservando as regras e permissões das origens. A documentação estrutura a especificação sem comprovar código implementado ou testes executados.

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](overview.md) | Finalidade, responsabilidades, catálogo e escopo |
| [Entidades](entities.md) | Painel, fonte, componente, instância e preferências |
| [Capacidades funcionais](functional-requirements.md) | 27 capacidades derivadas das seções funcionais da fonte |
| [Regras de negócio](business-rules.md) | RN-01 a RN-14 originais |
| [Permissões](permissions.md) | Painéis pessoais/compartilhados e autorização da origem |
| [Ciclo de vida e navegação](panel-lifecycle-and-navigation.md) | Padrão, ativação, ordenação, administração e exclusão |
| [Fontes e componentes](data-sources-and-components.md) | Contratos conceituais, compatibilidade, configuração e cópia |
| [Atualização e resiliência](refresh-and-resilience.md) | Intervalos por origem, falhas, acesso e incompatibilidade |
| [Fluxos](user-flows.md) | Composição, compartilhamento e manutenção |
| [Serviços comuns](cross-cutting-services.md) | Plataforma, dados, auditoria e portabilidade |
| [Requisitos não funcionais](non-functional-requirements.md) | Oito RNF próprios e herança da plataforma |
| [Arquitetura](architecture-alignment.md) | ADRs e limites do módulo |
| [Aceitação](acceptance-criteria.md) | Checklist original e cenários derivados |
| [Rastreabilidade](traceability.md) | Seções de origem, IDs e cobertura inicial |
| [Refinamentos](open-questions.md) | Ambiguidades e pontos locais de implementação |

A fonte não numera requisitos funcionais como RF. Esta entrega usa **CF-O01–CF-O27** como identificadores documentais derivados, sem apresentá-los como RF aprovados. RN-01–14 e RNF-01–08 permanecem com seus IDs e redação originais, qualificados pelo escopo `okape` quando necessário.

A [fonte original](../../reference/okape-original.md), a [plataforma](../platform/README.md) e as [ADRs](../../adr/README.md) acompanham o pacote; referências existentes foram preservadas. Identificadores CA-O dos cenários de verificação também são derivados.
