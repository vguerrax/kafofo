# Mutyrão — Visão geral

Mutyrão permite organizar, compartilhar e acompanhar tarefas da vida doméstica nos contextos pessoal, núcleo e residência. Prioriza colaboração, simplicidade e rastreabilidade, sem procedimentos burocráticos desnecessários.

O nome é uma adaptação de marca de “mutirão”, associada a trabalho coletivo. A personalidade definida é colaborativa, brasileira, descontraída e participativa. Mutyrão é grafia estilizada, não apresentada como forma original em tupi. Esta entrega preserva a definição de marca sem validação etimológica adicional.

## Capacidades do MVP

Cadastro com nome obrigatório, descrição formatada opcional e checkboxes interativos; prazo opcional; prioridade baixa/normal/alta, com normal como padrão; categoria opcional; múltiplos responsáveis ou nenhum; compartilhamento por contexto ou com pessoas específicas; edição colaborativa; conclusão integral, cancelamento com justificativa e reabertura sem justificativa.

Inclui histórico; lista, quadro por status e calendário por vencimento; filtros, pesquisa e ordenação consistentes entre visualizações; notificações para atribuições, alterações, conclusão/cancelamento e prazos; lembretes individuais; exclusão lógica confirmada e restauração autorizada.

## Atores e fronteiras

| Ator/componente | Responsabilidade conhecida |
| --- | --- |
| Criador | Registra tarefa; não possui exclusividade de edição |
| Responsável | Compartilha responsabilidade com os demais; pode concluir a tarefa inteira e configurar seus lembretes |
| Usuário autorizado com edição | Atualiza informações e pode atribuir/assumir tarefa sem responsável |
| Usuário com acesso | Pode cancelar e reabrir nos termos da fonte, observadas permissões e conflito com visualizador da plataforma |
| Usuário autorizado a restaurar | Recupera tarefa excluída; papel exato ainda a detalhar |
| Núcleo | Pode criar categorias personalizadas; papel criador não foi restringido expressamente a administrador |
| Plataforma | Identidade, contextos, papéis, ativação, notificações e ciclo de dados |
| Mutyrão | Tarefas, atribuições, estados, prazos, checkboxes e eventos de domínio |

Responsabilidade não é autorização universal de acesso, e autoria não é propriedade exclusiva. Atribuir pessoa sem acesso ou compartilhar com pessoas fora do contexto não possui semântica completa definida.

## Fora do MVP

Recorrência automática, anexos/arquivos, comentários/conversas, modelos ou estruturas predefinidas de tarefas e conclusão automática por checkboxes. Não há subtarefas autônomas, divisão de conclusão por responsável ou aplicativo nativo definidos como requisitos.

A visualização em calendário é do Mutyrão: não exige criar evento na agenda Arakatu. Ações simples não requerem justificativa, com exceção deliberada de cancelamento. Restauração e exclusão não são sinônimos de reabertura ou cancelamento.
