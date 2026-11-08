# Kitanda — Contrato aprovado da Alpha 1

**Aprovação:** 2026-11-06 · **Fontes:** issues [#1](https://github.com/vguerrax/kafofo/issues/1) e [#3](https://github.com/vguerrax/kafofo/issues/3).

Este refinamento prevalece no incremento Alpha 1 e não declara todo o MVP implementado. IDs do catálogo geral são preservados. [Identidade, convites, segurança, retenção e exportação](../platform/alpha-1.md) pertencem à plataforma e não são repetidos aqui.

## Recorte

Somente listas de residência. Inclui múltiplas listas, compartilhamento seletivo, itens, marcação/desmarcação, cartões/resumos/progresso, limpeza de comprados, histórico, exclusão lógica, lixeira e restauração.

Adiar listas pessoais/de núcleo, transferência de gestão, ordenação manual, detecção/soma de duplicados, pesquisa/filtros avançados, esvaziamento em lote e avisos de compartilhamento/permissões. Sem encerramento obrigatório, templates, recorrência, preços, estoque, anexos ou links públicos. Duplicados podem existir como itens separados; não impor unicidade de nome. As capacidades adiadas continuam no escopo geral do MVP quando previstas nele.

## Permissões

Lista pertence a uma única residência e começa acessível apenas ao criador. Compartilhar não altera o papel da pessoa na residência. Validar sessão, vínculo ativo, papel atual e acesso à lista no backend em toda operação.

| Ação | Criador | Participante com papel responsável/colaborador | Participante visualizador |
| --- | --- | --- | --- |
| Consultar lista e histórico | Sim, enquanto tem acesso à residência | Sim | Sim |
| Editar lista/itens, marcar e limpar comprados | Só com papel atual de responsável/colaborador | Sim | Não |
| Excluir/restaurar lista | Só com papel atual de responsável/colaborador | Sim | Não |
| Gerenciar compartilhamentos | Só com papel atual de responsável/colaborador | Não | Não |

Criar lista exige papel responsável/colaborador. Somente o criador compartilha/revoga, e apenas para pessoas com acesso ativo à mesma residência. Administrador global/de núcleo e responsável de residência não ganham acesso automático às listas privadas. Autoria não contorna rebaixamento para visualizador.

### Saída e reingresso

- Perder acesso à residência revoga compartilhamentos recebidos; retorno não os recupera. Criador precisa compartilhar novamente.
- Autoria permanece. Se o criador perde acesso, participantes restantes mantêm acessos atuais, mas ninguém gerencia compartilhamentos até o criador retornar com papel que permita essa ação. Não há transferência de gestão na Alpha 1.
- Criador que retorna recupera acesso às próprias listas sujeito ao papel atual e ao ciclo de vida do registro. Como visualizador, apenas consulta. Não recupera lista já expurgada nem restaura automaticamente lista na lixeira.
- Reingresso e restauração de lista não reativam concessões revogadas.

### Contrato técnico de listas e compartilhamento

A [#11](https://github.com/vguerrax/kafofo/issues/11) entrega metadados e compartilhamentos sob `/api/kitanda`, somente para residência. Coleção e detalhe filtram autoria ou concessão vigente, além de sessão e acesso atual à residência. Lista invisível ou inexistente retorna 404 com a mesma mensagem, inclusive fora da residência; ação proibida sobre lista visível retorna 403. Candidatos e gestão de concessões exigem criador com papel atual de escrita. O seletor recebe somente identificador da concessão residencial e nome de exibição.

Autoria referencia a conta; compartilhamento referencia o ID da concessão residencial. Papel alterado no mesmo ID muda as capacidades, enquanto revogação e nova concessão não reativam compartilhamentos antigos. PUT repetido não duplica concessão ativa; DELETE repetido é idempotente para quem ainda gerencia. Compartilhar novamente após revogação cria ID de compartilhamento novo. Chaves compostas impedem associação entre lista e concessão de outra residência.

Operações revalidam sessão e vínculos sob locks conta → núcleo → residência → lista, na mesma transação/conexão dos dados. A política comum de leitura, escrita e gestão deve ser reutilizada pelas operações das #12–15, inclusive coleções, resumos, histórico e lixeira quando forem introduzidos. Essas superfícies futuras não são disponibilizadas pela #11.

A tela consulta novamente ao retornar ou usar “Atualizar listas”. Não há notificações de compartilhamento. Itens e progresso pertencem à #12; atualização periódica, conflitos e repetição após resposta perdida à #13; lixeira/restauração à #14. Histórico consultável e sua integração pertencem à #15, que precisa estar integrada antes de publicar as operações que exigem histórico. A entrega de metadados não comprova esses critérios futuros.

## Dados e validação

| Campo | Obrigatoriedade e limite |
| --- | --- |
| Nome da lista | Obrigatório, até 120 caracteres, linha única |
| Descrição | Opcional, até 2.000 caracteres, aceita quebras de linha |
| Nome do item | Obrigatório, até 120 caracteres, linha única |
| Quantidade | Opcional, maior que zero, até 999999.999 e até três casas decimais |
| Unidade | Texto opcional, até 20 caracteres, linha única |
| Observação | Opcional, até 1.000 caracteres, aceita quebras de linha |

Remover espaços nas extremidades dos textos acima, preservando espaços internos. Obrigatório só com espaços é recusado; opcional vazio é ausente. Texto simples, sem editor rico. Excesso de limite é recusado, sem truncamento silencioso. Listas/itens podem ter nomes iguais. A senha segue contrato próprio da plataforma, sem remoção de espaços.

Quantidade vazia permanece sem valor, sem assumir 1. Quantidade e unidade são independentes. Interface aceita vírgula ou ponto como separador decimal, sem separador de milhar; a API preserva as restrições de valor/precisão. Zero, negativos e excesso de precisão são recusados, sem arredondamento silencioso. Não converter nem padronizar unidades automaticamente. Unidade livre pode conter variações como kg/quilo; soma de duplicados está adiada.

### Contrato técnico de itens e resumos

A [#12](https://github.com/vguerrax/kafofo/issues/12) expõe coleção/criação em `GET/POST /api/kitanda/lists/:listId/items`, edição/remoção em `PATCH/DELETE /lists/:listId/items/:itemId` e marcação em `PUT /lists/:listId/items/:itemId/purchased` com estado desejado. Todas reutilizam a política comum da #11. Item é consultado pelo par lista/item; removidos ficam fora da coleção e das mutações. Exclusão individual é lógica, sem restauração individual nesta entrega.

Quantidade transita como texto decimal ou null, é validada antes de persistir em `NUMERIC(9,3)` e retorna canônica, sem zeros finais desnecessários. A API aceita dígitos e ponto decimal, sem sinal, expoente ou separador de milhar; exige até três casas na entrada, inclusive quando casas adicionais seriam zero. A interface aceita vírgula ou ponto e normaliza para ponto. Quantidade, unidade e observação ausentes retornam null; no PATCH, omitir preserva, null limpa opcionais. Edição de metadados não altera compra. Repetir o estado desejado é um no-op, inclusive para `updatedAt`.

A coleção de listas inclui residência, total ativo e total comprado calculados na mesma consulta, com agregação restrita às listas autorizadas e sem contadores persistidos. Itens removidos não entram nos totais. O frontend calcula o percentual por contagem de itens e exibe grupos pendentes/comprados, ordenados por criação e ID. Após mutação confirmada, atualiza detalhe e cartões; falhas preservam formulário preenchido. A lista continua reutilizável após 100%.

Atualização periódica, conflitos e repetição segura de criação após resposta perdida pertencem à #13. Limpeza de comprados, lixeira e restauração pertencem à #14; histórico e auditoria à #15. A dependência da #15 antes da publicação de operações com histórico permanece vigente.

## Compras e progresso

Marcar/desmarcar não exige confirmação ou motivo. Comprados permanecem separados visualmente dos pendentes. Comando envia estado desejado, não inversão cega. Lista permanece reutilizável após 100% das compras.

Progresso = itens ativos comprados / total de itens ativos × 100, sem peso pela quantidade. Removidos não entram nas contagens. Exibir até uma casa decimal, sem zero decimal final: 1 de 3 = 33,3%; todos comprados = 100%. Lista sem itens ativos mostra “Lista vazia”, sem percentual. Inclusão/desmarcação recalcula o progresso e não cria nova sessão de compras.

## Atualização e concorrência

Atualizar a cada cinco segundos com a lista aberta e visível e imediatamente ao retornar à tela. Alterações não dependem de notificações. Sem operação offline.

Preservar edições em itens diferentes. Recusar atualização desatualizada do mesmo item com oportunidade de revisão antes de nova tentativa. Falha de conexão preserva preenchimento e informa ausência de confirmação de salvamento; repetição após resposta perdida não deve duplicar operações. Atualização de dados não deve destruir formulário em edição ou foco de teclado.

Revogação bloqueia novas operações no backend imediatamente; conteúdo sai da tela na próxima verificação. O intervalo de cinco segundos não é prazo de tolerância para autorização no servidor.

### Contrato técnico de colaboração online

A [#13](https://github.com/vguerrax/kafofo/issues/13) acrescenta `version` inteira aos itens, inicialmente 1 inclusive para registros existentes. PATCH, PUT de compra e DELETE exigem `expectedVersion`. Mudança efetiva incrementa somente a versão do item afetado; metadados sem alteração e marcação do estado vigente não alteram versão/timestamp. Versão divergente retorna 409 `ITEM_VERSION_CONFLICT`, sem devolver conteúdo do item. A comparação usa uma nova leitura autorizada. Item removido permanece indisponível para sobrescrita.

Criação de lista e mutações de itens exigem `Idempotency-Key` UUID. A identidade do comprovante combina conta, ação, recurso pai e chave; a impressão inclui payload normalizado, item-alvo e versão esperada quando aplicáveis. Efeito e comprovante confirmam na mesma transação, após autorização atual. Chave/payload iguais reconhecem a confirmação sem reaplicar, mesmo se o item mudou ou foi removido; payload diferente retorna 409 `IDEMPOTENCY_KEY_REUSED`. Revogação ou perda de escrita impedem também consultar confirmação por essa via.

Respostas dessas mutações são comprovantes mínimos (`confirmed`, `resourceId` e, para itens, versão confirmada), sem nome, quantidade ou conteúdo anterior. DELETE mantém 204 com `X-Resource-Id` e `X-Item-Version`. A versão confirmada registra o efeito original e não substitui a leitura atual para uma nova edição. GET de itens retorna `{list, items}`, com permissões atuais e versões no mesmo escopo autorizado. Rotas e validações de campos da #12 permanecem.

Comprovantes duram 24 horas; a deduplicação está limitada a essa janela. Limpeza ao iniciar e a cada minuto, sem sobreposição e em lotes de até 500, remove somente expirados. São dados operacionais distintos do histórico/auditoria da #15. Falha antes do commit reverte efeito e comprovante.

Com a lista aberta e visível, o frontend consulta a cada cinco segundos, imediatamente na abertura/retorno e após mutação confirmada. Há no máximo uma consulta ativa por lista; respostas anteriores à confirmação ou de contexto desmontado são descartadas. Rascunho e versão-base ficam em memória, sem serem reescritos pela consulta. A pessoa compara, descarta ou aceita explicitamente a versão atual antes de salvar; não há reenvio automático com versão nova.

Rede/503 sinalizam dados possivelmente desatualizados. Gravação sem confirmação preserva payload/chave e bloqueia alteração do preenchimento até confirmar. Depois de 24 horas, não repete: exige atualizar, conferir o resultado e liberar conscientemente uma nova operação. Perda de leitura/sessão retira conteúdo/rascunhos e interrompe consultas; perda somente de escrita mantém leitura e desabilita mutações. Não há fila offline nem persistência de rascunhos após recarga.

## Limpeza, exclusão e restauração

Remover item ou limpar comprados aplica exclusão lógica e preserva histórico segundo política da plataforma. Limpar comprados exige confirmação dos alvos apresentados. Mudança de algum alvo entre confirmação/execução exige nova confirmação; novos comprados fora da seleção não são removidos silenciosamente. Limpeza é atômica, sem remoção parcial silenciosa.

Excluir lista exige confirmação e a retira do uso ativo. Lixeira somente para pessoas com acesso atual à lista e residência; restaurar exige papel atual de escrita. Restauração em até 30 dias recupera somente itens ativos no momento da exclusão da lista, sem ressuscitar itens removidos anteriormente ou concessões revogadas. Sem restauração individual de item. Após o prazo, expurgo conforme a plataforma.

Histórico identifica ator e momento das operações entregues, incluindo compartilhamento, revogação e restauração. Consulta segue autorização atual. Não confundir histórico do domínio com log técnico ou prometer conteúdo permanente depois de expurgo.

## Aceitação complementar

| Cenário | Resultado esperado |
| --- | --- |
| Nome vazio / somente espaços / acima de 120 caracteres | Recusar, sem truncar |
| Campos opcionais vazios | Permanecem ausentes |
| Quantidade 0, negativa, acima do limite ou com quatro decimais significativos | Recusar sem arredondamento |
| Quantidade 0,5 / 0.5 na interface | Mesmo valor sem conversão automática de unidade |
| Unidade sem quantidade / quantidade sem unidade | Aceitar |
| Mesmos nomes na mesma lista ou residência | Aceitar sem consolidação automática |
| Visualizador tenta marcar/editar/excluir/restaurar | Negar inclusive se for criador |
| Participante volta à residência | Exigir novo compartilhamento |
| Criador retorna como visualizador | Consultar próprias listas sem escrever ou compartilhar |
| Lista vazia / 1 de 3 / quantidade diferente | Sem percentual / 33,3% / peso igual por item |
| Duas pessoas alteram mesmo item | Recusar edição desatualizada sem sobrescrita silenciosa |
| Marcação muda durante confirmação de limpeza | Pedir nova confirmação, sem lote parcial |
| Item removido antes da lista | Restauração da lista não o recupera |
| Revogação durante consulta/exportação | Não continuar entregando dados sem autorização |

São critérios para testes futuros, não evidências de implementação.

## Pendências resolvidas e adiadas

| Questão | Tratamento para Alpha 1 |
| --- | --- |
| Q-I01/02 | Matriz e precedência do papel atual definidas; operações adiadas não estão liberadas por inferência |
| Q-I03 | Contexto pessoal adiado |
| Q-I04 | Tratamento especial de duplicados adiado; unidades/valores definidos aqui |
| Q-I05 | Contrato de quantidade/unidade definido |
| Q-I06 | Ordenação manual adiada; separar situações sem prometer ordem configurável |
| Q-I07/08 | Atualização, conflitos e seleção de limpeza definidos; soma/reordenação adiadas |
| Q-I09 | Restauração e itens anteriores definidos |
| Q-I10 | Vazio, contagens e percentual definidos |
| Q-I11 | Histórico do recorte e retenção definidos; reordenação adiada |
| Q-I12 | Notificações adiadas explicitamente |
| Q-I13 | Lixeira autorizada incluída; pesquisa/filtros avançados adiados |
| Q-I14 | Exportação individual limitada, definida pela plataforma |
| Q-I15 | Texto simples neste incremento; não aprova editor rico em outros módulos |

Relaciona kitanda/RF-144–147, RF-296, RF-298, RF-300–302, RF-304–306 e RF-309–313 às regras refinadas acima. RF-297, RF-299, RF-303 e RF-307–308 ficam adiados no recorte. Os cenários CA-I da especificação geral continuam válidos no respectivo alcance; não declarar atendidos os que cobrem capacidades adiadas.
