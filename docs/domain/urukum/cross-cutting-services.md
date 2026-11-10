# Urukum — Serviços transversais

## Contexto e colaboração

Usa identidade, papéis e autorização da plataforma. Notas pessoais permanecem exclusivas do proprietário. Compartilhamento é contextual, sem concessões diretas entre contextos. A mesma regra protege tags, histórico e lixeira.

O módulo permite edição, exclusão, restauração e arquivamento por membros autorizados sem privilégios administrativos financeiros. Papéis concretos de residência devem ser conciliados com visualizador da plataforma antes de implementar operações de escrita.

## Versões, auditoria e logs

Versões completas são requisito de domínio no MVP. Autor/data/hora ficam registrados; conteúdo anterior permanece consultável. Não substituir esse armazenamento por logs Pino nem afirmar restauração de versão por causa de backup.

ADR-0010 adia auditoria específica por módulo; Urukum exige histórico completo. Preservar o requisito funcional e explicitar a necessidade de conciliação com a ADR, como nos outros módulos. Retenção de versões de ativas e relação com excluídas precisam de política específica.

## Exclusão e portabilidade

Lixeira própria segue trinta dias padrão configuráveis; restaura nota ativa com conteúdo/tags/histórico e preferências individuais. Remoção definitiva após retenção segue política global, sem promessa de apagamento de todas as cópias de backup no mesmo momento.

Exportação pessoal da plataforma inclui registros pessoais dos módulos, protegendo dados de terceiros. Delimitar conteúdo formatado, tags, versões, preferências e lixeira no arquivo, sem exportar indiscriminadamente notas compartilhadas de outras pessoas. Não há exportador independente PDF/Markdown/CSV aprovado na especificação do módulo.

## Notificações e integrações

Urukum não possui lembretes, vencimentos ou notificações próprias. Não enviar notificações de edições comuns. Atividades de tarefa/agenda pertencem a Mutyrão/Arakatu; não criar integração nota→tarefa/evento no MVP.

Referência a editor consistente não exige que os outros módulos estejam habilitados para usar notas. Priorizar componente comum quando tecnicamente adequado, sem acoplamento obrigatório entre domínios.

## Catálogo e marca

Ativação/desativação do módulo segue plataforma, preservando dados. O documento de marca mais antigo lista quatro módulos; Urukum está nomeado na especificação própria e não possui justificativa cultural/visual completa fornecida. Não inventar identidade para preencher essa diferença.
