# Kapanga — Integração com a plataforma

## Contexto, ativação e privacidade

Usa identidade e contextos da plataforma. Operações e indicadores respeitam pessoal, núcleo e residência; autorização vale também em buscas, históricos, fontes de dados e exportações. Responsável pelo lançamento é distinto de responsável pelo pagamento.

Disponibilidade do módulo na instância e habilitação no núcleo seguem a plataforma. Desativação não elimina dados; efeito sobre geração já agendada e espaço pessoal depende das pendências da plataforma e de Q-K06.

## Auditoria financeira

| Operação | Dados explicitamente exigidos |
| --- | --- |
| Exclusão | Responsável, data/hora, despesa afetada e justificativa |
| Restauração | Responsável, data/hora e despesa afetada |
| Reversão | Responsável, data/hora, registro afetado, situação anterior, nova situação e justificativa |

Pagamento original e registros anteriores não são apagados pela reversão. Original e histórico dos pagos não desaparecem na exclusão de parcelas não pagas. As diretrizes exigem rastreabilidade de operações administrativas e financeiras relevantes, sem schema completo aprovado para todos os eventos.

Pino fornece logs operacionais, não substitui histórico financeiro. A ADR-0010 adia auditoria específica por módulo, enquanto esta fonte exige registros no MVP; divergência já registrada na plataforma e mantida em Q-K03.

## Exclusão e retenção

A exclusão pelo usuário é lógica e preserva dados/histórico, inclusive para despesa paga individual. A plataforma prevê trinta dias configuráveis e eliminação posterior. A proibição de remoção física na fonte do Kapanga precisa ser conciliada com essa política; não declarar automaticamente retenção financeira permanente ou expurgo obrigatório de todo histórico após trinta dias.

A exclusão da conta ou do contexto também exige esclarecer referências de autoria e disponibilidade dos registros compartilhados, sem eliminar valores financeiros por inferência.

## Portabilidade

A exportação individual da plataforma inclui registros pessoais de módulos nativos. Kapanga deve participar respeitando esse escopo, sem expor indiscriminadamente despesas compartilhadas de terceiros. Conteúdo concreto de histórico, registros excluídos e relações de recorrência/parcelamento no arquivo deve ser especificado.

Não há funcionalidade autônoma aprovada de exportação financeira CSV/PDF nem relatório avançado no Kapanga. Exportação de núcleo e backups seguem as definições e lacunas da plataforma.

## Okape

Kapanga é dono das regras de cálculo e autorização; Okape compõe as visualizações. O resumo financeiro não deve forçar painel inicial preconfigurado, nem impedir consulta do Kapanga quando Okape não está em uso. O mesmo dado pode alimentar visuais distintos sem calcular regras financeiras na camada de apresentação.

## Notificações e integrações externas

A fonte exige identificar vencidos e próximos vencimentos; não especifica notificações automáticas de cobrança. Não transformar uma lista ou indicador em alerta push/e-mail por inferência. Qualquer definição futura deve utilizar os canais e preferências comuns da plataforma.

Falhas de integrações externas não devem comprometer funções nativas independentes. Não há integração bancária, Potira, gateway de pagamento ou conciliação aprovados como dependência do módulo.
