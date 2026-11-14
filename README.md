# Kafofo

Plataforma modular de organização e administração da vida doméstica compartilhada, com proposta open-source e self-hosted.

O repositório reúne a documentação funcional e arquitetural e a fundação executável da Alpha 1. Comece pelo [índice da documentação](docs/README.md) ou pelo [guia de desenvolvimento local](docs/development/README.md).

## Navegação

- [Plataforma](docs/domain/platform/README.md): identidade, núcleos, residências, permissões e serviços comuns.
- [Kapanga](docs/domain/kapanga/README.md): despesas domésticas.
- [Kitanda](docs/domain/kitanda/README.md): listas de compras.
- [Mutyrão](docs/domain/mutyrao/README.md): tarefas domésticas.
- [Arakatu](docs/domain/arakatu/README.md): calendário e agenda.
- [Okape](docs/domain/okape/README.md): composição de painéis.
- [Urukum](docs/domain/urukum/README.md): notas digitais.
- [Kitute](docs/domain/kitute/README.md): cadernos de receitas.
- [Decisões de arquitetura](docs/adr/README.md).
- [Identidade de marca](docs/brand/README.md).

A documentação descreve o MVP pretendido. Critérios de aceitação não são testes executados. Better Auth foi aceito para a Alpha 1 com as adaptações da [ADR-0008](docs/adr/0008-autenticacao-better-auth.md); bibliotecas complementares do frontend e CD continuam pendentes conforme as ADRs. O código do Kafofo é licenciado sob [GNU AGPL v3](LICENSE). A primeira release pública aguarda a navegação da Alpha 2 e a [verificação de distribuição](docs/operations/distribution.md).

**Consolidação do conjunto:** 2026-11-04. As datas originais dos documentos foram preservadas.

## Desenvolvimento e contribuições

- [Alpha 1: escopo e decisões](https://github.com/vguerrax/kafofo/issues/1).
- [Backlog oficial](https://github.com/vguerrax/kafofo/issues).
- [Como contribuir](CONTRIBUTING.md).
- [Regras para agentes](AGENTS.md).

A aplicação contém API Fastify, frontend React, contratos TypeBox e configuração inicial, login, logout e troca autenticada de senha da [#7](https://github.com/vguerrax/kafofo/issues/7). A #8 acrescenta núcleos, residências e autorização contextual. Convites e recuperação de senha permanecem nas tarefas correspondentes. O [GitHub Project](https://github.com/users/vguerrax/projects/1) mantém as etapas de execução; disponibilidade do código não comprova publicação da Alpha 1.
