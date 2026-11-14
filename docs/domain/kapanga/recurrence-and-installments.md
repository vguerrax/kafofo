# Kapanga — Recorrência e parcelamento

## Distinção obrigatória

| Aspecto | Recorrência | Parcelamento |
| --- | --- | --- |
| Finalidade | Compromisso contínuo | Compromisso com quantidade finita de pagamentos |
| Término | Sem quantidade fixa ou data final na criação; encerramento explícito | Quantidade total definida na criação |
| Periodicidade | Semanal, mensal ou anual | Mensal após primeiro vencimento |
| Dados individuais | Valor e situação próprios de cada ocorrência | Valor, vencimento e situação próprios de cada parcela |
| Edição individual | Não altera demais ocorrências | Não altera valores das demais parcelas |
| Histórico | Encerramento preserva lançamentos gerados | Exclusão de não pagos preserva original e histórico de pagos |

RF-190 vigente não permite escolher quantidade de ocorrências. A redação intermediária que permitia recorrência finita foi superada. RN-114 direciona compromissos finitos ao parcelamento; a combinação de recorrência e parcelamento não foi definida.

## Geração e ajuste de datas

Recorrências calculam próximos vencimentos segundo a periodicidade. Quando o dia previsto não existe, usa-se o último dia do mês, mantendo a referência original para os meses seguintes. Não encadear o dia ajustado como nova âncora permanente.

Parcelas vencem no mesmo dia dos meses subsequentes ao primeiro vencimento, usando o último dia quando necessário. Quantidade total e número de cada parcela são imutáveis desde criação.

| Caso ilustrativo | Sequência esperada |
| --- | --- |
| Recorrência mensal, dia 31, em 2027 | 31/01 → 28/02 → 31/03 → 30/04 → 31/05 |
| Recorrência mensal, dia 31, em 2028 | 31/01 → 29/02 → 31/03 → 30/04 |
| Quatro parcelas iniciadas em 31/01/2027 | 31/01, 28/02, 31/03 e 30/04 |

Os exemplos verificam o ajuste aprovado; não definem horizonte ou momento de materialização. O tratamento anual de 29 de fevereiro deve ser explicitado e testado com retorno ao dia original quando existir, sem inferir periodicidade mensal para recorrências anuais.

## Valores e independência

Cada ocorrência ou parcela mantém valor e situação de pagamento próprios. Alterar uma parcela não modifica as demais; excluir uma parcela não redistribui seu valor. Excluir parcelas não pagas é permitido mesmo que vencidas.

O valor total de um parcelamento deriva da soma dos valores finais das parcelas, incluindo ajustes individuais. A fonte não especifica como exibir total histórico, total operacional e valores de parcelas excluídas ou canceladas; não escolher uma dessas bases silenciosamente.

**Exemplo definido:** três parcelas de 100, 120 e 100 resultam em total de 320 antes de qualquer exclusão/cancelamento. Excluir a segunda não transforma automaticamente as restantes em parcelas de 160 nem muda seus números.

## Edição da configuração recorrente

Alterações da configuração se aplicam às próximas ocorrências sem reescrever o histórico. Ocorrência editada individualmente não altera as demais. O significado de “próximas” quando já existem ocorrências futuras geradas precisa de refinamento: ainda não foi definido se tais registros são atualizados ou se só muda a geração posterior.

## Encerramento e exclusão

Encerrar recorrência é ação explícita: cessa criação futura e preserva lançamentos já gerados. Excluir configuração também não elimina lançamentos existentes. Excluir uma ocorrência isolada não deve apagar automaticamente a configuração pela mera existência do vínculo.

Ao excluir despesa vinculada, oferecer ocorrência atual ou cadeia em aberto. Na cadeia, somente registros ainda não pagos são atingidos; pagos são preservados. Não está definido se excluir a cadeia em aberto também encerra a configuração recorrente; registrar essa escolha em Q-K05 antes de implementar.

Ao restaurar original, oferecer original ou relacionados, respeitando estado e permissões. Restauração de registros não foi definida como reativação automática da geração.

## Refinamentos técnicos restantes

Momento da geração, horizonte, execução após indisponibilidade, chave de deduplicação, concorrência com encerramento e edição e limites de criação em lote. A arquitetura prevê processo Fastify com PostgreSQL, sem fila externa obrigatória. A escolha não determina sozinha essas garantias.
