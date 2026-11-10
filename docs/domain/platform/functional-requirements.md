# Plataforma — Requisitos funcionais

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


**Base:** levantamento consolidado; escopo `plataforma`. São 123 requisitos de plataforma, não o total do produto. IDs e títulos originais foram mantidos. O comportamento normativo vem dos parágrafos de cada grupo e dos documentos vinculados; pontos não definidos permanecem em [pendências](open-questions.md).

## Integrações

Integrações próprias e externas, falhas isoladas e consulta de dados previamente sincronizados. Isso não equivale a suporte offline.

Detalhamento: [cross-cutting-services.md](cross-cutting-services.md). Aceitação: CA-P01, CA-P02. ADRs: 0001, 0019.

| ID | Requisito original |
| --- | --- |
| RF-001 | Integração com serviços externos |
| RF-002 | Evolução para serviços próprios |
| RF-003 | Isolamento de falhas em integrações |
| RF-004 | Consulta a informações previamente sincronizadas |
| RF-005 | Centralização de informações e operações |

## Identidade

Conta individual independente, associação multínúcleo e federação opcional; provedor e fluxo federado pendentes.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P03, CA-P04. ADRs: 0008, 0009.

| ID | Requisito original |
| --- | --- |
| RF-006 | Identidade própria |
| RF-007 | Autenticação federada |
| RF-008 | Independência de identidade |
| RF-009 | Associação a múltiplos núcleos |

## Núcleos e organização

Administração global e delegada sem acesso privado irrestrito. Uma residência só pode estar associada a um núcleo por vez no MVP.

Detalhamento: [entities.md](entities.md). Aceitação: CA-P05, CA-P06. ADRs: 0009.

| ID | Requisito original |
| --- | --- |
| RF-010 | Suporte a múltiplos núcleos |
| RF-011 | Administração global da instância |
| RF-012 | Administração delegada |
| RF-013 | Isolamento entre núcleos |
| RF-014 | Independência administrativa |
| RF-015 | Associação entre núcleos e residências |
| RF-016 | Restrição inicial de associação |
| RF-017 | Múltiplas residências por núcleo |
| RF-018 | Preparação para compartilhamento |

## Espaços e compartilhamento

Contextos pessoal, núcleo e residência; compartilhamento seletivo explícito, submetido às restrições específicas de cada módulo.

Detalhamento: [permissions.md](permissions.md). Aceitação: CA-P07, CA-P08. ADRs: 0009.

| ID | Requisito original |
| --- | --- |
| RF-019 | Espaços predefinidos |
| RF-020 | Compartilhamento seletivo |
| RF-021 | Controle de visibilidade |

## Membros e papéis

Participação, moradia e administração são independentes. Papéis fixos, sem permissões individuais personalizadas no MVP.

Detalhamento: [permissions.md](permissions.md). Aceitação: CA-P09. ADRs: 0009.

| ID | Requisito original |
| --- | --- |
| RF-022 | Participação independente de residência |
| RF-023 | Independência entre participação e residência |
| RF-024 | Associação de membros a múltiplos núcleos |
| RF-025 | Papéis predefinidos |

## Convites e saída

Convites individuais, padrão de sete dias, autenticação necessária e revogação. Saída sem aprovação; remoção administrativa; histórico preservado.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P10, CA-P11, CA-P12. ADRs: 0009.

| ID | Requisito original |
| --- | --- |
| RF-026 | Geração de convites |
| RF-027 | Compartilhamento de convites |
| RF-028 | Aceitação de convite |
| RF-029 | Controle de convites |
| RF-030 | Saída voluntária |
| RF-031 | Remoção administrativa |
| RF-032 | Revogação de acesso |
| RF-033 | Preservação do histórico |

## Ciclo de vida do núcleo

Exclusão lógica, confirmação e apresentação de impactos; recuperação no prazo configurado, padrão de trinta dias.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P13, CA-P14. ADRs: 0010.

| ID | Requisito original |
| --- | --- |
| RF-034 | Exclusão lógica de núcleo |
| RF-035 | Recuperação de núcleo |
| RF-036 | Configuração de retenção |

## Papéis de residência

Responsável, colaborador e visualizador, com atribuição independente do papel no núcleo.

Detalhamento: [permissions.md](permissions.md). Aceitação: CA-P15. ADRs: 0009.

| ID | Requisito original |
| --- | --- |
| RF-037 | Permissões por residência |
| RF-038 | Independência de permissões |
| RF-039 | Gestão de acesso à residência |
| RF-040 | Papéis de residência |
| RF-041 | Atribuição independente |
| RF-042 | Gestão de responsáveis |

## Ciclo de vida da residência

Criação e exclusão pelo administrador do núcleo, sem concessão automática de acesso; exclusão notifica responsáveis e não exclui o núcleo.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P16, CA-P17. ADRs: 0009, 0010.

| ID | Requisito original |
| --- | --- |
| RF-043 | Criação de residências |
| RF-044 | Restrição de criação |
| RF-045 | Exclusão de residências |
| RF-046 | Notificação de responsáveis |
| RF-047 | Prévia de impacto |
| RF-048 | Recuperação de residências |

## Contextualização dos módulos

Módulos independentes; definem os contextos aplicáveis a seus registros. Despesas nativas não obrigam integração com Potira.

Detalhamento: [cross-cutting-services.md](cross-cutting-services.md). Aceitação: CA-P18. ADRs: 0001, 0019.

| ID | Requisito original |
| --- | --- |
| RF-049 | Associação de módulos à residência |
| RF-050 | Contextualização de informações |
| RF-051 | Independência dos módulos |
| RF-052 | Módulos nativos |

## Catálogo e ativação

Disponibilidade global limita habilitação por núcleo. Desativação impede novas operações e preserva dados; reativação sem recadastro.

Detalhamento: [cross-cutting-services.md](cross-cutting-services.md). Aceitação: CA-P19, CA-P20. ADRs: 0001, 0009.

| ID | Requisito original |
| --- | --- |
| RF-053 | Catálogo de módulos |
| RF-054 | Disponibilidade por instância |
| RF-055 | Ativação por núcleo |
| RF-056 | Independência entre núcleos |
| RF-057 | Desativação de módulos |
| RF-058 | Preservação de dados |
| RF-059 | Reativação de módulos |

## Configuração inicial

Núcleo inicial automático; criador é membro e administrador. Somente nome do núcleo obrigatório; residência, convites e ajustes posteriores são opcionais.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P21. ADRs: 0008, 0009.

| ID | Requisito original |
| --- | --- |
| RF-060 | Criação automática do primeiro núcleo |
| RF-061 | Associação automática do criador |
| RF-062 | Administração inicial |
| RF-063 | Cadastro independente de novos núcleos |
| RF-064 | Nomeação do núcleo |
| RF-065 | Cadastro posterior de residências |
| RF-066 | Convites opcionais |
| RF-067 | Configuração posterior de módulos |

## Navegação e dashboard

Seletor global aplica contexto e permissões. Painéis são detalhados pelo Okape; composição pessoal autorizada é exceção explícita à não mistura automática.

Detalhamento: [overview.md](overview.md). Aceitação: CA-P22, CA-P23. ADRs: 0001, 0004, 0009.

| ID | Requisito original |
| --- | --- |
| RF-068 | Dashboard contextual |
| RF-069 | Visão pessoal |
| RF-070 | Visão do núcleo |
| RF-071 | Visão da residência |
| RF-072 | Conteúdo dinâmico |
| RF-073 | Seletor global de contexto |
| RF-074 | Alternância de contexto |
| RF-075 | Aplicação de permissões |
| RF-076 | Contexto ativo |
| RF-077 | Respeito ao contexto ativo |
| RF-078 | Isolamento de informações entre contextos |
| RF-079 | Operações contextualizadas |

## Notificações

Centro nativo com leitura, canais e preferências individuais. Eventos administrativos obrigatórios e padrões ainda precisam de lista explícita.

Detalhamento: [cross-cutting-services.md](cross-cutting-services.md). Aceitação: CA-P24, CA-P25, CA-P26. ADRs: 0012, 0019.

| ID | Requisito original |
| --- | --- |
| RF-080 | Centro de notificações |
| RF-081 | Notificações entre módulos |
| RF-082 | Notificações pessoais |
| RF-083 | Controle de leitura |
| RF-084 | Respeito às permissões |
| RF-085 | Notificações internas |
| RF-086 | Notificações por e-mail |
| RF-087 | Notificações push |
| RF-088 | Configuração de canais |
| RF-089 | Preferências individuais |
| RF-090 | Preferências por canal |
| RF-091 | Preferências por categoria |
| RF-092 | Preferências por contexto |
| RF-093 | Priorização de notificações |

## Perfil

Nome de exibição e foto opcional são visíveis aos membros; e-mail, preferências e segurança permanecem privados.

Detalhamento: [permissions.md](permissions.md). Aceitação: CA-P27. ADRs: 0008, 0009, 0011.

| ID | Requisito original |
| --- | --- |
| RF-094 | Perfil pessoal |
| RF-095 | Nome de exibição |
| RF-096 | Foto de perfil opcional |
| RF-097 | Privacidade do perfil |

## Recuperação de senha

Recuperação por e-mail, assistida ou local. Administrador inicia, titular redefine; token temporário, auditoria e revogação de sessões antigas.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P28, CA-P29. ADRs: 0008, 0009, 0018.

| ID | Requisito original |
| --- | --- |
| RF-098 | Recuperação por e-mail |
| RF-099 | Recuperação assistida |
| RF-100 | Recuperação local pelo servidor |
| RF-101 | Credenciais temporárias |
| RF-102 | Redefinição de senha pelo próprio usuário |
| RF-103 | Revogação de sessões após recuperação |

## Segundo fator

TOTP opcional sem SMS obrigatório; recuperação de acesso prevista, mas mecanismo ainda pendente.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P30. ADRs: 0008.

| ID | Requisito original |
| --- | --- |
| RF-104 | Autenticação em dois fatores |
| RF-105 | Ativação de 2FA |
| RF-106 | Validação de segundo fator |
| RF-107 | Recuperação de acesso ao 2FA |

## Sessões

Consultar sessões, encerrar uma ou todas as demais preservando a atual; exibir navegador, sistema, data e último acesso.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P31, CA-P32. ADRs: 0008.

| ID | Requisito original |
| --- | --- |
| RF-108 | Consulta de sessões |
| RF-109 | Encerramento individual |
| RF-110 | Encerramento global |
| RF-111 | Informações de sessão |

## Auditoria

Instância, núcleo e segurança individual com visibilidade delimitada; módulos definem registros próprios. Retenção por categoria pendente.

Detalhamento: [cross-cutting-services.md](cross-cutting-services.md). Aceitação: CA-P33. ADRs: 0010, 0018.

| ID | Requisito original |
| --- | --- |
| RF-112 | Auditoria da instância |
| RF-113 | Histórico do núcleo |
| RF-114 | Histórico de segurança |
| RF-115 | Auditoria extensível |

## Exclusão de conta

Solicitação pelo titular; verificar responsabilidades e participações; eliminar/anonimizar dados quando cabível, preservando referências históricas necessárias.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P34. ADRs: 0010.

| ID | Requisito original |
| --- | --- |
| RF-116 | Solicitação de exclusão de conta |
| RF-117 | Verificação de responsabilidades |
| RF-118 | Transferência de administração |
| RF-119 | Encerramento de participações |
| RF-120 | Exclusão de dados pessoais |
| RF-121 | Preservação de histórico |

## Exportação individual

Exportar perfil, preferências, espaço pessoal, segurança acessível, vínculos e registros pessoais de módulos; proteger dados de terceiros.

Detalhamento: [user-flows.md](user-flows.md). Aceitação: CA-P35. ADRs: 0010, 0011, 0012.

| ID | Requisito original |
| --- | --- |
| RF-122 | Exportação individual de dados |
| RF-123 | Abrangência da exportação individual |
