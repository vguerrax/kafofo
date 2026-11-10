# Kitute — Fluxos

## Cadastrar receita
1. Pessoa acessa caderno autorizado e ativo.
2. Se possui edição, informa nome, ingredientes e preparo, além dos opcionais desejados.
3. Sistema valida, salva e registra autoria/datas.
4. Receita aparece a quem já tem acesso ao caderno, inclusive destinatários de leitura.

## Consultar e buscar
1. Pessoa escolhe contexto/caderno acessível.
2. Consulta receitas, busca pelo nome e aplica filtros por caderno/tags.
3. Abre receita em apresentação legível para celular ou computador.
4. A interface e o backend não oferecem atualização a visualizadores.

## Compartilhar
1. Administrador do caderno seleciona usuário com conta na mesma instância.
2. Concede leitura do caderno inteiro.
3. Destinatário consulta conteúdo atual e receitas futuras sem acesso geral ao contexto.
4. Administrador pode revogar a concessão.

## Editar com conflito
1. Duas pessoas abrem a mesma receita com edição permitida.
2. A primeira salva.
3. A segunda tenta salvar com base desatualizada.
4. Sistema impede sobrescrita silenciosa, avisa e mantém o texto não salvo para reconciliação.

## Excluir e recuperar
1. Ator autorizado exclui logicamente receita ou caderno.
2. Conteúdo deixa o uso ativo.
3. Ator autorizado solicita recuperação dentro da política aplicável.
4. Em caderno, receitas anteriormente excluídas ficam na lixeira e concessões adicionais não são reativadas.
