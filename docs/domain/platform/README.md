# Kafofo — Documentação da plataforma

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


**Escopo:** MVP da plataforma · **Consolidação:** 2026-11-03 · **Status:** documentação funcional estruturada; não comprova implementação.

A plataforma fornece a base comum para identidade, administração, contextos, autorização e serviços transversais do ecossistema Kafofo. As regras específicas de cada módulo serão documentadas separadamente.

## Percurso de leitura

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](overview.md) | Objetivo, fronteiras, atores e escopo |
| [Entidades](entities.md) | Glossário, relações e invariantes conceituais |
| [Requisitos funcionais](functional-requirements.md) | Catálogo dos RF-001 a RF-123, preservando os IDs originais |
| [Regras de negócio](business-rules.md) | RN da plataforma e comportamento consolidado |
| [Permissões](permissions.md) | Papéis, limites e matriz de acesso conhecida |
| [Fluxos](user-flows.md) | Cadastro, convites, saída, recuperação, exclusão e exportação |
| [Serviços transversais](cross-cutting-services.md) | Notificações, auditoria, módulos e integrações |
| [Requisitos não funcionais](non-functional-requirements.md) | RNF-001 a RNF-025 e limites de verificação |
| [Relação com a arquitetura](architecture-alignment.md) | ADRs aplicáveis e proposta de limites internos |
| [Critérios de aceitação](acceptance-criteria.md) | Cenários verificáveis derivados dos requisitos |
| [Rastreabilidade](traceability.md) | Fontes, IDs, documentos, ADRs e cenários |
| [Pendências e conflitos](open-questions.md) | Lacunas, conflitos e refinamentos necessários |

## Como interpretar

- **Definido:** comportamento explícito nas fontes funcionais ou decisão aceita nas ADRs.
- **Condicionado:** adoção técnica sujeita à prova de conceito; aplica-se ao Better Auth.
- **Pendente:** comportamento ou escolha ainda sem definição suficiente.
- **Derivado/proposto:** organização documental, cenário de verificação ou recomendação técnica desta consolidação; não equivale a nova aprovação.

Os IDs originais são preservados. Referências completas usam o escopo, por exemplo `plataforma/RF-001`, `okape/RN-01` e `urukum/RN-01`, evitando colisões sem renumerar as fontes. A RN-020 não foi localizada: o salto é preservado. O cabeçalho quantitativo do levantamento original é histórico; não expressa o total atual do produto.

Os documentos específicos mais recentes refinam os respectivos módulos. Isso não permite generalizar uma exceção de um módulo para toda a plataforma. Divergências com ADRs permanecem registradas para revisão explícita; as ADRs fornecidas foram copiadas sem alteração.

## Referências

- [Levantamento original](../../reference/levantamento-original.md), preservado para consulta histórica; contém também requisitos de módulos e trechos superados.
- [Registro das fontes](../../reference/fontes.md).
- [ADRs](../../adr/README.md).
- [Identidade e fronteira com os módulos](../../brand/platform-identity.md).

A implementação e seus testes não foram executados nesta etapa. Critérios de aceitação descrevem o comportamento esperado e não representam verificações já aprovadas.

## Refinamentos da Alpha 1

O [contrato aprovado](alpha-1.md) consolida as decisões das issues [#1](https://github.com/vguerrax/kafofo/issues/1) e [#3](https://github.com/vguerrax/kafofo/issues/3), com alcance, adiamentos e aceitação complementar. O backlog e as evidências de execução permanecem nas Issues e no Project.
