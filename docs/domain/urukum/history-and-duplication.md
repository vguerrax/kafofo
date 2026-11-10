# Urukum — Histórico e duplicação

## Versões completas

Cada edição gera nova versão completa e independente, com autor, data/horário, conteúdo integral, título e demais informações relevantes daquela versão. Versões anteriores continuam disponíveis para leitura e não devem ser sobrescritas/apagadas durante a retenção aplicável.

Histórico é somente consultável no MVP. Não oferecer “restaurar esta versão” nem substituir nota atual ao consultar conteúdo anterior. Estrutura deve permitir evolução futura de restauração sem descartar histórico existente, mas isso não antecipa a funcionalidade.

Campos que compõem “demais informações relevantes”, gravação inicial, autosave por digitação versus confirmação de edição, metadados de tags/cor/estado e preferências individuais ainda precisam de definição.

**Orientação derivada:** persistir alteração e respectiva versão de modo consistente, tratando concorrência para não perder conteúdo. Formato de snapshot, chave de versão, tamanho e estratégia transacional não foram escolhidos.

## Cópia independente

| Aspecto | Resultado aprovado da duplicação |
| --- | --- |
| Título/conteúdo/formatação | Preservados |
| Cor/tags | Preservadas |
| Identificador | Novo |
| Data de criação | Nova |
| Histórico | Próprio da nova nota |
| Estado | Ativo |
| Fixação | Independente |
| Nota original | Não alterada |

A fonte não aprova copiar histórico integral da original para a nova nota. Também não define valor inicial da fixação, posição da cópia ou duplicação entre contextos. Não presumir que independente significa fixa ou não fixa por padrão.

Duplicar conteúdo não significa clonar tags de um contexto para outro; compartilhamento direto entre contextos permanece fora do MVP.

## Limites de acesso

Histórico segue autorização atual à nota/contexto, não acesso permanente do autor de versão antiga. Identidade de autor pode exigir anonimização após exclusão de conta conforme plataforma, sem alterar arbitrariamente conteúdo histórico.

Pino registra funcionamento operacional e não substitui snapshots de notas. Restauração da lixeira preserva histórico; não muda sua política de leitura para permitir restaurar versão antiga.
