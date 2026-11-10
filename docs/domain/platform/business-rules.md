# Plataforma — Regras de negócio

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


**Base:** RN-001 a RN-050 do levantamento, com ausência da RN-020. São 49 regras identificadas; a numeração não foi compactada. O catálogo preserva os enunciados originais; o detalhamento abaixo consolida as definições textuais associadas.

## Catálogo original

| ID | Regra |
| --- | --- |
| RN-001 | Permissões associadas aos papéis |
| RN-002 | Ausência de personalização individual no MVP |
| RN-003 | Evolução futura do controle de acesso |
| RN-004 | Apenas administradores convidam |
| RN-005 | Conta individual necessária |
| RN-006 | Revogação invalida convite |
| RN-007 | Validade padrão de 7 dias |
| RN-008 | Revogação antecipada |
| RN-009 | Saída voluntária não exige aprovação |
| RN-010 | Remoção restrita a administradores |
| RN-011 | Saída/remoção não exclui automaticamente históricos |
| RN-012 | Histórico preserva identificação do autor após saída |
| RN-013 | Transferência de administração quando houver outros membros |
| RN-014 | Exclusão de núcleo sem membros |
| RN-015 | Núcleo ativo não fica sem administrador |
| RN-016 | Período padrão de 30 dias |
| RN-017 | Eliminação após vencimento do prazo |
| RN-018 | Recuperação restaura núcleo e associações, respeitando integrações |
| RN-019 | Exclusão lógica desativa acesso dos membros |
| RN-021 | Criação não concede acesso automático |
| RN-022 | Apenas administradores do núcleo excluem |
| RN-023 | Período de recuperação de residências |
| RN-024 | Exclusão da residência não exclui núcleo |
| RN-025 | Desativação de integrações durante exclusão |
| RN-026 | Núcleo não habilita módulo indisponível na instância |
| RN-027 | Desativação global afeta todos os núcleos usuários |
| RN-028 | Desativação não exclui dados |
| RN-029 | Módulos desativados não recebem novas operações |
| RN-030 | Desativação global prevalece sobre ativação individual |
| RN-031 | Reativação não exige recadastro |
| RN-032 | Cada conta terá inicialmente um núcleo criado automaticamente |
| RN-033 | Apenas nome do núcleo obrigatório |
| RN-034 | Ausência de residência ou membros adicionais não impede uso |
| RN-035 | Módulos terão configurações padrão |
| RN-036 | cada operação respeita contexto ativo e permissões, sem presumir compartilhamento entre contextos |
| RN-037 | Canal interno independente de terceiros |
| RN-038 | E-mail depende de SMTP válido |
| RN-039 | Push depende de compatibilidade e autorização |
| RN-040 | Indisponibilidade de um canal não impede os demais |
| RN-041 | nome de exibição e foto são os únicos campos pessoais visíveis aos demais membros no MVP |
| RN-042 | Administradores podem iniciar recuperação de membros próprios |
| RN-043 | Não recuperar contas de pessoas fora dos núcleos administrados |
| RN-044 | Administrador não visualiza nem define nova senha |
| RN-045 | Código temporário, de uso único e validade limitada |
| RN-046 | sessões encerradas não acessam recursos protegidos |
| RN-047 | registros de auditoria respeitam escopo de acesso e privacidade |
| RN-048 | proteção dos dados de terceiros na exportação individual |
| RN-049 | ausência de mensageria no MVP |
| RN-050 | comunicação contextualizada por notificações e recursos específicos dos módulos, quando aplicável |

## Papéis, contexto e privacidade

RN-001–003: permissões estão associadas a papéis predefinidos; não há personalização individual no MVP. Participação em núcleo, associação a residência e responsabilidade administrativa são conceitos independentes. A matriz conhecida está em [permissões](permissions.md).

RN-036: operações respeitam contexto ativo e permissões. Não presumem compartilhamento. No Okape, a composição pessoal de fontes autorizadas é explícita e não amplia o acesso do proprietário ou dos convidados.

RN-041: somente nome de exibição e foto do perfil são visíveis aos demais membros. Isso não torna dados pessoais, e-mail ou segurança acessíveis a administradores por padrão.

## Entrada, saída e continuidade administrativa

RN-004–008: só administradores do núcleo convidam. O convite exige conta individual, tem validade padrão de sete dias e pode ser revogado antecipadamente; revogação invalida o link. Link individual não foi definido expressamente como uso único, ao contrário do token de recuperação.

RN-009–015: saída voluntária dispensa aprovação. Remoção exige administrador. Nenhuma delas elimina automaticamente históricos; autoria é preservada. Quando houver outros membros, transfere-se a administração necessária; núcleo ativo não fica sem administrador. Sem membros, aplica-se exclusão do núcleo, observando seu ciclo de vida.

## Exclusão de núcleos e residências

RN-016–019: retenção padrão de trinta dias configurável pelo administrador da instância. Após o prazo, prevê-se eliminação. Exclusão lógica desativa acesso dos membros; recuperação restaura núcleo e associações, considerando a situação das integrações.

RN-021–025: criar residência não concede acesso automático. Somente administradores do núcleo a excluem. Recuperação segue período da instância; excluir residência não exclui núcleo; integrações são desativadas durante exclusão.

A RN-020 não foi fornecida. Não há regra criada para preencher seu número. O destino detalhado de cada registro de módulo, versões e arquivos durante o expurgo exige política própria.

## Disponibilidade de módulos e início de uso

RN-026–031: núcleo não habilita módulo globalmente indisponível. Desativação global afeta todos os núcleos usuários e prevalece sobre habilitação individual. Desativar não exclui dados; módulo desativado não recebe novas operações. Reativar dispensa recadastro.

RN-032–035: cada conta terá inicialmente um núcleo criado automaticamente; apenas o nome do núcleo é obrigatório. Residência e membros adicionais não impedem o uso. Módulos partem de configurações padrão. A aplicação dessa regra ao ingresso por convite precisa de esclarecimento.

## Notificações e segurança

RN-037–040: canal interno independe de terceiros; e-mail depende de SMTP válido; push depende de compatibilidade e autorização. Falha de um canal não impede os demais.

RN-042–045: administrador pode iniciar recuperação somente de membros de núcleos administrados. Não vê nem define a nova senha. Credencial temporária tem uso único e validade limitada. A recuperação afeta a conta global, deve registrar administrador/núcleo iniciador, limitar tentativas e revogar sessões antigas.

RN-046: sessão encerrada não acessa recursos protegidos. Encerrar todas as demais sessões preserva a atual no gerenciamento comum; a recuperação de senha segue a regra específica de revogação das antigas.

## Auditoria, exportação e comunicação

RN-047: auditoria respeita o escopo e a privacidade, inclusive frente a administradores.

RN-048: exportação individual protege dados de terceiros, sem incluir indiscriminadamente registros compartilhados. A relação dos núcleos/residências é dado exportável do titular; seu conteúdo integral não passa a ser exportável por esse motivo.

RN-049–050: não há chat ou mensageria privada no MVP. Comunicação contextual usa notificações e recursos próprios dos módulos, quando existentes. Gerar convite copiável não implica integração de envio por aplicativos de mensagem.

## Estados e transições conhecidos

| Objeto | Estados/condições conhecidas | Transição e efeito |
| --- | --- | --- |
| Convite | Válido, revogado, expirado; aceitação prevista | Revogação ou expiração impede ingresso; semântica de consumo pendente |
| Participação | Vinculada ou encerrada por saída/remoção | Encerramento revoga acesso e preserva histórico |
| Núcleo/residência | Ativo, excluído logicamente, recuperado; eliminação após prazo | Recuperação no período; impacto detalhado do expurgo pendente |
| Módulo | Disponível/indisponível globalmente; habilitado/desabilitado no núcleo | Global prevalece; dados preservados |
| Sessão | Válida ou encerrada | Encerrada deixa de autorizar recursos protegidos |
| Credencial temporária | Válida, usada ou expirada | Somente válida e ainda não usada permite redefinição |

Os nomes dos estados acima são descritivos, não enums de API ou banco aprovados.
