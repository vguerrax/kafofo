# ADR-0014: TypeScript estrito e ferramentas de qualidade

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

Contribuições precisam seguir convenções verificáveis de tipagem e estilo.

## Decisão

Adotar TypeScript em modo strict, ESLint e Prettier. Usar Husky e lint-staged para verificações locais.

## Consequências e riscos

Reduz inconsistências. Hooks locais podem ser ignorados e não garantem que uma contribuição passou nas verificações.

## Alternativas de referência

Convenções apenas documentais; verificação exclusivamente manual.

## Validação e pontos em aberto

As verificações relevantes devem estar no CI. Regras específicas e versões serão definidas na configuração; não se considera uma configuração existente apenas pela aprovação desta ADR.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

