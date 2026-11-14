# Arakatu — Visão geral

Arakatu organiza o tempo, compromissos e acontecimentos pessoais e domésticos. Deve oferecer uma agenda utilizável, com criação e administração de eventos no Kafofo, além de integração com calendários externos, sem obrigar migração dos serviços existentes.

O nome é definitivo no documento de marca. Sua personalidade foi definida como leve, organizada e acolhedora. A associação semântica a oportunidade, bonança e momento oportuno permanece com ressalva até validação linguística conclusiva; não ampliar significados ou atribuir tradução comprovada nesta documentação.

## Capacidades definidas

Agenda pessoal e compartilhada; eventos de núcleo e residência; integração e visualização consolidada de origens diferentes com identificação da origem; importação/exportação iCalendar; sincronização unidirecional no MVP; recorrência diária, semanal, mensal e anual; edição/exclusão de ocorrência específica ou série; múltiplos lembretes configuráveis e integrados ao centro de notificações.

O calendário é independente dos demais módulos domésticos. Não exige desenvolvimento integral do zero: prioriza avaliação de soluções open-source existentes.

## Responsabilidades e atores

| Ator/componente | Responsabilidade conhecida |
| --- | --- |
| Usuário autorizado | Usa agenda pessoal e compartilhada e administra eventos conforme autorização a detalhar |
| Plataforma | Identidade, contextos, papéis, canais de notificação, privacidade, PWA e ciclo de dados |
| Arakatu | Regras de agenda/evento, origem, recorrência, integração e lembretes |
| Serviço externo | Mantém seus próprios dados e comportamento de atualização; alterações externas não modificam automaticamente original do Kafofo |

## Limites de escopo

Sincronização bidirecional e integrações autenticadas específicas com Google, Microsoft e outros provedores ficam para evolução. Operação offline e aplicativos móveis nativos não fazem parte do MVP da plataforma.

FullCalendar, Radicale e Nextcloud Calendar são candidatos de naturezas diferentes listados na fonte, sem escolha aprovada. CalDAV deve ser avaliado; não é serviço obrigatório decidido.

Campos obrigatórios do evento, número de agendas por contexto, papéis de compartilhamento, convites de participantes, eventos de dia inteiro, disponibilidade, colisões de horários, anexos e visualizações exatas não foram detalhados. Não tratar esses itens como aprovados nem como proibições funcionais definitivas.
