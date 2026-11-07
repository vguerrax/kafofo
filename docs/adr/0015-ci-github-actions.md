# ADR-0015: Integração contínua com GitHub Actions

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

Pull Requests precisam de verificações repetíveis antes da integração.

## Decisão

Usar GitHub Actions para executar em Pull Requests testes, análise estática, verificação de tipos, build e validação de contratos OpenAPI.

## Consequências e riscos

Oferece um ponto comum de verificação. Tempo de execução, custos e manutenção dos workflows precisam ser controlados.

## Alternativas de referência

Executar verificações apenas localmente; outro provedor de CI.

## Validação e pontos em aberto

O [workflow CI](../../.github/workflows/ci.yml) executa qualidade, persistência e navegador em PRs, incluindo a POC de autenticação. O [guia operacional](../development/ci.md) documenta os checks e sua reprodução local. Proteção de branches e exigência automática dos checks dependem da configuração do repositório pelo mantenedor; a presença do workflow não comprova esse bloqueio. A aprovação de CI não inclui entrega ou implantação automática; ver ADR-0021.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

