# ADR-0021: Entrega e implantação contínuas

- **Status:** Pendente
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

GitHub Actions foi aprovado para CI e Docker Compose para implantação, mas a ligação entre esses fluxos não foi definida.

## Decisão

A estratégia de CD permanece em aberto. Não se considera aprovado publicar imagens, atualizar instalações ou executar migrações automaticamente.

## Consequências e riscos

Permite decidir o controle de atualização adequado à auto-hospedagem. Automatizar sem uma política de recuperação pode tornar uma falha de release difícil de reverter.

## Alternativas de referência

Releases e atualização manuais; publicação automatizada com atualização manual; implantação automática em ambientes controlados.

## Validação e pontos em aberto

Definir registry, tags, publicação multi-arquitetura, migrações, recuperação de falhas e responsabilidades de atualização. Registrar a escolha antes de promover o status desta ADR.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

