# Mutyrão — Regras de negócio

**Escopo dos IDs:** `mutyrao`. 44 enunciados da especificação detalhada, preservados com IDs e redação fornecidos. Refinamentos locais aparecem nos demais documentos sem substituir estes enunciados.

| ID | Nome | Definição fornecida |
| --- | --- | --- |
| RN-058 | Recorrência | não disponibilizar recorrência de tarefas no MVP. |
| RN-184 | Associação ao contexto | toda tarefa deve estar associada a um contexto: pessoal, núcleo ou residência. |
| RN-185 | Visibilidade | a visibilidade deve respeitar a modalidade de compartilhamento definida para a tarefa. |
| RN-186 | Permissões de acesso | somente pessoas autorizadas podem visualizar ou interagir com a tarefa, conforme suas permissões. |
| RN-187 | Responsabilidade compartilhada | todos os responsáveis associados compartilham a responsabilidade pela tarefa. |
| RN-188 | Conclusão por responsável | qualquer um dos responsáveis pode marcar a tarefa como concluída. |
| RN-189 | Conclusão integral | a conclusão altera o status da tarefa inteira, não apenas a responsabilidade individual. |
| RN-190 | Registro de conclusão | registrar no histórico quem concluiu a tarefa, com data e horário. |
| RN-191 | Reabertura | qualquer usuário com acesso pode reabrir tarefas concluídas ou canceladas. |
| RN-192 | Justificativa de reabertura | não exigir justificativa para reabrir uma tarefa. |
| RN-193 | Privilégios de reabertura | não exigir privilégio especial além do acesso à tarefa. |
| RN-194 | Histórico de reabertura | registrar a reabertura, preservando os registros das conclusões anteriores. |
| RN-195 | Justificativa de cancelamento | exigir justificativa para cancelar uma tarefa. |
| RN-196 | Visibilidade da justificativa | disponibilizar a justificativa aos demais usuários com acesso à tarefa. |
| RN-197 | Permissão de cancelamento | qualquer usuário com acesso à tarefa pode cancelá-la. |
| RN-198 | Histórico de cancelamento | registrar responsável, data, horário e justificativa do cancelamento. |
| RN-199 | Edição compartilhada | qualquer usuário com acesso à tarefa pode editar seus dados, respeitando as permissões aplicáveis. |
| RN-200 | Edição pelo criador | o criador da tarefa não possui exclusividade de edição. |
| RN-201 | Texto livre | a descrição deve aceitar texto livre, sem exigir modelos ou estruturas predefinidas. |
| RN-202 | Prazo opcional | a definição de vencimento não é obrigatória. |
| RN-203 | Identificação de atraso | tarefas não concluídas nem canceladas após o vencimento devem receber identificação visual de atraso, sem alteração automática do status. |
| RN-204 | Prioridade padrão | novas tarefas devem receber prioridade normal por padrão. |
| RN-205 | Categorias predefinidas | disponibilizar as categorias listadas acima. |
| RN-206 | Categorias personalizadas | permitir que cada núcleo crie categorias próprias. |
| RN-207 | Categoria opcional | não exigir uma categoria para cadastrar uma tarefa. |
| RN-208 | Identificação dos checkboxes | itens marcados devem apresentar diferenciação visual em relação aos itens pendentes. |
| RN-209 | Conclusão independente | marcar todos os itens da lista de verificação não deve concluir automaticamente a tarefa. A conclusão deve ser uma ação explícita. |
| RN-210 | Anexos | não disponibilizar anexos no MVP. |
| RN-211 | Comentários e conversas | não disponibilizar comentários ou conversas nas tarefas no MVP. |
| RN-212 | Período padrão do quadro | apresentar tarefas concluídas e canceladas dos últimos 30 dias por padrão. |
| RN-213 | Período configurável | permitir alterar o período considerado para tarefas concluídas e canceladas. |
| RN-214 | Filtros e ordenação compartilhados | disponibilizar os mesmos critérios nas visualizações de lista, quadro e calendário. |
| RN-215 | Respeito às permissões na pesquisa | apresentar somente tarefas que o usuário tenha autorização para visualizar. |
| RN-216 | Preferências individuais | respeitar as preferências de notificação de cada usuário. |
| RN-217 | Canais de notificação | utilizar os canais internos, e-mail e push disponíveis no Kafofo. |
| RN-218 | Independência dos lembretes | a configuração de um responsável não deve alterar os lembretes dos demais. |
| RN-219 | Visibilidade de tarefas não atribuídas | tarefas sem responsável ficam disponíveis aos usuários autorizados do contexto. |
| RN-220 | Atribuição posterior | qualquer usuário com permissão de edição pode atribuir ou assumir a responsabilidade por uma tarefa sem responsável. |
| RN-221 | Histórico de atribuição | alterações de responsáveis devem ser registradas no histórico. |
| RN-222 | Justificativa de atribuição | não exigir justificativa para alterações de responsáveis. |
| RN-223 | Permissão de exclusão | qualquer usuário com acesso e permissão de edição pode excluir tarefas. |
| RN-224 | Confirmação de exclusão | solicitar confirmação antes de excluir. |
| RN-225 | Preservação do histórico | manter os registros históricos após a exclusão. |
| RN-226 | Restauração | permitir restaurar tarefas excluídas logicamente por usuários autorizados. |

## Definições textuais complementares

Status considerados: Pendente, Em andamento, Concluída e Cancelada. Categorias predefinidas: Limpeza, Manutenção, Compras, Organização, Cuidados com animais e Outros. Tarefas pendentes e em andamento permanecem visíveis no quadro independentemente do período configurado para encerradas, observadas autorização e filtros.

O MVP exclui modelos/estruturas predefinidas de tarefas, além de recorrência, anexos, comentários/conversas e conclusão automática por checklist. Não exigir privilégios especiais para concluir, cancelar ou reabrir além das permissões definidas. Justificativa de cancelamento é exceção deliberada às operações simples.
