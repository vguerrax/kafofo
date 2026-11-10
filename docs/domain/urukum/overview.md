# Urukum — Visão geral

Urukum é o bloco de notas digitais do Kafofo. Permite registrar informações rápidas, organizar por cores e tags, fixar notas importantes e colaborar em notas de núcleo/residência, com apresentação em cartões semelhantes a post-its.

Destina-se a registros e anotações. Não assume tarefas, compromissos, vencimentos ou lembretes; não possui notificações próprias.

## Capacidades do MVP

Criar/editar notas pessoais ou contextuais; título opcional e conteúdo obrigatório; cor de paleta predefinida; tags reutilizáveis por contexto; editor consistente com os outros módulos; grade responsiva, modo expandido, ordem manual e fixação individuais; pesquisa/filtros/ordenação; duplicação independente; arquivamento/desarquivamento; versões completas consultáveis; exclusão lógica, lixeira própria e restauração com retenção configurável.

## Contextos e atores

| Contexto/ator | Responsabilidade conhecida |
| --- | --- |
| Pessoal / proprietário | Somente titular visualiza e administra notas e tags pessoais |
| Núcleo / membro autorizado | Pode criar, visualizar, editar, excluir, restaurar, arquivar e desarquivar notas daquele contexto |
| Residência / membro autorizado | Mesmas operações na residência conforme autorização aplicável |
| Cada usuário | Mantém disposição e fixação próprias, sem reorganizar grade alheia |
| Administrador da instância | Configura retenção global; não ganha leitura privada irrestrita pela função |
| Plataforma | Identidade, contexto, papéis, ciclo de dados e base operacional |
| Urukum | Notas, tags, versões, preferências, arquivamento e lixeira |

Cada nota pertence a um contexto. Não há compartilhamento direto entre contextos. Perda de acesso ao contexto retira acesso às respectivas notas.

## Limites

Ficam fora do MVP: imagens/anexos/arquivos incorporados, áudio/vídeo, restauração de versões antigas, lembretes/notificações, vencimentos, compartilhamento entre contextos, integração com tarefas/eventos, cores livres e recursos avançados de base de conhecimento.

Não há definição cultural/visual completa de marca de Urukum na fonte. O nome funcional é preservado, sem inventar etimologia, slogan, tipografia ou códigos de cor. Paleta predefinida é requisito, mas seus valores ainda não foram fornecidos.
