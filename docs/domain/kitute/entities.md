# Kitute — Entidades conceituais

Não fixa tabelas, endpoints ou tipos físicos de identificador.

| Entidade | Dados e relações |
| --- | --- |
| Caderno | Identificador, nome obrigatório, descrição opcional, referência a exatamente um contexto, metadados de exclusão lógica. |
| Receita | Identificador, caderno obrigatório, nome, ingredientes, modo de preparo, rendimento opcional, tempo em minutos opcional, observações opcionais, tags, criador/data, último editor/data, metadados de exclusão lógica. |
| Concessão de leitura | Caderno, destinatário da mesma instância, concedente e estado de concessão/revogação. |
| Tag | Nome e contexto; associação a receitas daquele contexto. |
| Registro de ação | Autor e instante das ações de exclusão/restauração; integração com os mecanismos da plataforma. |

## Formatos funcionais
- Ingredientes: texto livre com quebras de linha; sem cadastro de ingredientes, quantidades ou unidades.
- Preparo: texto com parágrafos e listas; formato de armazenamento não definido.
- Rendimento: texto, por exemplo “8 porções” ou “1 forma média”.
- Tempo de preparo: minutos; não foi aprovada divisão entre tempo ativo, forno e espera.
- Não há entidade de versão completa no MVP.
- O controle de concorrência pode exigir uma revisão técnica, sem implicar histórico de versões.

Preservar a diferença entre exclusão anterior de uma receita e sua indisponibilidade causada pela exclusão do caderno.
