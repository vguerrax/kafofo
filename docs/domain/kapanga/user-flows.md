# Kapanga — Fluxos de uso

## FL-K01 — Registrar despesa avulsa

**Ator:** usuário autorizado no contexto. **Base:** RF-149–154, RF-177–178, RN-066, RN-088–091.

1. Seleciona contexto autorizado e inicia registro.
2. Informa descrição, valor e data de vencimento; vencimento pode ser retroativo.
3. Plataforma identifica o autor do lançamento e mantém data de lançamento separada do vencimento.
4. Pode associar categoria e informar forma de pagamento; forma é opcional, obrigatoriedade da categoria não definida.
5. Registro passa a ser consultável segundo contexto e permissões.

Não há suporte a anexos. Situação inicial e limites monetários devem ser explicitados antes da implementação; não são impostos por este fluxo.

## FL-K02 — Confirmar quitação e editar registro pago

**Ator:** usuário com permissão aplicável. **Base:** RN-074, RN-084–087.

1. Confirma pagamento apenas quando quitado o valor integral.
2. Situação passa a PAGO; não registra saldo parcial.
3. Valor, lançamento, vencimento e forma de pagamento ficam bloqueados.
4. Descrição e categoria continuam editáveis conforme autorização; dados estruturais do parcelamento permanecem imutáveis.

Dados adicionais da confirmação, estados de origem e identificação de quem efetivamente pagou precisam de refinamento.

## FL-K03 — Reverter pagamento

**Ator:** administrador do núcleo, dentro do escopo autorizado. **Base:** RN-077–081, RN-100.

1. Seleciona registro pago para reversão; extensão explícita de avulsas/recorrentes e contexto pessoal depende de Q-K01/Q-K09.
2. Informa justificativa obrigatória.
3. Sistema registra responsável, momento, registro afetado, estados anterior/novo e motivo.
4. Situação fica REVERTIDO e campos antes protegidos voltam a ser editáveis conforme permissão.
5. Pagamento e auditoria anteriores permanecem preservados.

Não realiza estorno bancário nem troca automaticamente o estado para PENDENTE.

## FL-K04 — Criar e administrar recorrência

**Base:** RF-155–162, RF-190 e RN-101–102, RN-114.

1. Configura despesa recorrente semanal, mensal ou anual, sem quantidade fixa ou data final.
2. Sistema calcula vencimentos com ajuste de dia inexistente para último dia do mês, preservando âncora original.
3. Gera lançamentos individuais com valor e situação próprios; momento/horizonte de geração ainda pendentes.
4. Pode editar ocorrência sem alterar demais; pode editar configuração para próximas ocorrências sem reescrever histórico.
5. Ao encerrar explicitamente, não gera próximos lançamentos; os existentes continuam preservados.

## FL-K05 — Criar e ajustar parcelamento

**Base:** RF-169–176, RN-068–076, RN-083, RN-103–105.

1. Informa valor da parcela, quantidade total e primeiro vencimento.
2. Gera parcelas vinculadas ao original, com vencimentos mensais e ajuste de fim de mês.
3. Cada parcela mantém valor, vencimento e situação próprios; edição respeita proteção de pagos.
4. Número e quantidade total permanecem imutáveis.
5. Total deriva dos valores finais das parcelas; alteração individual não redistribui nem altera demais valores.

## FL-K06 — Excluir despesa individual ou cadeia

**Base:** RF-161, RF-175–176, RF-191, RN-070–075, RN-092–096, RN-106–107.

1. Usuário autorizado solicita exclusão; se vinculada, escolhe somente a ocorrência atual ou cadeia em aberto.
2. Sistema exige confirmação explícita e motivo.
3. Individualmente, despesa paga pode ser excluída logicamente; na cadeia, registros pagos são preservados.
4. Sistema registra ator, momento, registro e motivo; mantém dados e histórico.
5. Excluir parcela não muda números, quantidade total ou valores restantes.

Exclusão lógica não equivale a CANCELADO. Exclusão em cadeia não foi definida como encerramento automático de recorrência.

## FL-K07 — Restaurar registro e relacionados

**Ator:** administrador do núcleo, conforme escopo. **Base:** RF-179, RF-192, RN-097–098, RN-108.

1. Consulta registro excluído dentro da política aplicável.
2. Para original vinculado, escolhe restaurar só o original ou também registros relacionados.
3. Verifica estado de cada registro e permissão administrativa.
4. Restaura os registros elegíveis e audita responsável, momento e despesa afetada.

Não amplia acesso nem apaga histórico financeiro. Condições de elegibilidade, retenção e comportamento no espaço pessoal estão pendentes.

## FL-K08 — Consultar e acompanhar despesas

**Base:** RF-180–189, RF-193, RN-099, RN-109–112.

1. Seleciona contexto autorizado e aplica filtros disponíveis.
2. Consulta despesas vencidas e próximas, com antecedência padrão de sete dias configurável.
3. Consulta indicadores do mês corrente sem dupla contagem de compra e parcelas.
4. Pode apresentar dados no Okape, com verificação das permissões de cada fonte.

Matriz exata de cálculo, data-base e fronteiras temporais precisa ser fechada antes de homologar totais.

## FL-K09 — Classificar despesas

**Base:** RF-163–168, RN-065–066.

1. Utiliza categoria predefinida ou personalizada disponível no contexto.
2. Administrador do núcleo pode criar categorias próprias; não ficam disponíveis automaticamente em outro núcleo.
3. Informa forma opcional entre Dinheiro, Pix, Crédito, Débito, Boleto, Transferência ou outra forma permitida.

Não se presume criação livre de categorias por qualquer usuário, nem cadastro administrado de formas de pagamento sem definição.
