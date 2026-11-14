# ADR-0019: Web responsiva, PWA e evolução por integrações

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

O Kafofo deve funcionar como hub doméstico sem exigir que todos os serviços sejam reimplementados ou que usuários migrem seus dados de imediato.

## Decisão

Priorizar web responsiva e PWA. Funcionamento offline fica para evolução. Priorizar serviços externos para as integrações iniciais, evoluindo serviços próprios posteriormente. A agenda deve permitir uso pessoal e exportação ou integração com serviço do usuário; o fluxo de integração no MVP é unidirecional.

## Consequências e riscos

Permite entregas incrementais. Dependências externas trazem indisponibilidade e diferenças de capacidade. Instalar a PWA não implica suporte offline nem sincronização bidirecional.

## Alternativas de referência

Aplicativos nativos iniciais; reimplementar todos os serviços; obrigar migração de agenda.

## Validação e pontos em aberto

Provedores, protocolos e direção exata de cada integração ainda precisam ser especificados. Não há aprovação implícita de servidor de e-mail, CalDAV, broker ou protocolo específico.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

