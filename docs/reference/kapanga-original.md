# Kafofo — Especificação Funcional
## Kapanga - Módulo de Despesas Domésticas

**Status:** Levantamento funcional consolidado  
**Escopo:** MVP

---

## 1. Objetivo

Disponibilizar um módulo nativo para registrar, consultar e acompanhar despesas domésticas nos contextos pessoal, núcleo e residência.

O módulo deverá atender às necessidades básicas de organização financeira doméstica, sem pretender substituir ferramentas especializadas de gestão financeira, como o Potira.

O MVP não contemplará planejamento financeiro avançado, conciliação bancária, integração bancária obrigatória, rateios automáticos ou controle de pagamentos parciais.

## 2. Requisitos funcionais

### 2.1. Cadastro e gerenciamento de despesas

**RF-149 — Cadastro de despesas**  
Permitir cadastrar despesas nos contextos suportados pelo Kafofo, respeitando as permissões do usuário.

**RF-150 — Valor da despesa**  
Permitir informar o valor da despesa.

**RF-151 — Descrição da despesa**  
Permitir informar uma descrição para identificar a despesa.

**RF-152 — Data de lançamento**  
Registrar a data de lançamento da despesa.

**RF-153 — Responsável pelo lançamento**  
Identificar automaticamente o usuário responsável pelo registro da despesa.

**RF-154 — Situação de pagamento**  
Permitir acompanhar a situação de pagamento da despesa.

**RF-177 — Data de lançamento e vencimento**  
Manter separadamente a data de lançamento e a data de vencimento.

**RF-178 — Data de vencimento**  
Permitir informar a data em que a despesa deverá ser paga.

### 2.2. Categorias

**RF-163 — Categorias predefinidas**  
Disponibilizar categorias predefinidas para classificação das despesas.

**RF-164 — Categorias personalizadas**  
Permitir que administradores do núcleo criem categorias personalizadas.

**RF-165 — Associação de categorias**  
Permitir associar uma categoria a cada despesa.

### 2.3. Formas de pagamento

**RF-166 — Forma de pagamento**  
Permitir informar a forma de pagamento utilizada em uma despesa.

**RF-167 — Formas predefinidas**  
Disponibilizar as seguintes formas de pagamento:
- Dinheiro;
- Pix;
- Crédito;
- Débito;
- Boleto;
- Transferência.

**RF-168 — Outras formas de pagamento**  
Permitir utilizar outras formas de pagamento quando as opções predefinidas não forem suficientes.

### 2.4. Despesas recorrentes

**RF-155 — Configuração de recorrência**  
Permitir configurar uma despesa para gerar lançamentos recorrentes.

**RF-156 — Geração de ocorrências**  
Gerar lançamentos individuais a partir da configuração de recorrência.

**RF-157 — Periodicidade**  
Disponibilizar recorrência semanal, mensal e anual.

**RF-158 — Encerramento de recorrência**  
Permitir encerrar uma configuração de recorrência.

**RF-159 — Edição individual**  
Permitir editar uma ocorrência sem modificar as demais.

**RF-160 — Edição da recorrência**  
Permitir editar a configuração da recorrência, aplicando as alterações às próximas ocorrências sem modificar o histórico.

**RF-161 — Exclusão individual de ocorrência**  
Permitir excluir individualmente uma ocorrência de uma despesa recorrente.

**RF-162 — Exclusão da configuração recorrente**  
Permitir excluir ou encerrar uma configuração de recorrência sem eliminar os lançamentos já gerados.

### 2.5. Despesas parceladas

**RF-169 — Cadastro de despesas parceladas**  
Permitir cadastrar despesas que serão divididas em uma quantidade finita de parcelas.

**RF-170 — Configuração do parcelamento**  
Permitir informar:
- Valor da parcela;
- Quantidade total de parcelas;
- Data do primeiro vencimento.

**RF-171 — Geração de parcelas**  
Gerar parcelas como lançamentos individuais vinculados à despesa original.

**RF-172 — Ajuste individual de parcelas**  
Permitir alterar individualmente o valor de uma parcela, sem modificar automaticamente as demais.

**RF-173 — Acompanhamento de pagamento**  
Permitir acompanhar individualmente a situação de pagamento de cada parcela.

**RF-174 — Histórico do parcelamento**  
Manter a relação entre a despesa original e suas parcelas, preservando o histórico do parcelamento.

**RF-175 — Exclusão individual de parcelas**  
Permitir excluir logicamente parcelas ainda não pagas.

**RF-176 — Exclusão de parcelas em conjunto**  
Permitir excluir logicamente, em conjunto, todas as parcelas ainda não pagas de um parcelamento.

### 2.6. Exclusão e restauração

**RF-179 — Restauração de despesas**  
Permitir que administradores do núcleo restaurem despesas excluídas logicamente.

### 2.7. Consulta e filtros

**RF-180 — Filtros de despesas**  
Permitir filtrar despesas por:
- Período de lançamento;
- Período de vencimento;
- Situação de pagamento;
- Categoria;
- Forma de pagamento;
- Responsável pelo lançamento;
- Residência, quando aplicável.

**RF-181 — Identificação de despesas vencidas**  
Identificar despesas não pagas cuja data de vencimento já tenha passado.

**RF-182 — Identificação de próximos vencimentos**  
Identificar despesas com vencimento próximo.

**RF-183 — Indicadores de despesas**  
Apresentar indicadores de vencimentos e situações de pagamento no contexto correspondente.

### 2.8. Dashboard financeiro

**RF-184 — Resumo financeiro**  
Apresentar um resumo financeiro no dashboard do contexto ativo.

**RF-185 — Total de despesas**  
Exibir o total de despesas cadastradas no período selecionado.

**RF-186 — Total pago**  
Exibir o total de despesas pagas no período.

**RF-187 — Total pendente**  
Exibir o total de despesas ainda não pagas.

**RF-188 — Total vencido**  
Exibir o total de despesas não pagas e vencidas.

**RF-189 — Próximos vencimentos**  
Apresentar despesas com vencimento próximo.

---

## 3. Regras de negócio

### 3.1. Cadastro e dados obrigatórios

**RN-063 — Independência das ocorrências recorrentes**  
Cada ocorrência de uma despesa recorrente possui valor e situação de pagamento próprios.

**RN-064 — Preservação de lançamentos anteriores**  
Excluir ou encerrar uma configuração de recorrência não elimina os lançamentos anteriormente gerados.

**RN-065 — Isolamento de categorias personalizadas**  
Categorias personalizadas de um núcleo não ficam automaticamente disponíveis em outros núcleos.

**RN-066 — Forma de pagamento opcional**  
O preenchimento da forma de pagamento é opcional.

**RN-067 — Ausência de anexos no MVP**  
Não será permitido anexar comprovantes ou documentos às despesas no MVP.

**RN-088 — Independência das datas**  
Data de lançamento e data de vencimento possuem finalidades distintas e devem ser armazenadas separadamente.

**RN-089 — Campos obrigatórios**  
Toda despesa deve possuir descrição, valor e data de vencimento.

**RN-090 — Data de lançamento**  
A data de lançamento deve ser registrada separadamente da data de vencimento.

**RN-091 — Vencimento retroativo**  
Permitir cadastrar despesas com data de vencimento anterior à data atual.

### 3.2. Parcelamento

**RN-068 — Independência das parcelas**  
Cada parcela possui valor, vencimento e situação de pagamento próprios.

**RN-069 — Ajuste individual de valores**  
Alterar o valor de uma parcela não modifica automaticamente os valores das demais.

**RN-070 — Preservação de parcelas pagas**  
Parcelas pagas não podem ser excluídas pela operação de cancelamento ou exclusão do parcelamento.

**RN-071 — Exclusão de parcelas não pagas**  
Parcelas não pagas podem ser excluídas individualmente ou em conjunto, independentemente de já terem vencido.

**RN-072 — Preservação histórica do parcelamento**  
A exclusão de parcelas não pagas não elimina a despesa original nem o histórico das parcelas pagas.

**RN-083 — Imutabilidade estrutural do parcelamento**  
O número identificador da parcela na sequência e a quantidade total de parcelas são imutáveis desde a criação do parcelamento.

**RN-075 — Preservação dos valores restantes**  
A exclusão de uma parcela não redistribui seu valor entre as parcelas restantes.

### 3.3. Exclusão lógica

**RN-073 — Exclusão lógica global**  
Todos os módulos do Kafofo devem utilizar exclusão lógica como padrão. Registros excluídos não devem ser removidos fisicamente do banco de dados.

**RN-092 — Exclusão de despesas**  
Permitir exclusão lógica de despesas, inclusive quando já estiverem pagas.

**RN-093 — Confirmação obrigatória**  
Exigir confirmação explícita antes da exclusão de uma despesa.

**RN-094 — Justificativa obrigatória**  
Exigir o registro do motivo da exclusão.

**RN-095 — Auditoria de exclusão**  
Registrar responsável pela operação, data e hora, despesa afetada e justificativa.

**RN-096 — Preservação histórica**  
Manter os dados e o histórico da despesa excluída, sem remoção física.

**RN-097 — Permissão de restauração**  
Somente administradores do núcleo poderão restaurar despesas excluídas.

**RN-098 — Auditoria de restauração**  
Registrar responsável, data e hora da restauração e despesa afetada.

### 3.4. Pagamento e imutabilidade

**RN-086 — Pagamento integral**  
Uma despesa só poderá ser marcada como paga quando seu valor total tiver sido quitado.

**RN-087 — Ausência de pagamento parcial**  
Não haverá registro de pagamentos parciais ou controle de saldo parcialmente quitado no MVP.

**RN-074 — Imutabilidade condicionada ao pagamento**  
Quando uma despesa ou parcela estiver paga, seus campos de data, valor e forma de pagamento não poderão ser alterados diretamente.

**RN-084 — Edição dos demais campos**  
Descrição, categoria e demais campos não protegidos poderão ser alterados mesmo após o pagamento.

**RN-077 — Reversão administrativa de pagamento**  
Permitir que administradores do núcleo revertam o status de uma parcela paga.

**RN-078 — Justificativa obrigatória para reversão**  
Toda reversão de pagamento exige o registro de um motivo.

**RN-079 — Auditoria de reversão**  
Registrar responsável pela reversão, data e hora, parcela afetada, status anterior, novo status e justificativa.

**RN-080 — Preservação histórica da reversão**  
A reversão não apaga o evento original de pagamento nem seu registro de auditoria.

**RN-081 — Permissão para reversão no MVP**  
Qualquer administrador do núcleo poderá reverter o status de pagamento de uma parcela, mediante justificativa obrigatória.

**RN-082 — Evolução de permissões**  
Permissões financeiras granulares ficam fora do MVP e poderão ser introduzidas em versões posteriores.

**RN-085 — Aplicação geral das regras de edição**  
As regras de imutabilidade e edição aplicam-se a despesas avulsas, recorrentes e parceladas.

**RN-076 — Integridade histórica**  
Parcelas pagas permanecem preservadas, mesmo quando o parcelamento original for encerrado ou tiver parcelas não pagas excluídas.

**RN-099 — Isolamento contextual**  
Os indicadores financeiros devem respeitar o contexto ativo, sem misturar dados pessoais, do núcleo ou de residências.

---

## 4. Escopo explicitamente fora do MVP

Os seguintes recursos não fazem parte da primeira versão:

- Pagamento parcial;
- Controle de saldo parcialmente quitado;
- Rateio automático de despesas entre membros;
- Conciliação bancária;
- Integração bancária obrigatória;
- Planejamento financeiro avançado;
- Anexos e comprovantes;
- Permissões financeiras granulares;
- Redistribuição automática de valores após exclusão de parcelas.

---

## 5. Pendências para detalhamento funcional

Os seguintes pontos ainda precisam de definição antes de considerar a especificação completamente fechada:

1. **Data protegida após pagamento:** definir se a imutabilidade abrange tanto a data de lançamento quanto a data de vencimento, ou somente a data de vencimento.
2. **Geração de recorrências:** definir quando as ocorrências serão geradas, o horizonte de geração e o tratamento de vencimentos em dias inexistentes, como o dia 31.
3. **Geração de parcelas:** definir como serão calculados os vencimentos posteriores ao primeiro, especialmente em meses com quantidades diferentes de dias.
4. **Valor original do parcelamento:** definir se o valor total informado na compra será armazenado separadamente ou será derivado da soma das parcelas.
5. **Exclusão de despesas vinculadas:** definir o comportamento da exclusão de uma despesa original que possua ocorrências recorrentes ou parcelas associadas.
6. **Restauração:** definir se restaurar uma despesa original também restaura automaticamente seus registros relacionados.
7. **Indicadores financeiros:** definir os critérios de período, agrupamento e cálculo dos totais, especialmente para despesas recorrentes e parceladas.
8. **Próximos vencimentos:** definir a janela de antecedência utilizada para classificar despesas como próximas do vencimento.
9. **Situações de pagamento:** formalizar os estados permitidos e as transições entre eles, incluindo pagamento, reversão e exclusão.

---

## 6. Diretrizes gerais aplicáveis

- Respeitar os espaços e contextos definidos pelo Kafofo.
- Respeitar as permissões do núcleo e da residência.
- Preservar a separação entre identidade do responsável pelo lançamento e responsabilidade pelo pagamento.
- Aplicar exclusão lógica como padrão.
- Preservar histórico e rastreabilidade das operações relevantes.
- Registrar operações administrativas e financeiras relevantes para auditoria.
- Não expor informações de despesas fora do contexto autorizado.
- Não permitir que a falha de um módulo ou integração externa comprometa o funcionamento das funcionalidades nativas do Kafofo.

## 7. Requisitos e regras adicionais

Datas e imutabilidade
- RN-074 — Imutabilidade após pagamento (atualizada): quando uma despesa ou parcela estiver paga, tanto a data de lançamento quanto a data de vencimento, o valor e a forma de pagamento ficam bloqueados.
- RN-100 — Reversão e edição: após a reversão administrativa do pagamento, os campos protegidos voltam a ser editáveis. A operação anterior permanece registrada na auditoria.
Despesas recorrentes
- RF-190 — Limite de recorrência: permitir configurar uma recorrência com quantidade determinada de ocorrências ou sem término definido.
- RN-101 — Cálculo dos vencimentos recorrentes: calcular automaticamente os vencimentos seguintes, respeitando a periodicidade configurada.
- RN-102 — Último dia do mês: quando o dia originalmente previsto não existir em determinado mês, utilizar o último dia daquele mês.
Exemplo: uma recorrência com vencimento no dia 31 será gerada no dia 28 ou 29 em fevereiro e retornará ao dia 31 nos meses seguintes que o permitirem.
Despesas parceladas
- RN-103 — Cálculo dos vencimentos das parcelas: as parcelas seguintes terão vencimento no mesmo dia dos meses subsequentes ao primeiro vencimento.
- RN-104 — Ajuste de vencimentos: quando o dia previsto não existir em determinado mês, utilizar o último dia daquele mês.
- RN-105 — Valor total do parcelamento: o valor total da despesa parcelada será derivado da soma dos valores finais de todas as parcelas, considerando eventuais ajustes individuais.
Exclusão de despesas vinculadas
- RF-191 — Exclusão de despesas vinculadas: ao excluir uma despesa que pertença a uma recorrência ou parcelamento, apresentar a opção de excluir somente a ocorrência atual ou toda a cadeia em aberto.
- RN-106 — Preservação de registros pagos: a exclusão de uma cadeia não deve excluir parcelas ou ocorrências já pagas.
- RN-107 — Exclusão da cadeia: a exclusão em conjunto deve atingir os registros ainda não pagos, preservando o histórico dos registros anteriores.
Restauração
- RF-192 — Restauração de cadeia: ao restaurar uma despesa original, oferecer a opção de restaurar somente o registro original ou também os registros relacionados da cadeia.
- RN-108 — Restauração seletiva: a restauração de uma cadeia deve respeitar o estado individual dos registros e as permissões do administrador.
Indicadores financeiros
- RN-109 — Período de referência: os indicadores financeiros utilizarão sempre o mês corrente como período de referência.
- RN-110 — Despesas parceladas nos indicadores: contabilizar os valores das parcelas individualmente, evitando somar novamente o valor total da compra.
- RN-111 — Contexto dos indicadores: manter o isolamento entre pessoal, núcleo e residência.
Próximos vencimentos
- RF-193 — Janela de próximos vencimentos: apresentar despesas com vencimento nos próximos sete dias, além das despesas vencidas.
- RN-112 — Configuração da janela: permitir que o período de antecedência seja configurado.
Situações de pagamento
- RN-113 — Situações de pagamento: utilizar os estados:
- PENDENTE
- PAGO
- REVERTIDO
- EXCLUIDO

Situações de pagamento atualizadas

O estado EXCLUIDO será substituído por CANCELADO.
- PENDENTE: despesa aguardando pagamento.
- PAGO: despesa com pagamento confirmado.
- REVERTIDO: pagamento revertido administrativamente.
- CANCELADO: despesa cancelada, sem obrigação de pagamento.
RN-113 — Situações de pagamento: esses serão os quatro estados utilizados pelo módulo.

A exclusão lógica continuará sendo um mecanismo separado. Portanto, um registro cancelado não precisa estar excluído logicamente, e um registro excluído logicamente não perde seu histórico financeiro.
2. Recorrências atualizadas
- RF-190 — Recorrência sem término predefinido: toda recorrência será criada sem quantidade fixa de ocorrências ou data final.
- RN-101 — Geração contínua: o sistema calculará os próximos vencimentos conforme a periodicidade configurada.
- RN-102 — Ajuste de fim de mês: quando o dia previsto não existir em determinado mês, será utilizado o último dia daquele mês.
- RN-114 — Distinção entre recorrência e parcelamento: recorrências não possuem quantidade fixa de ocorrências. Compromissos com quantidade finita de pagamentos devem ser cadastrados como despesas parceladas.
Exemplo: uma despesa recorrente com vencimento no dia 31 seguirá a sequência 31/01, 28/02, 31/03, 30/04, 31/05.
3. Consequência para o encerramento
Como a recorrência não possui término automático, seu encerramento será uma ação explícita do usuário. Os lançamentos já gerados serão preservados, e os próximos deixarão de ser criados.

Esse comportamento já está contemplado no RF-158, mas agora fica mais bem definido.

Uma observação de modelagem: CANCELADO representa uma situação de negócio, enquanto exclusão lógica representa a remoção da visualização operacional. Manter os dois conceitos separados evita confusão na auditoria e nos indicadores.