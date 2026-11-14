# Kitute — Critérios de aceite

Cenários para implementação futura; não representam testes já executados.

## CA-KIT-01
Requisitos: RF-KIT-01/02.

Criar dois cadernos no mesmo contexto mantém ambos; tentativa de mudar contexto de um existente é recusada.

## CA-KIT-02
Requisitos: RF-KIT-03/04.

Receita exige um caderno válido e os três campos obrigatórios; não pode pertencer simultaneamente a dois cadernos.

## CA-KIT-03
Requisitos: RF-KIT-05/06.

Receita sem opcionais é aceita; ingredientes preservam quebras de linha e preparo apresenta parágrafos/listas.

## CA-KIT-04
Requisitos: RF-KIT-07.

Editor do contexto pode editar receita criada por outro membro; autoria original é preservada e último editor é atualizado.

## CA-KIT-05
Requisitos: RF-KIT-07/08.

Visualizador consulta, mas tentativas de criar, editar, excluir ou restaurar conteúdo são negadas no backend.

## CA-KIT-06
Requisitos: RF-KIT-08.

Editor comum de receitas não recebe por isso permissão de administrar compartilhamentos nem excluir/restaurar o caderno inteiro.

## CA-KIT-07
Requisitos: RF-KIT-09/10.

Concessão para usuário da mesma instância permite ler caderno de outro contexto e receitas futuras, sem abrir demais recursos do contexto.

## CA-KIT-08
Requisitos: RF-KIT-09.

Leitor adicional não pode editar; sem outra fonte de autorização, revogar concessão impede consulta posterior, inclusive por endereço direto.

## CA-KIT-09
Requisitos: RF-KIT-09.

Não há compartilhamento anônimo/público ou para conta de outra instância.

## CA-KIT-10
Requisitos: RF-KIT-11/16.

Busca pelo nome e filtros por caderno/tags mostram somente resultados autorizados; não expõem receitas ou tags privadas de outros cadernos.

## CA-KIT-11
Requisitos: RF-KIT-12.

Consulta exibe criador/data e último editor/data; exclusão/restauração têm ator da ação registrado.

## CA-KIT-12
Requisitos: RF-KIT-13.

Se outra edição é salva antes, gravação desatualizada não sobrescreve: a pessoa recebe aviso e seu texto não salvo permanece disponível.

## CA-KIT-13
Requisitos: RF-KIT-14.

Com A ativa e B já excluída, excluir/restaurar o caderno recupera A, mantém B na lixeira e não reativa concessões antigas.

## CA-KIT-14
Requisitos: RF-KIT-07/14.

Receita não pode ser restaurada para uso ativo enquanto o caderno permanece excluído; recuperação segue política da plataforma.

## CA-KIT-15
Requisitos: RF-KIT-15.

Remover membro sem concessão independente encerra acesso contextual; receitas que criou no caderno compartilhado permanecem.

## CA-KIT-16
Requisitos: RF-KIT-16.

Tags de um contexto não passam a compor automaticamente o catálogo de outro; concessão de caderno não abre o catálogo inteiro de origem.

## CA-KIT-17
Requisitos: RF-KIT-08.

Proprietário pessoal, responsável da residência e administrador do núcleo administram o caderno correspondente; papel em outro contexto não basta.
