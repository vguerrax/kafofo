# ADR-0020: Bibliotecas complementares do frontend

- **Status:** Pendente
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

React, TypeScript e Vite estão aprovados; escolhas adicionais ainda não foram confirmadas.

## Decisão

Não há escolha fechada para biblioteca visual, CSS, estado remoto, estado global e formulários. shadcn/ui, Tailwind CSS, TanStack Query, Zustand, React Hook Form e Zod no frontend foram recomendados e permanecem pendentes.

## Consequências e riscos

Evita transformar sugestões em obrigações. Implementar componentes dependentes dessas escolhas antes da decisão pode gerar retrabalho.

## Alternativas de referência

Combinações das bibliotecas citadas; recursos nativos de React e CSS, conforme necessidade.

## Validação e pontos em aberto

Avaliar acessibilidade, manutenção, custo de dependências e necessidades reais. Aprovar cada responsabilidade sem assumir que todas exigem uma biblioteca. TypeBox na API não aprova Zod no frontend.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

