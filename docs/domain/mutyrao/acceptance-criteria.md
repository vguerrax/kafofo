# Mutyrão — Critérios de aceitação

**Status:** cenários derivados, não executados. Os que citam Q-M dependem de refinamento para verificação completa; não representam decisões novas sobre os pontos abertos.

| ID | Cenário e referências | Dado / quando | Resultado esperado |
| --- | --- | --- | --- |
| CA-M01 | **Cadastro simples** — RF-139–140, RF-271, RF-273, RF-293; RN-202, RN-207 | Usuário autorizado informa nome sem descrição, responsável, prazo ou categoria | Permitir criar tarefa sem esses opcionais; nome é obrigatório; status inicial depende de Q-M04. |
| CA-M02 | **Prioridade padrão** — RF-274; RN-204 | Nova tarefa é cadastrada | Receber normal por padrão; opções baixa, normal e alta disponíveis. |
| CA-M03 | **Contexto e compartilhamento** — RF-268; RN-184–186 | Pessoa consulta tarefa compartilhada por contexto ou para pessoas específicas | Respeitar contexto e modalidade; limite de externos depende de Q-M02. |
| CA-M04 | **Edição colaborativa** — RN-199–200 | Pessoa com acesso e edição altera tarefa criada por outra | Permitir sem exigir que seja criadora, respeitando autorização. |
| CA-M05 | **Múltiplos responsáveis** — RF-141, RF-269; RN-187 | Tarefa é atribuída a mais de uma pessoa elegível | Manter responsabilidade compartilhada, sem criar tarefa separada para cada um. |
| CA-M06 | **Tarefa não atribuída** — RF-293; RN-219–220 | Tarefa não tem responsável | Ficar disponível aos autorizados do contexto; pessoa com edição pode assumir ou atribuir. |
| CA-M07 | **Gerenciar responsáveis** — RF-294; RN-221–222 | Pessoa autorizada adiciona, remove ou substitui responsáveis | Permitir sem justificativa e registrar alteração; não reabrir tarefa automaticamente por inferência. |
| CA-M08 | **Conclusão integral** — RN-188–190 | Um entre vários responsáveis conclui explicitamente | Marcar tarefa inteira Concluída e registrar quem/data/hora, sem exigir conclusão individual dos demais. |
| CA-M09 | **Reabrir concluída** — RN-191–194 | Pessoa autorizada com acesso reabre tarefa Concluída | Não exigir motivo nem privilégio especial; preservar conclusões anteriores; destino do status depende de Q-M04. |
| CA-M10 | **Cancelar com motivo** — RF-270; RN-195–198 | Pessoa autorizada cancela informando justificativa | Estado Cancelada; motivo acessível aos autorizados; histórico com autor, data/hora e motivo. |
| CA-M11 | **Bloquear cancelamento sem motivo** — RN-195 | Cancelamento é solicitado sem justificativa | Não concluir cancelamento até informar motivo obrigatório. |
| CA-M12 | **Reabrir cancelada** — RN-191–194 | Pessoa autorizada com acesso reabre Cancelada | Não exigir justificativa, preservando histórico; estado de destino depende de Q-M04. |
| CA-M13 | **Descrição formatada** — RF-271–272; RN-201 | Pessoa edita descrição opcional | Aceitar texto livre com negrito, itálico, listas e links sem modelo obrigatório. |
| CA-M14 | **Checkbox visual** — RF-276; RN-208 | Pessoa marca item de verificação | Diferenciar visualmente marcado de pendente, com estado acessível. |
| CA-M15 | **Checklist não conclui** — RN-209 | Todos os checkboxes são marcados | Tarefa não fica Concluída automaticamente; conclusão exige ação explícita. |
| CA-M16 | **Atraso sem mudar status** — RN-202–203; RF-282 | Vencimento passou e tarefa está Pendente ou Em andamento | Identificar atraso sem alterar status; corte temporal depende de Q-M05. |
| CA-M17 | **Encerrada não atrasa** — RN-203 | Tarefa Concluída ou Cancelada tem vencimento passado | Não identificá-la como tarefa em atraso pelo critério de abertas. |
| CA-M18 | **Categorias opcionais** — RF-275; RN-205–207 | Usuário consulta classificação | Oferecer Limpeza, Manutenção, Compras, Organização, Cuidados com animais e Outros; aceitar sem categoria e permitir categorias próprias do núcleo conforme papel a refinar. |
| CA-M19 | **Três visualizações** — RF-277–279 | Usuário alterna lista, quadro e calendário | Disponibilizar lista, colunas por status e tarefas por vencimento; tratamento de sem prazo depende de Q-M10. |
| CA-M20 | **Recorte de encerradas** — RF-280; RN-212–213 | Quadro usa configuração padrão e depois período alterado | Encerradas seguem últimos trinta dias por padrão; período pode mudar sem excluir tarefas; data-base depende de Q-M09. |
| CA-M21 | **Abertas no quadro** — Complemento seção 9 da fonte | Tarefa antiga está Pendente ou Em andamento | Não ocultar por recorte de encerradas; manter filtros e autorização. |
| CA-M22 | **Filtros consistentes** — RF-281–282; RN-214 | Pessoa consulta lista, quadro e calendário | Disponibilizar mesmos critérios por responsáveis, categoria, prioridade, status, contexto e prazo, com atrasadas/próximas/sem prazo. |
| CA-M23 | **Ordenação e pesquisa** — RF-283–284; RN-215 | Pessoa ordena e pesquisa | Ordenar por prazo, prioridade, criação e última atualização; pesquisar nome/descrição apenas em tarefas autorizadas. |
| CA-M24 | **Notificar atribuição** — RF-285; RN-216–217 | Usuário recebe atribuição | Notificá-lo pelos canais disponíveis respeitando preferências; autoatribuição e agrupamento dependem de Q-M13. |
| CA-M25 | **Notificar alterações** — RF-286; RN-216–217 | Tarefa sob responsabilidade sofre alteração | Notificar responsáveis respeitando preferências; granularidade de alteração depende de Q-M13. |
| CA-M26 | **Notificar encerramento** — RF-287; RN-216–217 | Tarefa é concluída ou cancelada | Notificar responsáveis conforme preferências e autorização. |
| CA-M27 | **Alertas de prazo** — RF-288–289 | Tarefa se aproxima do vencimento ou atrasa | Notificar responsáveis; janela, repetição e corte de atraso dependem de Q-M05/06. |
| CA-M28 | **Antecedências** — RF-290–291 | Responsável configura lembrete em tarefa com vencimento | Oferecer dez/trinta minutos, uma hora, um dia ou personalizado; não exige recurso de lembrete para tarefa sem prazo. |
| CA-M29 | **Lembretes independentes** — RF-292; RN-218 | Um responsável altera seu lembrete | Não modificar lembrete dos demais responsáveis. |
| CA-M30 | **Canais e preferências** — RN-216–217; plataforma/RN-038–040 | SMTP falha ou push não é autorizado | Usar canais disponíveis e preferências; falha num canal não impede demais conforme plataforma. |
| CA-M31 | **Excluir com confirmação** — RF-295; RN-223–225 | Pessoa com acesso e edição solicita exclusão | Exigir confirmação; aplicar exclusão lógica e preservar histórico; não exigir motivo de cancelamento por inferência. |
| CA-M32 | **Restaurar** — RN-226 | Usuário autorizado solicita recuperar tarefa excluída | Permitir restauração conforme política; ator e efeitos em estado/lembretes dependem de Q-M15. |
| CA-M33 | **Histórico persistente** — RF-143; RN-194, RN-198, RN-221, RN-225 | Tarefa passa por atribuição, conclusão, reabertura, cancelamento e exclusão | Preservar eventos e conclusões anteriores; acesso ao histórico respeita contexto. |
| CA-M34 | **Sem capacidades excluídas** — RN-058, RN-210–211; restrições do MVP | Pessoa utiliza fluxo de tarefas | Não exigir/oferecer recorrência automática, anexos, comentários/conversas, templates ou conclusão automática como recursos aprovados. |
| CA-M35 | **Isolamento** — RN-186, RN-215; plataforma/RF-013 | Cliente usa identificador de tarefa de contexto não autorizado | Impedir consulta, escrita, pesquisa, histórico e configurações individuais sem autorização. |
| CA-M36 | **Experiência herdada** — plataforma/RNF-001–025 | Fluxos são avaliados em diferentes telas e tecnologias assistivas | Aplicar responsividade, PWA online, acessibilidade, localização e isolamento; não prometer operação offline. |

Complementar na implementação com ações concorrentes de status/atribuição/checklist, execução repetida de agendamento, mudança de prazo, perda de acesso antes da entrega e restauração com lembretes antigos. Esses desdobramentos verificam integridade, sem criar novos recursos funcionais.
