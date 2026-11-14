# Arakatu — Pendências e limites da base

Escopo geral de agenda aprovado; o detalhamento disponível é menor que nos documentos específicos dos outros módulos. As lacunas abaixo não foram preenchidas por analogia.

| ID | Tema | Definição necessária |
| --- | --- | --- |
| Q-A01 | Modelo de evento e agenda | Campos, obrigatoriedade, início/fim/duração, dia inteiro, multiplicidade de agendas, origem e identificadores |
| Q-A02 | Permissões e compartilhamento | Criar/editar/excluir por papel, compartilhamento de agenda/evento, convidados e limites entre contextos/instância |
| Q-A03 | Direção das assinaturas | Publicar feed do Kafofo, consumir externo ou ambos em fluxos separados; autenticação, escopo e revogação |
| Q-A04 | Importação/exportação | Arquivo ou URL, abrangência, dados suportados, erros, duplicatas, identificadores e atualização de importações |
| Q-A05 | Administração de externos | Evento importado apenas visualizável ou editável localmente; remoção externa, propriedade e comportamento de cópias |
| Q-A06 | Recorrência e datas | Intervalos/término de séries, dias inexistentes, 29/02, fuso e horário de verão; não herdar regras financeiras automaticamente |
| Q-A07 | Edição de série e exceções | Escopo sobre passado, tratamento de exceções existentes, identidade de ocorrência e reagendamento |
| Q-A08 | Exclusão e recuperação | Confirmação, papel, restauração de evento/série/exceção, histórico e retenção; política comum ainda exige aplicação local |
| Q-A09 | Lembretes e destinatários | Quem configura/recebe, individual ou compartilhado, antecedências, evento externo, herança série/ocorrência e preferências |
| Q-A10 | Agendamento e falhas | Retomada após indisponibilidade, deduplicação, tentativas e mudanças de evento/fuso/permissão/módulo |
| Q-A11 | Atualização de integração | Periodicidade, marca de atualidade, falha parcial, credenciais, cache e retirada de acesso |
| Q-A12 | Tecnologia de calendário | Avaliar componentes e soluções open-source; nenhuma escolha definitiva de FullCalendar/Radicale/Nextcloud Calendar ou biblioteca de recorrência |
| Q-A13 | Interface de agenda | Vistas, navegação, pesquisa/filtros, ordenação, distinção de origens e acessibilidade; não copiar vistas do Mutyrão como requisito |
| Q-A14 | Portabilidade e histórico | Abrangência pessoal, dados compartilhados, conteúdo externo, lembretes e eventuais versões no arquivo; definir eventos de auditoria |

## Decisões já fechadas

Agenda deve ser utilizável e permitir criar/administar eventos no Kafofo. Migração não é obrigatória. Origem precisa ser identificável na visão consolidada. MVP é unidirecional; alteração externa não modifica original nativo. Assinatura iCalendar é prioridade inicial. Frequências diária, semanal, mensal e anual; edição/exclusão de ocorrência ou série; múltiplos lembretes configuráveis pelo centro de notificações.

Bidirecionalidade e conectores autenticados específicos Google/Microsoft ficam para evolução. CalDAV é avaliação, não implantação aprovada. Não selecionar biblioteca apenas porque foi mencionada como candidata.

## Sequência sugerida

Fechar modelo/autorização e direção de integração (Q-A01–05), depois regras temporais/recorrência (Q-A06–08), lembretes e execução (Q-A09–11). Avaliação técnica deve usar esses contratos; apresentação e portabilidade acompanham as entregas afetadas.

Riscos principais: chamar importação/exportação de sincronização sem definir direção, editar original errado, duplicar evento ao atualizar, alterar demais ocorrências por uma exceção e disparar lembretes após perda de acesso. A consolidação documental não torna essas lacunas resolvidas.
