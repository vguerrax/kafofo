# ADR-0007: Contratos com TypeBox e OpenAPI 3.1

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

Frontend e backend precisam de contratos verificáveis para reduzir divergências de integração.

## Decisão

Usar TypeBox na definição dos schemas da API e OpenAPI 3.1 para documentar seus contratos. Validar os contratos no CI.

## Consequências e riscos

Aproxima validação e documentação. Há risco de divergência se o documento e as rotas forem mantidos por caminhos independentes.

## Alternativas de referência

Documentação manual desconectada; contratos apenas em tipos TypeScript.

## Validação e pontos em aberto

O mecanismo exato de geração, validação e eventual geração de cliente ainda será implementado. Política de versionamento da API e detecção de alterações incompatíveis não estão definidas.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

