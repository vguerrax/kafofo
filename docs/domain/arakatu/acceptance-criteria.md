# Arakatu — Critérios de aceitação

**Status:** cenários derivados e não executados. Como a base é menos detalhada, vários cenários representam cobertura parcial e dependem de Q-A. Não são prova de prontidão para implementação integral.

| ID | Cenário e referências | Dado / quando | Resultado esperado |
| --- | --- | --- | --- |
| CA-A01 | **Agenda utilizável** — RF-124–127 | Pessoa autorizada utiliza agenda no Kafofo | Permitir criação/administração de eventos pessoais e compartilhados, com formulário e matriz de papéis dependentes de Q-A01/02. |
| CA-A02 | **Contextos** — RF-126–127; plataforma/RF-050, RF-075 | Pessoa acessa contexto pessoal, núcleo ou residência | Eventos respeitam autorização e contexto; compartilhamento não concede acesso irrestrito. |
| CA-A03 | **Origem identificável** — RF-125, RF-130 | Visão reúne eventos nativos e externos autorizados | Identificar origem de cada evento; consolidar não amplia permissões. |
| CA-A04 | **Sem migração obrigatória** — RN-053; RF-128 | Pessoa mantém calendário externo | Agenda permite convivência sem obrigar abandono do serviço existente. |
| CA-A05 | **Original do Kafofo** — RN-054; RF-131 | Evento criado no Kafofo sofre alteração em serviço externo | Alteração externa não modifica automaticamente original nativo; comportamento de cópia importada depende de Q-A05. |
| CA-A06 | **Importação** — RF-129 | Usuário solicita importar iCalendar autorizado | Capacidade deve existir; suporte de arquivo/URL, abrangência e duplicatas dependem de Q-A04. |
| CA-A07 | **Exportação** — RF-129 | Usuário solicita exportar iCalendar autorizado | Capacidade deve existir no escopo permitido; formato concreto/abrangência dependem de Q-A04. |
| CA-A08 | **Assinatura prioritária** — RF-128, RF-131; decisões textuais | Fluxo inicial de integração é implementado | Priorizar assinatura iCalendar; direção e autenticação dependem de Q-A03. |
| CA-A09 | **MVP unidirecional** — RF-131; RN-055 | Integração MVP está configurada | Não exigir retorno bidirecional nem conectores autenticados Google/Microsoft como capacidade aprovada inicial. |
| CA-A10 | **Independência** — RN-052 | Outro módulo doméstico está desabilitado | Agenda continua utilizável independentemente, respeitando serviços comuns necessários. |
| CA-A11 | **Falha externa** — plataforma/RF-003–004 | Serviço de calendário externo fica indisponível | Não interromper funções nativas independentes; consulta de sincronizados segue permissão e política, sem operação offline implícita. |
| CA-A12 | **Frequências** — RF-132–133 | Pessoa configura recorrência | Oferecer diária, semanal, mensal e anual; término/intervalos detalhados dependem de Q-A06. |
| CA-A13 | **Editar ocorrência** — RF-134 | Pessoa altera ocorrência específica de série | Não modificar indevidamente demais ocorrências; identidade e exceção dependem de Q-A07. |
| CA-A14 | **Editar série** — RF-134 | Pessoa escolhe alterar toda série | Aplicar escopo explicitamente escolhido; passado e exceções existentes dependem de Q-A07. |
| CA-A15 | **Excluir ocorrência** — RF-135 | Pessoa exclui ocorrência específica | Não excluir toda série nem afetar indevidamente demais; recuperação depende de Q-A08. |
| CA-A16 | **Excluir série** — RF-135; plataforma/ADR-0010 | Pessoa autorizada exclui série inteira | Aplicar política lógica no escopo e tratar exceções/lembretes conforme definição futura; não excluir calendário externo por inferência. |
| CA-A17 | **Múltiplos lembretes** — RF-136–137 | Evento possui mais de um lembrete configurado | Suportar múltiplos lembretes no centro comum; atores e destinatários dependem de Q-A09. |
| CA-A18 | **Antecedência** — RF-138 | Antecedência do lembrete é configurada | Permitir configuração sem importar opções fixas de outro módulo; limites e fusos dependem de Q-A09/10. |
| CA-A19 | **Preferências** — RN-056; definições textuais | Lembrete é emitido para destinatário autorizado | Usar centro de notificações e respeitar preferências individuais e canais disponíveis. |
| CA-A20 | **Isolamento em integração** — plataforma/RF-013, RF-075 | Pedido de evento/feed/exportação usa contexto não autorizado | Impedir exposição; formato de credenciais e revogação de assinatura dependem de Q-A02/03. |
| CA-A21 | **Fusos e exceções** — plataforma/RNF-016–020 | Recorrência cruza fusos, fim de mês ou mudança de horário local | Verificar comportamento somente após fechar Q-A06; não herdar ajuste de fim de mês de despesas como regra de agenda. |
| CA-A22 | **Escolha técnica** — RN-051 | Implementação avalia calendário | Priorizar avaliação de soluções open-source; não tratar candidatos como aprovados sem decisão registrada. |
| CA-A23 | **Experiência herdada** — plataforma/RNF-001–015 | Fluxos são avaliados em dispositivos e tecnologias assistivas | Aplicar responsividade, PWA online, teclado, referência de acessibilidade e localização da plataforma. |
| CA-A24 | **Portabilidade distinta** — RF-129; plataforma/RF-122–123 | Usuário solicita arquivo de agenda ou seus dados pessoais | Distinguir exportação iCalendar de exportação pessoal; definir escopo sem expor terceiros, conforme Q-A14. |

Ao definir os contratos, complementar com importação repetida, arquivo parcialmente inválido, exclusão e retorno de feed, reinício durante agendamento, modificação de série com exceções, horário local inexistente/ambíguo e revogação de acesso antes da entrega de lembrete. Não foram criados testes de aplicação nesta entrega documental.
