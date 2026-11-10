# Kitanda — Requisitos não funcionais

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


A especificação detalhada não possui IDs próprios de RNF. São herdadas as definições da plataforma; não criar numeração que pareça ter sido aprovada no levantamento.

| Referência | Aplicação |
| --- | --- |
| plataforma/RNF-001–006 | Interface responsiva, PWA e instalação compatível; servidor necessário; sem operação offline no MVP |
| plataforma/RNF-007–012 | Referência WCAG 2.2 AA, teclado, tecnologias assistivas, contraste, feedback e consistência visual |
| plataforma/RNF-013–020 | pt-BR, preparação para internacionalização e localização temporal; apresentação do histórico com fuso adequado |
| plataforma/RNF-021–025 | Armazenamento na instância, isolamento, identidade separada, backups e portabilidade conforme política comum |

## Orientações de implementação derivadas

Permitir reorganização acessível sem depender exclusivamente de gesto de arrastar. Verificar permissões e regras no backend, inclusive em limpeza, contagens e histórico. Preservar consistência entre mutação e registro de operação. Definir tratamento de concorrência para marcação, soma, reordenação e limpeza.

Quantidade exige tipo e validação explícitos; não usar concatenação textual como soma. A ausência de catálogo não impede validar dados, mas não autoriza criar conversão automática de unidades. Conteúdo exibido deve respeitar a política de segurança da plataforma; editor rico não foi aprovado para o módulo.

## Limites

Não há metas aprovadas de latência de atualização, número máximo de listas/itens, tamanho de nome, unidade/precisão da quantidade, intervalo de sincronização ou navegadores específicos. Não prometer colaboração em tempo real com latência garantida por causa da expressão “atualização compartilhada”.

Cenários de aceitação são propostas de verificação, não testes executados ou comprovação de conformidade.
