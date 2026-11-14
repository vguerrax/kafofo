# Kapanga — Estados e pagamentos

## Situação financeira vigente

| Estado | Significado definido |
| --- | --- |
| PENDENTE | Despesa aguardando pagamento |
| PAGO | Despesa com pagamento integral confirmado |
| REVERTIDO | Pagamento revertido administrativamente |
| CANCELADO | Despesa cancelada, sem obrigação de pagamento |

RN-113 atualizada substitui EXCLUIDO por CANCELADO. EXCLUIDO não é situação financeira vigente. Pagamento parcial e saldo parcialmente quitado ficam fora do MVP.

## Transições e operações

| Operação | Comportamento conhecido | Limite da definição |
| --- | --- | --- |
| Confirmar pagamento | Somente após quitação total; resultado PAGO | Estado inicial permitido, data efetiva e dados exigidos da confirmação não estão detalhados |
| Reverter pagamento | Pagamento confirmado passa a REVERTIDO; administrador registra motivo e auditoria | Fontes iniciais referem-se a parcelas; aplicação a avulsas/recorrentes deve ser explicitada na matriz |
| Editar após reversão | Campos antes protegidos ficam editáveis, conforme permissão | Não altera automaticamente REVERTIDO para PENDENTE |
| Cancelar obrigação | Estado CANCELADO significa ausência de obrigação | Estados de origem, ator, justificativa e possibilidade de reabertura não definidos |
| Pagar novamente um registro REVERTIDO | Não especificado integralmente | Não tratar a nova transição como aprovada sem completar o fluxo |
| Excluir logicamente | Registro sai da visualização operacional e conserva histórico financeiro | Não muda automaticamente para CANCELADO ou REVERTIDO |
| Restaurar | Recupera registro conforme seleção e autorização | Não significa novo pagamento nem reversão do pagamento anterior |

As situações foram definidas; a máquina completa de transições ainda não. Não foram acrescentadas setas para caminhos não especificados.

## Campos protegidos

| Campo | Enquanto PAGO | Após reversão administrativa |
| --- | --- | --- |
| Valor | Bloqueado | Volta a ser editável conforme permissão |
| Data de lançamento | Bloqueada | Volta a ser editável conforme permissão |
| Data de vencimento | Bloqueada | Volta a ser editável conforme permissão |
| Forma de pagamento | Bloqueada, inclusive mudança entre vazio e preenchido | Volta a ser editável conforme permissão |
| Descrição e categoria | Editáveis conforme autorização | Continuam editáveis conforme autorização |
| Número da parcela / quantidade total | Imutáveis desde criação | Permanecem imutáveis |

A proteção das duas datas é a redação final de RN-074. O termo inicial genérico “campos de data” não autoriza criar um campo de data de pagamento nem estender automaticamente sua proteção.

## Reversão e auditoria

Exige motivo. Registra responsável, data/hora, lançamento/parcela afetado, situação anterior, nova situação e justificativa. Preserva o pagamento original e a auditoria anterior. Não representa estorno bancário, reembolso ou exclusão.

**Orientação derivada:** mudança de situação e registro do evento devem ser consistentes; concorrência entre editar, pagar e reverter precisa ser tratada na implementação. A interface desabilitada não substitui validação de imutabilidade no backend.

## Exclusão individual e exclusão em cadeia

RN-092 permite excluir logicamente uma despesa individual mesmo paga. RN-070 e RN-106 impedem que uma exclusão em cadeia remova registros pagos. Essas regras têm escopos diferentes e podem coexistir; não converter proteção do lote em proibição geral de exclusão individual de pagos.

Toda exclusão exige confirmação e motivo; registra ator, momento, registro e justificativa. Exclusão não remove fisicamente dados ou histórico pela operação do usuário.

Restauração é administrativa e auditada; pode atingir somente o original ou também relacionados, respeitando estado de cada registro e permissões. Não foi aprovado restaurar todos indiscriminadamente nem recalcular pagamentos durante restauração.

A preservação “sem remoção física” da fonte precisa ser conciliada com a política de expurgo após retenção da plataforma; ver Q-K03. Este documento não resolve essa divergência alterando os requisitos.
