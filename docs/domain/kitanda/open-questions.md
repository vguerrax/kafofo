# Kitanda — Refinamentos e conflitos

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


O levantamento funcional está concluído. Os pontos abaixo delimitam implementação e integração sem reabrir o objetivo e o escopo aprovados.

| ID | Tema | Refinamento necessário |
| --- | --- | --- |
| Q-I01 | Marcação versus visualizador | RN-235 permite marcar a qualquer pessoa com acesso; papel visualizador de residência só consulta. Definir precedência sem conceder escrita universal |
| Q-I02 | Matriz de operações | Definir poderes de criar, editar, compartilhar, reordenar, limpar e restaurar por papel; restauração não foi reservada a administradores |
| Q-I03 | Compartilhamento pessoal | Lista pessoal é prevista, mas compartilhamento exige membros do contexto. Definir limite sem importar exceção do Okape ou abrir externo ao núcleo |
| Q-I04 | Igualdade e soma de duplicados | Definir normalização do nome, quantidades ausentes, unidades distintas, observações e itens já comprados; conversão automática não aprovada |
| Q-I05 | Quantidade e unidades | Definir tipo, precisão, limites, valores zero/negativos e forma de unidade; ambos continuam opcionais |
| Q-I06 | Ordem entre grupos | Definir posição ao marcar/desmarcar, ordem pendente/comprado e persistência da organização, mantendo ordem compartilhada |
| Q-I07 | Concorrência e atualização | Definir estratégia e intervalo de atualização, conflitos de edição/soma/ordem e perda de acesso; sem requisito offline ou latência fechada |
| Q-I08 | Limpeza concorrente | Definir quais itens são atingidos se marcação muda entre confirmação e execução e atomicidade/resultado de falha parcial |
| Q-I09 | Restauração e itens anteriores | Definir recuperação da lista sem ressuscitar itens removidos antes dela; restauração individual de item não foi aprovada |
| Q-I10 | Progresso vazio | Definir exibição de lista vazia, arredondamento e elegibilidade de itens excluídos; fórmula não admite divisão por zero |
| Q-I11 | Histórico e retenção | Esclarecer eventos de restauração/compartilhamento/reordenação e retenção por categoria; conciliar histórico obrigatório no MVP com ADR-0010 |
| Q-I12 | Notificações relevantes | Definir destinatários, categorias e preferências para compartilhamento/permissões; manter silêncio nas operações comuns |
| Q-I13 | Consulta de excluídos | Definir área de restauração, pesquisa em listas/itens excluídos e interação com filtros e resumos |
| Q-I14 | Portabilidade | Detalhar conteúdo exportado, histórico e excluídos no escopo pessoal da plataforma; não criar exportador financeiro ou PDF por inferência |
| Q-I15 | Editor compartilhado | Urukum faz referência à formatação do Kitanda; esta especificação só fornece descrição/observação sem opções de texto rico. Delimitar a consistência do editor |

## Pontos já fechados

Compartilhamento externo não é pendência: é proibido no MVP. Ordem é compartilhada, não individual. Quantidade e unidade são opcionais. Duplicados podem continuar separados. Marcar/desmarcar não exige confirmação. Limpar comprados e esvaziar exigem confirmação e têm alvos diferentes. Justificativa comum não é exigida. Templates, recorrência automática, estoque, preços e Kanban estão fora do MVP.

## Sequência de refinamento sugerida

Fechar permissões (Q-I01–03) antes das operações compartilhadas. Definir soma/quantidade e concorrência (Q-I04–08) junto aos contratos. Resolver recuperação, progresso e histórico (Q-I09–11) antes da homologação. As escolhas de apresentação e serviços restantes acompanham os fluxos afetados.

Os riscos principais são escrita por visualizadores, perda de edição simultânea, limpeza atingindo registros inesperados e restauração de itens já removidos. Eles não exigem acrescentar catálogo, engine de estoque ou infraestrutura distribuída ao MVP.

## Tratamento posterior na Alpha 1

A tabela acima preserva as questões identificadas na consolidação original. Consulte o [contrato aprovado](alpha-1.md) para a resolução no incremento. Uma questão pode estar resolvida para a Alpha 1 e continuar aberta para contextos ou capacidades adiados. A POC de autenticação, biblioteca de frontend, licença e CD mantêm seus status próprios.
