# Urukum — Regras de negócio

**Escopo:** `urukum`. IDs e enunciados originais preservados, sem colisão com RN locais de outros módulos.

| ID original | Regra fornecida |
| --- | --- |
| RN-01 | toda nota deverá pertencer a um único contexto. |
| RN-02 | o título será opcional e o conteúdo será obrigatório. |
| RN-03 | somente usuários autorizados poderão acessar notas de núcleo ou residência. |
| RN-04 | qualquer membro autorizado poderá editar notas compartilhadas. |
| RN-05 | cada edição deverá gerar uma versão completa e independente no histórico. |
| RN-06 | o histórico será somente para consulta no MVP. |
| RN-07 | tags serão compartilhadas somente dentro do contexto em que foram criadas. |
| RN-08 | cada usuário terá sua própria organização visual das notas compartilhadas. |
| RN-09 | notas fixadas permanecerão no início da grade, respeitando os filtros. |
| RN-10 | a duplicação criará uma nota independente, com histórico próprio. |
| RN-11 | arquivamento não equivale a exclusão. |
| RN-12 | qualquer membro autorizado poderá arquivar e desarquivar notas compartilhadas. |
| RN-13 | qualquer membro autorizado poderá excluir notas compartilhadas. |
| RN-14 | notas excluídas serão mantidas na lixeira própria do Urukum. |
| RN-15 | qualquer membro autorizado poderá restaurar notas compartilhadas. |
| RN-16 | o prazo padrão de retenção será de 30 dias, configurável pelo administrador da instância. |
| RN-17 | o Urukum não terá lembretes, vencimentos ou notificações próprias. |
| RN-18 | imagens e anexos não serão suportados no MVP. |

## Definições complementares da fonte

Notas pessoais só são visualizadas/administradas pelo proprietário. Perda de acesso ao contexto retira acesso às notas. Ordem e fixação são individuais por usuário, preservadas entre contextos; fixadas precedem ordenação respeitando filtros. Duplicação preserva título/conteúdo/formatação/cor/tags, com novo ID/data/histórico, ativa e fixação independente.

Arquivadas têm área própria. Excluídas vão à lixeira, fora das áreas ativa/arquivada. Restauração recupera conteúdo/tags/histórico e retorna ativa, respeitando posição/fixação individuais. Após retenção, remoção definitiva segue política global.

Cada edição gera versão completa com autor/data/hora. Consulta de versão antiga não autoriza restaurá-la no MVP. Notas exclusivamente textuais; cores da paleta; sem vencimentos, lembretes/notificações, integração com tarefas/eventos, mídia ou compartilhamento direto entre contextos.
