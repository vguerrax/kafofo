## 18. Calendário e agenda

Escopo do MVP aprovado

O calendário é uma capacidade central do Kafofo, mas não necessariamente deve ser desenvolvido integralmente do zero.

O usuário deixou claro que não quer apenas uma interface de visualização: o Kafofo deve oferecer uma agenda utilizável, sem obrigar as pessoas a abandonar os serviços que já utilizam.

### Capacidades definidas

- Agenda pessoal.
- Agenda compartilhada.
- Eventos associados a núcleos e residências.
- Criação e administração de eventos diretamente no Kafofo.
- Integração com calendários externos.
- Visualização consolidada de eventos de diferentes origens.
- Identificação da origem dos eventos.
- Eventos recorrentes.
- Múltiplos lembretes por evento.
- Integração com o centro de notificações.

### Requisitos

| ID     | Requisito                           |
| ------ | ----------------------------------- |
| RF-124 | Calendário integrado                |
| RF-125 | Integração de eventos               |
| RF-126 | Agenda pessoal                      |
| RF-127 | Agenda compartilhada                |
| RF-128 | Integração com calendários externos |
| RF-129 | Importação e exportação iCalendar   |
| RF-130 | Visualização consolidada            |
| RF-131 | Sincronização unidirecional         |
| RF-132 | Recorrência de eventos              |
| RF-133 | Frequências de recorrência          |
| RF-134 | Edição de recorrência               |
| RF-135 | Exclusão de recorrência             |
| RF-136 | Lembretes de eventos                |
| RF-137 | Múltiplos lembretes                 |
| RF-138 | Antecedência configurável           |

### Regras

| ID     | Regra                                                  |
| ------ | ------------------------------------------------------ |
| RN-051 | Priorizar avaliação de soluções open-source existentes |
| RN-052 | Independência funcional do calendário                  |
| RN-053 | Não obrigatoriedade de migração para o Kafofo          |
| RN-054 | Kafofo como fonte dos eventos criados nele             |
| RN-055 | Possibilidade futura de sincronização bidirecional     |
| RN-056 | Lembretes integrados ao centro de notificações         |

### Decisões sobre integração

- Sincronização unidirecional no MVP.
- Alterações realizadas externamente não modificam o evento original no Kafofo.
- Assinatura iCalendar é prioridade inicial.
- Integrações autenticadas específicas com Google, Microsoft e outros provedores ficam para evolução futura.
- Sincronização bidirecional fica fora do MVP.
- Compatibilidade com CalDAV e iCalendar deve ser avaliada.
- Reutilização de componentes ou soluções open-source será investigada.

### Tecnologias candidatas, ainda não escolhidas

- FullCalendar: biblioteca de interface.
- Radicale: servidor CalDAV.
- Nextcloud Calendar: aplicação de calendário completa.

Nenhuma dessas opções está aprovada como implementação definitiva.

### Recorrência

Frequências iniciais:

- Diária.
- Semanal.
- Mensal.
- Anual.

Edição e exclusão:

- Uma ocorrência específica.
- Toda a série.

É necessário tratar exceções sem modificar indevidamente as demais ocorrências.

### Lembretes

- Múltiplos lembretes por evento.
- Antecedências configuráveis.
- Uso do centro de notificações.
- Respeito às preferências individuais.

