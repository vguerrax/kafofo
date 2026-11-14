# Arakatu — Regras de negócio

**Escopo dos IDs:** `arakatu`. Seis regras explícitas do levantamento, com títulos originais preservados.

| ID | Título original | Aplicação conhecida |
| --- | --- | --- |
| RN-051 | Priorizar avaliação de soluções open-source existentes | Avaliar componentes/serviços existentes; candidatos não estão aprovados. |
| RN-052 | Independência funcional do calendário | Usar agenda independentemente dos outros módulos domésticos. |
| RN-053 | Não obrigatoriedade de migração para o Kafofo | Não forçar abandono dos calendários que a pessoa já usa. |
| RN-054 | Kafofo como fonte dos eventos criados nele | Alteração externa não modifica original criado no Kafofo. |
| RN-055 | Possibilidade futura de sincronização bidirecional | Bidirecionalidade é evolução futura, fora do MVP. |
| RN-056 | Lembretes integrados ao centro de notificações | Usar centro de notificações com múltiplos lembretes, antecedência e preferências individuais. |

## Definições textuais complementares

Agenda pessoal e compartilhada; eventos de núcleo/residência; criação/administração própria; origem identificável. Assinatura iCalendar é prioridade inicial, com sincronização unidirecional; alterações externas não modificam original nativo.

Avaliar CalDAV/iCalendar e reutilização open-source. FullCalendar, Radicale e Nextcloud Calendar são candidatos não escolhidos. Conectores autenticados específicos Google/Microsoft/outros e bidirecionalidade ficam para evolução.

Recorrência diária/semanal/mensal/anual; editar/excluir ocorrência ou série; exceção não deve modificar indevidamente as demais. Múltiplos lembretes com antecedência configurável e preferências individuais.

Campos obrigatórios, matriz de papéis, duração/término de recorrência e direção de cada assinatura não foram especificados. Regras gerais da plataforma se aplicam sem importar automatismos de outros módulos.
