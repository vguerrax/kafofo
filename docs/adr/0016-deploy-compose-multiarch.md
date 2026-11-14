# ADR-0016: Implantação com Docker Compose e imagens multi-arquitetura

- **Status:** Aceita
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

O Kafofo será auto-hospedado em VPS, mini PCs e Raspberry Pi.

## Decisão

Usar Docker Compose como estratégia padrão de implantação. As imagens devem suportar amd64 e arm64.

## Consequências e riscos

Simplifica a composição dos serviços. Suporte às duas arquiteturas exige verificar dependências e imagens base; a imagem compilar não comprova funcionamento no hardware de destino.

## Alternativas de referência

Kubernetes como requisito; instalação manual como único caminho; imagens apenas amd64.

## Validação e pontos em aberto

Não há SLA de desempenho por hardware nem suporte implícito a ARM de 32 bits. Registry, publicação de releases, versões de imagens e automação de atualização continuam por definir.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

