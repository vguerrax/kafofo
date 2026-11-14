# Kapanga — Visão geral

## Finalidade

Kapanga é o módulo nativo do Kafofo para registrar, consultar e acompanhar despesas domésticas nos contextos pessoal, núcleo e residência. Deve oferecer organização financeira doméstica básica e independente, sem obrigar integração com bancos, Potira ou outros módulos domésticos.

O nome é a grafia de marca definida para o módulo. A identidade consolidada o descreve como popular, descontraído, marcante e direto. A forma lexical capanga/kapanga possui controvérsias etimológicas: não atribuir uma tradução única ou origem definitivamente comprovada. Esta documentação não adiciona validação linguística.

## Capacidades do MVP

- Despesas avulsas, recorrentes e parceladas, com valor, descrição e vencimento obrigatórios.
- Data de lançamento separada do vencimento e identificação automática de quem registrou.
- Categorias predefinidas e personalizadas; formas de pagamento opcionais.
- Pagamento integral, estados financeiros definidos, reversão administrativa e preservação histórica.
- Edição controlada após pagamento; exclusão lógica com confirmação e motivo; restauração administrativa.
- Recorrências semanais, mensais ou anuais sem término automático; parcelamentos finitos com vencimentos mensais.
- Consulta, filtros, identificação de vencidos e próximos vencimentos; resumo financeiro por contexto.

## Atores e fronteiras

| Ator/componente | Responsabilidade |
| --- | --- |
| Usuário autorizado | Operações financeiras comuns conforme permissões do contexto; matriz completa ainda a detalhar |
| Responsável pelo lançamento | Autor identificado automaticamente; não equivale ao responsável por pagar |
| Responsável pelo pagamento | Conceito distinto; não obrigatório no MVP |
| Administrador do núcleo | Criar categorias personalizadas, reverter pagamento e restaurar registros dentro do escopo autorizado |
| Plataforma | Conta, contexto, papéis, ativação do módulo, segurança, portabilidade e serviços comuns |
| Okape | Composição e apresentação de painéis; não calcula regras financeiras do Kapanga |
| Kapanga | Integridade das despesas, geração de ocorrências/parcelas, regras financeiras e dados dos indicadores |

No espaço pessoal, a atribuição de reversão e restauração a administradores de núcleo não foi conciliada com a privacidade do titular. Isso é uma pendência, não autorização para que administradores leiam despesas pessoais.

## Fora do MVP

Pagamentos parciais, saldo parcialmente quitado, rateio automático, conciliação bancária, integração bancária obrigatória, planejamento financeiro avançado, anexos/comprovantes, permissões financeiras granulares e redistribuição automática de valores de parcelas excluídas.

Não há definição de moeda, multimoeda, orçamento, receita, conta bancária, saldo de caixa ou estorno bancário. O estado REVERTIDO é uma reversão administrativa do registro de pagamento, sem implicar transferência de dinheiro.
