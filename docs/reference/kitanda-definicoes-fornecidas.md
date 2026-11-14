# Kitanda — Registro das definições fornecidas

**Origem:** especificação funcional enviada diretamente na conversa pelo autor; escopo MVP, levantamento concluído. Este arquivo é uma transcrição estruturada dos enunciados identificados, não um anexo original nem um novo levantamento.

## Objetivo

Criar, organizar e compartilhar listas de compras entre pessoas autorizadas de um contexto, priorizando simplicidade, colaboração e atualização compartilhada. Não se transformar em estoque, catálogo de produtos ou controle financeiro.

## Requisitos funcionais

- **RF-144 — Gerenciamento de listas:** Permitir criar, consultar, editar e excluir listas de compras.
- **RF-145 — Compartilhamento de listas:** Permitir compartilhar listas com membros autorizados do contexto.
- **RF-146 — Gerenciamento de itens:** Permitir adicionar, editar e remover itens das listas.
- **RF-147 — Marcação de itens comprados:** Permitir marcar itens como comprados.
- **RF-296 — Múltiplas listas:** Permitir criar e manter várias listas de compras em cada contexto.
- **RF-297 — Identificação de itens duplicados:** Identificar quando um item adicionado já existe na mesma lista.
- **RF-298 — Dados dos itens:** Permitir cadastrar nome, quantidade, unidade de medida e observação.
- **RF-299 — Ordenação manual:** Permitir reorganizar manualmente os itens de uma lista.
- **RF-300 — Separação por situação:** Permitir visualizar separadamente os itens pendentes e comprados.
- **RF-301 — Marcação e desmarcação:** Permitir marcar e desmarcar itens como comprados.
- **RF-302 — Limpar itens comprados:** Permitir remover todos os itens marcados como comprados, preservando os pendentes.
- **RF-303 — Esvaziar lista:** Permitir remover todos os itens, independentemente da situação.
- **RF-304 — Nome da lista:** Exigir um nome para identificar cada lista.
- **RF-305 — Descrição da lista:** Permitir adicionar uma descrição opcional.
- **RF-306 — Exclusão de listas:** Permitir excluir logicamente listas de compras.
- **RF-307 — Pesquisa de listas:** Permitir pesquisar pelo nome da lista e pelo nome dos itens.
- **RF-308 — Filtros:** Permitir filtrar listas por contexto e situação.
- **RF-309 — Histórico de alterações:** Manter histórico das operações realizadas nas listas e em seus itens.
- **RF-310 — Resumo da lista:** Apresentar a quantidade de itens pendentes e comprados.
- **RF-311 — Progresso da lista:** Apresentar o percentual de conclusão das compras.
- **RF-312 — Visualização dos itens:** Apresentar os itens em formato de lista, separados entre pendentes e comprados.
- **RF-313 — Visualização das listas:** Apresentar as listas em cartões, exibindo nome, contexto e resumo do progresso.

## Regras de negócio

- **RN-062 — Contexto e permissões:** Respeitar o contexto ao qual a lista pertence e as permissões dos usuários.
- **RN-227 — Associação ao contexto:** Cada lista deve pertencer a um único contexto: pessoal, núcleo ou residência.
- **RN-228 — Independência das listas:** Alterações em uma lista não devem afetar as demais.
- **RN-229 — Tratamento de duplicidades:** Alertar o usuário e oferecer a possibilidade de somar as quantidades.
- **RN-230 — Manutenção de itens separados:** Permitir manter itens duplicados separadamente, caso o usuário prefira.
- **RN-231 — Nome obrigatório:** Todo item deve possuir um nome.
- **RN-232 — Campos opcionais:** Quantidade, unidade de medida e observação são opcionais.
- **RN-233 — Escopo dos itens:** Não incluir marca, preço ou fornecedor no MVP.
- **RN-234 — Ordem compartilhada:** A ordenação deve ser compartilhada entre todos os usuários autorizados da lista.
- **RN-235 — Permissão de alteração:** Qualquer usuário com acesso à lista pode marcar ou desmarcar itens.
- **RN-236 — Histórico de compra:** Registrar quem realizou a alteração e quando.
- **RN-237 — Simplicidade:** Não exigir confirmação ou justificativa para marcar ou desmarcar itens.
- **RN-238 — Permanência dos itens comprados:** Manter os itens comprados na lista, separados visualmente dos pendentes.
- **RN-239 — Remoção de itens comprados:** Permitir remover esses itens individualmente ou por meio de uma limpeza da lista.
- **RN-240 — Confirmação de limpeza:** Solicitar confirmação antes de executar limpar comprados ou esvaziar lista.
- **RN-241 — Preservação do histórico:** Manter registros das operações de limpeza, respeitando a exclusão lógica adotada pelo Kafofo.
- **RN-242 — Identificação:** O nome deve ser suficiente para identificar a lista, sem exigir outros campos.
- **RN-243 — Permissão de exclusão:** Qualquer usuário com permissão de edição pode excluir listas.
- **RN-244 — Confirmação:** Solicitar confirmação antes da exclusão da lista.
- **RN-245 — Preservação do histórico:** Manter o histórico da lista e de seus itens.
- **RN-246 — Restauração:** Permitir restaurar listas excluídas logicamente por usuários autorizados.
- **RN-247 — Respeito às permissões:** Apresentar somente listas e itens que o usuário tenha autorização para visualizar.
- **RN-248 — Identificação das ações:** Registrar o usuário responsável e a data/hora de cada operação.
- **RN-249 — Operações rastreadas:** Registrar criação e exclusão de listas; inclusão, edição e remoção de itens; mudanças de quantidade e unidade; marcação e desmarcação; limpeza de comprados e esvaziamento.
- **RN-250 — Sem justificativas:** Não exigir justificativas para operações comuns.
- **RN-251 — Notificações de listas:** Não enviar notificações para inclusão, edição, remoção ou marcação comuns.
- **RN-252 — Atualização compartilhada:** Alterações devem ficar disponíveis aos demais usuários autorizados da lista, sem depender de notificações.
- **RN-253 — Notificações relevantes:** Reservar notificações para eventos de compartilhamento e alterações de permissões.
- **RN-254 — Reutilização de listas:** Permitir reutilizar listas existentes após compras, adicionando itens ou limpando comprados.
- **RN-255 — Sem encerramento obrigatório:** Não exigir encerramento ou arquivamento após uso.
- **RN-256 — Continuidade:** Reutilização não deve apagar itens pendentes nem histórico anterior.
- **RN-257 — Cálculo do progresso:** Calcular proporção de itens comprados sobre total de itens, sem pesos diferentes.
- **RN-258 — Escopo das visualizações:** Não disponibilizar quadro Kanban no MVP.
- **RN-259 — Compartilhamento restrito:** Permitir compartilhamento somente com membros autorizados do contexto no MVP.
- **RN-260 — Compartilhamento externo:** Não permitir compartilhamento com pessoas externas ao núcleo, inclusive links públicos ou convites sem conta.

## Complementos textuais da especificação

- Duplicidade: ao adicionar Leite — 1 litro onde existe Leite — 2 litros, oferecer junção para 3 litros sem obrigar a operação.
- Situações de filtro: com itens pendentes; somente itens comprados; listas vazias.
- Limpar comprados e esvaziar lista são operações independentes.
- Fora do MVP: compartilhamento externo ao núcleo, links públicos/convites sem conta, modelos/templates, recorrência automática, estoque, marcas, fornecedores, preços, integração financeira, notificações comuns e Kanban.
- Não exigir quantidade, unidade, descrição da lista, justificativas comuns ou encerramento/arquivamento; não obrigar consolidação de duplicados; marcação/desmarcação sem confirmação.
- Levantamento funcional concluído. Implementação, interface, atualização compartilhada e auditoria serão refinadas durante implementação, sem ampliar desnecessariamente o escopo.
