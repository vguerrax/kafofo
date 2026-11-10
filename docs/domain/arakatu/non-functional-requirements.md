# Arakatu — Requisitos não funcionais

Não há RNF próprios numerados de Arakatu na fonte. Aplicam-se os da plataforma, sem renumeração ou metas inventadas.

| Referência da plataforma | Aplicação |
| --- | --- |
| RNF-001–006 | Responsividade, PWA compatível e dependência de conexão com servidor; feedback de indisponibilidade |
| RNF-007–012 | WCAG 2.2 AA como referência, teclado, tecnologias assistivas, contraste, feedback e consistência |
| RNF-013–020 | pt-BR, internacionalização/localização, fuso por usuário/residência, conversão, preservação de origem e horário de verão |
| RNF-021–025 | Armazenamento na instância, isolamento, identidade separada, backup e exportação autorizada |

## Orientações técnicas derivadas

Distinguir datas civis, horários locais, fusos e instantes antes de escolher representação persistida. Validar expansão de séries e exceções em mudanças de fuso, meses de durações diferentes e horário de verão. Definir identidade estável para evitar duplicação na importação/assinatura.

Proteger autorização também em feeds, exportações e lembretes. Tratar conteúdo importado como dados a validar, preservando erro de importação sem corromper registros existentes. Definir limites operacionais de importação/expansão sem inventar quotas de produto aprovadas.

Essas orientações não aprovam biblioteca, formato SQL, nível de transação, serviço CalDAV ou protocolo de atualização em tempo real.

## Limites de validação

Sem metas aprovadas de volume de eventos, janela de expansão, intervalo de atualização, latência de lembretes, navegadores, compatibilidade de provedores, disponibilidade ou desempenho. Não declarar suporte a qualquer arquivo/servidor iCalendar ou conformidade CalDAV completa sem contrato e verificação.

Os cenários de aceitação descrevem verificações futuras; vários dependem de detalhamento funcional. Não há testes executados ou comprovação de conformidade nesta entrega.
