# Mutyrão — Descrição, checklist e visualizações

## Conteúdo

Descrição opcional com texto livre, sem modelos ou estrutura predefinida obrigatória. Disponibilizar negrito, itálico, listas, links e checkboxes interativos. Itens marcados devem apresentar diferenciação visual dos pendentes.

Marcar todos os checkboxes não conclui a tarefa. A fonte também não estabelece que concluir exige checklist completo nem que reabrir desmarca checkboxes. Preservar essa independência sem acrescentar bloqueios automáticos.

Checkbox não é subtarefa autônoma com responsável, prazo ou status próprio. Editor, formato de armazenamento, IDs dos itens e concorrência na edição precisam de refinamento técnico. Não há anexos, comentários ou conversas no MVP.

## Categorias e prioridade

Categorias predefinidas: Limpeza, Manutenção, Compras, Organização, Cuidados com animais e Outros. Cada núcleo pode criar categorias próprias. Categoria não é obrigatória; papel de criação e disponibilidade no contexto pessoal precisam de detalhamento.

Prioridades baixa, normal e alta. Novas tarefas recebem normal por padrão. Não foi definido cálculo automático de prioridade por atraso, responsável ou categoria.

## Visualizações

| Visualização | Comportamento |
| --- | --- |
| Lista | Apresenta tarefas em lista, com filtros e critérios de ordenação disponíveis |
| Quadro | Colunas por status; encerradas dos últimos trinta dias por padrão, período alterável |
| Calendário | Apresenta tarefas conforme datas de vencimento |

Pendentes e Em andamento permanecem no quadro independentemente do período configurado para encerradas. Essa regra não anula filtros selecionados nem autorização.

A visualização em quadro não aprova explicitamente arrastar entre colunas. O calendário não obriga integração com Arakatu, criação de eventos ou alteração de vencimento por arraste. Tarefas sem prazo exigem tratamento de interface que preserve sua consulta sem inventar vencimento.

## Filtros, ordenação e pesquisa

Filtros por responsáveis, categoria, prioridade, status, contexto e prazo. Classificações: atrasadas, com vencimento próximo ou sem prazo. Ordenar por prazo, prioridade, criação e última atualização. Pesquisar por nome e descrição, retornando somente tarefas autorizadas.

RN-214 exige os mesmos critérios em lista, quadro e calendário. “Compartilhados” nessa regra significa disponibilidade consistente dos critérios, não que mudar um filtro pessoal reorganiza a tela de outras pessoas. Persistência e eventual compartilhamento de preferências não foram definidos.

Base temporal do recorte de encerradas, janela de vencimento próximo, desempate de ordenação e tratamento de tarefas sem prazo permanecem refinamentos de implementação.
