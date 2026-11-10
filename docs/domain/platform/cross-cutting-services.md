# Plataforma — Serviços transversais

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


## Catálogo e ativação de módulos

**Base:** RF-049–059, RN-026–031.

A instância define os módulos disponíveis; cada núcleo escolhe quais habilitar. Núcleos podem utilizar conjuntos diferentes. Desativação global prevalece, impede novas operações e preserva dados. Reativação dispensa recadastro.

O catálogo conhecido inclui Kitanda, Arakatu, Kapanga, Mutyrão, Okape e Urukum. O documento de marca consolida expressamente os quatro primeiros; Okape e Urukum estão nomeados nas respectivas especificações funcionais, sem descrição cultural ou personalidade de marca fornecidas.

A ativação no espaço pessoal está pendente: a configuração em dois níveis foi definida por instância e núcleo, mas o usuário pode participar de vários núcleos com módulos distintos.

## Notificações

**Base:** RF-080–093, RN-037–040 e RN-050.

Centro nativo independente de terceiros, com controle de leitura e notificações pessoais e entre módulos. Canais do MVP:

| Canal | Condição | Comportamento conhecido |
| --- | --- | --- |
| Interno | Plataforma disponível | Não depende de serviço externo |
| E-mail | SMTP válido configurado na instância e contato utilizável | Falha não impede demais canais; não torna e-mail obrigatório para identidade |
| Push | Navegador/dispositivo compatível e autorização | Não garante disponibilidade em qualquer ambiente |

Preferências por canal, categoria, contexto e prioridade são individuais. Padrões devem evitar configuração excessiva. Eventos administrativos críticos podem exigir comunicação mesmo com notificações comuns desativadas; a lista desses eventos e a precedência das regras ainda não foram definidas.

Eventos específicos permanecem nos módulos: Kitanda reserva notificações a compartilhamento/permissões; Mutyrão prevê atribuições, alterações e prazos; Urukum não possui notificações próprias. A plataforma não deve criar alertas indiscriminados para toda alteração de registro.

**Refinamento técnico proposto:** definir destinatário e permissão antes de gerar conteúdo e repetir a verificação ao consultar a notificação; estabelecer tentativas, deduplicação e tratamento de falhas sem prometer entrega exatamente uma vez.

## Auditoria e históricos

**Base:** RF-112–115, RN-047.

| Nível | Finalidade | Limite de acesso |
| --- | --- | --- |
| Instância | Eventos administrativos e operacionais globais | Escopo administrativo, sem acesso privado irrestrito |
| Núcleo | Atividades administrativas do núcleo | Pessoas autorizadas naquele núcleo |
| Segurança da conta | Atividades individuais de segurança | Titular e acessos especificamente autorizados |
| Módulo | Eventos e versões de domínio | Regras do módulo e do contexto |

Recuperação assistida registra o administrador e o núcleo iniciador. Saída preserva autoria; exclusão de conta pode anonimizar referências. Eventos de domínio, versões completas de notas e logs Pino têm finalidades diferentes e não devem ser considerados equivalentes.

Prazos por categoria estão pendentes. O prazo padrão de registros excluídos não determina automaticamente retenção de auditoria. A ADR-0010 adia auditoria específica, enquanto documentos funcionais posteriores exigem históricos já no MVP: conflito registrado em Q-P03.

## Integrações

**Base:** RF-001–005 e ADR-0019.

Integrações devem falhar isoladamente, permitindo consulta de informações previamente sincronizadas conforme permissões. Esse requisito não significa suporte offline: o servidor continua necessário. Disponibilidade, atualidade e autorização dos dados sincronizados precisam ser tratadas separadamente.

Identidade individual, doméstica compartilhada e de integração são distintas; permissões não se propagam automaticamente. Na exclusão lógica de núcleo ou residência, integrações são desativadas e configurações recuperáveis preservadas quando possível.

Protocolos, credenciais, formatos de sincronização, expiração de cache e critérios de descarte não estão definidos genericamente. Na agenda, vale o escopo unidirecional do MVP; outros módulos não herdam automaticamente esse mecanismo.

## Exportação, arquivos e recuperação operacional

**Base:** RF-116–123, RNF-021–025, ADRs 0010–0012 e 0016.

Exportação individual está definida no MVP. Exportação de núcleo está no levantamento e precisa de detalhamento de ator e abrangência. Formatos devem ser abertos e documentados. Armazenamento de arquivos inicialmente em disco local, sem MinIO obrigatório.

Backups são configuráveis pelo operador. Ferramenta, periodicidade, criptografia, destino e objetivos de recuperação não estão aprovados. A solução precisa considerar PostgreSQL e arquivos em conjunto; restauração lógica de um registro, exportação e restauração de backup são processos distintos.

O processamento assíncrono será inicialmente no processo Fastify com persistência PostgreSQL. Persistência de tarefas não define garantias de execução: retomada, concorrência, tentativas e idempotência permanecem para refinamento técnico.
