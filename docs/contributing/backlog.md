# Contrato do backlog

## Fonte de cada informação

| Informação                                             | Local oficial                  |
| ------------------------------------------------------ | ------------------------------ |
| Escopo, critérios, discussão e evidências da tarefa    | GitHub Issue                   |
| Etapa de execução                                      | Campo Status no GitHub Project |
| Responsável                                            | Assignee da issue              |
| Tipo e módulo                                          | Labels                         |
| Versão planejada                                       | Milestone, quando configurada  |
| Implementação e revisão                                | Pull request para develop      |
| Requisitos, arquitetura e decisões duráveis de produto | docs/ no Git                   |

O Project referencia as issues; não criar cartões independentes com cópia do texto. Não duplicar Status em labels ou no corpo. Sem Project configurado, não presumir prontidão pela condição aberta da issue. A [issue #2](https://github.com/vguerrax/kafofo/issues/2) acompanha essa configuração.

## Etapas

| Etapa                 | Condição                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Pendente              | Trabalho identificado; pode exigir refinamento                                             |
| Pronta                | Escopo e aceitação suficientes, decisões necessárias resolvidas e dependências satisfeitas |
| Em andamento          | Trabalho atribuído e iniciado                                                              |
| Em revisão            | PR ou resultado submetido à revisão                                                        |
| Aguardando publicação | Código integrado, ainda sem publicação verificada                                          |
| Concluída             | Evidência de entrega registrada; para trabalho sem publicação, resultado revisado          |
| Cancelada             | Encerramento sem implementação, com motivo                                                 |

Bloqueios são relações/dependências com motivo, não uma segunda etapa. O mantenedor coordena atribuições concorrentes; comentários não são reserva atômica de trabalho.

## Relação com Git e entrega

`develop` é a base de integração do código e documentação. Não é mais a fonte de status do backlog. Cada tarefa usa uma branch própria. PRs referenciam a issue sem palavras de fechamento antecipado. Rever automações padrão para não converter merge em entrega concluída.

Ao publicar funcionalidade, registrar versão/tag, commit distribuído, ambiente e resultado verificado. Não confundir esse commit com atualização documental posterior. Uma publicação pode concluir várias issues. Trabalho de configuração, documentação e POC tem critérios próprios e não precisa de produção artificial.

## Agentes

Devem ler issue, comentários, dependências e Status antes de iniciar; registrar resultado e evidências; atualizar etapa quando autorizados pelo fluxo. Acesso a Issues não garante acesso aos campos do Project: validar integração, credenciais e permissões. Se indisponível, comunicar limitação sem inventar estado ou criar cópia manual do backlog.
