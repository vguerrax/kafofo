# Kitanda — Permissões e compartilhamento

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


## Regras conhecidas

| Operação | Autorização definida | Limite ou pendência |
| --- | --- | --- |
| Consultar listas/itens, pesquisar e filtrar | Pessoa com acesso ao recurso e contexto | Somente resultados autorizados |
| Compartilhar lista | Com membros autorizados do contexto | Ator que concede e papéis concedidos ainda não detalhados |
| Criar/editar lista, adicionar/editar/remover itens | Operação disponível a usuários autorizados conforme contexto | Matriz completa por papel fixo ainda a definir |
| Marcar/desmarcar comprado | Qualquer usuário com acesso, segundo RN-235 | Conciliar com visualizador de residência antes de implementar |
| Reorganizar itens | Autorização do contexto/lista | Ordem resultante compartilhada; papel exato não explicitado |
| Limpar comprados / esvaziar | Autorização aplicável à lista | Confirmação obrigatória; papel exato não explicitado |
| Excluir lista | Qualquer usuário com permissão de edição | Confirmação obrigatória; não exige justificativa comum |
| Restaurar lista | Usuário autorizado | Não foi reservado explicitamente ao administrador; ator exato pendente |
| Consultar histórico | Acesso autorizado ao contexto/recurso | Histórico não vira público nem irrestrito para administração global |

No MVP, não compartilhar com pessoas externas ao núcleo, links públicos ou convites sem conta. Estar no mesmo núcleo também não basta: é necessário ser membro autorizado do contexto da lista. Compartilhamento não contorna restrições de residência.

## Contexto pessoal

A lista pode ser pessoal, mas o compartilhamento é limitado a membros autorizados do contexto. O limite de compartilhamento de uma lista pessoal não foi detalhado. Não aplicar a exceção do painel pessoal do Okape ao Kitanda nem assumir compartilhamento pessoal externo.

## Validação derivada

Validar no backend sessão, contexto real, vínculo ativo, permissões e estado do registro. Aplicar também às contagens, nomes encontrados por pesquisa, histórico, restauração e operações em lote. Não confiar no contexto ou autor enviado pelo cliente como prova de autorização.

Saída do núcleo ou perda de acesso deve seguir revogação da plataforma. Alterações compartilhadas e cache não podem continuar expondo registros após perda de permissão; estratégia de atualização ainda a definir.
