# Kapanga — Pendências e conflitos restantes

A fonte encerra várias pendências antigas nas atualizações finais. Esta lista mantém somente lacunas ou conflitos ainda sem resolução suficiente. Prioridades são recomendações de refinamento.

| ID | Questão | Evidência e consequência |
| --- | --- | --- |
| Q-K01 | Reversão/restauração no contexto pessoal | Operações reservadas ao administrador do núcleo, mas despesas pessoais são privadas. Definir ator sem conceder acesso automático a administrador |
| Q-K02 | Matriz completa de transições | Quatro estados aprovados, mas origens de pagamento, cancelamento, reabertura e pagamento após reversão não foram formalizadas; situação inicial não explicitada |
| Q-K03 | Preservação, auditoria e expurgo | RN-073/096 preservam sem remoção física; plataforma/ADR-0010 prevê prazo e eliminação e adia auditoria específica. Conciliar políticas sem apagar históricos exigidos |
| Q-K04 | Momento/horizonte de geração | Recorrência contínua e cálculo de datas definidos; quando gerar, quantos registros futuros, recuperação após indisponibilidade e limites não definidos |
| Q-K05 | Exclusão de cadeia versus encerramento | Cadeia em aberto exclui não pagos; encerramento interrompe geração. Definir se a exclusão da cadeia também encerra a configuração e como tratar registros CANCELADO/REVERTIDO |
| Q-K06 | Concorrência e módulos desativados | Definir corrida entre gerar/encerrar/editar/pagar, deduplicação e geração durante desativação; arquitetura de processamento não resolve essas políticas sozinha |
| Q-K07 | Cálculos dos indicadores | Mês corrente definido, mas data-base, inclusão de cada estado/excluídos, data efetiva de pagamento e limites de janela não definidos; esclarecer vencidos de meses anteriores e mudança de mês |
| Q-K08 | Total do parcelamento e exclusões | Soma dos valores finais definida; esclarecer total histórico versus operacional ao excluir/cancelar/restaurar parcela, sem redistribuição automática |
| Q-K09 | Reversão além de parcelas | RN-077/081 citam parcelas; regras gerais abrangem avulsas/recorrentes e RN-100 desbloqueia após reversão. Explicitar alcance sem ampliar silenciosamente a permissão |
| Q-K10 | Valores e datas | Definir moeda, escala, arredondamento, limites/negativos, data de lançamento automática/editável e eventual data de pagamento; não impor formato bancário por inferência |
| Q-K11 | Categorias e outras formas | Criador de categoria é administrador do núcleo; definir uso pessoal/residencial, obrigatoriedade, alteração/exclusão e representação de outras formas de pagamento |
| Q-K12 | Configuração da antecedência | Sete dias padrão e configurabilidade definidos; ator, escopo, limites e precedência de configurações não especificados |
| Q-K13 | Restauração seletiva | Opção original/relacionados definida; elegibilidade por estado, origens excluídas separadamente, restauração parcial e reativação da geração não definidas |
| Q-K14 | Configuração e ocorrências futuras existentes | Edição afeta próximas ocorrências e preserva histórico; definir se modifica futuras já materializadas, inclusive alteradas individualmente |
| Q-K15 | Permissões comuns e residência | Cadastro/edição/pagamento/exclusão dependem de autorização, mas mapa exaustivo por papel fixo não existe; responsável de residência não ganha reversão automaticamente |
| Q-K16 | Exportação e fontes de dados | Escopo pessoal da plataforma e resumo no dashboard definidos; estrutura exportada, históricos/excluídos, contratos do Okape e intervalo de atualização ainda a especificar |
| Q-K17 | Vencimentos anuais especiais | Regra de último dia definida; explicitar comportamento anual para 29/02, preservando âncora ao voltar a ano bissexto |

## Pendências antigas já resolvidas

| Tema antigo | Decisão vigente |
| --- | --- |
| Qual data fica bloqueada após pagamento? | Lançamento e vencimento, além de valor e forma de pagamento — RN-074 atualizada |
| Dia inexistente em mês | Último dia, preservando referência original — RN-102/104 |
| Parcelas posteriores | Mesmo dia dos meses subsequentes — RN-103 |
| Valor total do parcelamento | Derivado da soma final das parcelas — RN-105; efeito de excluídos ainda em Q-K08 |
| Escolha na exclusão de vinculados | Ocorrência atual ou cadeia em aberto; lote preserva pagos — RF-191, RN-106/107 |
| Escolha na restauração | Original ou também relacionados — RF-192, RN-108; elegibilidade ainda em Q-K13 |
| Período dos indicadores | Mês corrente — RN-109; data-base ainda em Q-K07 |
| Janela futura | Sete dias por padrão, configurável — RF-193, RN-112 |
| Nomes dos estados | PENDENTE, PAGO, REVERTIDO e CANCELADO — RN-113 final; transições completas ainda em Q-K02 |
| Duração da recorrência | Sempre sem término predefinido; encerramento explícito — RF-190 final e RN-114 |

## Riscos e sequência sugerida

Primeiro fechar autorização pessoal (Q-K01/09/15), transições (Q-K02) e política de histórico/expurgo (Q-K03). Resolver geração e concorrência antes de habilitar recorrências (Q-K04–06/14). Fechar matriz dos agregados antes de homologar totais (Q-K07/08/12).

Os maiores riscos são vazamento de despesas pessoais, totais inconsistentes por dupla contagem ou exclusão, geração duplicada após reinício e reabertura indevida de geração na restauração. A documentação não exige uma nova reunião completa de levantamento para resolver detalhes locais já delimitados.
