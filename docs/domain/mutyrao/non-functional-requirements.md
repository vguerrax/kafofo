# Mutyrão — Requisitos não funcionais

A fonte não possui IDs de RNF próprios. Referenciar os requisitos existentes da plataforma sem renumerar como novas decisões do módulo.

| Referência da plataforma | Aplicação |
| --- | --- |
| RNF-001–006 | Interface responsiva e PWA; conexão com servidor necessária; indicação de indisponibilidade; sem edição offline no MVP |
| RNF-007–012 | Referência WCAG 2.2 AA, teclado, tecnologias assistivas, contraste, feedback e consistência de componentes |
| RNF-013–020 | pt-BR, estrutura para internacionalização, localização e fusos; relação entre vencimento e lembretes precisa de refinamento |
| RNF-021–025 | Armazenamento na instância, isolamento, separação de identidade, backup e portabilidade na abrangência autorizada |

## Orientações técnicas derivadas

Editor de conteúdo formatado deve proteger apresentação de texto e links segundo a política de segurança da aplicação. Checkbox deve ser operável por teclado e ter estado acessível. Visualização em quadro/calendário não deve tornar informação disponível apenas por cor, arraste ou interação de ponteiro.

Validar autorização no backend em ações, buscas, histórico, lembretes e notificações. Preservar consistência entre mudança de status e registro histórico. Tratar edições concorrentes de responsáveis, descrição/checklist e prazos. Agendamentos persistentes precisam de retomada e deduplicação para evitar notificações indevidas.

Essas orientações não aprovam biblioteca de editor, mecanismo de lock, outbox, RLS, WebSocket ou serviço externo obrigatório.

## Limites

Não há metas aprovadas de latência, volume de tarefas, quantidade de responsáveis, número de lembretes, atraso tolerável de entrega, tamanho de conteúdo ou desempenho dos filtros. Não prometer edição simultânea em tempo real, entrega exatamente uma vez ou suporte universal de push.

Cenários de aceitação são verificações futuras, não resultados de testes ou comprovação de conformidade.
