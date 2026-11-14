# Okape — Visão geral

Okape é o ambiente de composição de painéis do Kafofo. Permite reunir dados de módulos nativos e integrações em formatos visuais compatíveis escolhidos pelo usuário, sem assumir as regras de negócio das origens.

Módulos/integrações fornecem conjuntos de dados e opções de ajuste. Okape fornece catálogo visual, composição, layout e apresentação. Um conjunto pode alimentar vários componentes simultaneamente, como gráfico e tabela.

## Contextos

| Contexto do painel | Alcance |
| --- | --- |
| Pessoal | Privado por padrão; pode reunir dados pessoais e de diferentes núcleos/residências autorizados |
| Núcleo | Compartilhado com usuários autorizados daquele núcleo, restrito ao respectivo contexto |
| Residência | Compartilhado com usuários autorizados daquela residência, restrito ao respectivo contexto |

A mistura pessoal é explícita e autorizada, sem conceder acesso adicional. Compartilhar painel não compartilha automaticamente suas fontes de dados.

## Capacidades do MVP

Múltiplos painéis vazios; criação sem limite funcional previamente estabelecido; administração e compartilhamento conforme contexto; menu lateral, ordem e painel padrão; ativação/desativação com preservação; seleção de fonte/visualização com prévia; configuração e cópia independentes; grade responsiva com reposicionamento/redimensionamento; atualização periódica por origem e manual; tratamento de falhas sem perder composição; exclusão lógica de painel sem excluir dados de origem.

## Atores e fronteiras

| Ator/componente | Responsabilidade |
| --- | --- |
| Proprietário pessoal | Compor e editar painel pessoal, compartilhar para consulta e revogar individualmente |
| Criador de painel compartilhado | Administrador inicial; pode designar administrador e editar enquanto autorizado |
| Administrador designado | Altera composição e pode excluir enquanto autorizado no contexto compartilhado |
| Usuário autorizado de consulta | Visualiza painel e somente as fontes às quais possui acesso |
| Administrador do núcleo/residência | Pode excluir painel compartilhado do contexto; isso não concede edição de composição por si só |
| Módulo/integração de origem | Regras de negócio, permissões e dados tipados; intervalo de atualização |
| Plataforma/Okape | Catálogo visual fixo mantido pela plataforma e experiência de composição |

## Limites

Ficam fora do MVP: catálogo comunitário, instalação de componentes de terceiros, execução de código próprio de terceiros para renderização, compartilhamento externo à instância, permissões granulares específicas do Okape, modelos/painéis preconfigurados e configurações sincronizadas entre instâncias de componentes.

O catálogo fixo ainda pode ter estrutura preparada para expansão futura. Não representa um sistema de plugins instaláveis no MVP. Não há marca cultural/visual detalhada de Okape na fonte, além do nome funcional; não foram inventadas etimologia, cores ou personalidade.
