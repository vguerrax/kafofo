# Okape — Critérios de aceitação

## Checklist original preservado

Os 23 itens abaixo foram extraídos da fonte, mantidos desmarcados. Não representam verificações executadas.

- [ ] Criar painéis vazios nos contextos pessoal, núcleo e residência.
- [ ] Compor painéis pessoais com dados de diferentes contextos autorizados.
- [ ] Restringir painéis compartilhados ao contexto correspondente.
- [ ] Compartilhar painéis pessoais com usuários da mesma instância.
- [ ] Revogar compartilhamentos pela tela de edição.
- [ ] Restringir convidados à visualização.
- [ ] Organizar painéis manualmente pela tela de configuração.
- [ ] Ativar e desativar painéis, preservando suas configurações.
- [ ] Ocultar painéis desativados do menu lateral.
- [ ] Definir um painel padrão por contexto.
- [ ] Exigir outro painel padrão antes de desativar ou excluir o atual.
- [ ] Consultar o catálogo agrupado por módulo ou integração.
- [ ] Visualizar nome, descrição e prévia dos componentes.
- [ ] Selecionar fontes de dados e componentes visuais compatíveis.
- [ ] Utilizar uma mesma fonte em múltiplos componentes.
- [ ] Configurar componentes individualmente.
- [ ] Copiar componentes mantendo configurações iniciais independentes.
- [ ] Reposicionar e redimensionar componentes.
- [ ] Atualizar componentes automaticamente e sob demanda.
- [ ] Apresentar erros e permitir nova tentativa de carregamento.
- [ ] Sinalizar perda de acesso e incompatibilidade sem remover componentes automaticamente.
- [ ] Preservar a composição quando a origem estiver indisponível.
- [ ] Excluir painéis logicamente sem afetar os dados de origem.

## Cenários derivados para implementação

Identificadores CA-O foram criados nesta entrega. Dependências Q-O indicam cobertura parcial de refinamentos; não aprovam automaticamente uma solução.

| ID | Cenário e referências | Dado / quando | Resultado esperado |
| --- | --- | --- | --- |
| CA-O01 | **Painéis vazios** — CF-O01; seção 2.1–2.2 | Usuário cria painel em contexto autorizado | Iniciar vazio; permitir múltiplos sem limite funcional previamente fixado; não aplicar template. |
| CA-O02 | **Pessoal multicontexto** — CF-O02; RN-01–02 | Proprietário tem acesso a fontes pessoais e de núcleos/residências diferentes | Poder reunir em painel pessoal sem ampliar acesso do proprietário. |
| CA-O03 | **Compartilhado contextual** — CF-O02; RN-03 | Painel pertence a núcleo ou residência | Fontes ficam restritas ao contexto correspondente. |
| CA-O04 | **Administrador inicial/designado** — CF-O03; RN-06 | Usuário autorizado cria painel compartilhado e designa outro administrador | Criador administra inicialmente; criador/designado podem compor enquanto autorizados; demais não ganham edição. |
| CA-O05 | **Exclusão por administração de contexto** — CF-O25; seção 2.3 | Administrador de núcleo/residência exclui painel compartilhado respectivo | Permitir conforme regra de padrão; poder de excluir não concede edição de composição automaticamente. |
| CA-O06 | **Criador perde acesso** — CF-O04 | Criador de compartilhado perde autorização ao contexto | Painel permanece, criador aparece desconhecido e outro autorizado pode assumir; procedimento depende de Q-O04/05. |
| CA-O07 | **Compartilhamento pessoal** — CF-O05; RN-04–05 | Proprietário convida conta da mesma instância | Convidado só consulta; edição continua do proprietário; externos à instância não recebem acesso. |
| CA-O08 | **Revogar individualmente** — CF-O06 | Proprietário consulta compartilhamentos na edição e revoga uma conta | Remover acesso daquele compartilhamento sem exigir revogação de todos. |
| CA-O09 | **Fonte sem acesso do convidado** — RN-09; RNF-02–03 | Convidado acessa painel pessoal com fonte à qual não tem permissão | Não entregar dados sob privilégio do proprietário; preservar componente/alerta de acesso. |
| CA-O10 | **Navegação e ordem** — CF-O07, CF-O09 | Usuário navega e organiza painéis | Menu lateral com opção de recolhimento em tela menor e ordem manual pela configuração; escopo da ordem depende de Q-O03. |
| CA-O11 | **Desativar preservando** — CF-O10 | Painel é desativado e depois reativado | Sumir do menu enquanto desativado; cadastro/configuração/layout/componentes preservados; consulta/reativação na configuração. |
| CA-O12 | **Padrão por contexto** — CF-O08; RN-07 | Pessoa escolhe padrão | Manter escolha individual independente por contexto; granularidade por núcleo/residência depende de Q-O01. |
| CA-O13 | **Substituição do padrão** — CF-O11; RN-08 | Pessoa tenta desativar/excluir padrão | Exigir outro padrão do mesmo contexto; último elegível e padrão de outros usuários dependem de Q-O01/02. |
| CA-O14 | **Contrato da fonte** — CF-O12 | Origem disponibiliza conjunto para Okape | Informar identificação, estrutura/tipos, configurações e compatibilidade; origem continua validando regras/acesso. |
| CA-O15 | **Catálogo visual fixo** — CF-O13; RNF-08 | Pessoa escolhe componente no MVP | Oferecer catálogo mantido pela plataforma, com tipos/estruturas aceitos; não instalar/executar componente de terceiros. |
| CA-O16 | **Adicionar e prévia** — CF-O14 | Pessoa aciona Adicionar | Catálogo agrupado por módulo/integração com nomes/descrições e possibilidade de prévia antes de incluir; prévia respeita acesso. |
| CA-O17 | **Compatibilidade** — CF-O15; RNF-05 | Pessoa escolhe fonte e visual | Permitir configuração compatível; incompatibilidade não pode ser resolvida ignorando estrutura da origem. |
| CA-O18 | **Configuração independente** — CF-O16; RN-10 | Duas instâncias usam mesma fonte e uma é alterada | Configuração da outra permanece independente. |
| CA-O19 | **Fonte reutilizada** — CF-O17 | Pessoa usa mesmo conjunto em gráfico e tabela | Manter ambas instâncias simultaneamente com configurações próprias. |
| CA-O20 | **Cópia independente** — CF-O18; RN-11 | Pessoa copia componente e altera a cópia | Herdar fonte/configuração inicial, criar nova instância e não sincronizar alteração com original. |
| CA-O21 | **Grade responsiva** — CF-O19; RNF-01 | Editor reposiciona/redimensiona em dispositivos diferentes | Disponibilizar arrastar/soltar e ajuste de largura/altura; adaptar grade a desktop/tablet/celular. |
| CA-O22 | **Origens diferentes** — CF-O19 | Painel recebe fontes de módulos distintos | Permitir coexistência respeitando contexto/permissões e compatibilidade de cada instância. |
| CA-O23 | **Intervalo por origem** — CF-O20 | Duas fontes definem intervalos diferentes | Atualizar periodicamente conforme cada origem, sem impor intervalo único. |
| CA-O24 | **Atualização manual** — CF-O21 | Usuário solicita atualizar dados | Oferecer atualização manual; escopo componente/painel e condições dependem de Q-O11. |
| CA-O25 | **Erro com retomada** — CF-O22; RN-13; RNF-06 | Componente não carrega | Preservar instância/configuração, mostrar erro/indisponibilidade e permitir tentar novamente. |
| CA-O26 | **Perda de acesso** — CF-O23; RN-13 | Usuário perde acesso à fonte | Preservar componente com alerta, sem remover automaticamente e sem expor dados privados; remoção depende de permissão de composição. |
| CA-O27 | **Schema incompatível** — CF-O24; RN-13 | Fonte muda e visual se torna incompatível | Preservar componente/alerta e permitir ajuste ou remoção por editor; não excluir automaticamente. |
| CA-O28 | **Remover sem excluir fonte** — CF-O26; RN-12 | Editor remove instância | Fonte e registros do módulo continuam existentes. |
| CA-O29 | **Excluir sem apagar domínio** — CF-O25; RN-14 | Ator autorizado exclui painel | Aplicar exclusão lógica respeitando regra de padrão; não remover registros das fontes. |
| CA-O30 | **Independência** — CF-O27; RNF-04 | Nenhum módulo doméstico específico está disponível | Okape continua capaz de existir/criar painel vazio; catálogo vazio precisa de apresentação definida. |
| CA-O31 | **Resiliência da composição** — RNF-06; RN-13 | Uma integração fica indisponível | Não perder composição/configurações de painel nem remover componentes automaticamente. |
| CA-O32 | **Acessibilidade e isolamento** — RNF-01–03; plataforma/RNF-007–012 | Fluxos são avaliados por teclado/tecnologia assistiva e com usuários distintos | Aplicar experiência acessível e autorização individual em prévia, consulta, cache e atualizações; alternativa a arraste depende de Q-O10. |

Complementar com revogação durante carregamento, prévia/cache com permissões diferentes, duas tomadas administrativas simultâneas, edição de cópia e resposta fora de ordem. Não houve implementação ou execução de testes nesta entrega documental.
