# Mutyrão — Refinamentos e conflitos

O levantamento funcional está concluído. Os pontos abaixo delimitam comportamento de implementação e integração, preservando o escopo aprovado.

| ID | Tema | Refinamento necessário |
| --- | --- | --- |
| Q-M01 | Acesso versus visualizador | Reabertura/cancelamento disponíveis a quem tem acesso; residência possui visualizador de consulta. Definir precedência com RN-186/199 e política comum |
| Q-M02 | Compartilhamento com pessoas específicas | Definir ator que concede/revoga, limite de participação no contexto/núcleo/instância e efeito sobre tarefa pessoal; não importar exceções de outros módulos |
| Q-M03 | Conclusão e matriz completa | Qualquer responsável pode concluir; explicitar se editor não responsável também pode, e permissões de categorias/restauração sem criar privilégios especiais novos |
| Q-M04 | Status e transições | Definir estado inicial, destino da reabertura, origens de conclusão/cancelamento e repetição de ações; não inventar caminho obrigatório |
| Q-M05 | Vencimento e fuso | Prazo opcional convive com lembretes em minutos/horas; definir data versus data/hora, horário de referência, fuso e momento exato de atraso |
| Q-M06 | Próximo vencimento e repetição | Definir janela do RF-282/288, alertas únicos/repetidos, mudanças de prazo e lembrete já vencido; não copiar sete dias do Kapanga |
| Q-M07 | Remoção de responsável | Definir cancelamento de agendamentos, destinatários de alteração, reatribuição e eventual preservação das preferências individuais |
| Q-M08 | Ciclo de agendamento | Definir efeitos de concluir/cancelar/reabrir/excluir/restaurar e desativar módulo; deduplicação, retomada e retentativas ainda não fechadas |
| Q-M09 | Quadro e recorte | Definir data-base de encerradas, fronteiras dos trinta dias e escopo/ator da configuração; não confundir com retenção de excluídos |
| Q-M10 | Filtros e calendário | Definir tarefa sem prazo no calendário, desempates, persistência de preferências e aplicação visual de ordenação; mesmos critérios não implicam filtro global entre usuários |
| Q-M11 | Categorias | Definir papel criador, gestão/exclusão, disponibilidade pessoal/residencial e quantidade por tarefa; fonte só garante categoria opcional e personalização por núcleo |
| Q-M12 | Descrição e checklist | Definir formato persistido, política de links, acessibilidade, IDs e conflitos de edição; concluir/reabrir não modifica checkboxes automaticamente por inferência |
| Q-M13 | Alterações e notificações | Definir eventos que disparam aviso, destinatário que é autor, autoatribuição, agrupamento e conteúdo autorizado; respeitar preferências |
| Q-M14 | Histórico e ADR | Detalhar schema/eventos e retenção, conciliando histórico no MVP com ADR-0010 que adia auditoria específica |
| Q-M15 | Restauração e portabilidade | Definir ator e restauração de compartilhamento/atribuições/estado/lembretes; delimitar histórico e configurações na exportação pessoal |

## Pontos já definidos

Responsável não é obrigatório e pode haver vários. Qualquer responsável conclui a tarefa inteira. Criador não tem exclusividade de edição. Prazo e categoria são opcionais, prioridade padrão normal. Cancelamento exige motivo; reabertura e mudança de responsáveis não exigem. Atraso não muda status. Checkboxes completos não concluem automaticamente. Quadro possui recorte configurável para encerradas, padrão trinta dias; tarefas abertas não são ocultadas por esse recorte. Lembretes são individuais. Exclusão é lógica e confirmada.

Recorrência, comentários, anexos e templates permanecem fora do MVP; não são itens pendentes para aprovação nesta entrega.

## Riscos e sequência sugerida

Resolver autorização e transições (Q-M01–04) antes de implementar ações. Fechar semântica temporal e ciclo de agendamento (Q-M05–08) antes de habilitar notificações de prazo. Refinar apresentação, conteúdo e histórico junto aos respectivos fluxos.

Riscos principais: visualizador executar escrita, conclusão individual ser interpretada como parcial, lembretes enviarem dados após perda de acesso, edição concorrente perder checklist e recorte visual ser confundido com exclusão. Essas questões não exigem transformar o módulo num sistema completo de projetos.
