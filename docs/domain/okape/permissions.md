# Okape — Permissões

## Matriz conhecida

| Operação | Painel pessoal | Painel compartilhado de núcleo/residência |
| --- | --- | --- |
| Criar | Usuário cria seu painel | Usuário autorizado no contexto |
| Visualizar | Proprietário e convidados individuais da mesma instância | Usuários autorizados do contexto |
| Alterar composição/layout/configuração | Somente proprietário | Somente criador ou administrador designado, mantendo autorização |
| Copiar/adicionar/remover componente | Ação de composição, restrita ao proprietário | Ação de composição do criador/designado |
| Compartilhar para consulta | Proprietário concede individualmente | Acesso segue contexto; concessões extras por painel não detalhadas |
| Revogar compartilhamento pessoal | Proprietário pela tela de edição | Não se aplica como regra pessoal |
| Designar outro administrador | Não cria editor extra no painel pessoal | Criador pode designar outro administrador |
| Excluir painel | Exclusão do próprio painel segue administração/contexto e regra de padrão | Criador/designado autorizado ou administrador do núcleo/residência |
| Assumir painel após perda do criador | Não definido para conta pessoal excluída | Outro membro autorizado pode assumir; seleção e concorrência a detalhar |
| Consultar fonte de dados | Somente se usuário possui acesso na origem | Somente se usuário possui acesso na origem e fonte respeita contexto |

Administrador de contexto não ganha poder de editar composição apenas porque pode excluir painel. Convidado de painel pessoal não vira editor. A regra de designação administrativa é do painel compartilhado; não transfere edição de painel pessoal a terceiros.

## Duas verificações de acesso

Primeiro, a pessoa precisa poder acessar o painel. Depois, cada fonte aplica suas próprias regras e valida acesso para aquela pessoa. Acesso do proprietário não é usado como credencial para entregar dados aos convidados.

Exemplo: painel pessoal reúne indicador do Núcleo A e tabela da Residência B. Convidado autorizado apenas ao Núcleo A não passa a consultar os dados da Residência B pelo convite. Tratamento visual da fonte indisponível segue alerta de acesso, sem expor conteúdo protegido.

## Perda de acesso e autoria

Se criador de compartilhado perde acesso ao contexto, painel permanece e criador aparece como desconhecido. Outro autorizado pode assumir administração. A regra de exibição não é autorização para apagar identidade histórica de auditoria; conciliar com a preservação de autoria da plataforma.

## Remoção de componentes com erro

A fonte permite que usuário decida remover componente sem acesso/incompatível. Essa ação deve ser conciliada com edição de composição restrita: convidado de consulta não ganha edição por ver um alerta. Comportamento de consulta sem editor disponível precisa de refinamento explícito.

## Verificação derivada

Aplicar autorização no backend a carregamento, prévia, atualização, cópia, catálogo, edição e exclusão. Mesmo prévias e cache podem vazar dados se forem gerados sob identidade do proprietário. Revisar acesso após revogação de painel, contexto ou origem.
