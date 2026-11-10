# Kapanga — Critérios de aceitação

**Status:** cenários derivados; não foram executados. Cenários com Q-K pendente descrevem cobertura parcial, sem aprovar a semântica ainda aberta.

| ID | Cenário e referências | Dado / quando | Resultado esperado |
| --- | --- | --- | --- |
| CA-K01 | **Cadastro obrigatório** — RF-149–153, RF-177–178; RN-088–091 | Usuário autorizado cadastra despesa com descrição, valor e vencimento | Manter lançamento e vencimento separados e identificar automaticamente autor; ausência dos campos obrigatórios impede conclusão. |
| CA-K02 | **Vencimento retroativo** — RN-091; RF-181 | Vencimento informado é anterior à data atual | Cadastro é permitido; identificação de vencido respeita situação e matriz temporal a detalhar. |
| CA-K03 | **Forma opcional e anexos** — RF-166–168; RN-066–067 | Usuário registra sem forma de pagamento e consulta opções disponíveis | Forma não é obrigatória; há Dinheiro, Pix, Crédito, Débito, Boleto, Transferência e possibilidade de outra; anexos indisponíveis. |
| CA-K04 | **Categorias isoladas** — RF-163–165; RN-065 | Administrador do núcleo cria categoria personalizada | Categoria não fica automaticamente disponível em outro núcleo; poder de criação respeita autorização. |
| CA-K05 | **Quitação integral** — RF-154, RF-173; RN-086–087 | Usuário tenta registrar quitação parcial | Não existe fluxo de saldo parcial no MVP; situação PAGO só representa quitação total. |
| CA-K06 | **Proteção de pagos** — RN-074, RN-085 | Despesa avulsa, ocorrência ou parcela está PAGO | Backend impede alterar valor, lançamento, vencimento e forma, inclusive payload que contorne a interface. |
| CA-K07 | **Edição não protegida** — RN-084 | Usuário autorizado altera descrição ou categoria de despesa paga | Edição é permitida sem desbloquear valor, datas ou forma de pagamento. |
| CA-K08 | **Reversão administrativa** — RN-077–081, RN-100 | Administrador autorizado reverte pagamento de parcela, informando motivo | Estado fica REVERTIDO, campos protegidos voltam a ser editáveis e pagamento original permanece no histórico. |
| CA-K09 | **Reversão indevida** — RN-078, RN-081 | Pessoa sem autorização tenta reverter ou administrador não informa motivo | Operação é impedida; forma de autorização no espaço pessoal depende de Q-K01. |
| CA-K10 | **Situações vigentes** — RN-113 | Contrato/interface apresenta situações de pagamento | Usar PENDENTE, PAGO, REVERTIDO e CANCELADO; EXCLUIDO não é situação vigente e cancelamento não equivale a exclusão lógica. |
| CA-K11 | **Recorrência contínua** — RF-155–157, RF-190; RN-101, RN-114 | Usuário configura semanal, mensal ou anual | Não exige nem oferece quantidade fixa/data final como término predefinido; compromisso finito é parcelamento. |
| CA-K12 | **Fim de mês não bissexto** — RN-102 | Recorrência mensal dia 31 avança em 2027 | Vencimentos incluem 31/01, 28/02, 31/03, 30/04 e 31/05; fevereiro não altera âncora permanente. |
| CA-K13 | **Fim de mês bissexto** — RN-102 | Recorrência mensal dia 31 avança em 2028 | Fevereiro usa 29/02 e março volta a 31/03. |
| CA-K14 | **Independência recorrente** — RF-159; RN-063 | Uma ocorrência tem valor ou situação alterados de forma autorizada | Demais ocorrências preservam valores e situação próprios. |
| CA-K15 | **Edição da configuração** — RF-160 | Configuração recorrente é alterada | Preservar histórico e aplicar a próximas ocorrências; tratamento de futuras já geradas depende de Q-K14. |
| CA-K16 | **Encerramento explícito** — RF-158, RF-162; RN-064 | Usuário autorizado encerra recorrência | Cessar geração futura sem eliminar ocorrências existentes; concorrência de execução precisa de validação técnica. |
| CA-K17 | **Parcelas e datas** — RF-169–171; RN-068, RN-103–104 | Quatro parcelas iniciam em 31/01/2027 | Gerar vínculos independentes com vencimentos 31/01, 28/02, 31/03 e 30/04. |
| CA-K18 | **Ajuste de valor e total** — RF-172; RN-069, RN-105 | Parcelas de 100, 100 e 100 têm segunda alterada para 120 antes do pagamento | Restantes mantêm 100; soma final do parcelamento é 320 antes de exclusões/cancelamentos. |
| CA-K19 | **Estrutura imutável** — RN-083 | Usuário tenta alterar número sequencial ou quantidade total após criação, inclusive após reversão | Alteração estrutural é impedida. |
| CA-K20 | **Excluir parcela sem redistribuir** — RF-175; RN-071–075 | Parcela não paga, inclusive vencida, é excluída com confirmação e motivo | Restantes mantêm valores e números; original e histórico das pagas são preservados. |
| CA-K21 | **Exclusão individual paga** — RN-092–096 | Usuário com permissão exclui individualmente despesa paga com confirmação e motivo | Aplicar exclusão lógica mantendo estado/histórico financeiro; não exigir reversão por inferência. |
| CA-K22 | **Exclusão de vinculados** — RF-191; RN-106–107 | Usuário solicita excluir despesa vinculada | Oferecer ocorrência atual ou cadeia em aberto; cadeia não exclui pagos. |
| CA-K23 | **Auditoria de exclusão** — RN-093–095 | Exclusão é solicitada sem confirmação ou motivo | Não concluir sem ambos; quando concluída registrar ator, data/hora, despesa e justificativa. |
| CA-K24 | **Restaurar com escopo** — RF-179, RF-192; RN-097–098, RN-108 | Administrador autorizado restaura original | Oferecer somente original ou também relacionados; respeitar elegibilidade individual e auditar responsável, momento e registro. |
| CA-K25 | **Restauração indevida** — RN-097; RN-108 | Usuário não administrador tenta restaurar contexto compartilhado | Operação é impedida; solução do espaço pessoal continua pendente. |
| CA-K26 | **Filtros** — RF-180 | Pessoa autorizada consulta despesas com os filtros previstos | Aplicar lançamento, vencimento, situação, categoria, forma, autor e residência quando aplicável, sem ampliar acesso. |
| CA-K27 | **Contexto protegido** — RF-149; RN-099, RN-111 | Requisição ou fonte do Okape aponta a contexto não autorizado | Não expor lançamentos, totais ou históricos; composição de painel não concede acesso de origem. |
| CA-K28 | **Mês e parcelas** — RF-184–188; RN-109–110 | Resumo agrega despesas parceladas no mês corrente | Contar parcelas individualmente sem somar total da compra; data-base e elegibilidade dependem de Q-K07. |
| CA-K29 | **Vencimentos próximos** — RF-182, RF-189, RF-193; RN-112 | Pessoa consulta próximos vencimentos | Padrão de sete dias, possibilidade de configuração e apresentação de vencidas; limites e escopo da configuração dependem de Q-K07/12. |
| CA-K30 | **Histórico de reversão** — RF-174; RN-076, RN-079–080 | Reversão de parcela é concluída | Preservar pagamento original e registrar ator, data/hora, registro, estados anterior/novo e justificativa. |
| CA-K31 | **Isolamento e independência** — Diretrizes gerais; plataforma/RF-003, RF-051 | Integração externa ou outro módulo está indisponível | Funções nativas independentes do Kapanga continuam utilizáveis sem exigir banco ou Potira externos. |
| CA-K32 | **RNF herdados** — plataforma/RNF-001–025 | Fluxos do módulo são avaliados em dispositivos e tecnologias assistivas | Aplicar responsividade, PWA online, acessibilidade, localização e isolamento; detalhes de backup/exportação dependem da plataforma. |

A estratégia técnica deve também verificar geração duplicada, reinício durante processamento, pagamento concorrente com edição e exclusão em lote, autorização revogada antes da execução e consistência entre evento financeiro e auditoria. Não há testes automatizados novos nesta entrega documental.
