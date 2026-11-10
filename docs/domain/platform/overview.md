# Plataforma — Visão geral

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


## Objetivo e posicionamento

Kafofo é uma plataforma de organização e administração da vida doméstica compartilhada, com proposta open-source, self-hosted e modular. Atende pessoas sozinhas, casais, famílias, moradias compartilhadas e pessoas que administram residências nas quais não moram.

Reúne funcionalidades próprias e integrações com serviços especializados. A pessoa mantém autonomia sobre sua instalação e seus dados, sem obrigação de abandonar serviços que já utiliza. O acesso pode ocorrer na rede local, com acesso remoto opcional. Atualizações ficam sob responsabilidade do operador da instalação. A licença de distribuição continua pendente na ADR-0022.

## Fronteira da plataforma

| Responsabilidade | Plataforma | Módulos |
| --- | --- | --- |
| Identidade | Conta individual, autenticação, sessões e recuperação | Usam a identidade comum |
| Organização doméstica | Núcleos, residências, membros, papéis e contexto | Associam registros aos contextos pertinentes |
| Acesso | Isolamento, privacidade e validação contextual | Aplicam também as restrições específicas dos próprios registros |
| Administração | Configuração da instância, disponibilidade e ativação de módulos | Configurações e operações próprias |
| Serviços comuns | Notificações, auditoria administrativa e de segurança, exportação e ciclo de dados | Definem eventos, dados exportáveis e históricos de domínio |
| Navegação | Seletor de contexto e experiência integrada | Telas específicas e composição de painéis pelo Okape |
| Integrações | Princípios de falha isolada, contexto e autorização | Protocolos e operações de cada integração |

A composição de painéis pertence ao Okape; o seletor global de contexto pertence à plataforma. O dashboard não deve ser tratado como um conjunto de cartões fixos: a especificação do Okape define painéis vazios, múltiplos e configuráveis.

## Atores

| Ator | Responsabilidade ou acesso definido |
| --- | --- |
| Operador da instalação | Implantação, atualizações e backups; atuação técnica sobre o servidor |
| Administrador global | Administração funcional da instância e disponibilidade de módulos |
| Administrador de núcleo | Administração do núcleo, convites, residências e recuperação assistida de membros |
| Membro de núcleo | Participação conforme papéis e permissões; não precisa morar em residência vinculada |
| Responsável por residência | Administração de informações, configurações e acessos daquela residência |
| Colaborador de residência | Consulta e atualização de informações permitidas |
| Visualizador de residência | Consulta de informações permitidas |
| Titular da conta | Perfil, dados pessoais, preferências, segurança e espaço pessoal |
| Identidade de integração | Identidade distinta da pessoa e da identidade doméstica compartilhada |

Operador e administrador global podem ser a mesma pessoa, mas são responsabilidades distintas. A restrição de acesso pela aplicação não é promessa de isolamento contra quem controla diretamente banco, disco e servidor.

## Escopo do MVP

Inclui múltiplos núcleos por instância; várias residências por núcleo; conta pessoal independente; papéis fixos; convites; saída e remoção de membros; exclusão lógica e recuperação; perfil privado; sessões; recuperação de senha sem depender de e-mail pessoal; 2FA TOTP opcional; módulos e contextos; notificações internas, e-mail e push; auditoria; exportação; interface responsiva, PWA e acessibilidade.

Autenticação federada e recuperação por e-mail constam do levantamento, mas seus provedores e fluxos não estão especificados. E-mail não é requisito para possuir uma conta. A escolha do Better Auth permanece condicionada à POC.

## Limites e evolução

Ficam fora do MVP: permissões personalizadas por pessoa, associação simultânea de uma residência a vários núcleos, funcionamento offline, aplicativos móveis nativos, chat e mensagens privadas, canais WhatsApp/Telegram e sincronização bidirecional de agenda. A arquitetura deve permitir evolução sem disponibilizar antecipadamente essas capacidades.

O compartilhamento seletivo existe como princípio geral, com restrições por módulo. Não representa autorização universal para compartilhar registros entre quaisquer pessoas ou contextos.
