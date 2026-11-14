# Kapanga — Consultas e indicadores

## Filtros de consulta

RF-180 prevê período de lançamento, período de vencimento, situação de pagamento, categoria, forma de pagamento, responsável pelo lançamento e residência quando aplicável. Os filtros só apresentam registros autorizados no contexto consultado; filtro de residência não amplia permissão.

Filtros de consulta por outros períodos continuam previstos. Para indicadores financeiros, a atualização RN-109 fixa o mês corrente; isso substitui a referência anterior a “período selecionado” em RF-185 no resumo. Não eliminar os filtros históricos da listagem por esse motivo.

## Indicadores conhecidos

| Indicador | Comportamento definido | Cálculo ainda a detalhar |
| --- | --- | --- |
| Total de despesas | Total no mês corrente do contexto | Data-base: lançamento ou vencimento; tratamento de estados e excluídos |
| Total pago | Valores pagos no período de referência | Data-base e efeito de exclusão/reversão no agregado |
| Total pendente | Valores ainda não pagos | Inclusão de REVERTIDO precisa de regra explícita; CANCELADO não representa obrigação |
| Total vencido | Despesas não pagas cujo vencimento já passou | REVERTIDO, CANCELADO e excluídos precisam de matriz de elegibilidade |
| Próximos vencimentos | Próximos sete dias por padrão, além de vencidas; janela configurável | Inclusão dos limites de hoje e do último dia; relação com mês corrente e períodos anteriores |

Os indicadores não misturam contextos pessoal, núcleo e residência. Painel pessoal do Okape pode reunir fontes autorizadas de vários contextos, mas cada indicador do Kapanga continua contextual e independente.

## Parcelas e dupla contagem

RN-110 exige contabilizar parcelas individualmente, sem somar novamente o valor total da compra. O registro original serve à relação e ao histórico, sem duplicar despesa nos indicadores.

Exemplo: compra em três parcelas de 100, 120 e 100, com apenas a primeira vencendo no mês. A parcela contribui com 100 se a base aprovada for vencimento; não adicionar os 320 do total da compra ao indicador. A escolha de vencimento como data-base neste exemplo é condicional, não decisão funcional já tomada.

## Vencidos e janela futura

RF-181 define vencido como não pago com vencimento anterior à data atual. Vencimento retroativo é aceito no cadastro. RF-193 define sete dias por padrão e inclui apresentação de vencidos; RN-112 permite alterar antecedência.

Não foram definidos quem configura a janela, seu escopo, limites, referência de fuso ou tratamento de mudança de mês. Não restringir automaticamente a lista de vencidos ao mês corrente nem remover a restrição mensal dos totais por inferência.

## Contrato com Okape

Kapanga calcula agregados, valida contexto/permissões e fornece estruturas tipadas de dados. Okape escolhe apresentação e composição. Intervalo de atualização é da origem segundo a especificação de Okape, mas o valor do intervalo do Kapanga ainda não foi definido.

O resumo financeiro RF-184 é uma capacidade de dados do módulo; não obriga painel predefinido nem acopla o funcionamento financeiro à disponibilidade do Okape.
