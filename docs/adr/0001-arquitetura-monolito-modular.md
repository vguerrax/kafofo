# ADR-0001: Monólito modular

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

O Kafofo precisa reunir funções domésticas sem tornar a instalação e a manutenção desproporcionais ao uso em uma residência.

## Decisão

Adotar um monólito modular, com módulos internos e contratos explícitos. Manter uma aplicação React única consumindo o backend. A separação lógica dos módulos não implica processos ou serviços independentes.

## Consequências e riscos

Reduz a complexidade operacional e permite evolução incremental. O risco principal é a separação existir apenas nas pastas e o domínio ficar acoplado por acessos internos indiscriminados.

## Alternativas de referência

Microsserviços desde o MVP; aplicação sem limites internos definidos.

## Validação e pontos em aberto

Como orientação derivada, explicitar as interfaces entre módulos e revisar dependências. Extração de serviços exige nova decisão baseada em necessidade concreta.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

