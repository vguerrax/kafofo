# ADR-0005: PostgreSQL como banco de dados

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

Dados de usuários, núcleos, residências e módulos precisam de persistência transacional.

## Decisão

Adotar PostgreSQL como banco do Kafofo.

## Consequências e riscos

Permite transações e integridade referencial. Acrescenta um serviço à instalação e exige políticas de manutenção e recuperação.

## Alternativas de referência

SQLite como banco inicial; múltiplos bancos desde o MVP.

## Validação e pontos em aberto

A decisão não define versão, topologia de alta disponibilidade nem isolamento por schema ou banco. O mecanismo de isolamento entre núcleos permanece por detalhar na ADR-0009.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

