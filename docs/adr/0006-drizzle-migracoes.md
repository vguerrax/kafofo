# ADR-0006: Drizzle ORM e Drizzle Kit

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

O acesso ao PostgreSQL e as mudanças de schema precisam acompanhar a evolução do código.

## Decisão

Usar Drizzle ORM para acesso a dados e Drizzle Kit para gerenciamento das migrações.

## Consequências e riscos

Alinha persistência ao TypeScript e torna alterações de schema rastreáveis. Migrações ainda precisam de revisão; a ferramenta não garante reversibilidade nem ausência de perda de dados.

## Alternativas de referência

SQL manual como única camada; outros ORMs.

## Validação e pontos em aberto

Como orientação derivada, versionar e revisar migrações. Estratégia de execução no deploy, compatibilidade entre versões e recuperação de falhas ainda precisa ser especificada.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

