# Plataforma — Papéis, privacidade e autorização

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


Para a Alpha 1, a [matriz da #8](alpha-1.md#núcleo-residência-e-autorização-contextual) prevalece: nomeação de responsáveis é exclusiva de administradores daquele núcleo, inclusive para administrador global. Responsáveis gerenciam apenas colaboradores e visualizadores.

## Política conhecida

Privacidade por padrão, privilégio mínimo, compartilhamento explícito e revogável. A autenticação identifica a pessoa; a autorização determina a ação permitida sobre o recurso e seu contexto. O seletor da interface não concede acesso.

Papéis são predefinidos e fixos no MVP. O levantamento não contém uma matriz exaustiva de operações por papel. A tabela abaixo registra somente permissões conhecidas. **Não definido** não equivale a permissão concedida.

## Matriz de permissões confirmadas

| Operação | Ator autorizado | Limite |
| --- | --- | --- |
| Configurar a instância e retenção | Administrador global | Administração não concede leitura irrestrita de dados privados |
| Definir módulos disponíveis | Administrador global | Desativação global prevalece e afeta núcleos usuários |
| Criar outro núcleo | Conta existente | Criador assume administração inicial; condições de bloqueio não especificadas |
| Gerar, consultar e revogar convites | Administrador do núcleo | Somente no núcleo administrado |
| Aceitar convite | Pessoa autenticada ou que cria conta | Convite válido; efeitos sobre criação automática de núcleo pendentes |
| Sair do núcleo | Próprio membro | Sem aprovação, respeitando continuidade administrativa |
| Remover membro | Administrador do núcleo | Preserva histórico; remoção do último administrador exige continuidade |
| Criar e excluir residência | Administrador do núcleo | Não concede acesso geral automático |
| Administrar informações, configurações e acessos da residência | Responsável da residência | Não inclui poder de excluir a residência; criação/exclusão são do administrador do núcleo |
| Atualizar informações permitidas na residência | Colaborador da residência | Restrições adicionais do módulo continuam aplicáveis |
| Consultar informações permitidas na residência | Visualizador da residência | Sem autorização de atualização decorrente desse papel |
| Habilitar módulos no núcleo | Administrador do núcleo | Somente módulos disponíveis globalmente |
| Iniciar recuperação assistida | Administrador do núcleo | Somente conta de membro do próprio núcleo; não vê nem escolhe senha |
| Definir nova senha | Titular em fluxo temporário válido | Token de uso único; sessões antigas revogadas |
| Consultar e encerrar sessões | Titular da conta | Consulta própria; encerramento das demais preserva sessão atual |
| Administrar perfil e preferências | Titular | Nome e foto visíveis; demais dados pessoais privados |
| Exportar dados individuais | Titular | Dados pessoais definidos, sem exportação indiscriminada de dados de terceiros |
| Solicitar exclusão de conta | Titular | Verificação e resolução das responsabilidades administrativas |
| Consultar auditoria | Pessoa autorizada no escopo | Administração não concede leitura indiscriminada de registros privados |
| Excluir/recuperar núcleo; recuperar residência; exportar núcleo | Ator exato a detalhar | Capacidades previstas, sem matriz completa aprovada |

## Verificação de acesso — orientação técnica derivada

Para cada operação protegida, verificar sessão válida, contexto real do recurso, participação/vínculo vigente, papel aplicável, compartilhamento quando permitido, disponibilidade do módulo e estado de exclusão. Aplicar a mesma política a pesquisa, indicadores, arquivos, notificações, históricos e exportações, não somente às telas de edição.

A escolha entre autorização na aplicação, políticas no banco ou combinação ainda não foi fechada. Não presumir RLS na ADR-0009.

## Compartilhamento por módulo

| Módulo | Restrição funcional conhecida |
| --- | --- |
| Kitanda | Compartilhamento apenas com membros autorizados do contexto; sem externos ao núcleo, links públicos ou convites sem conta |
| Urukum | Notas pessoais privadas; colaboração em núcleo/residência; sem compartilhamento direto entre contextos |
| Okape | Painel pessoal pode ser compartilhado individualmente para visualização com conta da mesma instância; acesso ao painel não concede acesso aos dados de origem |
| Mutyrão | Compartilhamento com membros autorizados do contexto ou pessoas específicas; limite de participação dessas pessoas precisa de interpretação explícita |
| Kapanga | Operações e indicadores respeitam contexto e permissões; sem deduzir compartilhamento externo |
| Arakatu | Agenda pessoal e compartilhada; política específica será tratada na documentação do módulo |

Painéis pessoais do Okape podem combinar dados de diferentes contextos autorizados. Isso é composição explícita; não altera a regra de não misturar automaticamente informações entre contextos.

## Revogação e dados históricos

Saída, remoção e perda de acesso ao contexto retiram acesso aos recursos correspondentes, preservando o histórico conforme suas regras. Autoria após saída é preservada; exclusão de conta pode exigir anonimização. No Okape, a especificação determina criador identificado como desconhecido após perda de acesso: exceção localizada a revisar na integração, sem apagar o registro de auditoria por inferência.
