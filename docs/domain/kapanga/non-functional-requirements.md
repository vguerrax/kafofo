# Kapanga — Requisitos não funcionais

Kapanga não recebeu uma numeração própria de RNF na fonte. Este documento referencia os RNF existentes da plataforma e identifica orientações técnicas derivadas, sem criar novos IDs como se estivessem aprovados.

| Referência da plataforma | Aplicação ao Kapanga |
| --- | --- |
| RNF-001–006 | Interface responsiva e PWA; conexão com servidor necessária; feedback de conectividade; sem edição offline no MVP |
| RNF-007–012 | Referência WCAG 2.2 AA, teclado, tecnologias assistivas, contraste, feedback e padrões consistentes |
| RNF-013–020 | pt-BR inicial, estrutura para internacionalização, localização e fusos; referência temporal dos indicadores ainda a especificar |
| RNF-021–023 | Dados na instância, separação da identidade e isolamento contextual |
| RNF-024 | Backup configurável; recuperação consistente de registros, vínculos e históricos, conforme procedimento a definir |
| RNF-025 e RF-122–123 | Portabilidade de núcleo e individual na abrangência autorizada, sem inferir relatório financeiro próprio |

## Orientações derivadas de integridade

- Representar valores monetários sem erro acumulado de ponto flutuante; tipo, escala, arredondamento e moeda devem ser definidos antes dos contratos finais.
- Preservar consistência entre mudança financeira e auditoria; definir atomicidade e tratamento de falha para operações em cadeia.
- Evitar geração duplicada de ocorrências após reinício ou execução concorrente; definir estratégia idempotente compatível com PostgreSQL.
- Impedir corrida entre pagamento, alteração de valor, reversão e exclusão em lote.
- Usar regras consistentes para datas e referência temporal, evitando mudar um vencimento civil por conversão ingênua de timestamp.
- Validar regras no backend e nos contratos, incluindo requisições que contornem bloqueios da interface.

Essas orientações não aprovam mecanismo de lock, nível de isolamento, outbox, tipo SQL específico ou biblioteca adicional.

## Limites de verificação

Não foram aprovadas metas de latência, volume de despesas, duração de lotes, limite de parcelas, histórico máximo, disponibilidade ou prazo de geração. A arquitetura define direção tecnológica, sem comprovar desempenho ou conformidade. Critérios de aceitação ainda não foram executados.
