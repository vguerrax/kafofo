# Contribuindo com o Kafofo

O projeto está iniciando a implementação. Leia o [índice](docs/README.md) e a [Alpha 1](https://github.com/vguerrax/kafofo/issues/1) antes de propor trabalho.

## Fluxo

1. Abra ou localize uma issue. Informe problema, resultado esperado, escopo e critérios verificáveis; referencie requisitos quando houver.
2. Aguarde refinamento e atribuição antes de iniciar implementação que dependa de decisões abertas.
3. Use uma branch específica baseada em `develop` atualizada; contribuições externas podem usar fork.
4. Abra PR para `develop`, referenciando a issue com `Refs #N` e descrevendo resultado, validação e limitações.
5. Após revisão, funcionalidades integradas aguardam publicação e verificação. Fechar a issue antes disso não representa entrega concluída.

Issues são a fonte das tarefas; o Project mantém etapas, quando configurado. Consulte o [contrato do backlog](docs/contributing/backlog.md) e as [instruções para agentes](AGENTS.md).

## Documentação e arquitetura

Atualize os documentos de domínio quando alterar comportamento. Preserve IDs e fontes históricas. Mudanças em ADR aceita exigem registro sucessor e indicação da substituição. Não tratar proposta ou escolha condicionada como aprovação.

## Validação

Documentação: verifique links relativos, referências e coerência. Código: execute `pnpm check`, os testes de banco e os percursos de navegador descritos no [guia de CI](docs/development/ci.md). Os checks `Qualidade` e `Integração e navegador` devem passar antes da integração, além da revisão. O guia distingue essa regra de trabalho da proteção de branch configurada no GitHub.

## Licença

A licença de distribuição ainda está pendente na ADR-0022. O repositório público não deve ser apresentado como tendo uma licença já escolhida; essa decisão precisa preceder distribuição pública com permissões explícitas.
