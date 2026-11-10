# ADR-0009: Múltiplos núcleos e níveis de administração

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

Uma instalação pode servir mais de um núcleo doméstico, com membros e configurações independentes.

## Decisão

Suportar múltiplos núcleos por instalação, administradores globais da instância e administradores por núcleo. Cada núcleo tem configurações, membros e permissões próprios. No MVP, criar residências é atribuição administrativa; permissões administrativas são fixas, com granularidade futura.

## Consequências e riscos

Permite compartilhar a instalação, mas amplia o risco de acesso cruzado. Uma sessão autenticada não comprova autorização para qualquer núcleo ou residência.

## Alternativas de referência

Uma instalação limitada a um único núcleo; permissões granulares completas no MVP.

## Validação e pontos em aberto

O mecanismo técnico de isolamento não foi confirmado: não se presume RLS, banco ou schema por núcleo. Como requisito derivado, testar acesso cruzado e verificar o vínculo do usuário no backend em cada operação protegida.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

