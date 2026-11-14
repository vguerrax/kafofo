# Plataforma — Critérios de aceitação

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


**Status:** cenários derivados para verificação futura; não são testes executados. Os cenários com dependências abertas são parciais e não servem como comprovação de prontidão. Autenticação federada, recuperação por e-mail/local e outras variantes dependem dos fluxos detalhados antes de critérios completos.

| ID | Cenário / referências | Dado ou quando | Resultado esperado |
| --- | --- | --- | --- |
| CA-P01 | **Integração indisponível** — RF-001–003 | Uma integração falha | Outras funcionalidades independentes continuam utilizáveis e a falha é delimitada. |
| CA-P02 | **Dados sincronizados** — RF-004–005 | O serviço externo fica indisponível e existem dados previamente sincronizados | As informações autorizadas permanecem consultáveis pelo servidor; o cenário não exige funcionamento offline. |
| CA-P03 | **Identidade independente** — RF-006, RF-008–009 | A mesma conta participa de dois núcleos | Usa a mesma identidade e conserva permissões independentes em cada núcleo. |
| CA-P04 | **Login sem e-mail pessoal** — ADR-0008; RF-006 | Uma pessoa não fornece endereço pessoal de e-mail | O cadastro/login por username e senha deve funcionar; adoção da biblioteca depende da POC. |
| CA-P05 | **Administração e privacidade** — RF-010–014; RN-047 | Administrador global administra a instância | A função administrativa não concede acesso privado irrestrito pela aplicação. |
| CA-P06 | **Núcleo e residência** — RF-015–018 | Um núcleo possui várias residências | A associação é mantida; uma residência não pertence simultaneamente a outro núcleo no MVP. |
| CA-P07 | **Espaços privados** — RF-019, RF-021 | Uma conta consulta registros pessoais de outra | O acesso é negado quando não existe compartilhamento permitido e explícito. |
| CA-P08 | **Compartilhamento limitado** — RF-020–021 | Um painel pessoal é compartilhado no Okape | O convidado só visualiza fontes para as quais possui autorização; não herda acesso do proprietário. |
| CA-P09 | **Papéis independentes** — RF-022–025; RN-001–003 | Uma pessoa participa de núcleo sem morar em residência vinculada | A participação é válida e não recebe automaticamente todos os acessos às residências. |
| CA-P10 | **Convite válido** — RF-026–029; RN-004–008 | Administrador gera link e pessoa autenticada o aceita dentro de sete dias, sem revogação | A participação no núcleo convidante pode ser concluída; papel inicial depende do refinamento. |
| CA-P11 | **Convite inválido** — RF-026–029; RN-006–008 | Link está expirado ou revogado, ou um não administrador tenta gerar convite | A entrada ou geração indevida é impedida. |
| CA-P12 | **Saída e remoção** — RF-030–033; RN-009–015 | Um membro sai ou é removido por administrador | Acesso do vínculo é revogado, histórico preservado e núcleo ativo não fica sem administrador. |
| CA-P13 | **Exclusão de núcleo** — RF-034–036; RN-016–019 | Exclusão é confirmada por ator autorizado após apresentação de impactos | O núcleo é excluído logicamente, acesso dos membros e integrações são desativados. |
| CA-P14 | **Recuperação de núcleo** — RF-035–036; RN-016–018 | Ator autorizado solicita recuperação dentro do período padrão de trinta dias ou prazo configurado | Núcleo e associações recuperáveis são restaurados; detalhes de vínculos e expurgo exigem Q-P12. |
| CA-P15 | **Papéis de residência** — RF-037–042 | Responsável, colaborador e visualizador usam a mesma residência | Aplicam-se poderes respectivos, independentes do papel de núcleo; visualizador não atualiza dados por esse papel. |
| CA-P16 | **Criação de residência** — RF-043–044; RN-021 | Administrador de núcleo cria residência | A residência é vinculada ao núcleo sem acesso automático a todos os membros; não administrador não pode criá-la. |
| CA-P17 | **Exclusão de residência** — RF-045–048; RN-022–025 | Administrador exclui residência após apresentação de impacto | Responsáveis são notificados, integrações são desativadas e o núcleo continua existente; recuperação respeita período aplicável. |
| CA-P18 | **Independência de módulos** — RF-049–052 | Um módulo funciona sem outro módulo doméstico habilitado | Sua operação independente e contextual não exige integração obrigatória com Potira ou outro produto. |
| CA-P19 | **Prevalência global** — RF-053–057; RN-026–030 | Módulo habilitado num núcleo é desativado globalmente | Novas operações são impedidas em todos os núcleos afetados; habilitação local não contorna a restrição. |
| CA-P20 | **Reativação** — RF-058–059; RN-028, RN-031 | Módulo com registros existentes é desativado e reativado | Os registros são preservados e não precisam ser recadastrados. |
| CA-P21 | **Cadastro inicial** — RF-060–067; RN-032–035 | Pessoa se cadastra pelo fluxo inicial comum e informa nome de núcleo | É criada como membro e administrador do núcleo; residência, convites e ajustes não são obrigatórios. |
| CA-P22 | **Contexto ativo** — RF-068–079; RN-036 | Usuário alterna entre contextos autorizados | Navegação e operações aplicam o contexto, sem mistura automática; Okape preserva exceção pessoal explícita. |
| CA-P23 | **Acesso cruzado** — RF-013, RF-075, RF-078–079 | Requisição usa identificador de recurso pertencente a contexto não autorizado | Backend impede acesso, mesmo com sessão válida e interface manipulada. |
| CA-P24 | **Centro de notificações** — RF-080–085; RN-037 | Notificação autorizada é emitida sem SMTP ou push | Permanece disponível internamente e permite controle de leitura. |
| CA-P25 | **Canais independentes** — RF-086–088; RN-038–040 | SMTP falha ou push não está autorizado/compatível | Falha não impede demais canais disponíveis; identificador sintético não recebe e-mail. |
| CA-P26 | **Preferências** — RF-089–093 | Usuário ajusta canal, categoria, contexto e prioridade | Preferências são respeitadas; exceções críticas dependem de catálogo ainda pendente. |
| CA-P27 | **Perfil privado** — RF-094–097; RN-041 | Outro membro consulta perfil | Somente nome de exibição e foto são expostos como campos pessoais; e-mail, preferências e segurança permanecem privados. |
| CA-P28 | **Recuperação assistida** — RF-099, RF-101–103; RN-042–045 | Administrador de núcleo inicia recuperação de membro próprio | Administrador/núcleo são registrados, titular define a senha, token é temporário e de uso único e sessões antigas são revogadas. |
| CA-P29 | **Abuso de recuperação** — RF-098–103; RN-043–045 | Administrador tenta recuperar pessoa fora dos núcleos administrados ou token é reutilizado/expirado | Recuperação é impedida; limite de tentativas deve ser aplicado conforme definição futura. |
| CA-P30 | **Segundo fator** — RF-104–107 | Titular ativa TOTP em fluxo compatível | Segundo fator é validado sem SMS obrigatório; critério detalhado de recuperação depende de Q-P08. |
| CA-P31 | **Consulta e encerramento individual** — RF-108–109, RF-111; RN-046 | Titular consulta e encerra uma sessão | Dados de navegador, sistema, data e último acesso são apresentados e a sessão encerrada não acessa recursos protegidos. |
| CA-P32 | **Encerrar demais sessões** — RF-110; RN-046 | Titular escolhe encerrar as demais sessões | Sessão atual permanece válida e as demais deixam de autorizar acesso. |
| CA-P33 | **Auditoria por escopo** — RF-112–115; RN-047 | Pessoa consulta histórico administrativo ou de segurança | Consulta é restrita ao escopo autorizado; eventos de recuperação identificam iniciador e núcleo. |
| CA-P34 | **Exclusão de conta** — RF-116–121; RN-013–015 | Titular solicita exclusão com responsabilidades administrativas | Responsabilidades são resolvidas antes do encerramento, participações são encerradas e dados pessoais são eliminados/anonimizados conforme política. |
| CA-P35 | **Exportação pessoal** — RF-122–123; RN-048 | Titular solicita seus dados | Inclui perfil, preferências, espaço pessoal, segurança acessível, vínculos e registros pessoais, sem conteúdo compartilhado indiscriminado. |
| CA-P36 | **PWA online** — RNF-001–006 | Usuário acessa em telas diferentes e perde conexão com servidor | Interface adapta-se, oferece instalação quando compatível e indica indisponibilidade, sem prometer operações offline. |
| CA-P37 | **Acessibilidade e consistência** — RNF-007–012 | Pessoa navega pelos fluxos usando teclado e tecnologia assistiva | Fluxos, feedback e apresentação são avaliados conforme WCAG 2.2 AA, com padrões consistentes entre módulos. |
| CA-P38 | **Idioma e fusos** — RNF-013–020 | Usuário usa pt-BR e horários de origens diferentes | Apresentação considera localização e fusos, preserva origem e horário local; precedência detalhada depende de Q-P21. |
| CA-P39 | **Dados e recuperação operacional** — RNF-021–024 | Procedimento de backup/restauração é definido e executado em ambiente de validação | Banco e arquivos são restaurados de forma consistente com separação de identidade e isolamento lógico; procedimento ainda pendente. |
| CA-P40 | **Exportação de núcleo** — RNF-025 | Ator e abrangência de exportação de núcleo forem definidos | O formato deve ser aberto/documentado e respeitar acesso; detalhamento depende de Q-P16. |

Na implementação, complementar estes cenários com transações interrompidas, chamadas concorrentes, repetição de tokens, perda de permissão entre solicitação e processamento e falhas do canal de entrega. Esses desdobramentos são orientações técnicas, não novos recursos funcionais.
