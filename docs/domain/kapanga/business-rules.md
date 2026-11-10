# Kapanga — Regras de negócio

**Escopo de identificação:** `kapanga`. 52 entradas vigentes, com IDs originais preservados. Redações resumem o comportamento aprovado e explicitam lacunas; versões substituídas estão no [registro de rastreabilidade](traceability.md).

| ID | Definição vigente | Comportamento / limite |
| --- | --- | --- |
| RN-063 | Independência das ocorrências recorrentes | Cada ocorrência possui valor e situação próprios. |
| RN-064 | Preservação de lançamentos anteriores | Excluir ou encerrar configuração não elimina lançamentos gerados. |
| RN-065 | Isolamento de categorias personalizadas | Categorias de um núcleo não se disponibilizam automaticamente em outros. |
| RN-066 | Forma de pagamento opcional | Preenchimento da forma de pagamento é opcional. |
| RN-067 | Ausência de anexos no MVP | Não anexar comprovantes ou documentos às despesas. |
| RN-068 | Independência das parcelas | Cada parcela possui valor, vencimento e situação próprios. |
| RN-069 | Ajuste individual de valores | Alterar valor de parcela não modifica automaticamente as demais. |
| RN-070 | Preservação de parcelas pagas | Exclusão/cancelamento do parcelamento não exclui parcelas pagas. |
| RN-071 | Exclusão de parcelas não pagas | Podem ser excluídas individualmente ou em conjunto, inclusive vencidas. |
| RN-072 | Preservação histórica do parcelamento | Excluir não pagas não elimina original nem histórico das pagas. |
| RN-073 | Exclusão lógica global | Exclusão padrão é lógica, sem remoção física pela operação; divergência de expurgo com plataforma registrada em Q-K03. |
| RN-074 | Imutabilidade após pagamento — atualizada | Enquanto PAGO, bloquear data de lançamento, vencimento, valor e forma de pagamento. |
| RN-075 | Preservação dos valores restantes | Excluir parcela não redistribui seu valor entre restantes. |
| RN-076 | Integridade histórica | Parcelas pagas permanecem preservadas ao encerrar original ou excluir não pagas. |
| RN-077 | Reversão administrativa de pagamento | Administrador do núcleo pode reverter pagamento de parcela; extensão explícita às demais origens é Q-K09. |
| RN-078 | Justificativa obrigatória para reversão | Toda reversão exige motivo. |
| RN-079 | Auditoria de reversão | Registrar responsável, data/hora, parcela afetada, estado anterior, novo estado e motivo. |
| RN-080 | Preservação histórica da reversão | Reversão não apaga evento de pagamento original nem auditoria. |
| RN-081 | Permissão para reversão no MVP | Qualquer administrador do núcleo, no escopo autorizado, pode reverter parcela com justificativa; não implica acesso pessoal irrestrito. |
| RN-082 | Evolução de permissões | Permissões financeiras granulares ficam fora do MVP. |
| RN-083 | Imutabilidade estrutural do parcelamento | Número sequencial e quantidade total são imutáveis desde criação. |
| RN-084 | Edição dos demais campos | Descrição, categoria e demais campos não protegidos podem ser editados após pagamento, conforme autorização. |
| RN-085 | Aplicação geral das regras de edição | Imutabilidade e edição aplicam-se a avulsas, recorrentes e parceladas. |
| RN-086 | Pagamento integral | Marcar paga somente quando valor total estiver quitado. |
| RN-087 | Ausência de pagamento parcial | Não registrar quitação parcial ou saldo parcialmente pago. |
| RN-088 | Independência das datas | Lançamento e vencimento possuem finalidades distintas e são armazenados separadamente. |
| RN-089 | Campos obrigatórios | Descrição, valor e vencimento são obrigatórios. |
| RN-090 | Data de lançamento | Registrar lançamento separadamente de vencimento. |
| RN-091 | Vencimento retroativo | Permitir vencimento anterior à data atual. |
| RN-092 | Exclusão de despesas | Permitir exclusão lógica individual, inclusive de paga; não remove proteção de pagas no lote. |
| RN-093 | Confirmação obrigatória | Exigir confirmação explícita antes da exclusão. |
| RN-094 | Justificativa obrigatória | Registrar motivo da exclusão. |
| RN-095 | Auditoria de exclusão | Registrar responsável, data/hora, despesa e justificativa. |
| RN-096 | Preservação histórica | Manter dados e histórico de despesa excluída sem remoção física; conciliar retenção com plataforma em Q-K03. |
| RN-097 | Permissão de restauração | Somente administradores do núcleo restauram despesas; espaço pessoal pendente. |
| RN-098 | Auditoria de restauração | Registrar responsável, data/hora e despesa restaurada. |
| RN-099 | Isolamento contextual | Indicadores respeitam contexto ativo, sem misturar pessoal, núcleo e residência. |
| RN-100 | Reversão e edição | Após reversão administrativa, campos protegidos voltam a ser editáveis; evento anterior permanece auditado. |
| RN-101 | Geração contínua — atualizada | Calcular próximos vencimentos segundo periodicidade; sem quantidade fixa ou data final na criação. |
| RN-102 | Ajuste de fim de mês — atualizado | Quando dia não existir, usar último dia do mês, preservando dia originalmente previsto para meses seguintes. |
| RN-103 | Cálculo dos vencimentos das parcelas | Parcelas seguintes vencem no mesmo dia dos meses subsequentes ao primeiro vencimento. |
| RN-104 | Ajuste de vencimentos | Se dia de parcela não existir no mês, usar último dia. |
| RN-105 | Valor total do parcelamento | Derivar da soma dos valores finais de todas as parcelas, considerando ajustes; excluídos/cancelados em Q-K08. |
| RN-106 | Preservação de registros pagos | Exclusão em cadeia não exclui ocorrências ou parcelas já pagas. |
| RN-107 | Exclusão da cadeia | Atingir registros ainda não pagos e preservar histórico dos anteriores. |
| RN-108 | Restauração seletiva | Respeitar estado individual dos registros e permissões do administrador. |
| RN-109 | Período de referência | Indicadores financeiros usam sempre mês corrente. |
| RN-110 | Despesas parceladas nos indicadores | Contabilizar parcelas individualmente, sem somar novamente total da compra. |
| RN-111 | Contexto dos indicadores | Manter isolamento entre pessoal, núcleo e residência. |
| RN-112 | Configuração da janela | Permitir configuração do período de antecedência. |
| RN-113 | Situações de pagamento — atualizada | PENDENTE, PAGO, REVERTIDO e CANCELADO; CANCELADO substitui EXCLUIDO e exclusão lógica permanece separada. |
| RN-114 | Distinção entre recorrência e parcelamento | Recorrência sem quantidade fixa; compromissos finitos devem ser parcelamentos. |

Detalhamento em [estados](states-and-payments.md), [recorrência e parcelamento](recurrence-and-installments.md), [consultas e indicadores](indicators-and-queries.md), [fluxos](user-flows.md) e [permissões](permissions.md).
