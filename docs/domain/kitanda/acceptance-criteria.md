# Kitanda — Critérios de aceitação

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


**Status:** cenários derivados para futura verificação; não são testes executados. Dependências Q-I sinalizam cobertura parcial de pontos ainda em refinamento.

| ID | Cenário e referências | Dado / quando | Resultado esperado |
| --- | --- | --- | --- |
| CA-I01 | **Criar lista mínima** — RF-144, RF-304–305; RN-242 | Usuário autorizado informa somente nome | Lista pode ser criada sem descrição ou outros campos de identificação obrigatórios. |
| CA-I02 | **Múltiplas listas** — RF-296; RN-228 | Existem duas listas no mesmo contexto e uma é editada | Ambas coexistem; alterações numa não modificam outra. |
| CA-I03 | **Contexto único** — RN-062, RN-227 | Uma lista é cadastrada em contexto autorizado | Pertence a um único contexto; acesso respeita vínculo e permissões. |
| CA-I04 | **Compartilhamento restrito** — RF-145; RN-259–260 | Pessoa tenta compartilhar fora do contexto permitido ou com externo ao núcleo | Não conceder acesso; não oferecer link público ou convite sem conta. |
| CA-I05 | **Item mínimo** — RF-146, RF-298; RN-231–233 | Usuário adiciona somente nome de item | Aceitar sem quantidade, unidade ou observação; nome ausente impede cadastro; marca, preço e fornecedor não fazem parte do fluxo. |
| CA-I06 | **Duplicidade com soma** — RF-297; RN-229 | Já existe Leite 2 litros e usuário adiciona Leite 1 litro | Alertar e oferecer soma para 3 litros, sem impor consolidação. |
| CA-I07 | **Manter duplicados** — RN-230 | Usuário prefere manter separado após alerta | Preservar itens distintos; não forçar junção. |
| CA-I08 | **Ordem compartilhada** — RF-299; RN-234 | Pessoa autorizada reorganiza itens | Outras pessoas autorizadas consultam a mesma ordenação; sem lista de ordem individual por usuário. |
| CA-I09 | **Marcar compra** — RF-147, RF-301; RN-235–237 | Pessoa autorizada marca item como comprado | Alterar situação sem confirmação/motivo e registrar ator e momento; conflito com visualizador depende de Q-I01. |
| CA-I10 | **Desmarcar compra** — RF-301; RN-236–237 | Item comprado é desmarcado | Retornar a pendente sem confirmação/motivo e registrar alteração. |
| CA-I11 | **Permanência de comprados** — RF-300, RF-312; RN-238 | Um item fica comprado | Continuar na lista, separado visualmente dos pendentes. |
| CA-I12 | **Remoção individual** — RF-146; RN-239, RN-249 | Usuário autorizado remove item comprado | Permitir remoção, preservar histórico e respeitar exclusão lógica; confirmação individual não foi definida. |
| CA-I13 | **Limpar comprados** — RF-302; RN-240–241 | Lista tem dois pendentes e um comprado e usuário confirma limpar comprados | Remover somente comprado; preservar dois pendentes, lista e histórico. |
| CA-I14 | **Esvaziar lista** — RF-303; RN-240–241 | Lista tem pendentes/comprados e usuário confirma esvaziamento | Remover todos os itens, mantendo lista e histórico. |
| CA-I15 | **Cancelar limpeza** — RN-240 | Pessoa não confirma limpar comprados ou esvaziar | Não executar remoção. |
| CA-I16 | **Excluir lista** — RF-306; RN-243–245 | Usuário com edição confirma exclusão | Aplicar exclusão lógica, mantendo histórico da lista/itens; consulta sem edição não autoriza excluir. |
| CA-I17 | **Restaurar lista** — RN-246 | Usuário autorizado solicita restauração | Permitir recuperar lista segundo política; ator exato e tratamento de itens removidos anteriormente dependem de Q-I02/09. |
| CA-I18 | **Pesquisa autorizada** — RF-307; RN-247 | Pessoa pesquisa nome de lista ou item | Apresentar somente listas e itens autorizados, sem vazar nomes de outros contextos. |
| CA-I19 | **Filtros de situação** — RF-308 | Existem lista mista, somente comprados e vazia | Filtro com pendentes encontra a mista; somente comprados encontra a segunda; vazias encontra a terceira, respeitando contexto. |
| CA-I20 | **Histórico mínimo** — RF-309; RN-248–249 | Ocorrem criação/exclusão de lista, operações de item, quantidade/unidade, marcações e limpezas | Manter os eventos rastreados com usuário e data/hora, acessíveis somente a pessoas autorizadas. |
| CA-I21 | **Sem justificativas comuns** — RN-250 | Usuário realiza operação comum | Não exigir motivo; confirmação continua aplicável onde explicitamente exigida. |
| CA-I22 | **Sem notificações comuns** — RN-251 | Há inclusão, edição, remoção ou marcação de item | Não emitir notificação para operação comum. |
| CA-I23 | **Atualização independente de alertas** — RN-252 | Usuário autorizado altera lista e outro a consulta pelo mecanismo implementado | Alteração fica disponível sem depender de receber notificação; estratégia e latência dependem de Q-I07. |
| CA-I24 | **Notificações relevantes** — RN-253 | Ocorre compartilhamento ou mudança de permissão | Reservar comunicação a esses eventos segundo preferências/regras a detalhar em Q-I12. |
| CA-I25 | **Reutilização** — RN-254–256 | Lista já foi usada para compras | Permitir continuar adicionando/limpando sem encerramento obrigatório e sem apagar pendentes ou histórico anterior. |
| CA-I26 | **Contagem e proporção** — RF-310–311; RN-257 | Há três itens e um está comprado | Resumo mostra dois pendentes/um comprado e proporção de 1/3; arredondamento de exibição depende de Q-I10. |
| CA-I27 | **Sem peso por quantidade** — RN-257 | Um item tem quantidade 10 e outro quantidade 1, com um comprado | Progresso é 50%, independentemente de qual foi comprado. |
| CA-I28 | **Cartões e lista** — RF-312–313; RN-258 | Pessoa visualiza listas e seus itens | Cartões exibem nome, contexto e progresso; itens ficam em lista separada por situação; Kanban não é oferecido. |
| CA-I29 | **Lista vazia** — RF-308, RF-310–311 | Lista não possui itens | Pode ser filtrada como vazia, contagens são zero; apresentação do percentual depende de Q-I10 sem divisão por zero. |
| CA-I30 | **Sem templates/recorrência** — RN-060–061 herdadas; restrições atuais | Pessoa usa listas no MVP | Não exigir modelos nem oferecer recorrência automática como capacidade aprovada. |
| CA-I31 | **Privacidade na operação** — RN-062, RN-247; plataforma/RNF-022 | Cliente manipula identificador de lista/item de outro contexto | Backend impede consulta/mutação/histórico e contagens sem autorização. |
| CA-I32 | **Experiência herdada** — plataforma/RNF-001–025 | Fluxos são avaliados em dispositivos e tecnologias assistivas | Aplicar responsividade, PWA online, teclado, feedback e localização; reorganização acessível deve ser refinada sem exigir gesto exclusivo. |

Na implementação, complementar com concorrência em soma/marcação/ordem, limpeza após mudança de situação, perda de permissão durante atualização e restauração de lista com itens previamente removidos. Esses cenários técnicos não criam novos recursos de produto.
