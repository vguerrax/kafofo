# Kapanga — Requisitos funcionais

**Escopo de identificação:** `kapanga`. 45 entradas vigentes, com IDs originais preservados. Redações resumem o comportamento aprovado e explicitam lacunas; versões substituídas estão no [registro de rastreabilidade](traceability.md).

| ID | Definição vigente | Comportamento / limite |
| --- | --- | --- |
| RF-149 | Cadastro de despesas | Cadastrar despesas em contexto autorizado. |
| RF-150 | Valor da despesa | Informar o valor da despesa; campo obrigatório. |
| RF-151 | Descrição da despesa | Informar descrição obrigatória para identificação. |
| RF-152 | Data de lançamento | Registrar a data de lançamento separada do vencimento. |
| RF-153 | Responsável pelo lançamento | Identificar automaticamente o autor do registro. |
| RF-154 | Situação de pagamento | Acompanhar PENDENTE, PAGO, REVERTIDO e CANCELADO; exclusão lógica não é situação financeira. |
| RF-155 | Configuração de recorrência | Configurar geração de lançamentos recorrentes sem término predefinido. |
| RF-156 | Geração de ocorrências | Gerar lançamentos individuais vinculados à configuração recorrente. |
| RF-157 | Periodicidade | Disponibilizar recorrência semanal, mensal e anual. |
| RF-158 | Encerramento de recorrência | Encerrar explicitamente a geração futura, preservando lançamentos existentes. |
| RF-159 | Edição individual | Editar uma ocorrência sem alterar as demais, respeitando imutabilidade enquanto paga. |
| RF-160 | Edição da recorrência | Aplicar alterações às próximas ocorrências, preservando histórico; futuras já geradas exigem refinamento. |
| RF-161 | Exclusão individual de ocorrência | Permitir exclusão lógica individual de ocorrência conforme autorização e justificativa. |
| RF-162 | Exclusão da configuração recorrente | Excluir ou encerrar configuração sem eliminar lançamentos já gerados. |
| RF-163 | Categorias predefinidas | Disponibilizar categorias predefinidas; lista concreta não fornecida. |
| RF-164 | Categorias personalizadas | Permitir criação por administradores do núcleo. |
| RF-165 | Associação de categorias | Associar uma categoria à despesa; obrigatoriedade não especificada. |
| RF-166 | Forma de pagamento | Informar opcionalmente a forma de pagamento utilizada. |
| RF-167 | Formas predefinidas | Disponibilizar Dinheiro, Pix, Crédito, Débito, Boleto e Transferência. |
| RF-168 | Outras formas de pagamento | Permitir outra forma quando predefinidas não bastarem; mecanismo não definido. |
| RF-169 | Cadastro de despesas parceladas | Registrar compromisso dividido em quantidade finita de parcelas. |
| RF-170 | Configuração do parcelamento | Informar valor da parcela, quantidade total e primeiro vencimento. |
| RF-171 | Geração de parcelas | Gerar lançamentos individuais vinculados à despesa original. |
| RF-172 | Ajuste individual de parcelas | Alterar valor individual sem modificar automaticamente demais parcelas, respeitando proteção de pagas. |
| RF-173 | Acompanhamento de pagamento | Acompanhar situação de pagamento de cada parcela. |
| RF-174 | Histórico do parcelamento | Preservar vínculo entre original e parcelas e histórico do parcelamento. |
| RF-175 | Exclusão individual de parcelas | Excluir logicamente parcelas ainda não pagas; RN-092 também permite exclusão individual de despesa paga. |
| RF-176 | Exclusão de parcelas em conjunto | Excluir em conjunto parcelas não pagas, preservando pagas. |
| RF-177 | Data de lançamento e vencimento | Manter os dois dados separadamente. |
| RF-178 | Data de vencimento | Informar vencimento obrigatório, inclusive retroativo. |
| RF-179 | Restauração de despesas | Permitir restauração por administradores do núcleo, conforme contexto e política aplicável. |
| RF-180 | Filtros de despesas | Filtrar por lançamento, vencimento, situação, categoria, forma, autor do lançamento e residência quando aplicável. |
| RF-181 | Identificação de despesas vencidas | Identificar não pagas com vencimento anterior à data atual; elegibilidade detalhada por estado pendente. |
| RF-182 | Identificação de próximos vencimentos | Identificar despesas com vencimento próximo. |
| RF-183 | Indicadores de despesas | Apresentar indicadores de vencimentos e situações no contexto correspondente. |
| RF-184 | Resumo financeiro | Oferecer resumo financeiro contextual para dashboard; Okape cuida da apresentação. |
| RF-185 | Total de despesas | Exibir total de despesas no mês corrente conforme RN-109, refinando a redação inicial de período selecionado. |
| RF-186 | Total pago | Exibir total pago no período vigente de referência: mês corrente. |
| RF-187 | Total pendente | Exibir total ainda não pago; tratamento de REVERTIDO deve ser formalizado. |
| RF-188 | Total vencido | Exibir total de não pagas vencidas, respeitando matriz de cálculo a detalhar. |
| RF-189 | Próximos vencimentos | Apresentar despesas próximas do vencimento no contexto autorizado. |
| RF-190 | Recorrência sem término predefinido | Toda recorrência é criada sem quantidade fixa de ocorrências ou data final; substitui a opção intermediária finita. |
| RF-191 | Exclusão de despesas vinculadas | Oferecer somente ocorrência atual ou cadeia em aberto; na cadeia, preservar já pagas. |
| RF-192 | Restauração de cadeia | Ao restaurar original, oferecer original ou também relacionados, respeitando estados e permissões. |
| RF-193 | Janela de próximos vencimentos | Apresentar próximos sete dias por padrão, além de vencidas; antecedência configurável. |

Detalhamento em [estados](states-and-payments.md), [recorrência e parcelamento](recurrence-and-installments.md), [consultas e indicadores](indicators-and-queries.md), [fluxos](user-flows.md) e [permissões](permissions.md).
