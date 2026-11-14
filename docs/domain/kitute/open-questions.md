# Kitute — Refinamentos pendentes

Estes pontos não reabrem o escopo aprovado. Exigem definição antes da implementação das operações afetadas.

| ID | Questão | Impacto |
| --- | --- | --- |
| Q-KIT-01 | Quem pode criar caderno de residência/núcleo: qualquer editor ou somente o administrador correspondente? | Matriz de criação; não deduzir da permissão de criar receitas. |
| Q-KIT-02 | Se um membro sai do contexto mas também tem concessão explícita, essa concessão é revogada ou permanece? | Revogação com múltiplas fontes de acesso. |
| Q-KIT-03 | Leitor pode consultar nomes das tags usadas nas receitas compartilhadas, mas como impedir exposição do catálogo restante do contexto? | Isolamento de tags; acesso ao caderno não abre todo o contexto. |
| Q-KIT-04 | Limites de tamanho, validação de campos vazios, intervalo do tempo e normalização de tags. | Contratos e mensagens de erro. |
| Q-KIT-05 | Nome duplicado de caderno/receita é permitido? | Validação e experiência de organização. |
| Q-KIT-06 | Fluxo de resolução do conflito e estratégia de revisão concorrente. | Detalhe de implementação; não pode perder texto nem sobrescrever silenciosamente. |
| Q-KIT-07 | Destino de caderno pessoal após exclusão da conta; tratamento de autoria e portabilidade. | Aplicar política de plataforma após refinamento, sem transferência inventada. |
| Q-KIT-08 | Mecanismo para preservar quais receitas estavam ativas ao excluir caderno e para invalidar concessões antigas. | Persistência e restauração transacionais. |

Prazo de recuperação vem da política da plataforma, sem criar um número local.
Não foram aprovadas aprovação de receitas, moderação, notificações, favoritos ou mesclagem automática.
