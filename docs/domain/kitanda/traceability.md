# Kitanda — Rastreabilidade

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


## Fontes e escopo

- Especificação funcional Kitanda, MVP, levantamento concluído, fornecida diretamente na conversa. O [registro das definições](../../reference/kitanda-definicoes-fornecidas.md) transcreve os enunciados e complementos; não é arquivo original anexado.
- [Levantamento histórico](../../reference/levantamento-original.md): RN-060/061 e equivalências anteriores de RF-144–148.
- [Plataforma](../platform/README.md) e [ADRs](../../adr/README.md), incluídas sem alteração.
- Identidade de marca fornecida pelo autor, utilizada para nome/posicionamento.
- Referência cruzada do Urukum à consistência de editor: usada somente para registrar Q-I15, sem aprovar texto rico para Kitanda.

## Equivalências e refinamentos históricos

| Tema | Levantamento anterior | Especificação detalhada vigente |
| --- | --- | --- |
| RF-144 | Gerenciamento de listas | Mantido |
| RF-145 | Itens da lista | Compartilhamento de listas |
| RF-146 | Quantidade de itens | Gerenciamento de itens; quantidade passa a integrar RF-298 e RN-232 |
| RF-147 | Marcação de compra | Mantido e ampliado por RF-301 |
| RF-148 | Compartilhamento | Capacidade coberta atualmente por RF-145; ID não repetido na especificação detalhada |
| RN-060/061 | Sem templates/recorrência | Mantidas como restrições atuais; referências herdadas separadas |
| Compartilhamento externo | Pendência no resumo antigo | Proibido no MVP por RN-259/260 |

A especificação detalhada fornecida pelo autor rege Kitanda. Não alterar IDs de plataforma ou de outros módulos para compensar mudanças locais. RF-148 não foi reutilizado para outra capacidade.

## Requisitos funcionais

| ID | Documento principal | Aceitação inicial |
| --- | --- | --- |

| RF-144 | [user-flows.md](user-flows.md) | CA-I01–02 |
| RF-145 | [permissions.md](permissions.md) | CA-I04 |
| RF-146 | [entities.md](entities.md) | CA-I05, CA-I12 |
| RF-147 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I09 |
| RF-296 | [overview.md](overview.md) | CA-I02 |
| RF-297 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I06–07 |
| RF-298 | [entities.md](entities.md) | CA-I05 |
| RF-299 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I08 |
| RF-300 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I11 |
| RF-301 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I09–10 |
| RF-302 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I13, CA-I15 |
| RF-303 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I14–15 |
| RF-304 | [entities.md](entities.md) | CA-I01 |
| RF-305 | [entities.md](entities.md) | CA-I01 |
| RF-306 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I16–17 |
| RF-307 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I18 |
| RF-308 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I19, CA-I29 |
| RF-309 | [cross-cutting-services.md](cross-cutting-services.md) | CA-I20–21 |
| RF-310 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I26–27, CA-I29 |
| RF-311 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I26–27, CA-I29 |
| RF-312 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I11, CA-I28 |
| RF-313 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I28 |

## Regras da especificação atual

| ID | Documento principal | Aceitação inicial |
| --- | --- | --- |
| RN-062 | [permissions.md](permissions.md) | CA-I03–04, CA-I16–18, CA-I31 |
| RN-227 | [permissions.md](permissions.md) | CA-I03–04, CA-I16–18, CA-I31 |
| RN-228 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-229 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I06–08, CA-I26–29 |
| RN-230 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I06–08, CA-I26–29 |
| RN-231 | [entities.md](entities.md) | CA-I01, CA-I05 |
| RN-232 | [entities.md](entities.md) | CA-I01, CA-I05 |
| RN-233 | [entities.md](entities.md) | CA-I01, CA-I05 |
| RN-234 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I06–08, CA-I26–29 |
| RN-235 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-236 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-237 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-238 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-239 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-240 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-241 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-242 | [entities.md](entities.md) | CA-I01, CA-I05 |
| RN-243 | [permissions.md](permissions.md) | CA-I03–04, CA-I16–18, CA-I31 |
| RN-244 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-245 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-246 | [permissions.md](permissions.md) | CA-I03–04, CA-I16–18, CA-I31 |
| RN-247 | [permissions.md](permissions.md) | CA-I03–04, CA-I16–18, CA-I31 |
| RN-248 | [cross-cutting-services.md](cross-cutting-services.md) | CA-I20–24 |
| RN-249 | [cross-cutting-services.md](cross-cutting-services.md) | CA-I20–24 |
| RN-250 | [cross-cutting-services.md](cross-cutting-services.md) | CA-I20–24 |
| RN-251 | [cross-cutting-services.md](cross-cutting-services.md) | CA-I20–24 |
| RN-252 | [cross-cutting-services.md](cross-cutting-services.md) | CA-I20–24 |
| RN-253 | [cross-cutting-services.md](cross-cutting-services.md) | CA-I20–24 |
| RN-254 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-255 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-256 | [list-and-item-lifecycle.md](list-and-item-lifecycle.md) | CA-I02, CA-I09–17, CA-I25 |
| RN-257 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I06–08, CA-I26–29 |
| RN-258 | [organization-and-collaboration.md](organization-and-collaboration.md) | CA-I06–08, CA-I26–29 |
| RN-259 | [permissions.md](permissions.md) | CA-I03–04, CA-I16–18, CA-I31 |
| RN-260 | [permissions.md](permissions.md) | CA-I03–04, CA-I16–18, CA-I31 |

## Herança e arquitetura

As duas restrições RN-060/061 herdadas estão cobertas por CA-I30. RNF da plataforma são aplicados sem renumeração; CA-I32 organiza verificação inicial. ADRs 0001–0009 delimitam módulo, stack e contratos; ADR-0010 rege ciclo de dados, com divergência de auditoria registrada; ADRs 0013–0019 orientam validação e operação. Bibliotecas complementares, CD e licença permanecem pendentes.

Há 22 RF, 35 RN na especificação atual e duas restrições herdadas identificadas. São 32 cenários de aceitação. Matrizes remetem à cobertura inicial, sem afirmar completude de testes.

## Limites da consolidação

Não foram importadas funcionalidades do Jaci, regras financeiras do Kapanga, ordenação individual do Urukum ou compartilhamento ampliado do Okape. A estrutura documental, modelo conceitual e cenários são derivados; opções não aprovadas permanecem nas pendências de implementação.

## Refinamento aprovado em 2026-11-06

O [contrato da Alpha 1](alpha-1.md) acrescenta alcance e critérios complementares sem renumerar RF, RN ou CA. As issues #1 e #3 registram a aprovação. Critérios gerais de capacidades adiadas não são declarados atendidos pelo incremento.
