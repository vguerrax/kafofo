# Kitanda — Fluxos de uso

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


## FL-I01 — Criar e consultar lista

**Base:** RF-144, RF-296, RF-304–305; RN-227–228, RN-242.

Selecionar contexto autorizado, informar nome e opcionalmente descrição, criar lista e consultá-la. Podem coexistir várias listas independentes no mesmo contexto. Alterações numa lista não afetam as demais. Não exigir campos extras para identificação.

## FL-I02 — Compartilhar

**Base:** RF-145; RN-062, RN-259–260.

Usuário autorizado solicita compartilhamento, escolhe membros autorizados do contexto e efetiva conforme permissões. Não há pessoas externas ao núcleo, links públicos ou convites sem conta. Notificações são reservadas a esse tipo de evento e mudanças de permissão; destinatários e regras exatas a detalhar.

## FL-I03 — Adicionar e tratar duplicidade

**Base:** RF-146, RF-297–298; RN-229–233.

Informar nome obrigatório e dados opcionais. Se item já existe na lista, alertar e oferecer somar quantidades ou manter separado. Leite 2 litros mais Leite 1 litro pode resultar em 3 litros. A escolha é do usuário; unidades incompatíveis e valores ausentes exigem refinamento.

## FL-I04 — Organizar e acompanhar compra

**Base:** RF-147, RF-299–301, RF-312; RN-234–238.

Reorganizar itens manualmente conforme autorização; ordem fica compartilhada. Marcar ou desmarcar comprado sem confirmação ou motivo; registrar ator e momento. Manter comprados na lista, separados de pendentes. Conciliar permissão de marcação com papel visualizador antes da implementação.

## FL-I05 — Limpar comprados

**Base:** RF-302; RN-239–241.

Acionar limpar comprados, confirmar e remover somente comprados. Pendentes permanecem. Operação mantém histórico e respeita exclusão lógica. Não exige justificativa comum nem exclui a lista.

## FL-I06 — Esvaziar lista

**Base:** RF-303; RN-240–241.

Acionar esvaziar, confirmar e remover todos os itens independentemente da situação. Lista e histórico permanecem. É ação distinta da limpeza de comprados.

## FL-I07 — Excluir e restaurar lista

**Base:** RF-306; RN-243–246.

Usuário com edição solicita exclusão, confirma e exclui logicamente, preservando histórico de lista/itens. Usuário autorizado pode restaurar. Papel de restauração e tratamento de itens removidos antes da exclusão exigem refinamento; não restaurar indiscriminadamente registros anteriores.

## FL-I08 — Pesquisar, filtrar e consultar progresso

**Base:** RF-307–308, RF-310–313; RN-247, RN-257–258.

Pesquisar nome de lista ou item; filtrar contexto e situação. Mostrar somente dados autorizados em cartões com nome, contexto e resumo. Calcular proporção comprada sem pesos. Lista vazia e arredondamento precisam de definição de apresentação.

## FL-I09 — Consultar histórico e reutilizar

**Base:** RF-309; RN-248–256.

Consultar operações autorizadas e seus responsáveis/momentos. Reutilizar lista adicionando itens ou limpando comprados, preservando pendentes e histórico. Não exigir encerramento ou arquivamento. Operações comuns não geram notificações.
