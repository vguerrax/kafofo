# Kafofo — Registro consolidado de requisitos

Levantamento em andamento

MVP em definição

Open-source

Self-hosted

# 160

Requisitos funcionais (RF)

# 63

Regras de negócio (RN)

# 25

Requisitos não funcionais (RNF)

## 1. Conceito e posicionamento

Objetivo: organizar e administrar a vida doméstica compartilhada, independentemente do modelo familiar ou habitacional.

Público contemplado:

- Pessoas que moram sozinhas.
- Casais e famílias com ou sem filhos.
- Pessoas que dividem uma moradia.
- Pessoas que administram mais de uma residência.
- Pessoas que participam da administração de residências nas quais não moram.

O Kafofo não deve ser:

- Um simples painel de links para outras aplicações.
- Uma cópia doméstica do Google Workspace.
- Um substituto obrigatório para serviços especializados já utilizados.

Deve oferecer uma experiência integrada, permitindo que serviços externos e módulos próprios trabalhem juntos.

## 2. Identidade, implantação e estratégia do produto

Decisões confirmadas:

- Nome de trabalho: Kafofo.
- Marca principal do ecossistema, com possibilidade de módulos com nomes próprios.
- Validação comercial definitiva do nome e domínio ainda pendente.
- Código aberto.
- Estratégia self-hosted first.
- Cada instalação é administrada por seu próprio operador.
- Acesso pela rede local e acesso remoto opcional.
- Minimizar dependências obrigatórias de terceiros.
- Atualizações administradas pelo responsável pela instalação.
- Serviços externos podem ser integrados quando úteis.
- Não definir tecnologia ou arquitetura antes de concluir os requisitos.

Estratégia híbrida: combinar funcionalidades próprias para necessidades domésticas gerais com integrações de serviços especializados.

### Requisitos funcionais — integrações

| ID     | Requisito                                        |
| ------ | ------------------------------------------------ |
| RF-001 | Integração com serviços externos                 |
| RF-002 | Evolução para serviços próprios                  |
| RF-003 | Isolamento de falhas em integrações              |
| RF-004 | Consulta a informações previamente sincronizadas |
| RF-005 | Centralização de informações e operações         |

## 3. Identidade e autenticação

- Sistema próprio de identidade e autenticação.
- Autenticação federada opcional.
- Conta pessoal independente dos núcleos domésticos.
- Uma pessoa pode participar de vários núcleos.
- Identidade individual, identidade doméstica compartilhada e identidade de integração são conceitos separados.
- Permissões não são compartilhadas automaticamente entre essas identidades.

| ID     | Requisito                      |
| ------ | ------------------------------ |
| RF-006 | Identidade própria             |
| RF-007 | Autenticação federada          |
| RF-008 | Independência de identidade    |
| RF-009 | Associação a múltiplos núcleos |

## 4. Núcleos domésticos e administração

Uma instalação pode atender vários núcleos domésticos.

Cada núcleo possui:

- Administradores e membros.
- Configurações próprias.
- Permissões próprias.
- Dados isolados dos demais núcleos.

A instalação possui um administrador global, responsável pela administração da instância. Isso não concede acesso irrestrito aos dados pessoais ou privados dos núcleos.

| ID     | Requisito                         |
| ------ | --------------------------------- |
| RF-010 | Suporte a múltiplos núcleos       |
| RF-011 | Administração global da instância |
| RF-012 | Administração delegada            |
| RF-013 | Isolamento entre núcleos          |
| RF-014 | Independência administrativa      |

### Núcleos e residências

- Um núcleo pode administrar várias residências.
- No MVP, uma residência não pode estar associada simultaneamente a mais de um núcleo.
- A estrutura deve permitir compartilhamento entre núcleos no futuro.
- O vínculo núcleo-residência será conceitualmente uma entidade própria.

| ID     | Requisito                              |
| ------ | -------------------------------------- |
| RF-015 | Associação entre núcleos e residências |
| RF-016 | Restrição inicial de associação        |
| RF-017 | Múltiplas residências por núcleo       |
| RF-018 | Preparação para compartilhamento       |

## 5. Espaços, privacidade e compartilhamento

Estrutura predefinida no MVP:

1. Pessoal: privado e pertencente a uma pessoa.
2. Núcleo: compartilhado entre membros conforme permissões.
3. Residência: informações associadas a uma residência específica.
4. Compartilhamento seletivo: acesso concedido a informações específicas por pessoas autorizadas, inclusive externas ao núcleo.

Princípios:

- Privacidade por padrão.
- Privilégio mínimo.
- Compartilhamento explícito.
- Revogação de acesso.
- Propriedade e contexto claros.
- Residência não é sinônimo de núcleo.

| ID     | Requisito                 |
| ------ | ------------------------- |
| RF-019 | Espaços predefinidos      |
| RF-020 | Compartilhamento seletivo |
| RF-021 | Controle de visibilidade  |

## 6. Membros, papéis e permissões

- Uma pessoa pode participar de um núcleo sem morar em nenhuma residência vinculada.
- Participação no núcleo, vínculo com residência e responsabilidade administrativa são conceitos independentes.
- Papéis predefinidos e fixos no MVP.
- Permissões granulares e personalização individual ficam para evolução futura.

| ID     | Requisito                                     |
| ------ | --------------------------------------------- |
| RF-022 | Participação independente de residência       |
| RF-023 | Independência entre participação e residência |
| RF-024 | Associação de membros a múltiplos núcleos     |
| RF-025 | Papéis predefinidos                           |

| ID     | Regra                                        |
| ------ | -------------------------------------------- |
| RN-001 | Permissões associadas aos papéis             |
| RN-002 | Ausência de personalização individual no MVP |
| RN-003 | Evolução futura do controle de acesso        |

### Papéis por residência

- Responsável: administra informações, configurações e acessos.
- Colaborador: consulta e atualiza informações permitidas.
- Visualizador: somente consulta.

Esses papéis são independentes dos papéis do núcleo.

| ID     | Requisito                     |
| ------ | ----------------------------- |
| RF-037 | Permissões por residência     |
| RF-038 | Independência de permissões   |
| RF-039 | Gestão de acesso à residência |
| RF-040 | Papéis de residência          |
| RF-041 | Atribuição independente       |
| RF-042 | Gestão de responsáveis        |

## 7. Convites, entrada e saída de membros

- Somente administradores do núcleo podem gerar convites.
- Convites são links individuais.
- O compartilhamento pode ocorrer por qualquer canal externo.
- Não há dependência de integração com WhatsApp, Telegram ou e-mail para compartilhar o link.
- Aceitação exige autenticação ou criação de conta.
- Convites podem ser consultados e revogados.
- Validade padrão de 7 dias.
- Revogação antecipada invalida o convite.

| ID     | Requisito                    |
| ------ | ---------------------------- |
| RF-026 | Geração de convites          |
| RF-027 | Compartilhamento de convites |
| RF-028 | Aceitação de convite         |
| RF-029 | Controle de convites         |
| RF-030 | Saída voluntária             |
| RF-031 | Remoção administrativa       |
| RF-032 | Revogação de acesso          |
| RF-033 | Preservação do histórico     |

| ID     | Regra                                                       |
| ------ | ----------------------------------------------------------- |
| RN-004 | Apenas administradores convidam                             |
| RN-005 | Conta individual necessária                                 |
| RN-006 | Revogação invalida convite                                  |
| RN-007 | Validade padrão de 7 dias                                   |
| RN-008 | Revogação antecipada                                        |
| RN-009 | Saída voluntária não exige aprovação                        |
| RN-010 | Remoção restrita a administradores                          |
| RN-011 | Saída/remoção não exclui automaticamente históricos         |
| RN-012 | Histórico preserva identificação do autor após saída        |
| RN-013 | Transferência de administração quando houver outros membros |
| RN-014 | Exclusão de núcleo sem membros                              |
| RN-015 | Núcleo ativo não fica sem administrador                     |

## 8. Exclusão e recuperação de núcleos e residências

### Núcleos

- Exclusão lógica antes da eliminação definitiva.
- Período padrão de recuperação de 30 dias.
- Prazo configurável pelo administrador da instância.
- Integrações desativadas durante exclusão.
- Configurações preservadas para recuperação quando possível.
- Exclusão exige confirmação explícita e apresentação dos impactos.

| ID     | Requisito                 |
| ------ | ------------------------- |
| RF-034 | Exclusão lógica de núcleo |
| RF-035 | Recuperação de núcleo     |
| RF-036 | Configuração de retenção  |

| ID     | Regra                                                              |
| ------ | ------------------------------------------------------------------ |
| RN-016 | Período padrão de 30 dias                                          |
| RN-017 | Eliminação após vencimento do prazo                                |
| RN-018 | Recuperação restaura núcleo e associações, respeitando integrações |
| RN-019 | Exclusão lógica desativa acesso dos membros                        |

### Residências

- Somente administradores do núcleo podem criar e excluir residências.
- Criação não concede acesso automaticamente a todos os membros.
- Exclusão exige apresentação do impacto sobre dados e vínculos.
- Responsáveis são notificados.
- Recuperação segue o período configurado para a instância.
- Exclusão da residência não exclui o núcleo.
- Integrações são desativadas durante exclusão, preservando configurações recuperáveis quando possível.

| ID     | Requisito                   |
| ------ | --------------------------- |
| RF-043 | Criação de residências      |
| RF-044 | Restrição de criação        |
| RF-045 | Exclusão de residências     |
| RF-046 | Notificação de responsáveis |
| RF-047 | Prévia de impacto           |
| RF-048 | Recuperação de residências  |

| ID     | Regra                                       |
| ------ | ------------------------------------------- |
| RN-021 | Criação não concede acesso automático       |
| RN-022 | Apenas administradores do núcleo excluem    |
| RN-023 | Período de recuperação de residências       |
| RN-024 | Exclusão da residência não exclui núcleo    |
| RN-025 | Desativação de integrações durante exclusão |

## 9. Contextualização e módulos

- Qualquer módulo pode associar informações a uma residência quando fizer sentido.
- Informações podem ter contexto pessoal, de núcleo ou de residência.
- O módulo define quais contextos fazem sentido para cada tipo de informação.
- O Kafofo terá módulo nativo simples de despesas.
- Integração com Potira será estudada em etapa futura, sem substituir o levantamento atual.

| ID     | Requisito                          |
| ------ | ---------------------------------- |
| RF-049 | Associação de módulos à residência |
| RF-050 | Contextualização de informações    |
| RF-051 | Independência dos módulos          |
| RF-052 | Módulos nativos                    |

### Catálogo e ativação de módulos

Ativação em dois níveis:

1. Administrador global define os módulos disponíveis na instalação.
2. Administrador do núcleo escolhe quais módulos habilitar naquele núcleo.

Núcleos podem utilizar conjuntos diferentes de módulos.

| ID     | Requisito                     |
| ------ | ----------------------------- |
| RF-053 | Catálogo de módulos           |
| RF-054 | Disponibilidade por instância |
| RF-055 | Ativação por núcleo           |
| RF-056 | Independência entre núcleos   |
| RF-057 | Desativação de módulos        |
| RF-058 | Preservação de dados          |
| RF-059 | Reativação de módulos         |

| ID     | Regra                                                  |
| ------ | ------------------------------------------------------ |
| RN-026 | Núcleo não habilita módulo indisponível na instância   |
| RN-027 | Desativação global afeta todos os núcleos usuários     |
| RN-028 | Desativação não exclui dados                           |
| RN-029 | Módulos desativados não recebem novas operações        |
| RN-030 | Desativação global prevalece sobre ativação individual |
| RN-031 | Reativação não exige recadastro                        |

## 10. Primeiro cadastro e configuração inicial

- Primeiro cadastro cria automaticamente o primeiro núcleo.
- Criador torna-se o primeiro membro e administrador.
- Contas existentes podem criar outros núcleos ou participar de outros.
- Nome do núcleo é obrigatório.
- Residência, convites e ajustes de módulos são opcionais na configuração inicial.
- Módulos utilizam configurações padrão.

| ID     | Requisito                              |
| ------ | -------------------------------------- |
| RF-060 | Criação automática do primeiro núcleo  |
| RF-061 | Associação automática do criador       |
| RF-062 | Administração inicial                  |
| RF-063 | Cadastro independente de novos núcleos |
| RF-064 | Nomeação do núcleo                     |
| RF-065 | Cadastro posterior de residências      |
| RF-066 | Convites opcionais                     |
| RF-067 | Configuração posterior de módulos      |

| ID     | Regra                                                         |
| ------ | ------------------------------------------------------------- |
| RN-032 | Cada conta terá inicialmente um núcleo criado automaticamente |
| RN-033 | Apenas nome do núcleo obrigatório                             |
| RN-034 | Ausência de residência ou membros adicionais não impede uso   |
| RN-035 | Módulos terão configurações padrão                            |

## 11. Dashboard e navegação

Dashboard contextual:

- Pessoal.
- Núcleo.
- Residência.

Módulos fornecem cartões e indicadores aos dashboards correspondentes.

- Seletor global de contexto.
- Alternância entre espaço pessoal, núcleos e residências.
- Módulos respeitam o contexto ativo.
- Não há mistura automática de informações entre contextos.

| ID     | Requisito                                 |
| ------ | ----------------------------------------- |
| RF-068 | Dashboard contextual                      |
| RF-069 | Visão pessoal                             |
| RF-070 | Visão do núcleo                           |
| RF-071 | Visão da residência                       |
| RF-072 | Conteúdo dinâmico                         |
| RF-073 | Seletor global de contexto                |
| RF-074 | Alternância de contexto                   |
| RF-075 | Aplicação de permissões                   |
| RF-076 | Contexto ativo                            |
| RF-077 | Respeito ao contexto ativo                |
| RF-078 | Isolamento de informações entre contextos |
| RF-079 | Operações contextualizadas                |

\- RN-036: cada operação respeita contexto ativo e permissões, sem presumir compartilhamento entre contextos.

## 12. Notificações

Centro de notificações nativo, independente de serviços externos.

Canais do MVP:

1. Interno.
2. E-mail, usando SMTP configurado pelo administrador da instância.
3. Push, para navegadores e dispositivos compatíveis.

WhatsApp e Telegram ficam para integrações futuras.

Personalização desde o MVP:

- Preferências por canal.
- Categorias de eventos.
- Contextos.
- Prioridade.
- Padrões inteligentes para evitar configuração excessiva.
- Eventos administrativos críticos podem exigir comunicação mesmo quando notificações comuns estão desativadas.

| ID     | Requisito                   |
| ------ | --------------------------- |
| RF-080 | Centro de notificações      |
| RF-081 | Notificações entre módulos  |
| RF-082 | Notificações pessoais       |
| RF-083 | Controle de leitura         |
| RF-084 | Respeito às permissões      |
| RF-085 | Notificações internas       |
| RF-086 | Notificações por e-mail     |
| RF-087 | Notificações push           |
| RF-088 | Configuração de canais      |
| RF-089 | Preferências individuais    |
| RF-090 | Preferências por canal      |
| RF-091 | Preferências por categoria  |
| RF-092 | Preferências por contexto   |
| RF-093 | Priorização de notificações |

| ID     | Regra                                              |
| ------ | -------------------------------------------------- |
| RN-037 | Canal interno independente de terceiros            |
| RN-038 | E-mail depende de SMTP válido                      |
| RN-039 | Push depende de compatibilidade e autorização      |
| RN-040 | Indisponibilidade de um canal não impede os demais |

## 13. Perfil, segurança e recuperação de conta

### Perfil

- Nome de exibição e foto de perfil são os únicos campos pessoais visíveis aos demais membros no MVP.
- E-mail, preferências e configurações de segurança permanecem privados.

| ID     | Requisito               |
| ------ | ----------------------- |
| RF-094 | Perfil pessoal          |
| RF-095 | Nome de exibição        |
| RF-096 | Foto de perfil opcional |
| RF-097 | Privacidade do perfil   |

\- RN-041: nome de exibição e foto são os únicos campos pessoais visíveis aos demais membros no MVP.

### Recuperação de senha

Alternativas:

1. Recuperação por e-mail, com link temporário.
2. Recuperação assistida por administrador do núcleo.
3. Recuperação local pelo servidor, com procedimento administrativo que gera token temporário.

Decisão: administradores de núcleo podem iniciar recuperação de senha de membros do próprio núcleo.

Como a conta é individual, essa operação altera a senha global da pessoa, afetando os demais núcleos. O núcleo e o administrador que iniciaram a recuperação devem ser registrados.

- Não exibir nem permitir ao administrador definir a senha do membro.
- Token temporário de uso único.
- Validade limitada.
- Nova senha definida pelo próprio usuário.
- Revogação de sessões antigas.
- Registro de auditoria.
- Limite de tentativas.

| ID     | Requisito                                 |
| ------ | ----------------------------------------- |
| RF-098 | Recuperação por e-mail                    |
| RF-099 | Recuperação assistida                     |
| RF-100 | Recuperação local pelo servidor           |
| RF-101 | Credenciais temporárias                   |
| RF-102 | Redefinição de senha pelo próprio usuário |
| RF-103 | Revogação de sessões após recuperação     |

| ID     | Regra                                                          |
| ------ | -------------------------------------------------------------- |
| RN-042 | Administradores podem iniciar recuperação de membros próprios  |
| RN-043 | Não recuperar contas de pessoas fora dos núcleos administrados |
| RN-044 | Administrador não visualiza nem define nova senha              |
| RN-045 | Código temporário, de uso único e validade limitada            |

### Autenticação em dois fatores

- TOTP por aplicativo autenticador.
- Opcional no MVP.
- Sem dependência de SMS ou provedor externo obrigatório.

| ID     | Requisito                    |
| ------ | ---------------------------- |
| RF-104 | Autenticação em dois fatores |
| RF-105 | Ativação de 2FA              |
| RF-106 | Validação de segundo fator   |
| RF-107 | Recuperação de acesso ao 2FA |

### Sessões

- Consultar sessões ativas.
- Encerrar uma sessão específica.
- Encerrar todas as demais sessões, preservando a atual.
- Identificar navegador, sistema operacional, data e último acesso.

| ID     | Requisito               |
| ------ | ----------------------- |
| RF-108 | Consulta de sessões     |
| RF-109 | Encerramento individual |
| RF-110 | Encerramento global     |
| RF-111 | Informações de sessão   |

\- RN-046: sessões encerradas não acessam recursos protegidos.

## 14. Auditoria

Três níveis:

1. Auditoria da instância: eventos administrativos e operacionais globais.
2. Auditoria do núcleo e segurança da conta: atividades administrativas do núcleo e eventos individuais de segurança.
3. Auditoria dos módulos: cada módulo define eventos, detalhamento e retenção.

Acesso respeita o escopo de cada pessoa. Administração global ou do núcleo não concede acesso irrestrito aos registros privados.

| ID     | Requisito              |
| ------ | ---------------------- |
| RF-112 | Auditoria da instância |
| RF-113 | Histórico do núcleo    |
| RF-114 | Histórico de segurança |
| RF-115 | Auditoria extensível   |

\- RN-047: registros de auditoria respeitam escopo de acesso e privacidade.

Retenção deve ser proporcional à finalidade e compatível com a LGPD.

## 15. Interface, PWA e acessibilidade

Decisões:

- Web responsiva.
- PWA desde o MVP.
- Sem aplicativos móveis nativos no MVP.
- Funcionamento offline fora do MVP.
- Dependência de conexão com o servidor para operar.
- Acessibilidade desde o MVP, com WCAG 2.2 AA como referência.
- Idioma inicial pt-BR, preparado para internacionalização.
- Suporte a fusos horários por usuário e residência.

| ID      | Requisito                                  |
| ------- | ------------------------------------------ |
| RNF-001 | Responsividade                             |
| RNF-002 | PWA                                        |
| RNF-003 | Instalabilidade                            |
| RNF-004 | Experiência multiplataforma                |
| RNF-005 | Dependência de conexão                     |
| RNF-006 | Indicação de conectividade                 |
| RNF-007 | Acessibilidade                             |
| RNF-008 | Navegação por teclado                      |
| RNF-009 | Compatibilidade assistiva                  |
| RNF-010 | Contraste e legibilidade                   |
| RNF-011 | Feedback acessível                         |
| RNF-012 | Consistência entre módulos                 |
| RNF-013 | Idioma inicial                             |
| RNF-014 | Internacionalização                        |
| RNF-015 | Localização                                |
| RNF-016 | Fuso do usuário                            |
| RNF-017 | Fuso da residência                         |
| RNF-018 | Conversão de horários                      |
| RNF-019 | Preservação do horário de origem           |
| RNF-020 | Regras de horário local e horário de verão |

## 16. Dados, exportação e exclusão de conta

- Armazenamento centralizado por instalação.
- Isolamento lógico entre núcleos.
- Identidade separada dos dados dos núcleos.
- Backups configuráveis pelo operador.
- Exportação de dados de núcleo.
- Exportação individual de dados pessoais.
- Formatos abertos e documentados para portabilidade.

| ID      | Requisito                     |
| ------- | ----------------------------- |
| RNF-021 | Armazenamento por instância   |
| RNF-022 | Isolamento lógico             |
| RNF-023 | Separação de identidade       |
| RNF-024 | Backup                        |
| RNF-025 | Exportação de dados de núcleo |

### Exclusão de conta

- Solicitação pelo próprio usuário.
- Verificação de responsabilidades administrativas.
- Transferência de administração ou exclusão de núcleo quando necessário.
- Encerramento de participações em outros núcleos.
- Eliminação ou anonimização de dados pessoais quando possível e permitido.
- Preservação de referências históricas anonimizadas quando necessário.

| ID     | Requisito                        |
| ------ | -------------------------------- |
| RF-116 | Solicitação de exclusão de conta |
| RF-117 | Verificação de responsabilidades |
| RF-118 | Transferência de administração   |
| RF-119 | Encerramento de participações    |
| RF-120 | Exclusão de dados pessoais       |
| RF-121 | Preservação de histórico         |

### Exportação individual

Decisão confirmada para o MVP.

A exportação individual inclui:

- Perfil.
- Preferências pessoais.
- Espaço pessoal.
- Histórico de segurança acessível ao titular.
- Relação de núcleos e residências dos quais participa.
- Registros pessoais de módulos nativos.

Não deve incluir indiscriminadamente dados compartilhados pertencentes a outras pessoas.

| ID     | Requisito                            |
| ------ | ------------------------------------ |
| RF-122 | Exportação individual de dados       |
| RF-123 | Abrangência da exportação individual |

\- RN-048: proteção dos dados de terceiros na exportação individual.

## 17. Comunicação entre membros

Decisão confirmada: sem chat ou mensagens privadas no MVP.

- RN-049: ausência de mensageria no MVP.
- RN-050: comunicação contextualizada por notificações e recursos específicos dos módulos, quando aplicável.

## 18. Calendário e agenda

Escopo do MVP aprovado

O calendário é uma capacidade central do Kafofo, mas não necessariamente deve ser desenvolvido integralmente do zero.

O usuário deixou claro que não quer apenas uma interface de visualização: o Kafofo deve oferecer uma agenda utilizável, sem obrigar as pessoas a abandonar os serviços que já utilizam.

### Capacidades definidas

- Agenda pessoal.
- Agenda compartilhada.
- Eventos associados a núcleos e residências.
- Criação e administração de eventos diretamente no Kafofo.
- Integração com calendários externos.
- Visualização consolidada de eventos de diferentes origens.
- Identificação da origem dos eventos.
- Eventos recorrentes.
- Múltiplos lembretes por evento.
- Integração com o centro de notificações.

### Requisitos

| ID     | Requisito                           |
| ------ | ----------------------------------- |
| RF-124 | Calendário integrado                |
| RF-125 | Integração de eventos               |
| RF-126 | Agenda pessoal                      |
| RF-127 | Agenda compartilhada                |
| RF-128 | Integração com calendários externos |
| RF-129 | Importação e exportação iCalendar   |
| RF-130 | Visualização consolidada            |
| RF-131 | Sincronização unidirecional         |
| RF-132 | Recorrência de eventos              |
| RF-133 | Frequências de recorrência          |
| RF-134 | Edição de recorrência               |
| RF-135 | Exclusão de recorrência             |
| RF-136 | Lembretes de eventos                |
| RF-137 | Múltiplos lembretes                 |
| RF-138 | Antecedência configurável           |

### Regras

| ID     | Regra                                                  |
| ------ | ------------------------------------------------------ |
| RN-051 | Priorizar avaliação de soluções open-source existentes |
| RN-052 | Independência funcional do calendário                  |
| RN-053 | Não obrigatoriedade de migração para o Kafofo          |
| RN-054 | Kafofo como fonte dos eventos criados nele             |
| RN-055 | Possibilidade futura de sincronização bidirecional     |
| RN-056 | Lembretes integrados ao centro de notificações         |

### Decisões sobre integração

- Sincronização unidirecional no MVP.
- Alterações realizadas externamente não modificam o evento original no Kafofo.
- Assinatura iCalendar é prioridade inicial.
- Integrações autenticadas específicas com Google, Microsoft e outros provedores ficam para evolução futura.
- Sincronização bidirecional fica fora do MVP.
- Compatibilidade com CalDAV e iCalendar deve ser avaliada.
- Reutilização de componentes ou soluções open-source será investigada.

### Tecnologias candidatas, ainda não escolhidas

- FullCalendar: biblioteca de interface.
- Radicale: servidor CalDAV.
- Nextcloud Calendar: aplicação de calendário completa.

Nenhuma dessas opções está aprovada como implementação definitiva.

### Recorrência

Frequências iniciais:

- Diária.
- Semanal.
- Mensal.
- Anual.

Edição e exclusão:

- Uma ocorrência específica.
- Toda a série.

É necessário tratar exceções sem modificar indevidamente as demais ocorrências.

### Lembretes

- Múltiplos lembretes por evento.
- Antecedências configuráveis.
- Uso do centro de notificações.
- Respeito às preferências individuais.

## 19. Tarefas domésticas

Escopo do MVP aprovado

Módulo nativo simplificado.

Campos e funcionalidades:

- Nome.
- Responsável opcional.
- Status.
- Histórico.

### Requisitos

| ID     | Requisito            |
| ------ | -------------------- |
| RF-139 | Cadastro de tarefas  |
| RF-140 | Nome da tarefa       |
| RF-141 | Responsável          |
| RF-142 | Status da tarefa     |
| RF-143 | Histórico de tarefas |

### Status iniciais propostos

1. Pendente.
2. Em andamento.
3. Concluída.
4. Cancelada.

### Regras

- RN-057: responsável opcional.
- RN-058: sem recorrência de tarefas no MVP.
- RN-059: sem comentários nas tarefas no MVP.

O histórico registra alterações relevantes, quem realizou a alteração, quando ocorreu e o que foi alterado.

Não haverá comentários ou conversas dentro das tarefas no MVP.

## 20. Listas de compras

Escopo do MVP aprovado

Módulo nativo de listas compartilhadas.

Capacidades:

- Criar, consultar, editar e excluir listas.
- Adicionar, editar e remover itens.
- Informar quantidade desejada.
- Marcar itens como comprados.
- Compartilhar listas entre membros autorizados.

| ID     | Requisito               |
| ------ | ----------------------- |
| RF-144 | Gerenciamento de listas |
| RF-145 | Itens da lista          |
| RF-146 | Quantidade de itens     |
| RF-147 | Marcação de compra      |
| RF-148 | Compartilhamento        |

### Regras

- RN-060: sem templates de listas no MVP.
- RN-061: sem recorrência automática de listas.
- RN-062: listas respeitam os contextos pessoal, núcleo e residência e suas permissões.

Ponto ainda não detalhado: compartilhamento de listas com pessoas externas ao núcleo, aproveitando o mecanismo de compartilhamento seletivo.

## 21. Despesas domésticas

Escopo do MVP aprovado

Módulo nativo simples para registrar e acompanhar despesas domésticas.

Campos e funcionalidades iniciais:

- Descrição.
- Valor.
- Data.
- Responsável pelo lançamento.
- Situação de pagamento.
- Recorrência.

| ID     | Requisito                       |
| ------ | ------------------------------- |
| RF-149 | Cadastro de despesas            |
| RF-150 | Valor                           |
| RF-151 | Descrição                       |
| RF-152 | Data                            |
| RF-153 | Responsável pelo lançamento     |
| RF-154 | Situação de pagamento           |
| RF-155 | Configuração de recorrência     |
| RF-156 | Geração de ocorrências          |
| RF-157 | Periodicidade                   |
| RF-158 | Encerramento da recorrência     |
| RF-159 | Edição individual de ocorrência |
| RF-160 | Edição da recorrência           |

### Regras e comportamento

\- RN-063: independência das ocorrências.

Cada ocorrência gerada terá seus próprios valores e situação de pagamento.

Periodicidades iniciais:

- Semanal.
- Mensal.
- Anual.

Edição:

- Alterar uma ocorrência sem modificar as demais.
- Alterar a configuração recorrente para as próximas ocorrências, preservando o histórico.
- Encerrar a recorrência sem apagar lançamentos anteriores.

### Limites do MVP

- Não substituir o Potira.
- Sem planejamento financeiro avançado.
- Sem rateios automáticos.
- Sem conciliação bancária.
- Sem integração bancária obrigatória.

Responsável pelo lançamento e responsável pelo pagamento são conceitos diferentes. O segundo não será obrigatório no MVP.

# 22. Decisões pendentes e pontos que precisam de detalhamento

Esta seção é importante para evitar que uma proposta seja confundida com uma decisão já tomada.

| Domínio          | Ponto pendente                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Marca            | Validar disponibilidade comercial de Kafofo e domínio                                          |
| Identidade       | Detalhar papéis e permissões exatas                                                            |
| Convites         | Confirmar se o prazo poderá ser configurado por instância                                      |
| Compartilhamento | Definir o escopo exato de compartilhamento com pessoas externas                                |
| Residências      | Detalhar comportamento de dados e integrações na exclusão                                      |
| Notificações     | Definir padrões inteligentes e quais eventos são obrigatórios                                  |
| Segurança        | Definir validade exata dos tokens temporários                                                  |
| Auditoria        | Definir prazos de retenção por categoria                                                       |
| Exportação       | Definir formatos e estrutura dos arquivos                                                      |
| Calendário       | Escolher biblioteca, serviço ou implementação                                                  |
| Calendário       | Detalhar importação, assinatura e atualização de eventos                                       |
| Calendário       | Definir regras de exceção e fuso horário em recorrências                                       |
| Calendário       | Definir se eventos importados serão apenas visualizados ou poderão ser administrados no Kafofo |
| Tarefas          | Confirmar se os quatro status propostos são definitivos                                        |
| Listas           | Definir compartilhamento externo                                                               |
| Despesas         | Detalhar situação de pagamento e regras de recorrência                                         |
| Despesas         | Definir comportamento quando o valor de uma ocorrência variar                                  |

# 23. Visão atual do MVP

Com as decisões tomadas, o MVP já tem um escopo funcional relativamente amplo.

Plataforma e administração

- Identidade e autenticação.
- Núcleos e residências.
- Membros, convites e permissões.
- Contextos pessoais e compartilhados.
- Dashboard e navegação.
- Catálogo e ativação de módulos.

Infraestrutura funcional

- Notificações.
- Auditoria.
- Segurança da conta.
- Exportação e exclusão de dados.
- PWA e acessibilidade.

Organização doméstica

- Calendário e agenda.
- Tarefas domésticas.
- Listas de compras.
- Despesas domésticas.
- Integrações externas.

## 24. Avaliação crítica do escopo

Há três riscos que merecem atenção antes de avançarmos muito mais:

1\. O núcleo da plataforma já é complexo. Identidade, múltiplos núcleos, residências, permissões independentes, compartilhamento seletivo e exclusão com recuperação formam uma base considerável. Um erro nessa camada afetará praticamente todos os módulos.

2\. O calendário pode se tornar um projeto dentro do projeto. Agenda pessoal, compartilhamento, recorrência, lembretes e integração externa já representam um conjunto expressivo de funcionalidades. É importante definir o que realmente precisa ser administrado pelo Kafofo e o que pode ser delegado a uma solução externa.

3\. O MVP está crescendo em várias direções. Já temos quatro módulos domésticos, além de uma plataforma de identidade, administração e integração. Isso não significa que o escopo esteja errado, mas exige priorização e critérios claros de entrega.