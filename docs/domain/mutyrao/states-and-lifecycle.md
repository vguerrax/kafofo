# Mutyrão — Estados e ciclo de vida

## Estados definidos

| Status | Uso na especificação |
| --- | --- |
| Pendente | Estado disponível para acompanhamento |
| Em andamento | Estado disponível para acompanhamento |
| Concluída | Conclusão explícita da tarefa inteira |
| Cancelada | Encerramento por cancelamento com justificativa |

A especificação detalhada mantém os quatro status considerados no levantamento. Não define estado inicial obrigatório, caminho completo de transições nem estado de destino da reabertura. Esses detalhes permanecem delimitados, sem inventar fluxo obrigatório de Pendente para Em andamento antes de concluir.

## Operações de ciclo

| Operação | Regra definida | Dados/limites |
| --- | --- | --- |
| Concluir | Qualquer responsável pode concluir integralmente | Registrar quem e quando; não requer conclusão individual dos demais |
| Cancelar | Qualquer pessoa com acesso pode cancelar, observadas permissões | Motivo obrigatório, visível aos demais autorizados; registrar autor, data/hora e justificativa |
| Reabrir | Disponível para Concluída e Cancelada a pessoa com acesso | Não exige justificativa nem privilégio especial; preservar conclusões anteriores; destino ainda não especificado |
| Marcar checklist completo | Todos os itens podem ser marcados | Não conclui a tarefa; é necessária ação explícita |
| Vencer prazo | Tarefa não concluída/cancelada fica atrasada após vencimento | Identificação visual sem mudança automática de status |
| Excluir | Pessoa com acesso e edição confirma ação | Exclusão lógica, preservando histórico |
| Restaurar | Usuário autorizado recupera excluída | Papel, prazo aplicável e efeitos em lembretes/estado devem ser refinados |

Não foi definida exigência de motivo para conclusão, reabertura, mudança de responsáveis ou exclusão. Cancelamento é exceção deliberada com justificativa obrigatória.

## Responsabilidade compartilhada

Tarefa com três responsáveis possui um único status. Conclusão por um deles conclui a tarefa inteira, registra esse autor e pode notificar os responsáveis conforme preferências. Não existe aprovação por unanimidade, percentual individual ou etapa de aceite definida.

Responsáveis podem ser alterados a qualquer momento; isso não autoriza reabrir automaticamente uma tarefa encerrada nem modificar seu histórico. Tratamento de notificações e lembretes de responsáveis removidos precisa de refinamento.

## Atraso e quadro

Atraso é um atributo de apresentação calculado: vencimento passou e tarefa não está Concluída ou Cancelada. Não criar status Atrasada. Critérios para vencimento com data sem horário e fuso precisam de definição.

O quadro exibe Concluída/Cancelada dos últimos trinta dias por padrão, período configurável. Pendentes/Em andamento não são ocultadas por esse recorte temporal, mantendo filtros e autorização. Ocultar encerradas antigas não exclui nem arquiva essas tarefas.

## Exclusão e recuperação

Exclusão lógica não é cancelamento. Não exigir justificativa de cancelamento ao excluir nem reabrir tarefa automaticamente ao restaurar. Restauração não deve apagar histórico de encerramentos. Efeitos precisos de recuperação sobre atribuições, compartilhamento e agendamentos precisam ser explicitados junto ao ciclo de dados da plataforma.

Os trinta dias do quadro são independentes dos trinta dias padrão de recuperação de registros excluídos: são configurações com finalidades distintas.
