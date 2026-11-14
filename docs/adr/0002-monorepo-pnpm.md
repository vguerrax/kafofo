# ADR-0002: Monorepo com pnpm Workspaces

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

Frontend, backend e contratos precisam evoluir em conjunto.

## Decisão

Organizar o código em monorepo gerenciado por pnpm Workspaces.

## Consequências e riscos

Facilita alterações coordenadas e padronização. Pacotes compartilhados podem gerar acoplamento e dependências circulares.

## Alternativas de referência

Repositórios separados; gerenciadores de monorepo adicionais.

## Validação e pontos em aberto

A estrutura exata de diretórios e os pacotes compartilhados serão definidos na implementação; não há adoção confirmada de Nx ou Turborepo.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

