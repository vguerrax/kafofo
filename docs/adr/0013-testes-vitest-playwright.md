# ADR-0013: Testes com Vitest e Playwright

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

O Kafofo precisa verificar regras, integrações e fluxos de uso.

## Decisão

Usar Vitest e Playwright como ferramentas de testes, compondo a verificação automatizada do projeto.

## Consequências e riscos

Permite verificar comportamento em diferentes camadas. Testes de ponta a ponta podem se tornar lentos e instáveis quando repetem verificações melhor cobertas em camadas inferiores.

## Alternativas de referência

Somente testes manuais; uma única ferramenta para todas as camadas.

## Validação e pontos em aberto

A distribuição sugerida é Vitest para testes unitários e de integração e Playwright para fluxos no navegador. Metas de cobertura, matriz de navegadores e fixtures ainda precisam ser definidas. Priorizar isolamento de núcleos, permissões e recuperação de acesso.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

