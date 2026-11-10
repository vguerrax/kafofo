# Mutyrão — Notificações e lembretes

## Eventos definidos

| Evento | Destinatário definido | Referência |
| --- | --- | --- |
| Atribuição | Usuário ao qual a tarefa foi atribuída | RF-285 |
| Alteração | Responsáveis pela tarefa alterada | RF-286 |
| Conclusão ou cancelamento | Responsáveis | RF-287 |
| Vencimento próximo | Responsáveis | RF-288 |
| Atraso | Responsáveis | RF-289 |

Utilizar canais interno, e-mail e push disponíveis na plataforma, respeitando preferências individuais e condições de cada canal. Não torna e-mail obrigatório no cadastro nem garante push em qualquer dispositivo.

Não foram definidos exclusão do autor da mudança entre destinatários, granularidade das alterações, agrupamento de eventos, repetição de alertas, conteúdo por canal ou política de autoatribuição. Não emitir alertas a todo o núcleo por inferência; tarefa sem responsável não possui destinatário de atribuição/responsabilidade definido automaticamente.

## Lembretes individuais

Somente tarefas com vencimento permitem configurar lembretes. Antecedências disponíveis: dez minutos, trinta minutos, uma hora, um dia ou período personalizado. Cada responsável configura seus próprios lembretes, sem modificar os demais.

O catálogo de antecedências não define quantidade máxima de lembretes por responsável nem exige vários simultâneos. O critério de vencimento próximo não deve ser igualado automaticamente à antecedência de um lembrete individual.

## Refinamentos de agendamento

Definir granularidade do vencimento, fuso de referência, execução após indisponibilidade, limites da antecedência personalizada, deduplicação, retentativas e mudanças de prazo. Definir também destino dos agendamentos ao concluir, cancelar, reabrir, excluir/restaurar ou remover responsável.

**Orientação derivada:** conferir autorização atual antes de enviar e antes de exibir conteúdo. Uma pessoa removida do contexto não deve receber dados porque havia lembrete antigo. O mecanismo de persistência assíncrona não determina política de entrega exatamente uma vez.

## Limites

Não há recorrência automática de tarefas, chat, comentários, SMS obrigatório ou envio por WhatsApp/Telegram no MVP. Notificação e lembrete não criam nova tarefa, evento no Arakatu ou obrigação de serviço externo adicional.
