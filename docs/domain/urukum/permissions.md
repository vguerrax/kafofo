# Urukum — Permissões

## Matriz conhecida

| Operação | Pessoal | Núcleo/residência |
| --- | --- | --- |
| Criar/visualizar/editar | Somente proprietário | Qualquer membro autorizado conforme permissões aplicáveis |
| Excluir/restaurar | Somente proprietário | Qualquer membro autorizado; restauração não é reservada a administrador pela fonte |
| Arquivar/desarquivar | Somente proprietário | Qualquer membro autorizado |
| Duplicar | Proprietário conforme acesso | Operação disponível a quem possui autorização; matriz exata de papéis a refinar |
| Consultar histórico | Proprietário | Usuário com acesso conforme contexto e privacidade |
| Restaurar versão antiga | Fora do MVP | Fora do MVP |
| Criar/reutilizar tags | Tags pessoais privadas | Tags do contexto compartilhadas entre membros autorizados |
| Reorganizar/fixar | Preferência do próprio usuário | Preferência do próprio usuário; não reorganiza outros membros |
| Configurar retenção global | Administrador da instância | Mesma política global, sem poder de leitura privada implícito |

Módulo não compartilha diretamente notas pessoais com outras pessoas nem atravessa contextos. Não importar compartilhamento pessoal ampliado do Okape. Não atribuir restauração exclusiva a administrador por analogia com Kapanga.

## Autorização de residência

A fonte permite colaboração a qualquer membro autorizado, respeitando permissões do Kafofo. A plataforma define visualizador de residência apenas para consulta. Detalhar quais papéis contam como autorizados a cada ação, sem converter membro de residência automaticamente em editor.

Responsabilidade administrativa global/núcleo não concede acesso irrestrito a notas pessoais ou outros contextos. Perda do vínculo retira acesso a nota, tags, histórico e lixeira correspondentes.

## Verificação derivada

Validar no backend sessão, contexto real, vínculo, papel aplicável e estado do registro em nota, tag, versão, preferência, busca e recuperação. Nome de tag e trecho de versão também podem expor conteúdo privado. Cache e organização pessoal não podem continuar exibindo nota após perda de acesso.

Não permitir que preferência de fixação enviada por um usuário modifique a de outro, mesmo quando ambos editam o conteúdo compartilhado.
