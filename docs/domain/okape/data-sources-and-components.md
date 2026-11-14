# Okape — Fontes e componentes

## Responsabilidade dos contratos

| Origem de dados | Okape / componente visual |
| --- | --- |
| Identificação do conjunto | Seleciona origem de uma instância |
| Estrutura e tipos fornecidos | Declara estruturas e tipos aceitos |
| Opções de ajuste do módulo | Aplica configuração escolhida naquela instância |
| Compatibilidade de formatos | Oferece visuais compatíveis |
| Regras e autorização dos dados | Respeita a decisão da origem para o usuário atual |
| Intervalo de atualização | Atualiza periodicamente conforme cada origem |

A fonte permanece dona de regras como total financeiro ou critérios de tarefas. O Okape não recalcula regras de negócio apenas para desenhar gráfico, tabela, indicador ou listagem.

## Catálogo e inclusão

Catálogo visual fixo no MVP, mantido pela plataforma. Exemplos fornecidos são gráficos, tabelas, indicadores numéricos e listagens; a lista final de tipos/variantes não foi especificada.

Ação **Adicionar** abre catálogo agrupado por módulo/integração, com nome/descrição de conjuntos e componentes e possibilidade de prévia. Usuário escolhe fonte e visual compatível; a ordem exata da experiência de prévia precisa ser refinada sem eliminar essa possibilidade.

Prévia também respeita autorização. Não entregar amostra real privada a quem só pode consultar catálogo. Quando não houver fontes disponíveis, comportamento visual precisa ser definido; Okape continua independente de módulo específico.

## Configuração independente e cópia

Uma fonte pode alimentar vários componentes simultaneamente. Cada instância tem configuração própria; alterar uma não modifica as outras. Cópia herda fonte e configurações iniciais, mas vira instância independente.

Não compartilhar referência mutável de configurações nem sincronizar mudanças posteriores. A fonte não define posição/tamanho da cópia, cópia entre painéis/contextos ou clonagem integral de painel. Não adicionar esses recursos por inferência.

## Layout

Grade responsiva controlada pelo Okape, com arrastar/soltar, reposicionar e redimensionar largura/altura. Componentes de módulos diferentes podem coexistir, respeitando contexto e acesso. Breakpoints, limites de tamanho, colisões e persistência de variações por dispositivo ainda precisam de refinamento.

## Extensão futura

Estrutura do catálogo e contratos devem permitir expansão futura sem reformulação completa. MVP não instala nem executa código próprio de terceiros para componentes. Isso não equivale a proibir uso de bibliotecas comuns de interface escolhidas pela plataforma; ADR-0020 continua pendente.
