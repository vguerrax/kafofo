# Okape — Requisitos não funcionais

**Escopo:** `okape`. Oito RNF originais, com numeração local preservada.

| ID original | Requisito | Definição fornecida |
| --- | --- | --- |
| RNF-01 | Responsividade | a interface deverá funcionar em desktop, tablet e celular. |
| RNF-02 | Segurança | o Okape deverá respeitar as permissões dos módulos e contextos de origem, sem conceder acesso adicional por meio da composição de painéis. |
| RNF-03 | Isolamento | dados pessoais e compartilhados deverão respeitar os limites de acesso de cada usuário. |
| RNF-04 | Independência | o Okape não deverá depender da instalação ou utilização de um módulo específico. |
| RNF-05 | Compatibilidade | componentes visuais deverão validar a compatibilidade com a estrutura dos dados fornecidos. |
| RNF-06 | Resiliência | falhas de módulos ou integrações não deverão provocar perda da composição dos painéis. |
| RNF-07 | Extensibilidade arquitetural | a estrutura do catálogo e os contratos de dados deverão permitir expansão futura sem exigir uma reformulação completa do Okape. |
| RNF-08 | Segurança de execução | no MVP, somente componentes visuais mantidos pela plataforma poderão ser utilizados. Não haverá execução de código de terceiros. |

## Herança da plataforma

Aplicam-se também plataforma/RNF-001–025: responsividade/PWA online, acessibilidade com WCAG 2.2 AA como referência, teclado/tecnologias assistivas, localização, identidade separada, isolamento, backups e portabilidade autorizada.

## Orientações derivadas

Disponibilizar alternativa acessível ao arraste/redimensionamento. Distinguir compatibilidade estrutural de autorização: um schema compatível não dá acesso aos dados. Isolar cache por política de acesso e manter prévia sob verificação de permissão. Não gerar erros que revelem conteúdo privado da fonte.

Preservar configuração independentemente de resultado carregado. Não compartilhar objeto mutável entre original/cópia. Tratar resposta atrasada sem sobrescrever configuração ou autorização mais recente. Esses são critérios técnicos derivados, sem escolher biblioteca ou estratégia de lock.

## Limites

Sem metas aprovadas de latência, quantidade de componentes, tamanho de painel, cache, frequência mínima/máxima, memória ou navegadores. Ausência de limite funcional de painéis não garante recursos computacionais ilimitados. Não prometer tempo real ou instalação de plugins.

Requisitos e cenários descrevem comportamento esperado; não há teste executado ou comprovação de conformidade nesta entrega.
