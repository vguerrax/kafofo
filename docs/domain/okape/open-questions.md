# Okape — Refinamentos e conflitos

As capacidades são sustentadas pela especificação fornecida. Estes pontos delimitam implementação e integração sem acrescentar escopo.

| ID | Tema | Refinamento necessário |
| --- | --- | --- |
| Q-O01 | Painel padrão e último painel | RN-08 exige substituto do mesmo contexto; definir quando não existe outro elegível, quando acesso é perdido e se padrão é por contexto concreto ou por tipo |
| Q-O02 | Padrão de outras pessoas | Exclusão/desativação de compartilhado pode afetar padrão de vários usuários; definir precedência e resolução sem modificar preferências silenciosamente |
| Q-O03 | Ativação e ordenação | Definir escopo individual/compartilhado de ativo/desativado, ordem e configuração; preservação de composição já é obrigatória |
| Q-O04 | Administração órfã | Definir tomada administrativa quando criador perde acesso, designado ainda ativo, escolha concorrente e papéis elegíveis |
| Q-O05 | Criador desconhecido e histórico | Conciliar rótulo funcional com autoria preservada na plataforma; não apagar identidade auditável por inferência |
| Q-O06 | Remoção por quem só consulta | Fonte manda usuário decidir remover sem acesso/incompatível; composição é restrita. Definir experiência de convidado sem conceder edição |
| Q-O07 | Fontes e compatibilidade | Definir identificadores, estrutura/tipos, versões, validação, opções e catálogo real de formatos visuais |
| Q-O08 | Prévia | Definir momento da prévia, exemplo versus dado real e comportamento sem fonte; sempre verificar acesso |
| Q-O09 | Cópia | Definir posição/tamanho inicial e limites; cópia entre painéis/contextos e clonagem de painel não aprovadas |
| Q-O10 | Layout responsivo | Definir breakpoints, dimensões mínimas, colisões, persistência por dispositivo e alternativa acessível a arraste |
| Q-O11 | Atualização | Definir escopo manual, ciclo com painel oculto/desativado, concorrência, cache e intervalos inválidos; origem continua dona do intervalo |
| Q-O12 | Dados após perda de acesso | Preservar composição sem expor último resultado privado; definir limpeza de cache e mensagens sem vazamento |
| Q-O13 | Exclusão/recuperação | Definir confirmação, ator de restauração, retomada de compartilhamento/padrões/layout e regras de retenção |
| Q-O14 | Metadados básicos | Campos de cadastro de painel, nome/descrição, limites técnicos e unicidade não definidos; não exigir formulário inventado |
| Q-O15 | Portabilidade e auditoria | Definir composição/referências no arquivo pessoal e eventos administrativos; sem exportação PDF/imagem ou versões/desfazer aprovados |
| Q-O16 | Desativação de módulos | Conciliar catálogo/consulta quando fonte ou Okape é desativado, preservando painéis e dados de origem |

## Pontos já fechados

Painéis nascem vazios, sem templates e sem limite funcional fixado. Compartilhados ficam no próprio contexto; pessoal pode reunir fontes autorizadas de contextos diferentes. Compartilhamento pessoal é individual para contas da instância e só leitura. Acesso ao painel não concede acesso às fontes.

Configurações e cópias são independentes. Intervalo é definido pela origem, com atualização manual possível. Falha/acesso/incompatibilidade preservam componentes. Catálogo é fixo, sem componentes de terceiros no MVP. Exclusão de painel é lógica e não afeta dados dos módulos.

## Sequência sugerida e riscos

Fechar autorização e ciclo de padrão/administração (Q-O01–06), contratos de fontes/prévia (Q-O07–08) e cache após perda de acesso (Q-O12) antes dos fluxos compartilhados. Refinar layout/atualização conforme componentes forem implementados.

Principais riscos: cache ou prévia usar privilégio do proprietário, última preferência padrão impedir manutenção sem fluxo definido, tomada administrativa indevida, cópias compartilharem objeto de configuração e indisponibilidade apagar composição. Catálogo fixo reduz escopo operacional, mas não elimina essas regras.
