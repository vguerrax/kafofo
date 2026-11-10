# Plataforma — Fluxos de uso

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


Os fluxos consolidam comportamentos aprovados. Passos técnicos e tratamentos sem definição constam como pendências, sem simular uma implementação concluída.

## FL-P01 — Primeiro cadastro e novo núcleo

Na Alpha 1, a [#7](https://github.com/vguerrax/kafofo/issues/7) separa a criação única do administrador e o login da criação de núcleo/residência na #8, conforme o [contrato do incremento](alpha-1.md#primeiro-acesso-e-vínculos). O fluxo geral do MVP abaixo não autoriza cadastro livre na instalação.

**Ator:** pessoa criando conta. **Referências:** RF-060–067, RN-032–035, ADR-0008.

1. A pessoa cadastra sua identidade; e-mail pessoal não é obrigatório para autenticação.
2. Informa o nome obrigatório do núcleo inicial.
3. A plataforma cria o núcleo e associa o criador como primeiro membro e administrador.
4. O uso pode começar sem residência, convidados ou ajustes de módulos; aplicam-se configurações padrão.
5. Residências, convites e ajustes podem ser adicionados depois; contas existentes podem criar outros núcleos.

**Pendente:** cadastro iniciado por convite versus RN-032; escolha do primeiro administrador global e abertura/fechamento de cadastro da instância.

## FL-P02 — Convidar e aceitar participação

**Ator inicial:** administrador do núcleo. **Referências:** RF-026–029, RN-004–008.

1. O administrador gera um link individual para o núcleo administrado.
2. Copia e compartilha por canal externo de sua escolha, sem integração obrigatória.
3. A pessoa acessa o link e autentica-se ou cria conta.
4. A plataforma verifica validade e revogação e permite a entrada por convite válido.
5. O administrador pode consultar e revogar o convite antes da aceitação; o prazo padrão é de sete dias.

Convite expirado ou revogado não permite entrada. Quantidade de usos, vínculo com destinatário, papel inicial e reaceitação não estão especificados.

## FL-P03 — Criar residência e conceder acesso

**Ator:** administrador do núcleo para criação. **Referências:** RF-037–048, RN-021–025.

1. Cria uma residência associada ao núcleo; campos obrigatórios além dos definidos nas fontes precisam de refinamento.
2. A residência não é disponibilizada automaticamente a todos os membros.
3. Os acessos são atribuídos conforme os papéis responsável, colaborador e visualizador, independentes dos papéis do núcleo.
4. Responsáveis administram informações, configurações e acessos daquela residência.

Quem pode inicialmente designar responsáveis e limites de autoconcessão devem constar da matriz completa antes da implementação.

## FL-P04 — Alternar contexto e executar operação

**Ator:** usuário autenticado. **Referências:** RF-068–079, RN-036.

1. Seleciona espaço pessoal, núcleo ou residência autorizados.
2. A navegação e as operações dos módulos respeitam o contexto ativo.
3. Cada operação aplica permissões do recurso e do contexto; não ocorre compartilhamento automático.
4. Composição pessoal explícita no Okape mantém verificação de cada fonte de dados.

**Verificação derivada:** adulterar identificadores de contexto ou recurso não deve permitir acesso cruzado.

## FL-P05 — Sair ou remover membro

**Ator:** próprio membro ou administrador do núcleo. **Referências:** RF-030–033, RN-009–015.

1. A pessoa solicita saída, sem aprovação, ou um administrador solicita sua remoção.
2. A plataforma verifica se a ação deixará um núcleo ativo sem administrador.
3. Havendo outros membros, resolve-se a transferência de administração antes de encerrar a responsabilidade necessária.
4. Sem membros restantes, aplica-se a exclusão do núcleo conforme as regras de ciclo de vida.
5. O acesso é revogado e o histórico permanece com identificação de autoria, ressalvadas regras de anonimização e exceções documentadas.

A conta individual não é automaticamente excluída pela saída de um núcleo.

## FL-P06 — Recuperar senha

**Atores:** titular, administrador do próprio núcleo ou operador local. **Referências:** RF-098–103, RN-042–045.

1. Inicia recuperação por e-mail configurado, de modo assistido ou pelo procedimento local de servidor.
2. Na modalidade assistida, valida-se que o administrador administra um núcleo do qual o titular participa; registra-se administrador e núcleo solicitante.
3. Gera-se credencial temporária de uso único e validade limitada, com limite de tentativas e auditoria.
4. O próprio titular define a nova senha; administrador não visualiza nem define a senha.
5. Sessões antigas são revogadas. A alteração é global à conta e afeta todos os núcleos.

**Pendências:** prazo e entrega do token, verificação da identidade do solicitante, recuperação combinada com 2FA e comprovação dos fluxos pela POC. Identificador sintético da biblioteca não é endereço para recuperação.

## FL-P07 — Administrar 2FA e sessões

A [#7](https://github.com/vguerrax/kafofo/issues/7) entrega login, sessão absoluta, logout e troca de senha com revogação. Gestão completa das sessões e 2FA não são demonstradas por essas operações. A quinta falha de senha atual revoga todas as sessões e mantém o bloqueio da troca após novo login, conforme o [contrato da Alpha 1](alpha-1.md#senhas-e-sessões).

**Ator:** titular. **Referências:** RF-104–111, RN-046.

1. Pode ativar TOTP por aplicativo autenticador, sem SMS obrigatório.
2. Fluxos sujeitos a 2FA validam o segundo fator; a abrangência exata precisa ser especificada.
3. Consulta sessões e seus dados, encerra uma sessão ou todas as demais preservando a atual.
4. Sessões encerradas deixam de acessar recursos protegidos.

A recuperação de acesso ao 2FA é requisito, mas o mecanismo ainda não está definido; não assumir códigos de reserva aprovados.

## FL-P08 — Desativar e reativar módulo

**Atores:** administrador global ou do núcleo. **Referências:** RF-053–059, RN-026–031.

1. O administrador global estabelece disponibilidade na instância; o administrador do núcleo escolhe dentre os disponíveis.
2. Desativação global prevalece e afeta todos os núcleos usuários.
3. O módulo desativado não recebe novas operações e seus dados são preservados.
4. A reativação não exige recadastro.

Tratamento de leitura, tarefas pendentes e notificações agendadas durante desativação está em aberto.

## FL-P09 — Excluir e recuperar núcleo ou residência

**Pré-condição:** autorização específica; matriz completa pendente. **Referências:** RF-034–048, RN-016–025.

1. Apresenta impactos sobre vínculos, dados e integrações; exige confirmação explícita para exclusão do núcleo e apresentação de impacto para residência.
2. Aplica exclusão lógica; no núcleo, desativa acesso dos membros. Integrações são desativadas e configurações recuperáveis são preservadas quando possível.
3. Na exclusão de residência, notifica os responsáveis; o núcleo permanece existente.
4. Permite recuperação no prazo configurado da instância, padrão de trinta dias, restaurando associações conforme as regras aplicáveis.
5. Após o prazo, aplica eliminação conforme política definida; dados históricos e integrações exigem refinamento da ordem e alcance do expurgo.

A restauração não garante que credenciais ou autorizações de serviços externos continuem válidas. O destino de vínculos revogados enquanto o contexto estava excluído precisa ser especificado.

## FL-P10 — Exportar dados pessoais

**Ator:** titular. **Referências:** RF-122–123, RN-048, ADR-0010.

1. Solicita exportação de seus dados.
2. Inclui perfil, preferências, espaço pessoal, histórico de segurança acessível ao titular, relação de núcleos e residências e registros pessoais dos módulos nativos.
3. Protege informações de terceiros; não exporta indiscriminadamente dados compartilhados.
4. Disponibiliza resultado em formato aberto e documentado; formato concreto e entrega ainda pendentes.

Exportação de núcleo também está prevista em RNF-025, com ator e abrangência a detalhar. Exportação não substitui backup operacional.

## FL-P11 — Excluir conta

**Ator:** titular. **Referências:** RF-116–121, RN-013–015.

1. Solicita exclusão de sua conta.
2. Verifica responsabilidades administrativas; resolve transferência ou exclusão de núcleo quando necessário.
3. Encerra as participações nos demais núcleos.
4. Elimina ou anonimiza dados pessoais quando possível e permitido, preservando referências históricas anonimizadas quando necessárias.

Sequência física, prazo, eventual cancelamento do pedido, arquivos, integrações e backups precisam de política específica. A retenção de trinta dias não deve ser extrapolada como garantia de recuperação completa de toda exclusão de conta.
