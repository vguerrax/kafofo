# Kitanda — Visão geral

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


Kitanda permite criar, organizar e compartilhar listas de compras nos contextos pessoal, núcleo e residência, entre pessoas autorizadas. Prioriza simplicidade, colaboração e atualização compartilhada das compras domésticas.

O nome e a personalidade definidos são próximos, populares, culturais e práticos. O documento de marca associa Kitanda à palavra de referência quimbunda relacionada a feira ou mercado. Esta consolidação preserva a atribuição da marca sem realizar validação etimológica adicional.

## Escopo

Múltiplas listas independentes, nome obrigatório e descrição opcional; itens com nome obrigatório e quantidade, unidade e observação opcionais; identificação de duplicados com soma opcional; ordenação manual compartilhada; marcação/desmarcação de comprados; separação visual entre pendentes e comprados; limpeza e esvaziamento confirmados; exclusão lógica e restauração de listas; pesquisa, filtros, histórico, cartões e progresso.

As listas permanecem reutilizáveis. Não há encerramento ou arquivamento obrigatório, nem exigência de justificativa para operações comuns. Marcar/desmarcar não exige confirmação. Confirmações ficam explícitas para limpeza, esvaziamento e exclusão da lista.

## Atores e responsabilidades

| Ator/componente | Responsabilidade |
| --- | --- |
| Usuário autorizado | Consulta e participação conforme acesso à lista/contexto; marcação e desmarcação segundo RN-235 |
| Usuário com edição | Pode excluir lista, com confirmação; demais operações precisam respeitar matriz do contexto |
| Usuário autorizado a restaurar | Recupera lista excluída; papel exato ainda não especificado |
| Plataforma | Identidade, contextos, papéis, ativação, notificações, privacidade e ciclo de dados |
| Kitanda | Listas, itens, duplicidades, ordem, situação de compra, histórico e progresso |

A expressão “qualquer usuário com acesso” para marcação precisa ser conciliada com o papel visualizador da residência, que é de consulta. A documentação registra o conflito sem conceder edição universal.

## Fora do MVP

Compartilhamento externo ao núcleo, links públicos, convites sem conta, modelos/templates, recorrência automática de listas, estoque, catálogo de produtos, marcas, fornecedores, preços, integração financeira, notificações comuns e quadro Kanban.

Kitanda não depende do Jaci ou Kapanga. Reutilizar uma lista significa continuar usando seus registros, sem criar uma recorrência automática ou uma nova sessão de compras por inferência.
