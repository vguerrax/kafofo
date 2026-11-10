# ADR-0003: Backend com Fastify e TypeScript

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

O backend precisa oferecer a API e organizar as regras dos módulos do Kafofo.

## Decisão

Usar Fastify com TypeScript no backend. A escolha pertence ao Kafofo e não herda a stack Python/FastAPI dos demais produtos do autor.

## Consequências e riscos

Concentra frontend e backend na mesma linguagem. Tipos estáticos não substituem validação em execução, autorização nem testes de domínio.

## Alternativas de referência

Backend Python/FastAPI; outros frameworks Node.js.

## Validação e pontos em aberto

A versão do runtime Node.js e das dependências não foi fixada neste registro. Devem ser definidas na implementação.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

