# ADR-0011: Armazenamento de arquivos em disco local

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

A instalação inicial deve evitar serviços adicionais obrigatórios para armazenar arquivos.

## Decisão

Armazenar arquivos inicialmente em disco local. MinIO ou outro serviço de objetos não será obrigatório. Integração opcional com S3 ou compatível poderá ser avaliada futuramente.

## Consequências e riscos

Simplifica instalação. Vincula disponibilidade e capacidade ao armazenamento do host; banco e arquivos precisam ser considerados juntos na recuperação.

## Alternativas de referência

MinIO obrigatório; serviço S3 obrigatório.

## Validação e pontos em aberto

Como orientação derivada, persistir os arquivos fora da camada efêmera dos containers e controlar acesso pelo backend. Layout, limites, tipos permitidos e política de backup ainda serão definidos.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

