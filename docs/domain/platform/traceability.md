# Plataforma — Rastreabilidade

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


## Requisitos funcionais

A matriz agrupa IDs consecutivos apenas para facilitar leitura; cada ID permanece individual no catálogo funcional. Referências de aceitação são cenários de cobertura inicial, não alegação de completude de testes.

| IDs da plataforma | Domínio | Documento principal | ADRs | Aceitação |
| --- | --- | --- | --- | --- |
| RF-001–RF-005 | Integrações | [cross-cutting-services.md](cross-cutting-services.md) | 0001, 0019 | CA-P01, CA-P02 |
| RF-006–RF-009 | Identidade | [user-flows.md](user-flows.md) | 0008, 0009 | CA-P03, CA-P04 |
| RF-010–RF-018 | Núcleos e organização | [entities.md](entities.md) | 0009 | CA-P05, CA-P06 |
| RF-019–RF-021 | Espaços e compartilhamento | [permissions.md](permissions.md) | 0009 | CA-P07, CA-P08 |
| RF-022–RF-025 | Membros e papéis | [permissions.md](permissions.md) | 0009 | CA-P09 |
| RF-026–RF-033 | Convites e saída | [user-flows.md](user-flows.md) | 0009 | CA-P10, CA-P11, CA-P12 |
| RF-034–RF-036 | Ciclo de vida do núcleo | [user-flows.md](user-flows.md) | 0010 | CA-P13, CA-P14 |
| RF-037–RF-042 | Papéis de residência | [permissions.md](permissions.md) | 0009 | CA-P15 |
| RF-043–RF-048 | Ciclo de vida da residência | [user-flows.md](user-flows.md) | 0009, 0010 | CA-P16, CA-P17 |
| RF-049–RF-052 | Contextualização dos módulos | [cross-cutting-services.md](cross-cutting-services.md) | 0001, 0019 | CA-P18 |
| RF-053–RF-059 | Catálogo e ativação | [cross-cutting-services.md](cross-cutting-services.md) | 0001, 0009 | CA-P19, CA-P20 |
| RF-060–RF-067 | Configuração inicial | [user-flows.md](user-flows.md) | 0008, 0009 | CA-P21 |
| RF-068–RF-079 | Navegação e dashboard | [overview.md](overview.md) | 0001, 0004, 0009 | CA-P22, CA-P23 |
| RF-080–RF-093 | Notificações | [cross-cutting-services.md](cross-cutting-services.md) | 0012, 0019 | CA-P24, CA-P25, CA-P26 |
| RF-094–RF-097 | Perfil | [permissions.md](permissions.md) | 0008, 0009, 0011 | CA-P27 |
| RF-098–RF-103 | Recuperação de senha | [user-flows.md](user-flows.md) | 0008, 0009, 0018 | CA-P28, CA-P29 |
| RF-104–RF-107 | Segundo fator | [user-flows.md](user-flows.md) | 0008 | CA-P30 |
| RF-108–RF-111 | Sessões | [user-flows.md](user-flows.md) | 0008 | CA-P31, CA-P32 |
| RF-112–RF-115 | Auditoria | [cross-cutting-services.md](cross-cutting-services.md) | 0010, 0018 | CA-P33 |
| RF-116–RF-121 | Exclusão de conta | [user-flows.md](user-flows.md) | 0010 | CA-P34 |
| RF-122–RF-123 | Exportação individual | [user-flows.md](user-flows.md) | 0010, 0011, 0012 | CA-P35 |

## Regras e requisitos não funcionais

| IDs da plataforma | Documento | Aceitação principal |
| --- | --- | --- |
| RN-001–003 | [Permissões](permissions.md) | CA-P09, CA-P15 |
| RN-004–008 | [Fluxos](user-flows.md) | CA-P10–11 |
| RN-009–015 | [Fluxos](user-flows.md) | CA-P12, CA-P34 |
| RN-016–019, RN-021–025 | [Regras](business-rules.md) | CA-P13–17 |
| RN-026–031 | [Serviços](cross-cutting-services.md) | CA-P19–20 |
| RN-032–035 | [Fluxos](user-flows.md) | CA-P21 |
| RN-036 | [Permissões](permissions.md) | CA-P22–23 |
| RN-037–040 | [Serviços](cross-cutting-services.md) | CA-P24–26 |
| RN-041 | [Permissões](permissions.md) | CA-P27 |
| RN-042–045 | [Fluxos](user-flows.md) | CA-P28–29 |
| RN-046 | [Fluxos](user-flows.md) | CA-P31–32 |
| RN-047 | [Serviços](cross-cutting-services.md) | CA-P33 |
| RN-048 | [Fluxos](user-flows.md) | CA-P35 |
| RN-049–050 | [Visão geral](overview.md) e [serviços](cross-cutting-services.md) | Conferência de escopo: ausência de chat/mensageria privada |
| RNF-001–006 | [RNF](non-functional-requirements.md) | CA-P36 |
| RNF-007–012 | [RNF](non-functional-requirements.md) | CA-P37 |
| RNF-013–020 | [RNF](non-functional-requirements.md) | CA-P38 |
| RNF-021–024 | [RNF](non-functional-requirements.md) | CA-P39 |
| RNF-025 | [RNF](non-functional-requirements.md) | CA-P40 |

A RN-020 está ausente na fonte. O catálogo contém 123 RF, 49 RN e 25 RNF da plataforma. Não inclui os requisitos específicos dos módulos nos totais.

## Precedência e divergências documentais

| Fonte | Uso nesta documentação | Limite |
| --- | --- | --- |
| Levantamento consolidado original | Base da plataforma, IDs e regras | Trechos de módulos podem ter sido refinados por documentos posteriores |
| Identidade de marca fornecida na conversa | Conceito, posicionamento e nomes consolidados | Não comprova pesquisa de domínio/marca ou validação linguística |
| Kitanda fornecido na conversa | Restrição de compartilhamento e histórico | IDs refinam catálogo antigo de listas; não reutilizar descrição antiga fora da plataforma |
| Kapanga e Mutyrão | Contratos contextuais, auditoria e notificações | Regras de negócio específicas permanecem nos módulos |
| Okape | Separa navegação de composição de painéis; exceções de compartilhamento e autoria | Não generalizar sua exceção aos demais módulos |
| Urukum | Notas privadas e colaborativas, versões e ausência de alertas próprios | IDs locais RF-01/RN-01 não são IDs de plataforma |
| ADRs 0001–0022 | Restrições arquiteturais e status de adoção | Não substituem regras funcionais nem comprovam implementação |

Os nomes RF-145 e RF-146 mudaram entre o levantamento antigo e a especificação detalhada de Kitanda. Não foram renumerados ou incorporados ao catálogo da plataforma, que termina em RF-123. Ao documentar Kitanda, usar sua especificação mais recente e registrar equivalências históricas.

## Organização e proveniência

A estrutura `docs/domain/platform/` é uma organização documental desta entrega, coerente com limites do monólito modular. Não é uma estrutura de código imposta pelas ADRs. [Fontes](../../reference/fontes.md) registra os documentos de entrada e seus hashes locais. [Pendências](open-questions.md) preserva as diferenças ainda não resolvidas.

## Refinamento aprovado em 2026-11-06

O [contrato da Alpha 1](alpha-1.md) acrescenta alcance e critérios complementares sem renumerar RF, RN ou CA. As issues #1 e #3 registram a aprovação. Critérios gerais de capacidades adiadas não são declarados atendidos pelo incremento.
