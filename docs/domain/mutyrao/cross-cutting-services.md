# Mutyrão — Serviços transversais

## Plataforma e contexto

Usa conta, papéis fixos, participação em núcleo, acesso à residência e ativação de módulos da plataforma. Acesso à tarefa é determinado pelo contexto e compartilhamento; ser criador ou responsável não substitui autorização atual.

Contexto pessoal é suportado. Compartilhamento com pessoas específicas e categorias no espaço pessoal requerem refinamento, sem conceder acesso a administrador de núcleo por inferência. Efeitos de desativação sobre agendamentos acompanham a política de módulos da plataforma.

## Histórico

| Operação | Registro explicitamente definido |
| --- | --- |
| Conclusão | Quem concluiu, data e horário |
| Reabertura | Evento de reabertura, preservando conclusões anteriores |
| Cancelamento | Responsável, data, horário e justificativa; motivo visível aos autorizados |
| Mudança de responsáveis | Registrar alterações de atribuição |
| Exclusão | Preservar registros históricos após operação |

RF-143 exige histórico das alterações e ações. O schema e a enumeração exaustiva de eventos de edição, prioridade, checklist, compartilhamento, exclusão e restauração ainda precisam ser detalhados. Não exige motivo para toda alteração nem comentários de usuário como substituto de auditoria.

Pino é log operacional; não substitui o histórico de domínio. ADR-0010 adia auditoria específica, enquanto esta fonte exige histórico no MVP. A divergência já existe na plataforma e permanece explícita para conciliação.

## Retenção e apresentação

Período visual de encerradas no quadro é trinta dias por padrão, configurável, sem exclusão automática. Retenção/recuperação de excluídos é outra política da instância. Não apagar tarefa apenas por deixar de aparecer no quadro nem prometer retenção histórica ilimitada.

Restauração deve preservar histórico; estado, responsáveis, compartilhamento e lembretes após recuperação precisam de regra. Exclusão de conta também deve observar referências históricas e anonimização da plataforma.

## Portabilidade

Exportação individual inclui registros pessoais de módulos nativos na abrangência definida pela plataforma. Não é autorização para exportar integralmente todas as tarefas compartilhadas com o titular. Estrutura de histórico, atribuições, descrição formatada e lembretes no arquivo ainda a especificar.

Não há exportação independente de tarefas para PDF/CSV, sincronização de agenda ou relatório avançado aprovados nesta fonte.

## Outros módulos

Calendário interno de vencimentos não obriga integração com Arakatu. A especificação não exige fonte de dados para Okape. Urukum referencia consistência de editor com Mutyrão; isso permite alinhar experiência sem fixar biblioteca nem estender as capacidades de outros módulos por inferência.

O módulo funciona independentemente dos demais módulos domésticos. Não exige serviço de mensageria externa, armazenamento de anexos ou ferramenta de projetos de terceiros.
