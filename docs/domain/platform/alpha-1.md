# Plataforma — Contrato aprovado da Alpha 1

**Aprovação:** 2026-11-06 · **Decisões:** issues [#1](https://github.com/vguerrax/kafofo/issues/1) e [#3](https://github.com/vguerrax/kafofo/issues/3).

Este documento fixa o comportamento aprovado do incremento. Prevalece para a Alpha 1 onde a documentação geral do MVP ainda apresenta lacunas ou capacidades mais amplas. Não comprova implementação, POC ou testes. Não mantém tarefas nem status; execução continua nas Issues e no Project.

## Escopo e adiamentos

Entregar identidade, núcleo, residência, convites, autorização, recuperação, auditoria, exportação individual e operação necessários às [listas de residência do Kitanda](../kitanda/alpha-1.md). Preservar isolamento multínúcleo na estrutura e nos testes; o piloto com uma residência não limita o domínio a uma única residência ou núcleo.

Interface responsiva e uso por teclado incluídos. Notificações internas, e-mail e push, 2FA, autenticação federada e PWA instalável ficam adiados. Compartilhamento e alteração de acesso têm efeito imediato e confirmação na tela do ator; o destinatário vê conteúdo autorizado na próxima consulta/atualização. O adiamento inclui explicitamente os avisos previstos no MVP para compartilhamento/permissões. Uso offline não faz parte da entrega. Os requisitos adiados continuam no MVP e não devem ser declarados atendidos.

## Primeiro acesso e vínculos

1. Operador obtém no servidor um código de configuração de uso único, válido por 30 minutos. Reemissão invalida o anterior; não colocar o segredo nos logs técnicos comuns.
2. Uma única configuração inicial cria o administrador global. Consumo do código e criação inicial devem impedir duplicação por requisições concorrentes.
3. Essa pessoa cria o primeiro núcleo e residência, tornando-se também administradora desse núcleo e responsável por essa residência.
4. Cadastro livre fica fechado após configuração. Conta nova depende de convite; conta convidada não cria outro núcleo automaticamente.
5. Participação no núcleo não concede acesso automático à residência. Papéis contextuais e acessos são atribuídos explicitamente. Cargo administrativo não concede acesso privado às listas de outras pessoas.

O fluxo da [#7](https://github.com/vguerrax/kafofo/issues/7) cria somente a primeira conta, com papel de administrador global. Não inicia sessão automaticamente: após configurar, a pessoa entra pelo login e acessa o estado inicial sem núcleo ou residência. A criação desses contextos e concessões do passo 3 pertence à [#8](https://github.com/vguerrax/kafofo/issues/8); contas posteriores dependem dos convites da [#9](https://github.com/vguerrax/kafofo/issues/9). Não existe cadastro HTTP público alternativo nem emissão HTTP do código inicial.

Conta é global e independente dos núcleos. Autorização considera sessão, vínculo ativo, papel atual e concessão do recurso, inclusive histórico, resumos, exportação e lixeira.

## Núcleo, residência e autorização contextual

Refinamento da [#8](https://github.com/vguerrax/kafofo/issues/8): conta autenticada pode criar núcleo manualmente, recebendo participação e administração explícitas. Isso não altera a entrada por convite da #9, que não cria núcleo ou residência automaticamente. O primeiro administrador cria seu núcleo e depois a residência, indicando a si como responsável; interrupção entre etapas permite retomar pelo núcleo existente.

| Operação | Ator autorizado na Alpha 1 |
| --- | --- |
| Criar residência e indicar seu responsável inicial | Administrador ativo daquele núcleo |
| Nomear, alterar ou remover responsável | Administrador ativo daquele núcleo |
| Conceder, alterar ou revogar colaborador/visualizador | Responsável ativo da própria residência |
| Alterar papel no núcleo ou remover membro | Administrador ativo daquele núcleo |
| Sair do núcleo | Próprio membro, preservando administrador ativo |

Administrador global somente nomeia responsável se também administrar aquele núcleo. Responsável não nomeia outro responsável nem altera/revoga seu papel. Administrador do núcleo somente gerencia colaboradores/visualizadores quando também é responsável; pode rebaixar/remover um responsável por sua atribuição administrativa. Nomear a si próprio exige concessão explícita. Nenhuma dessas ações concede conteúdo privado de listas.

Residência pertence a um único núcleo; toda concessão exige membro ativo do mesmo núcleo. Participar do núcleo não concede residência. Metadados administrativos de residências são consultáveis por administradores para nomeação de responsáveis, sem autorização implícita para conteúdo.

Saída/remoção encerra as concessões residenciais daquela participação, preservando identidade e vínculos de outros núcleos. Reingresso e reconcessão geram novos IDs de vínculo; compartilhamentos recebidos antigos não devem ser reativados pelo Kitanda. Rebaixamento de papel aplica as capacidades atuais, sem duplicar concessão. A ausência de responsáveis após remoção de membro pode ser resolvida por nova nomeação administrativa.

Núcleo ativo conserva ao menos um administrador: saída, remoção e rebaixamento do último são recusados, inclusive sob concorrência e quando for o único membro. Exclusão/recuperação de núcleos/residências e encerramento do núcleo sem membros não integram a #8; permanecem capacidades do MVP que exigem refinamento próprio.

Nomes são texto simples, com 1–100 caracteres Unicode após trim, sem truncamento; nomes repetidos são aceitos. Endereço e demais campos não são exigidos por esta entrega.

A autorização usa sessão e vínculos atuais no backend; o seletor de contexto não concede acesso. Mutação revalida sessão e papel sob locks, na ordem conta do ator → núcleo → residência, em uma transação/conexão. Revogação concluída impede novas operações; leituras já iniciadas podem refletir o estado anterior. PostgreSQL aplica unicidade ativa e FKs entre residência, participação e núcleo; esta entrega não introduz RLS. Auditoria definitiva permanece na #15.

## Convites

Administrador do núcleo gera link revogável, válido por sete dias e para uma aceitação. Posse do link permite aceitar: não há vínculo obrigatório com e-mail. Pessoa cria conta ou usa uma existente e entra como membro comum, sem administração ou residência automática. Pessoa já participante não duplica vínculo nem consome convite. Consumo concorrente não permite duas aceitações. Link encaminhado pode ser usado por outra pessoa antes do destinatário pretendido; é limitação aceita do recorte.

A [#9](https://github.com/vguerrax/kafofo/issues/9) expõe gestão administrativa e consulta/aceitação sob `/api/platform`. Abrir o link mostra somente o nome do núcleo, sem consumir. Sessão ativa exige confirmação da conta; login existente retorna à confirmação. Cadastro confirma conta, participação e consumo na mesma transação, seguido de login obrigatório. Reingresso cria participação nova, sem restaurar acessos residenciais. Token fica no fragmento, removido ao abrir, e somente em memória durante login; recarga antes da aceitação exige reabrir o original. Após aceitar, conserva-se somente o identificador do núcleo, sujeito à verificação atual de participação no servidor.

## Senhas e sessões

| Aspecto | Regra |
| --- | --- |
| Senha | De 8 a 128 caracteres, sem espaços, tabulações ou quebras de linha; sem composição obrigatória com maiúsculas, números ou símbolos |
| Tratamento | Rejeitar caracteres proibidos com mensagem clara; não remover espaços nem truncar senha silenciosamente |
| Sessão | Expira sete dias após login, exigindo nova autenticação; atividade não reinicia esse prazo |
| Troca autenticada | Exige senha atual e encerra as outras sessões |
| Falhas por conta | Após cinco falhas em 15 minutos, suspender tentativas por 15 minutos; sem bloqueio permanente automático |
| Limite por origem | Até 60 tentativas de login por minuto, considerando contas diferentes |

Aplicar os dois limites de login. Suspensão de tentativas não encerra sessões válidas. A limitação por conta pode causar indisponibilidade temporária provocada por terceiros; esse contraponto foi aceito. Definir origem real com configuração de proxy confiável na implementação, sem aceitar cabeçalho arbitrário como identidade da origem.

Na troca autenticada, falhas da senha atual têm contador próprio por conta, separado do login e compartilhado entre sessões. Cinco falhas em 15 minutos bloqueiam a troca por 15 minutos e revogam todas as sessões, inclusive a causadora, na mesma transação. Novo login não remove esse bloqueio. Senha atual correta limpa falhas anteriores quando não há bloqueio vigente; senha nova inválida não conta como falha de senha atual. Verificar a senha atual antes de validar a nova. Troca bem-sucedida preserva o prazo absoluto da sessão atual, inclusive ao rotacionar o cookie. Essas decisões e os contratos físicos são refinados na [#7](https://github.com/vguerrax/kafofo/issues/7).

Better Auth/adaptador 1.7.18 com Username e adaptações locais foram aceitos após a [POC](../../adr/0008-autenticacao-better-auth.md). Username global usa 3–30 caracteres ASCII: letras, números, ponto, hífen e sublinhado; canonizar letras para minúsculas, sem trim, com unicidade no banco. Nome de exibição é independente. A contagem da senha acompanha unidades UTF-16 da biblioteca; não contar grafemas separadamente. Essa aceitação não inclui login federado.

## Recuperação

- Somente administrador global emite recuperação para outra conta na Alpha 1; administrador de núcleo não possui essa capacidade.
- Link de uso único, validade de 30 minutos; nova emissão invalida o anterior. Até três emissões por conta em uma hora.
- Usuário define sua senha; administrador não escolhe nem visualiza. Entrega manual do link após verificação de identidade pelo administrador.
- Após cinco submissões de senha nova inválida pelo link, invalidá-lo e exigir nova emissão. Isso não autoriza consultas ilimitadas de tokens: a implementação deve proteger também o endpoint e não expor tokens em logs.
- Conclusão encerra todas as sessões anteriores e exige novo login; emissão e uso são auditados sem segredos.
- Recuperação do administrador global por comando local executado pelo operador do servidor, com a mesma política de senha e invalidação de sessões.

## Retenção por categoria

| Categoria | Política da Alpha 1 |
| --- | --- |
| Histórico de listas/itens | Enquanto a lista existir, inclusive nos 30 dias de recuperação |
| Conteúdo de item removido/limpo | Preservar por 30 dias; depois expurgar |
| Evento de remoção do item | Preservar ação, autor e momento enquanto existir histórico da lista; após expurgo do item, sem seu conteúdo |
| Lista excluída | Recuperável por 30 dias; após o prazo, expurgar lista, itens e histórico associado |
| Auditoria administrativa e de segurança | 90 dias, sem senhas ou tokens |
| Logs técnicos | 30 dias, evitando conteúdo de listas e dados sensíveis |

Padrões iniciais sem configuração pela interface. Não aplicar 30 dias indiscriminadamente a todas as categorias. A [ADR-0023](../../adr/0023-auditoria-retencao-alpha-1.md) substitui parcialmente a ADR-0010 para este incremento. Procedimentos de expurgo devem preservar consistência e retomada após reinício.

## Exportação individual básica

Solicitada somente pelo próprio usuário autenticado, com confirmação da senha atual. Entrega por download direto de JSON, sem link público, com data de geração e versão do formato.

| Grupo | Incluído |
| --- | --- |
| Perfil | Dados cadastrais e preferências existentes |
| Participações | Vínculos e papéis do próprio usuário nos núcleos e residências |
| Segurança | Registros retidos referentes à própria conta, filtrados para não expor dados de terceiros |
| Histórico de domínio | Ações realizadas pelo usuário em listas às quais ainda tem acesso |

Excluir senhas, hashes, tokens, dados pessoais de terceiros e conteúdo completo das listas compartilhadas. Não recuperar dados expurgados. Verificar autorização atual também na geração/entrega. A autoria de uma ação não permite exportar lista cujo acesso foi revogado. Regras de lixeira e retenção continuam aplicáveis. Este recurso não é exportação do núcleo, cópia completa das listas nem backup da instalação. Implementação acompanhada na [issue #19](https://github.com/vguerrax/kafofo/issues/19).

## Backup e operação

Procedimento para execução diária no servidor, mantendo as sete cópias diárias mais recentes. Antes de atualizar, produzir uma cópia adicional e preservá-la até verificar a atualização. Destino configurado pelo operador; cópia fora do disco da instalação recomendada. Não há painel de administração de backup nesta entrega.

Backup consistente de PostgreSQL e arquivos, restauração em ambiente separado e verificação de contas, acessos, listas e históricos são critérios de operação. Backups têm retenção própria e não funcionam como lixeira; a restauração de uma cópia antiga exige reaplicar expurgos vencidos e conferir revogações antes de reabrir o serviço. Procedimento deve proteger segredos necessários à recuperação. Docker Compose, imagens amd64/arm64 e Caddy seguem ADRs; licença/CD permanecem com seus status próprios, sem aprovação implícita.

## Aceitação complementar

| Cenário | Resultado esperado |
| --- | --- |
| Código inicial expirado, reemitido ou consumido duas vezes | Não cria nova conta administrativa |
| Dois cadastros iniciais concorrentes | Exatamente um administrador inicial |
| Conta convidada | Não cria núcleo adicional nem recebe residência automática |
| Senha nos limites / com espaços ou controles | Aplica os limites sem remover/truncar conteúdo |
| Sessão após sete dias | Exige autenticação mesmo com atividade recente |
| Quinta falha e limites por origem | Suspensão temporária conforme as janelas, sem encerrar sessões válidas |
| Recuperação reemitida, expirada ou usada duas vezes | Não permite recuperar com link inválido |
| Troca autenticada / recuperação | Encerra outras sessões / todas as sessões anteriores, respectivamente |
| Exportação e perda de acesso | Não expõe dados de terceiros, segredos ou listas revogadas |
| Retenção e restauração de backup | Respeita categorias, expurgos e revogações; não declara recuperação testada sem execução |

Os cenários são critérios futuros, não testes aprovados.

## Rastreabilidade e limites

Refina plataforma/Q-P01–03, Q-P06, Q-P08–09 e Q-P12–18 no alcance desta entrega. Q-P04/05 continuam mais amplos que as operações usadas pelo Kitanda; Q-P07 foi avaliada pela POC #5, com alcance da ADR-0008; contextos pessoais, desativação de módulos, outros módulos e serviços adiados conservam suas pendências. As decisões específicas de listas estão no [contrato do Kitanda](../kitanda/alpha-1.md). Contratos físicos de API/schema e escolhas de biblioteca permanecem nas respectivas tarefas técnicas.
