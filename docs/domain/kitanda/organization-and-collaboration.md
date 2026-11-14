# Kitanda — Organização e colaboração

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


## Duplicidades

Ao adicionar item que já exista na mesma lista, identificar duplicidade, alertar e oferecer soma de quantidades. Usuário pode manter separado. Exemplo fornecido: Leite — 2 litros mais Leite — 1 litro pode resultar em Leite — 3 litros.

Não está definido se igualdade ignora acentos, maiúsculas, espaços ou sinônimos, nem se compara somente nome. Quantidade e unidade são opcionais; soma de quantidades ausentes ou unidades diferentes precisa de regra. Não converter automaticamente litros para mililitros nem fundir itens sem escolha do usuário.

A consolidação não tem regra aprovada para observações diferentes, itens já comprados ou histórico do registro absorvido. Preservar a possibilidade de manter separados nesses casos, sem inventar descarte de informação.

## Ordenação e visualizações

Itens em formato de lista, separados visualmente em pendentes e comprados. Ordenação manual deve ser compartilhada entre todos os usuários autorizados. Não copiar a ordenação individual das notas do Urukum para as compras.

Listas aparecem em cartões com nome, contexto e resumo do progresso. Não há Kanban no MVP. O comportamento da posição ao marcar/desmarcar, a ordenação entre grupos e a experiência acessível da reorganização serão refinados na implementação.

## Pesquisa e filtros

Pesquisar por nome da lista e nome dos itens, retornando somente registros autorizados. Filtrar por contexto e situação:

- Com itens pendentes.
- Somente itens comprados.
- Listas vazias.

Lista mista tem pendentes e comprados e satisfaz a descrição “com itens pendentes”. Não foi definida outra situação de lista nem busca por descrição/observação. Registros excluídos e áreas de restauração precisam de comportamento de pesquisa específico.

## Resumo e progresso

Exibir quantidade de itens pendentes/comprados e percentual concluído. Para lista não vazia, o cálculo definido é:

$$\text{progresso} = 100 \times \frac{\text{itens comprados}}{\text{total de itens}}$$

Cada registro de item tem o mesmo peso, independentemente de quantidade e unidade. Exemplo: um item de arroz com quantidade 10 e outro de leite com quantidade 1 correspondem a dois itens; comprar um deles resulta em 50%.

Lista vazia não possui percentual matematicamente definido por essa fórmula. Exibição de vazio, arredondamento e elegibilidade de itens excluídos precisam ser especificados. Não escolher automaticamente 0% ou 100% como se fosse definição original.

## Atualização compartilhada

Alterações devem ficar disponíveis aos demais usuários autorizados sem depender de notificações. Isso não fixa WebSocket, SSE, polling, latência máxima, edição simultânea de texto ou presença online.

**Orientações derivadas:** tratar alterações concorrentes de quantidade, marcação, ordenação e limpeza; preservar histórico coerente; apresentar falhas sem mostrar atualização rejeitada como concluída. Não acrescentar edição offline ou mecanismo CRDT ao MVP por inferência.
