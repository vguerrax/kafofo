# Kitanda — Regras de negócio

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


**Escopo dos IDs:** `kitanda`. São 35 enunciados da especificação atual, sem renumeração. Detalhamento nos fluxos e documentos de ciclo de vida, colaboração e permissões.

| ID | Nome | Definição |
| --- | --- | --- |
| RN-062 | Contexto e permissões | Respeitar o contexto ao qual a lista pertence e as permissões dos usuários. |
| RN-227 | Associação ao contexto | Cada lista deve pertencer a um único contexto: pessoal, núcleo ou residência. |
| RN-228 | Independência das listas | Alterações em uma lista não devem afetar as demais. |
| RN-229 | Tratamento de duplicidades | Alertar o usuário e oferecer a possibilidade de somar as quantidades. |
| RN-230 | Manutenção de itens separados | Permitir manter itens duplicados separadamente, caso o usuário prefira. |
| RN-231 | Nome obrigatório | Todo item deve possuir um nome. |
| RN-232 | Campos opcionais | Quantidade, unidade de medida e observação são opcionais. |
| RN-233 | Escopo dos itens | Não incluir marca, preço ou fornecedor no MVP. |
| RN-234 | Ordem compartilhada | A ordenação deve ser compartilhada entre todos os usuários autorizados da lista. |
| RN-235 | Permissão de alteração | Qualquer usuário com acesso à lista pode marcar ou desmarcar itens. |
| RN-236 | Histórico de compra | Registrar quem realizou a alteração e quando. |
| RN-237 | Simplicidade | Não exigir confirmação ou justificativa para marcar ou desmarcar itens. |
| RN-238 | Permanência dos itens comprados | Manter os itens comprados na lista, separados visualmente dos pendentes. |
| RN-239 | Remoção de itens comprados | Permitir remover esses itens individualmente ou por meio de uma limpeza da lista. |
| RN-240 | Confirmação de limpeza | Solicitar confirmação antes de executar limpar comprados ou esvaziar lista. |
| RN-241 | Preservação do histórico | Manter registros das operações de limpeza, respeitando a exclusão lógica adotada pelo Kafofo. |
| RN-242 | Identificação | O nome deve ser suficiente para identificar a lista, sem exigir outros campos. |
| RN-243 | Permissão de exclusão | Qualquer usuário com permissão de edição pode excluir listas. |
| RN-244 | Confirmação | Solicitar confirmação antes da exclusão da lista. |
| RN-245 | Preservação do histórico | Manter o histórico da lista e de seus itens. |
| RN-246 | Restauração | Permitir restaurar listas excluídas logicamente por usuários autorizados. |
| RN-247 | Respeito às permissões | Apresentar somente listas e itens que o usuário tenha autorização para visualizar. |
| RN-248 | Identificação das ações | Registrar o usuário responsável e a data/hora de cada operação. |
| RN-249 | Operações rastreadas | Registrar criação e exclusão de listas; inclusão, edição e remoção de itens; mudanças de quantidade e unidade; marcação e desmarcação; limpeza de comprados e esvaziamento. |
| RN-250 | Sem justificativas | Não exigir justificativas para operações comuns. |
| RN-251 | Notificações de listas | Não enviar notificações para inclusão, edição, remoção ou marcação comuns. |
| RN-252 | Atualização compartilhada | Alterações devem ficar disponíveis aos demais usuários autorizados da lista, sem depender de notificações. |
| RN-253 | Notificações relevantes | Reservar notificações para eventos de compartilhamento e alterações de permissões. |
| RN-254 | Reutilização de listas | Permitir reutilizar listas existentes após compras, adicionando itens ou limpando comprados. |
| RN-255 | Sem encerramento obrigatório | Não exigir encerramento ou arquivamento após uso. |
| RN-256 | Continuidade | Reutilização não deve apagar itens pendentes nem histórico anterior. |
| RN-257 | Cálculo do progresso | Calcular proporção de itens comprados sobre total de itens, sem pesos diferentes. |
| RN-258 | Escopo das visualizações | Não disponibilizar quadro Kanban no MVP. |
| RN-259 | Compartilhamento restrito | Permitir compartilhamento somente com membros autorizados do contexto no MVP. |
| RN-260 | Compartilhamento externo | Não permitir compartilhamento com pessoas externas ao núcleo, inclusive links públicos ou convites sem conta. |

## Restrições herdadas compatíveis

| ID do levantamento anterior | Regra mantida | Confirmação atual |
| --- | --- | --- |
| RN-060 | Sem templates de listas no MVP | Restrições atuais excluem modelos/templates |
| RN-061 | Sem recorrência automática de listas | Restrições atuais mantêm exclusão explícita |

Essas duas regras são referências históricas compatíveis, não novos enunciados numerados da especificação detalhada. São 35 regras atuais e duas restrições herdadas identificadas.
