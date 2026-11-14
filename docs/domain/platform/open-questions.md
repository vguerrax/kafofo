# Plataforma — Pendências, conflitos e riscos

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


As prioridades abaixo são recomendações de sequência de refinamento, não alteração do escopo aprovado. Questões locais devem ser resolvidas antes da funcionalidade afetada; não é necessário reabrir decisões já explícitas.

| ID | Ponto | Evidência / conflito | Impacto e encaminhamento |
| --- | --- | --- | --- |
| Q-P01 | Cadastro por convite | RN-032 cria núcleo para cada conta; RF-028 permite criar conta para aceitar convite | Definir se convidado cria núcleo adicional; esclarecer também primeiro cadastro da instância versus primeiro cadastro de cada pessoa |
| Q-P02 | Inicialização administrativa e cadastro | Primeiro criador é administrador do núcleo; bootstrap do administrador global e abertura de cadastro não definidos | Bloqueia configuração segura da instância e política de novas contas |
| Q-P03 | Auditoria de módulos no MVP | ADR-0010 adia auditoria específica; Kitanda, Mutyrão, Kapanga e Urukum exigem históricos | Delimitar auditoria comum versus histórico de domínio e revisar ADR se necessário; não remover requisitos dos módulos |
| Q-P04 | Compartilhamento seletivo | Plataforma permite inclusive externos ao núcleo; Kitanda restringe; Urukum não cruza contextos; Okape admite contas da instância | Consolidar matriz por tipo de recurso; distinguir externo ao núcleo de externo à instância; não abrir link público por inferência |
| Q-P05 | Matriz completa de papéis | Papéis fixos aprovados; poderes de exclusão/recuperação de núcleo, recuperação de residência e designação de responsáveis incompletos | Fechar ações administrativas sem atribuir superpoderes implícitos |
| Q-P06 | Recuperação assistida multínúcleo | Administrador de um núcleo pode iniciar troca da senha global de membro | Especificar prova de identidade, entrega do token e proteção contra abuso; manter rastreio de administrador/núcleo |
| Q-P07 | Identidade técnica | Better Auth condicionado; username, federação e requisitos sem e-mail ainda precisam de comprovação | Executar POC e registrar evidências; definir normalização/unicidade e provedores opcionais |
| Q-P08 | Tokens e 2FA | Uso único, validade limitada e limite de tentativas definidos; valores e recuperação de TOTP ausentes | Especificar validade, tentativas, invalidação e recuperação conjunta sem presumir códigos de reserva |
| Q-P09 | Convites | Prazo padrão sete dias; configurabilidade e semântica de uso/destinatário não especificadas | Definir uso único ou múltiplo, papel inicial e situações de conta já membro |
| Q-P10 | Módulos no contexto pessoal | Habilitação definida por instância/núcleo; usuário pode ter vários núcleos | Definir disponibilidade pessoal e efeitos de desativação de um núcleo sobre dados pessoais |
| Q-P11 | Desativação de módulos | Dados preservados e ausência de novas operações definidos | Esclarecer leitura, jobs existentes, lembretes, exportação e catálogo do Okape durante desativação |
| Q-P12 | Exclusão, recuperação e expurgo | Trinta dias configuráveis; efeitos em vínculos, histórias e integrações parcialmente definidos | Definir propagação, ordem de expurgo e restauração sem reabrir acessos posteriormente revogados |
| Q-P13 | Autoria após saída | RN-012 preserva identificação; Okape mostra criador desconhecido após perda de acesso; exclusão de conta prevê anonimização | Distinguir rótulo exibido, identidade em auditoria e anonimização; preservar exceções localizadas |
| Q-P14 | Notificações obrigatórias | Eventos administrativos críticos podem superar preferências; lista ausente | Definir eventos, precedência, padrões, prazos e significado da prioridade |
| Q-P15 | Retenção por categoria | Retenção de excluídos não especifica auditoria, logs, versões, tokens ou notificações | Definir políticas separadas; evitar usar trinta dias indiscriminadamente |
| Q-P16 | Portabilidade | Exportação individual definida; exportação de núcleo prevista em RNF-025 | Definir formato, entrega, prazo, ator/abrangência do núcleo e dados de terceiros; não excluir RNF-025 por ausência na ADR-0010 |
| Q-P17 | Backups | RNF-024 prevê configuração pelo operador; não há procedimento aprovado | Especificar backup consistente de banco/arquivos, restauração, destino e objetivos de recuperação |
| Q-P18 | Isolamento e assíncrono | ADRs 0009 e 0012 aprovam direção, sem mecanismo completo | Definir autorização, transações, idempotência, retomada e concorrência antes de fluxos críticos |
| Q-P19 | Marca e catálogo | Documento de marca lista quatro módulos; especificações adicionais nomeiam Okape e Urukum | Atualizar catálogo de marca em etapa própria; não inventar etimologias, cores ou personalidades |
| Q-P20 | Decisões técnicas abertas | ADRs 0020–0022 | Fechar bibliotecas quando necessárias; licença antes de distribuição com condições explícitas; CD antes de automação |
| Q-P21 | Localização e metas operacionais | Fusos e WCAG 2.2 AA previstos; precedência de fuso e metas mensuráveis ausentes | Detalhar formato temporal e critérios de acessibilidade; desempenho, capacidade e SLA não definidos |

## Prioridade sugerida

Primeiro, resolver Q-P01–08 e Q-P18 para implementar identidade, recuperação e autorização. Em seguida, fechar Q-P09–17 conforme os serviços forem entregues. Q-P19–21 devem acompanhar marca, distribuição e validação da experiência, sem bloquear a redação funcional já consolidada.

## Riscos principais

- **Controle de conta entre núcleos:** recuperação assistida tem efeito global; um administrador local não deve conseguir assumir a conta por conveniência operacional.
- **Vazamento contextual:** pesquisas, painéis, históricos, notificações, arquivos e exportações podem vazar dados mesmo com telas CRUD protegidas.
- **Restauração indevida:** restaurar vínculos antigos sem conferir revogações pode reabrir acesso que já havia sido removido.
- **Escopo transversal amplo:** seis módulos com identidade, notificações, auditoria e portabilidade exigem entregas incrementais verificáveis.
- **Acoplamento do monólito:** separar pastas não garante independência; contratos e responsabilidade pelos dados precisam ser claros.

## Tratamento das divergências

Preservar o texto de origem e a identificação da regra; registrar resolução explícita na documentação afetada; quando houver mudança de decisão arquitetural aceita, criar ADR substituta ou revisão de status conforme o índice de ADRs. Nenhuma pendência desta lista foi resolvida silenciosamente nesta consolidação.

## Tratamento posterior na Alpha 1

A tabela acima preserva as questões identificadas na consolidação original. Consulte o [contrato aprovado](alpha-1.md) para a resolução no incremento. Uma questão pode estar resolvida para a Alpha 1 e continuar aberta para contextos ou capacidades adiados. A POC de autenticação, biblioteca de frontend, licença e CD mantêm seus status próprios.
