# Arakatu — Eventos e recorrência

## Eventos próprios e externos

Kafofo permite criar e administrar eventos e é a fonte dos que nascem nele. Eventos de outras origens podem aparecer em visão consolidada, com origem identificável. A possibilidade de editar evento importado localmente, administrar sua origem ou apenas visualizá-lo ainda precisa ser definida.

A fonte não especifica máquina de estados como confirmado/cancelado, participação/aceite ou bloqueio de conflitos de horário. Não introduzir estados por analogia com tarefas.

## Frequências aprovadas

Diária, semanal, mensal e anual. Intervalos personalizados, quantidade/data-limite da série, seleção avançada de dias úteis e “primeira segunda-feira do mês” não foram detalhados. A recorrência não herda a proibição de término finito do Kapanga: é outro domínio.

## Escopos de alteração

| Operação | Comportamento aprovado | Refinamento |
| --- | --- | --- |
| Editar ocorrência | Alterar uma ocorrência específica | Manter identidade e exceção sem alterar as demais |
| Editar série | Alterar toda série | Definir alcance sobre passado, exceções existentes e agendamentos |
| Excluir ocorrência | Remover ocorrência específica | Não permitir reaparecimento indevido ao recalcular a série |
| Excluir série | Remover toda série | Definir histórico, recuperação, integrações e lembretes afetados |

“Esta e as próximas” não foi aprovado como terceiro escopo. Também não foi definido se edição de série reescreve ocorrências passadas; isso não deve ser resolvido silenciosamente na implementação.

## Datas e fusos

Plataforma prevê fuso por usuário/residência, conversão, preservação de origem e tratamento do horário local e de verão. Arakatu precisa detalhar como essas regras se aplicam a séries e exceções.

Não está definido o que ocorre com dia 31 em recorrência mensal, 29/02 em anual, horário inexistente ou repetido em mudança de horário de verão. A regra de último dia do mês do Kapanga não é automaticamente regra de agenda. Os casos devem ser especificados antes de homologar expansão de séries.

## Exclusão e recuperação

A política geral é exclusão lógica, com retenção configurável. Fluxo específico de recuperação de evento/série/exceção, confirmação e histórico de alterações não foi aprovado em detalhe. Não publicar uma restauração automática de toda série nem converter exclusão local em exclusão do calendário externo.

**Orientações técnicas derivadas:** preservar referência estável de ocorrência; controlar duplicidade de exceções; combinar persistência e reagendamento de lembretes de forma consistente. A representação SQL ou uso de biblioteca de recorrência ainda não foram escolhidos.
