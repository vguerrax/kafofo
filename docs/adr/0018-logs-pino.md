# ADR-0018: Logs estruturados com Pino

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

A instalação precisa oferecer evidência operacional sem uma plataforma de observabilidade obrigatória.

## Decisão

Usar Pino integrado ao Fastify para logs estruturados, com níveis configuráveis. Prometheus, Grafana e serviços adicionais de monitoramento não serão obrigatórios inicialmente.

## Consequências e riscos

Facilita análise de falhas. Logs podem expor dados pessoais ou crescer sem controle; não substituem auditoria de domínio nem métricas.

## Alternativas de referência

Logs sem estrutura; stack completa de monitoramento obrigatória no MVP.

## Validação e pontos em aberto

Como orientação derivada, definir redação de credenciais e dados sensíveis, correlação de requisições, rotação e retenção. Não presumir que o histórico de segurança já está implementado pelos logs.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

