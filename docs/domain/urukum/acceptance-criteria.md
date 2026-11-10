# Urukum — Critérios de aceitação

## Checklist original preservado

Os 28 itens originais seguem desmarcados: não representam testes executados.

- [ ] Criar notas pessoais.
- [ ] Criar notas compartilhadas em núcleos e residências.
- [ ] Respeitar permissões de acesso aos contextos.
- [ ] Criar notas com título opcional e conteúdo obrigatório.
- [ ] Utilizar as opções de formatação de texto do Mutyrão e Kitanda.
- [ ] Selecionar cores de uma paleta predefinida.
- [ ] Visualizar notas em grade de post-its.
- [ ] Abrir notas em modo expandido.
- [ ] Reorganizar notas por arrastar e soltar.
- [ ] Preservar a disposição individual de cada usuário.
- [ ] Fixar notas no início da grade.
- [ ] Criar e reutilizar tags.
- [ ] Restringir tags aos respectivos contextos.
- [ ] Pesquisar por título e conteúdo.
- [ ] Filtrar por tags e cores.
- [ ] Ordenar por criação, edição, título, cor e tags.
- [ ] Duplicar notas mantendo conteúdo, formatação, cor e tags.
- [ ] Arquivar e desarquivar notas.
- [ ] Consultar histórico completo de alterações.
- [ ] Identificar autor e data de cada versão.
- [ ] Manter histórico somente para consulta.
- [ ] Excluir notas logicamente.
- [ ] Consultar lixeira própria.
- [ ] Restaurar notas excluídas.
- [ ] Respeitar retenção padrão de 30 dias.
- [ ] Permitir ao administrador configurar o prazo de retenção.
- [ ] Permitir colaboração nas notas compartilhadas.
- [ ] Preservar conteúdo e histórico durante exclusões lógicas.

## Cenários derivados

IDs CA-U foram criados para rastreabilidade desta entrega. Referências Q-U identificam pontos que dependem de refinamento; não os resolvem automaticamente.

| ID | Cenário e referências | Dado / quando | Resultado esperado |
| --- | --- | --- | --- |
| CA-U01 | **Nota pessoal privada** — RF-01; RNF-04 | Proprietário cria nota pessoal | Somente proprietário visualiza/administra; outros usuários e administradores sem autorização não recebem conteúdo. |
| CA-U02 | **Colaboração contextual** — RF-25–26; RN-01, RN-03–04 | Membros autorizados usam nota de núcleo/residência | Permitir operações definidas conforme autorização; não compartilhar entre contextos. |
| CA-U03 | **Cadastro mínimo** — RF-01–02; RN-02 | Pessoa informa conteúdo sem título | Título pode ficar vazio e conteúdo é obrigatório; exigência de tags depende de Q-U01. |
| CA-U04 | **Editor consistente** — RF-03; RNF-02 | Pessoa edita texto | Oferecer opções consistentes com editor comum conforme Q-U03, sem anexos ou funções de tarefa. |
| CA-U05 | **Paleta predefinida** — RF-04 | Pessoa escolhe cor | Selecionar da paleta; não disponibilizar personalização livre de cor no MVP. |
| CA-U06 | **Grade e expansão** — RF-05–06; RNF-01 | Pessoa consulta/edita notas em telas diferentes | Apresentar cartões responsivos e modo expandido para leitura/edição. |
| CA-U07 | **Ordem individual** — RF-07–08; RN-08; RNF-06 | A reorganiza nota compartilhada e B consulta sua grade | Salvar automaticamente ordem de A sem alterar ordem de B. |
| CA-U08 | **Ordem por contexto** — RF-08 | Pessoa alterna entre contextos e retorna | Recuperar organização manual própria daquele contexto. |
| CA-U09 | **Fixação individual** — RF-09; RN-09 | A fixa nota compartilhada e B não a fixa | A recebe priorização própria sem modificar a fixação/visualização de B. |
| CA-U10 | **Fixadas respeitam filtros** — RF-13–14; RN-09 | Nota azul está fixada e pessoa filtra somente amarelas | Não mostrar azul por causa da fixação; dentro do filtro, fixadas precedem demais. |
| CA-U11 | **Tags reutilizáveis** — RF-10 | Pessoa cria tag e a associa a mais de uma nota autorizada | Permitir reutilização e múltiplas tags por nota; regra de obrigatoriedade depende de Q-U01. |
| CA-U12 | **Tags isoladas** — RF-11; RN-07 | Pessoa consulta tags de outro contexto sem acesso | Não expor nem compartilhar automaticamente tags; pessoais permanecem privadas. |
| CA-U13 | **Pesquisa** — RF-12 | Pessoa pesquisa trecho de título/conteúdo | Encontrar notas autorizadas por esses campos; áreas e histórico dependem de Q-U13. |
| CA-U14 | **Filtros e ordenação** — RF-13–14 | Pessoa organiza consulta | Oferecer tags/cor/estado e ordenar por criação, edição, título, cor, tags ou manual, mantendo filtros e fixação. |
| CA-U15 | **Cópia preserva conteúdo** — RF-15 | Pessoa duplica nota acessível | Preservar título/conteúdo/formatação/cor/tags sem modificar original. |
| CA-U16 | **Cópia independente** — RF-15; RN-10 | Duplicata é criada e depois editada | Novo ID/data de criação/histórico, estado ativo e fixação independente; edição não altera original. |
| CA-U17 | **Arquivar** — RF-16–17; RN-11–12 | Usuário autorizado arquiva nota | Retirar da grade principal, manter área de arquivadas e preservar conteúdo/histórico; não excluir. |
| CA-U18 | **Desarquivar** — RF-18; RN-12 | Usuário autorizado desarquiva | Retornar à área principal sem apagar conteúdo/histórico. |
| CA-U19 | **Versão completa** — RF-20; RN-05; RNF-05 | Uma edição de nota é concluída segundo unidade definida em Q-U04 | Gerar versão completa independente, com autor, data/hora, conteúdo, título e metadados relevantes. |
| CA-U20 | **Consulta de histórico** — RF-19–20; RN-06 | Pessoa autorizada consulta versões | Mostrar conteúdo anterior e autoria/momento sem sobrescrever atual; não oferecer restauração de versão no MVP. |
| CA-U21 | **Não sobrescrever versões** — RN-05; RNF-05, RNF-08 | Nota passa por edições sucessivas | Versões anteriores permanecem disponíveis e íntegras durante retenção aplicável. |
| CA-U22 | **Excluir logicamente** — RF-21; RN-13–14 | Usuário autorizado exclui nota ativa ou arquivada | Retirar de ativas/arquivadas, manter lixeira e histórico; não remover fisicamente pela operação. |
| CA-U23 | **Consultar lixeira** — RF-22 | Pessoa consulta lixeira própria do módulo | Mostrar notas excluídas dentro do escopo autorizado e da política de retenção. |
| CA-U24 | **Restaurar ativa** — RF-23; RN-15 | Usuário autorizado restaura nota excluída que antes estava arquivada | Recuperar conteúdo/tags/histórico e retornar a ativa, conforme seção 10.2. |
| CA-U25 | **Preferências na restauração** — RF-23; seção 10.2 | Dois usuários têm posição/fixação próprias e nota é restaurada | Respeitar preferências de cada um; não impor as do restaurador. |
| CA-U26 | **Retenção configurável** — RF-24; RN-16 | Instância usa padrão e administrador altera prazo | Aplicar trinta dias por padrão e configuração global; expurgo conforme política, sem apagar arquivadas só por idade. |
| CA-U27 | **Perda de acesso** — RF-25–26; seção 2.4 | Membro perde vínculo com contexto | Retirar acesso às notas/tags/versões/lixeira do contexto; preferências salvas não mantêm autorização. |
| CA-U28 | **Sem acesso administrativo irrestrito** — RNF-03–04; plataforma/RF-011 | Administrador de instância altera retenção | Não obter leitura de notas pessoais por ter configurado política global. |
| CA-U29 | **Sem notificações ou prazos** — RN-17 | Notas são criadas/editadas/arquivadas | Não gerar notificações próprias nem oferecer vencimentos/lembretes de nota. |
| CA-U30 | **Texto sem mídia** — RN-18; limitações do MVP | Pessoa usa editor | Não oferecer imagens/anexos/arquivos incorporados/áudio/vídeo como recursos do MVP. |
| CA-U31 | **Estado e preferências separados** — RN-08, RN-11–12 | A move/fixa nota e depois arquiva com autorização | Posição/fixação são próprias; arquivamento altera estado compartilhado, mantendo preferências individuais. |
| CA-U32 | **Experiência herdada** — RNF-01–09; plataforma/RNF-001–025 | Fluxos são avaliados por teclado/tecnologia assistiva e em telas diferentes | Aplicar acessibilidade, consistência, rapidez de uso e isolamento sem prometer operação offline ou metas não definidas. |

Complementar na implementação com edição simultânea, falha entre conteúdo/snapshot, exclusão concorrente com restauração/expurgo, mudança de tag e perda de acesso durante consulta histórica. Não foram criados ou executados testes de aplicação nesta etapa.
