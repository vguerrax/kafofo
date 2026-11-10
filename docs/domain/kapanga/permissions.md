# Kapanga — Permissões

Kapanga utiliza a identidade, os papéis fixos e o contexto da plataforma. Permissões financeiras individualizadas ficam fora do MVP. Administração de um núcleo não autoriza leitura irrestrita de dados privados, pessoais ou de outros contextos.

## Matriz conhecida

| Operação | Regra de autorização conhecida | Referência / limite |
| --- | --- | --- |
| Consultar despesas, filtros e indicadores | Usuário com acesso ao recurso/contexto | RF-149, RN-099, RN-111; não expor agregados de outros contextos |
| Criar despesa e editar campos permitidos | Usuário autorizado conforme permissões do contexto | Poder exato por papel fixo ainda a detalhar |
| Registrar pagamento integral | Conforme permissões do contexto | Não há papel financeiro específico aprovado |
| Cancelar e reabrir obrigação | Atores e transições não definidos | CANCELADO é estado conhecido; não aprovar comando por inferência |
| Criar categoria personalizada | Administrador do núcleo | RF-164; disponibilidade pessoal/residencial a detalhar |
| Usar outra forma de pagamento | Disponível além das formas predefinidas | RF-168; não está definido se texto livre ou cadastro administrado |
| Excluir despesa individual, inclusive paga | Conforme permissões do contexto, com confirmação e motivo | RN-092–095; papel exato de exclusão não definido |
| Excluir cadeia em aberto | Conforme autorização, preservando registros pagos | RF-191, RN-106–107; sem permissão de apagar pagos em lote |
| Reverter pagamento | Administrador do núcleo | RN-077–081; exige motivo; aplicação ao espaço pessoal e formulação antiga restrita a parcelas exigem refinamento |
| Restaurar despesa/cadeia | Administrador do núcleo | RF-179, RF-192, RN-097–098, RN-108; restauração não amplia acesso |
| Configurar antecedência de vencimento | Configuração prevista | RN-112; ator e escopo não definidos |
| Consultar histórico | Acesso conforme contexto e privacidade | Não é acesso global irrestrito para administrador |
| Exportar registros pessoais | Titular, pela plataforma | Não inclui indiscriminadamente dados compartilhados |

## Dependência dos papéis de residência

Responsável administra informações, configurações e acessos; colaborador consulta e atualiza o permitido; visualizador consulta. A matriz final deve traduzir essas funções para cada operação do Kapanga. Não deduzir que responsável pela residência pode executar reversão reservada ao administrador do núcleo.

## Verificação derivada para implementação

Validar no backend a sessão, o contexto real do lançamento, o vínculo ativo, o papel aplicável, a disponibilidade do módulo e as restrições do estado financeiro. Aplicar também em lotes, históricos, exportação e fontes do Okape. O usuário informado no payload não substitui a identidade autenticada como autor do lançamento ou operação.

## Espaço pessoal

A plataforma permite despesas pessoais e determina privacidade. Kapanga reserva reversão e restauração a administradores de núcleo, mas não define quem executa essas ações no espaço pessoal. Não conceder acesso a administrador de qualquer núcleo do titular nem promover o titular a administrador financeiro por inferência. Ver Q-K01.
