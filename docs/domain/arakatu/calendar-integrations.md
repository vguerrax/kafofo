# Arakatu — Integrações de calendário

## Decisões existentes

- MVP com sincronização unidirecional.
- Alterações externas não modificam evento original criado no Kafofo.
- Prioridade inicial para assinatura iCalendar.
- Importação e exportação iCalendar previstas.
- Compatibilidade com CalDAV e iCalendar deve ser avaliada.
- Conectores autenticados específicos com Google/Microsoft/outros e sincronização bidirecional ficam para evolução.

## Capacidades distintas

| Capacidade | Definição no projeto | Ainda não decidido |
| --- | --- | --- |
| Importar iCalendar | RF-129 prevê entrada de dados | Arquivo/link, validação, destino, duplicatas e atualização de importações |
| Exportar iCalendar | RF-129 prevê saída de dados | Escopo, formato concreto, autorização e tratamento de recorrência |
| Assinatura iCalendar | Prioridade para integração inicial | Se publica calendário do Kafofo, consome feed externo ou admite ambos em fluxos independentes |
| Sincronização unidirecional | RF-131 limita intercâmbio sem retorno que modifique original do Kafofo | Direção de cada integração, mapeamento de identidade e periodicidade |
| Visão consolidada | RF-130 reúne eventos e identifica origem | Atualização, falha, colisões e apresentação de cópias |

“Unidirecional” não escolhe sozinho a direção de todo fluxo. Importação e exportação podem ser capacidades diferentes; não equivalem a um vínculo bidirecional ativo. Registrar a direção de cada operação antes de especificar conectores.

O efeito de uma alteração externa sobre uma cópia local importada continua aberto. O requisito de não modificar original nativo permanece válido e não deve ser removido para resolver essa lacuna.

## Falhas e independência

Serviço externo indisponível não deve interromper funcionalidades nativas independentes. Plataforma prevê consulta de informações previamente sincronizadas segundo permissão; isso exige servidor e não representa suporte offline.

Periodicidade, atualização incremental, remoção externa, credenciais, falha parcial e identidade/deduplicação precisam de contrato. Não transformar importação repetida em criação ilimitada de cópias por ausência de regra explícita.

## Candidatos mencionados

| Candidato | Papel descrito na fonte | Status |
| --- | --- | --- |
| FullCalendar | Biblioteca de interface | Não aprovado |
| Radicale | Servidor CalDAV | Não aprovado |
| Nextcloud Calendar | Aplicação de calendário completa | Não aprovado |

A lista não constitui recomendação técnica atualizada nem comprovação de compatibilidade. Qualquer escolha exige avaliação do fluxo desejado e das dependências; não é necessário instalar todos os candidatos.
