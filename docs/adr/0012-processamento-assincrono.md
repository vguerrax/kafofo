# ADR-0012: Processamento assíncrono no processo Fastify com PostgreSQL

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

O MVP precisa executar trabalho assíncrono sem acrescentar infraestrutura dedicada de filas.

## Decisão

Executar inicialmente o processamento assíncrono no próprio processo Fastify, com PostgreSQL como suporte de persistência. Worker separado é uma evolução futura. Redis e RabbitMQ não são dependências obrigatórias.

## Consequências e riscos

Reduz serviços, mas as tarefas disputam recursos com as requisições. Reinícios, duplicidade de execução e retomada precisam ser tratados; execução apenas em memória não oferece persistência.

## Alternativas de referência

Worker separado desde o início; broker de mensagens obrigatório.

## Validação e pontos em aberto

Biblioteca, schema de tarefas, agendamento e garantias de entrega não estão definidos. Como requisitos derivados, especificar idempotência, concorrência, retomada e tentativas antes de usar esse mecanismo em rotinas críticas.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

