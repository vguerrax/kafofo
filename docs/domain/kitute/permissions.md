# Kitute — Permissões

## Matriz aprovada

| Operação | Pessoal | Residência | Núcleo | Compartilhamento adicional |
| --- | --- | --- | --- | --- |
| Consultar receitas | Proprietário | Usuário autorizado, inclusive visualizador | Usuário autorizado, inclusive visualizador | Leitor autorizado |
| Criar e editar receitas | Proprietário | Usuário com edição no contexto | Usuário com edição no contexto | Não concede |
| Excluir/restaurar receitas | Proprietário | Usuário com edição no contexto | Usuário com edição no contexto | Não concede |
| Alterar nome/descrição do caderno | Proprietário | Responsável da residência | Administrador do núcleo | Não concede |
| Conceder/revogar compartilhamento | Proprietário | Responsável da residência | Administrador do núcleo | Não concede |
| Excluir/restaurar caderno | Proprietário | Responsável da residência | Administrador do núcleo | Não concede |

O papel no núcleo não deve ser usado para deduzir automaticamente o papel na residência.
A matriz identifica autorização por operação, sem conceder consulta irrestrita por analogia administrativa.
A criação de cadernos compartilhados precisa da definição específica registrada em open-questions.md.

## Acesso adicional
Destinatário deve ter conta na mesma instância. Pode receber acesso a caderno de outro contexto sem se tornar membro dele. Não há links públicos nem acesso anônimo.
A concessão não rebaixa quem já tem edição contextual: ela apenas acrescenta leitura. Nunca promove visualizador a editor.
Busca, filtros, nomes de tags, contagens e acesso direto a uma receita precisam respeitar a mesma autorização.

## Revogação
Saída ou remoção revoga a autorização derivada do contexto. Revogar compartilhamento revoga a autorização dessa concessão. Coexistência de concessão explícita e saída do contexto precisa de refinamento, sem transformar uma revogação parcial em regra não aprovada.
