# Kafofo — Especificação Funcional
## Mutyrão - Tarefas Domésticas

**Escopo:** MVP  
**Status:** Levantamento funcional concluído

## 1. Objetivo

Permitir que pessoas organizem, compartilhem e acompanhem tarefas relacionadas à vida doméstica, considerando diferentes contextos de uso: pessoal, núcleo e residência.

O módulo deve priorizar simplicidade de uso, colaboração e rastreabilidade, sem introduzir procedimentos burocráticos desnecessários.

## 2. Cadastro e dados da tarefa

- **RF-139 — Cadastro de tarefas:** permitir criar tarefas domésticas.
- **RF-140 — Nome da tarefa:** exigir um nome para identificar a tarefa.
- **RF-141 — Responsáveis:** permitir associar um ou mais responsáveis à tarefa.
- **RF-142 — Status:** permitir acompanhar o estado da tarefa.
- **RF-143 — Histórico:** manter o histórico de alterações e ações realizadas sobre a tarefa.
- **RF-271 — Descrição:** permitir adicionar uma descrição opcional.
- **RF-272 — Formatação da descrição:** permitir formatação básica, incluindo negrito, itálico, listas e links.
- **RF-273 — Data de vencimento:** permitir definir uma data de vencimento opcional.
- **RF-274 — Prioridade:** permitir classificar tarefas como baixa, normal ou alta.
- **RF-275 — Categorias:** permitir classificar tarefas por categorias predefinidas ou personalizadas.
- **RF-276 — Lista de verificação:** permitir inserir checkboxes interativos na descrição da tarefa.

## 3. Compartilhamento e permissões

- **RF-268 — Compartilhamento de tarefas:** permitir compartilhar tarefas com todos os membros autorizados do contexto ou com pessoas específicas.
- **RN-184 — Associação ao contexto:** toda tarefa deve estar associada a um contexto: pessoal, núcleo ou residência.
- **RN-185 — Visibilidade:** a visibilidade deve respeitar a modalidade de compartilhamento definida para a tarefa.
- **RN-186 — Permissões de acesso:** somente pessoas autorizadas podem visualizar ou interagir com a tarefa, conforme suas permissões.
- **RN-199 — Edição compartilhada:** qualquer usuário com acesso à tarefa pode editar seus dados, respeitando as permissões aplicáveis.
- **RN-200 — Edição pelo criador:** o criador da tarefa não possui exclusividade de edição.

## 4. Responsáveis

- **RF-269 — Múltiplos responsáveis:** permitir associar vários responsáveis à mesma tarefa.
- **RF-293 — Tarefas sem responsável:** permitir cadastrar tarefas sem atribuição inicial.
- **RF-294 — Gerenciamento de responsáveis:** permitir adicionar, remover e substituir responsáveis a qualquer momento.
- **RN-187 — Responsabilidade compartilhada:** todos os responsáveis associados compartilham a responsabilidade pela tarefa.
- **RN-188 — Conclusão por responsável:** qualquer um dos responsáveis pode marcar a tarefa como concluída.
- **RN-189 — Conclusão integral:** a conclusão altera o status da tarefa inteira, não apenas a responsabilidade individual.
- **RN-219 — Visibilidade de tarefas não atribuídas:** tarefas sem responsável ficam disponíveis aos usuários autorizados do contexto.
- **RN-220 — Atribuição posterior:** qualquer usuário com permissão de edição pode atribuir ou assumir a responsabilidade por uma tarefa sem responsável.
- **RN-221 — Histórico de atribuição:** alterações de responsáveis devem ser registradas no histórico.
- **RN-222 — Justificativa de atribuição:** não exigir justificativa para alterações de responsáveis.

## 5. Status e ciclo de vida

Os status considerados para o módulo são:

- Pendente;
- Em andamento;
- Concluída;
- Cancelada.

- **RN-190 — Registro de conclusão:** registrar no histórico quem concluiu a tarefa, com data e horário.
- **RN-191 — Reabertura:** qualquer usuário com acesso pode reabrir tarefas concluídas ou canceladas.
- **RN-192 — Justificativa de reabertura:** não exigir justificativa para reabrir uma tarefa.
- **RN-193 — Privilégios de reabertura:** não exigir privilégio especial além do acesso à tarefa.
- **RN-194 — Histórico de reabertura:** registrar a reabertura, preservando os registros das conclusões anteriores.
- **RF-270 — Cancelamento:** permitir cancelar tarefas.
- **RN-195 — Justificativa de cancelamento:** exigir justificativa para cancelar uma tarefa.
- **RN-196 — Visibilidade da justificativa:** disponibilizar a justificativa aos demais usuários com acesso à tarefa.
- **RN-197 — Permissão de cancelamento:** qualquer usuário com acesso à tarefa pode cancelá-la.
- **RN-198 — Histórico de cancelamento:** registrar responsável, data, horário e justificativa do cancelamento.

## 6. Prazos e prioridades

- **RN-202 — Prazo opcional:** a definição de vencimento não é obrigatória.
- **RN-203 — Identificação de atraso:** tarefas não concluídas nem canceladas após o vencimento devem receber identificação visual de atraso, sem alteração automática do status.
- **RN-204 — Prioridade padrão:** novas tarefas devem receber prioridade normal por padrão.

## 7. Categorias

Categorias predefinidas:

1. Limpeza;
2. Manutenção;
3. Compras;
4. Organização;
5. Cuidados com animais;
6. Outros.

- **RN-205 — Categorias predefinidas:** disponibilizar as categorias listadas acima.
- **RN-206 — Categorias personalizadas:** permitir que cada núcleo crie categorias próprias.
- **RN-207 — Categoria opcional:** não exigir uma categoria para cadastrar uma tarefa.

## 8. Descrição e lista de verificação

- **RN-201 — Texto livre:** a descrição deve aceitar texto livre, sem exigir modelos ou estruturas predefinidas.
- **RN-208 — Identificação dos checkboxes:** itens marcados devem apresentar diferenciação visual em relação aos itens pendentes.
- **RN-209 — Conclusão independente:** marcar todos os itens da lista de verificação não deve concluir automaticamente a tarefa. A conclusão deve ser uma ação explícita.
- **RN-210 — Anexos:** não disponibilizar anexos no MVP.
- **RN-211 — Comentários e conversas:** não disponibilizar comentários ou conversas nas tarefas no MVP.
- **RN-058 — Recorrência:** não disponibilizar recorrência de tarefas no MVP.

## 9. Visualizações

- **RF-277 — Visualização em lista:** apresentar tarefas em formato de lista.
- **RF-278 — Visualização em quadro:** apresentar tarefas em colunas organizadas por status.
- **RF-279 — Visualização em calendário:** apresentar tarefas conforme suas datas de vencimento.
- **RF-280 — Período de tarefas encerradas:** permitir configurar o período de exibição de tarefas concluídas e canceladas no quadro.
- **RN-212 — Período padrão do quadro:** apresentar tarefas concluídas e canceladas dos últimos 30 dias por padrão.
- **RN-213 — Período configurável:** permitir alterar o período considerado para tarefas concluídas e canceladas.
- Tarefas pendentes e em andamento devem permanecer visíveis no quadro independentemente do período configurado.

## 10. Filtros, ordenação e pesquisa

- **RF-281 — Filtros de tarefas:** permitir filtrar por responsáveis, categoria, prioridade, status, contexto e prazo.
- **RF-282 — Classificação de prazo:** permitir identificar tarefas atrasadas, com vencimento próximo ou sem prazo.
- **RF-283 — Ordenação de tarefas:** permitir ordenar por prazo, prioridade, data de criação e última atualização.
- **RF-284 — Pesquisa de tarefas:** permitir pesquisar tarefas pelo nome e pela descrição.
- **RN-214 — Filtros e ordenação compartilhados:** disponibilizar os mesmos critérios nas visualizações de lista, quadro e calendário.
- **RN-215 — Respeito às permissões na pesquisa:** apresentar somente tarefas que o usuário tenha autorização para visualizar.

## 11. Notificações

- **RF-285 — Notificação de atribuição:** notificar o usuário quando uma tarefa for atribuída a ele.
- **RF-286 — Notificação de alterações:** notificar responsáveis sobre alterações em tarefas sob sua responsabilidade.
- **RF-287 — Notificação de conclusão e cancelamento:** notificar responsáveis quando a tarefa for concluída ou cancelada.
- **RF-288 — Notificação de prazo próximo:** notificar responsáveis quando o vencimento estiver próximo.
- **RF-289 — Notificação de atraso:** notificar responsáveis quando uma tarefa ficar atrasada.
- **RN-216 — Preferências individuais:** respeitar as preferências de notificação de cada usuário.
- **RN-217 — Canais de notificação:** utilizar os canais internos, e-mail e push disponíveis no Kafofo.

## 12. Lembretes

- **RF-290 — Configuração de lembretes:** permitir configurar lembretes para tarefas com vencimento.
- **RF-291 — Antecedência dos lembretes:** oferecer opções de 10 minutos, 30 minutos, 1 hora, 1 dia ou período personalizado.
- **RF-292 — Lembretes individuais:** permitir que cada responsável configure seus próprios lembretes.
- **RN-218 — Independência dos lembretes:** a configuração de um responsável não deve alterar os lembretes dos demais.

## 13. Exclusão e restauração

- **RF-295 — Exclusão de tarefas:** permitir excluir logicamente tarefas.
- **RN-223 — Permissão de exclusão:** qualquer usuário com acesso e permissão de edição pode excluir tarefas.
- **RN-224 — Confirmação de exclusão:** solicitar confirmação antes de excluir.
- **RN-225 — Preservação do histórico:** manter os registros históricos após a exclusão.
- **RN-226 — Restauração:** permitir restaurar tarefas excluídas logicamente por usuários autorizados.

## 14. Restrições do MVP

Não fazem parte do escopo inicial:

- Recorrência automática de tarefas;
- Anexos e arquivos;
- Comentários ou conversas;
- Modelos ou estruturas predefinidas de tarefas;
- Conclusão automática baseada nos checkboxes.

## 15. Princípios de simplicidade

O módulo deve evitar controles burocráticos sem benefício operacional claro.

Em particular:

- Não exigir justificativa para reabrir tarefas;
- Não exigir justificativa para alterações de responsáveis;
- Não exigir que o criador seja o responsável pela edição;
- Não exigir atribuição inicial de responsável;
- Não exigir prazo ou categoria;
- Não exigir privilégios especiais para concluir, cancelar ou reabrir além das permissões de acesso definidas.

A exigência de justificativa para cancelamento permanece como exceção deliberada, para dar visibilidade aos demais usuários sobre o motivo do cancelamento.

## 16. Encerramento do levantamento

O levantamento funcional do módulo de Tarefas Domésticas está concluído para o MVP.

Questões de implementação, detalhes de interface, comportamento técnico das notificações e demais refinamentos operacionais serão tratados durante a etapa de implementação, sem ampliar desnecessariamente o levantamento funcional neste momento.