# Urukum — Documentação do módulo

**Produto:** Kafofo · **Área:** Notas digitais · **Escopo:** MVP da especificação fornecida · **Consolidação:** 2026-11-03.

Urukum organiza notas textuais em cartões, com colaboração contextual, preferências visuais individuais e histórico de versões completas. A documentação estrutura o comportamento esperado; não comprova implementação ou testes executados.

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](overview.md) | Finalidade, fronteiras e escopo |
| [Entidades](entities.md) | Nota, versão, tag e preferências individuais |
| [Requisitos funcionais](functional-requirements.md) | RF-01 a RF-26 originais |
| [Regras de negócio](business-rules.md) | RN-01 a RN-18 originais |
| [Permissões](permissions.md) | Privacidade pessoal e colaboração contextual |
| [Estados e recuperação](states-and-lifecycle.md) | Arquivamento, lixeira, restauração e retenção |
| [Histórico e duplicação](history-and-duplication.md) | Versões completas, consulta e cópia independente |
| [Organização e tags](organization-and-tags.md) | Preferências individuais, filtros, fixação e edição |
| [Fluxos](user-flows.md) | Operações de uso |
| [Serviços comuns](cross-cutting-services.md) | Plataforma, segurança, portabilidade e limites |
| [Requisitos não funcionais](non-functional-requirements.md) | Nove RNF próprios e herança da plataforma |
| [Arquitetura](architecture-alignment.md) | ADRs, contratos e responsabilidades |
| [Aceitação](acceptance-criteria.md) | Checklist original e cenários derivados |
| [Rastreabilidade](traceability.md) | Fontes, IDs e cobertura inicial |
| [Refinamentos](open-questions.md) | Lacunas locais e conflitos delimitados |

IDs locais preservados: `urukum/RF-01`, `urukum/RN-01` e `urukum/RNF-01` distinguem o módulo dos demais. Os identificadores CA-U dos cenários foram criados nesta consolidação. Modelo conceitual, sugestões técnicas e sequência de refinamento são derivados, não novas aprovações.

A [fonte original](../../reference/urukum-original.md), a [plataforma](../platform/README.md) e as [ADRs](../../adr/README.md) acompanham o pacote. A distinção central é preservada: restaurar nota excluída é MVP; restaurar versão antiga não é.
