# Urukum — Refinamentos e conflitos

Os pontos abaixo delimitam implementação e integração; não ampliam escopo funcional.

| ID | Tema | Refinamento necessário |
| --- | --- | --- |
| Q-U01 | Tags obrigatórias | Estrutura diz uma ou mais tags; regras destacam conteúdo obrigatório. Confirmar possibilidade de nota sem tag, sem criar tag padrão por inferência |
| Q-U02 | Papéis de residência | Fonte permite colaboração a membros autorizados; plataforma possui visualizador só de consulta. Fechar matriz sem conceder escrita universal |
| Q-U03 | Editor consistente | Mutyrão define formatação; Kitanda não detalha texto rico. Fixar contrato comum e tratamento de checkboxes sem transformar nota em tarefa |
| Q-U04 | Limite de uma edição | Definir autosave/confirmar, concorrência, atualização da data de edição e momento de criação de snapshot completo |
| Q-U05 | Conteúdo da versão | Delimitar cor/tags/estado, versão inicial e mudanças de preferências; manter histórico completo e somente leitura |
| Q-U06 | Retenção histórica | Separar prazo de lixeira e versões de notas ativas/arquivadas; conciliar exigência de histórico com ADR-0010 e política de expurgo/backup |
| Q-U07 | Gestão de tags | Definir normalização/duplicados, renomeação, remoção, órfãs e efeito em associações e versões antigas |
| Q-U08 | Ordenação/filtros | Definir múltiplas tags, ordem por tags/cor/título ausente, empates e combinação de filtros, mantendo prioridade das fixadas |
| Q-U09 | Preferências e recuperação | Definir posição/fixação sem preferência anterior, variações por dispositivo e acesso revogado; restauração permanece ativa |
| Q-U10 | Duplicação | Definir posição/cor se paleta mudar, fixação inicial, duplicação de arquivadas e disponibilidade em lixeira; não aprovar cópia entre contextos |
| Q-U11 | Paleta e conteúdo | Definir cores/padrão, limites de texto, conteúdo vazio formatado e segurança do editor sem acrescentar mídia |
| Q-U12 | Lixeira e transições | Definir confirmação de exclusão, edição na área arquivada/lixeira, concorrência de expurgo/restauração e permissões de consulta |
| Q-U13 | Escopo da pesquisa | Definir busca nas áreas ativa/arquivada/lixeira e visibilidade de versões; não aprovar busca em todo histórico por inferência |
| Q-U14 | Portabilidade | Delimitar conteúdo, versões, tags, preferências e registros excluídos na exportação pessoal, sem expor compartilhados indevidos |

## Pontos já definidos

Título opcional; conteúdo obrigatório. Pessoal privado. Um contexto por nota; sem compartilhamento direto entre contextos. Ordem e fixação individuais, salvas automaticamente; fixadas respeitam filtros. Cor da paleta, sem cor livre. Duplicata ativa com novo ID e histórico próprio. Arquivamento não é exclusão. Histórico completo é só para consulta. Lixeira própria, restauração ativa e retenção padrão trinta dias configuráveis.

Anexos, mídia, vencimentos, lembretes/notificações, integração com tarefas/eventos e restauração de versão antiga ficam fora do MVP.

## Sequência sugerida

Resolver cadastro/autorização/editor e unidade de versão (Q-U01–05) antes da edição compartilhada; retenção e tags (Q-U06–07) antes de expurgo; preferências, recuperação e portabilidade junto aos fluxos respectivos.

Riscos principais: preferências pessoais virarem atributo global, versão ser sobrescrita por edição concorrente, restauração de nota se confundir com versão antiga, tag revelar outro contexto e política de expurgo destruir histórico ainda necessário. Não é preciso acrescentar um sistema avançado de conhecimento para resolver essas questões.
