# Mutyrão — Permissões e compartilhamento

## Matriz conhecida

| Operação | Autorização definida | Limite |
| --- | --- | --- |
| Visualizar/pesquisar | Pessoa autorizada pela tarefa/contexto e modalidade de compartilhamento | Não expor nome/descrição de tarefa sem acesso |
| Editar tarefa | Usuário com acesso, respeitando permissões aplicáveis | Criador não tem exclusividade; papel visualizador exige conciliação |
| Compartilhar | Com todos os membros autorizados do contexto ou pessoas específicas | Ator que concede, escopo dos convidados e revogação ainda a detalhar |
| Assumir/atribuir tarefa sem responsável | Qualquer pessoa com edição | Não exige justificativa |
| Adicionar/remover/substituir responsáveis | Disponível a qualquer momento conforme autorização | Elegibilidade dos responsáveis e matriz completa ainda não detalhadas |
| Concluir | Qualquer responsável pode concluir a tarefa inteira | Fonte não exige privilégio especial; conclusão por editor não responsável precisa de definição explícita |
| Cancelar | Qualquer pessoa com acesso, segundo RN-197 | Exige justificativa; conciliar com visualizador da residência |
| Reabrir concluída/cancelada | Qualquer pessoa com acesso, sem privilégio especial | Sem justificativa; conciliar com visualizador e definir status de destino |
| Configurar lembrete | Cada responsável configura os próprios | Não alterar configuração de outros responsáveis |
| Criar categoria personalizada | Núcleo pode criar categorias próprias | Papel exato não definido; não importar exclusividade administrativa do Kapanga |
| Excluir logicamente | Pessoa com acesso e edição | Confirmação obrigatória; justificativa não exigida pela especificação |
| Restaurar | Usuário autorizado | Papel exato não definido; não presumir restrição a administrador |

## Autorização versus atribuição

Criador não é o único editor. Ser responsável permite os comportamentos expressamente definidos, mas não substitui verificar acesso atual. Tarefa sem responsável fica disponível a usuários autorizados do contexto; ninguém precisa ser atribuído antes do cadastro.

Participar do núcleo não implica acesso automático a todas as residências. “Pessoas específicas” não define por si só compartilhamento externo ao núcleo ou à instância. Não aplicar a proibição particular do Kitanda nem a exceção particular do Okape sem decisão do Mutyrão.

## Conflito com visualizador

RN-191/193/197 usam “qualquer usuário com acesso” para reabrir/cancelar. A plataforma define visualizador de residência como consulta. RN-199 também condiciona edição às permissões aplicáveis. É necessário estabelecer precedência no contrato de autorização; o documento registra ambas as definições sem escolher silenciosamente uma.

## Verificação derivada

Validar no backend sessão, recurso real, contexto, vínculo ativo, modalidade de compartilhamento, papel e estado do módulo. Aplicar também em histórico, notificações, lembretes, checkboxes, exclusão/restauração e exportação. Campos enviados pelo cliente não determinam autor de eventos.
