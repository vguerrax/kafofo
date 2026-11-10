# Instruções para agentes — Kafofo

## Contexto e fontes

Kafofo é uma plataforma doméstica modular e self-hosted. Comece por `docs/README.md`, pelo domínio afetado e pelas ADRs correspondentes. Documentação não comprova implementação. Preserve IDs de requisitos e diferencie decisões aceitas, condicionadas e pendentes.

O backlog oficial está nas Issues de `vguerrax/kafofo`. O GitHub Project, quando configurado, mantém a etapa de execução. Não criar backlog paralelo em arquivos, labels de status ou comentários. A issue #1 contém o recorte e as decisões aprovadas da Alpha 1; a issue #2 acompanha a configuração do quadro. Enquanto ela não estiver concluída, não presumir que uma issue aberta está pronta para implementação.

## Antes de trabalhar

1. Ler a issue solicitada, seus comentários, dependências e PRs, além do Status no Project quando disponível.
2. Confirmar atribuição com o mantenedor/coordenador antes de executar trabalho concorrente. Comentário ou assignee, isoladamente, não são trava atômica entre agentes.
3. Obter `develop` atualizada e criar uma branch específica para a issue. Não usar uma cópia antiga como evidência do estado atual do backlog.
4. Se não houver acesso ao GitHub, informar a limitação; não inventar status, copiar tarefas para arquivos ou executar decisões ainda pendentes como aprovadas.

## Implementação e revisão

- Respeitar limites do monólito modular e contratos. Não ampliar o escopo para todos os módulos durante a Alpha 1.
- Better Auth/adaptador 1.7.18 foram aceitos para a Alpha 1 com as adaptações e regressões da ADR-0008. Não montar o handler genérico nem copiar o laboratório como implementação definitiva. Dependências, licença e outras decisões pendentes não estão aprovadas apenas por aparecerem nas ADRs.
- Validar autorização no backend, inclusive histórico, contagens, lixeira e operações em lote. Papéis administrativos não concedem conteúdo privado automaticamente.
- Aplicar testes proporcionais ao risco; não afirmar que critérios de aceitação foram testados sem evidências. Alterações documentais exigem verificação de links e coerência.
- Documentar mudança de comportamento no domínio e citar a issue; não repetir descrição e status de tarefas em Markdown.
- Criar PR para `develop` com `Refs #<numero>`, resumo, validação e limitações. Evitar palavras de fechamento automático enquanto houver entrega pendente de publicação.

## Conclusão

Merge de funcionalidade leva a Aguardando publicação, não a Concluída. Registrar versão/tag, commit efetivamente distribuído e verificação do ambiente piloto antes de concluir. Documentação, POCs e configuração podem concluir com resultado revisado e evidências próprias. Não atribuir data ou commit de produção ao commit que apenas atualizou documentação.

Não publicar versões, alterar políticas de acesso, escolher licença pendente ou integrar mudanças fora do escopo solicitado por inferência a partir deste arquivo.
