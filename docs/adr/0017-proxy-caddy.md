# ADR-0017: Caddy como proxy reverso

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

A implantação precisa de entrada HTTP/HTTPS com configuração simples.

## Decisão

Usar Caddy como proxy reverso padrão, com HTTPS automático.

## Consequências e riscos

Reduz configuração de entrada e certificados. A obtenção de certificados depende das condições do ambiente; a decisão não garante emissão automática para qualquer endereço local.

## Alternativas de referência

Nginx; Traefik; exposição direta do backend.

## Validação e pontos em aberto

Como orientação derivada, documentar implantação pública e acesso local separadamente. Domínio, rede, configuração de certificados e persistência de dados do Caddy devem ser definidos no guia operacional.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

