# Kafofo — Especificação Funcional
## Okape - Dashboard

**Produto:** Kafofo  
**Módulo:** Okape  
**Finalidade:** permitir que cada usuário componha painéis personalizados, reunindo dados de módulos nativos e integrações em diferentes formatos de apresentação.

## 1. Visão geral

O Okape é um ambiente independente de composição de painéis. Não implementa regras de negócio dos módulos nem depende de um módulo específico para funcionar.

Os módulos e integrações disponibilizam conjuntos de dados e suas opções de configuração. O Okape disponibiliza componentes visuais compatíveis com esses dados, permitindo que o usuário escolha como deseja apresentá-los.

O mesmo conjunto de dados poderá alimentar vários componentes simultaneamente, como um gráfico e uma tabela.

## 2. Contextos e painéis

### 2.1. Tipos de painel

O usuário poderá criar múltiplos painéis nos seguintes contextos:

- **Pessoal:** privado por padrão, podendo reunir dados pessoais e informações de diferentes núcleos e residências aos quais o usuário tenha acesso.
- **Núcleo:** compartilhado com os usuários autorizados daquele núcleo.
- **Residência:** compartilhado com os usuários autorizados daquela residência.

Painéis de núcleo e residência ficam restritos aos dados acessíveis no respectivo contexto.

A composição de um painel pessoal não amplia as permissões do usuário. Cada componente deve respeitar as permissões da fonte de dados.

### 2.2. Criação

- O usuário poderá criar quantos painéis forem necessários, sem limite funcional previamente estabelecido no MVP.
- Todo painel será criado vazio.
- Não haverá modelos ou configurações iniciais predefinidas.

### 2.3. Administração de painéis compartilhados

- Usuários autorizados poderão criar painéis compartilhados nos contextos aos quais tenham acesso.
- O criador será o administrador inicial do painel.
- O criador poderá designar outro administrador.
- Somente o criador ou administrador designado poderá alterar a composição.
- Demais usuários autorizados poderão visualizar o painel, respeitando as permissões dos dados apresentados.
- Administradores do núcleo ou residência poderão excluir painéis compartilhados do respectivo contexto.
- O criador ou administrador designado também poderá excluir o painel enquanto possuir autorização.

Se o criador perder acesso ao contexto, o painel continuará existindo. Seu criador será identificado como desconhecido, permitindo que outro membro autorizado assuma a administração.

### 2.4. Painéis pessoais e compartilhamento

- Painéis pessoais serão privados por padrão.
- O proprietário poderá compartilhar individualmente um painel com outros usuários cadastrados na mesma instância Kafofo.
- Pessoas externas à instância não poderão receber acesso.
- Usuários convidados terão somente permissão de visualização.
- A edição continuará restrita ao proprietário.
- A tela de edição permitirá consultar os compartilhamentos e revogar o acesso de usuários individualmente.

O compartilhamento do painel não concede automaticamente acesso aos dados dos módulos de origem.

## 3. Organização e navegação

### 3.1. Menu lateral

- O menu lateral será utilizado para navegar entre os painéis.
- Em telas menores, poderá ser recolhido para preservar espaço.
- Cada usuário poderá definir um painel padrão independente para cada contexto: pessoal, núcleo e residência.

### 3.2. Configuração dos painéis

Uma tela de configuração permitirá:

- Criar painéis.
- Definir manualmente a ordem de exibição.
- Ativar painéis.
- Desativar painéis.

Painéis desativados:

- Não serão apresentados no menu lateral.
- Continuarão cadastrados.
- Manterão componentes, configurações e layout.
- Poderão ser consultados e reativados pela tela de configuração.

Antes de desativar ou excluir um painel definido como padrão, será obrigatório selecionar outro painel padrão para o mesmo contexto.

## 4. Dados e componentes

### 4.1. Fontes de dados

Cada módulo ou integração poderá disponibilizar conjuntos de dados para utilização no Okape.

Essas fontes deverão informar, no mínimo:

- Identificação do conjunto de dados.
- Estrutura e tipos dos dados disponibilizados.
- Opções de configuração oferecidas pelo módulo.
- Compatibilidade com os formatos de apresentação disponíveis.

O módulo de origem continuará responsável pela validação das permissões e pela aplicação de suas regras de negócio.

### 4.2. Catálogo de componentes visuais

O Okape manterá um catálogo próprio de componentes de apresentação.

Cada componente deverá declarar quais estruturas e tipos de dados aceita.

Exemplos:

- Gráficos.
- Tabelas.
- Indicadores numéricos.
- Listagens.
- Outros formatos visuais compatíveis.

O catálogo será fixo no MVP, mantido pela plataforma.

### 4.3. Adição de componentes

O painel terá uma opção denominada **Adicionar**.

Ao acioná-la:

1. Será apresentado um catálogo agrupado por módulo ou integração.
2. O usuário poderá consultar o nome e a descrição dos conjuntos de dados e componentes disponíveis.
3. Será possível visualizar uma prévia do componente antes da inclusão.
4. O usuário escolherá a fonte de dados.
5. O usuário escolherá um componente visual compatível com os dados selecionados.

### 4.4. Configuração individual

- Cada módulo ou integração disponibilizará suas próprias opções de ajuste.
- O usuário decidirá quais opções aplicar.
- Cada instância de componente terá configuração independente.
- Alterações em um componente não afetarão outros que utilizem a mesma fonte de dados.

### 4.5. Reutilização e cópia

Um mesmo conjunto de dados poderá alimentar vários componentes simultaneamente.

O usuário poderá copiar um componente existente. A cópia herdará a fonte de dados e as configurações originais, mas será uma nova instância independente.

Alterações posteriores em uma instância não afetarão as demais.

## 5. Layout e apresentação

- O layout será controlado pelo Okape.
- Será utilizada uma grade responsiva.
- O usuário poderá arrastar e soltar componentes.
- Será permitido reposicionar e redimensionar componentes, ajustando largura e altura.
- O layout deverá adaptar-se a desktop, tablet e celular.
- Componentes de diferentes módulos poderão coexistir no mesmo painel.

## 6. Atualização dos dados

- Os componentes terão atualização automática periódica.
- O intervalo de atualização será definido pela origem dos dados.
- O usuário poderá solicitar atualização manual.
- O Okape não imporá um intervalo único para todos os componentes.

## 7. Indisponibilidade e incompatibilidade

### 7.1. Falha de carregamento

Quando um componente não conseguir carregar os dados:

- Permanecerá no painel.
- Apresentará mensagem de erro ou indisponibilidade.
- Disponibilizará uma opção para tentar novamente.
- Preservará suas configurações.

### 7.2. Perda de acesso

Quando o usuário perder acesso à origem dos dados:

- O componente permanecerá no painel.
- Exibirá um alerta.
- O usuário decidirá se deseja removê-lo.

### 7.3. Incompatibilidade de dados

Quando uma alteração na estrutura da fonte tornar o componente incompatível:

- O componente permanecerá no painel.
- Exibirá um alerta de incompatibilidade.
- O usuário poderá ajustar a configuração ou remover o componente.
- Não haverá remoção automática.

## 8. Exclusão e ciclo de vida

- A exclusão de painéis seguirá o padrão de exclusão lógica do Kafofo.
- A exclusão de um painel não afetará os dados dos módulos de origem.
- A remoção de um componente não excluirá sua fonte de dados.
- A desativação de um painel não excluirá sua composição nem suas configurações.

## 9. Requisitos não funcionais

**RNF-01 — Responsividade:** a interface deverá funcionar em desktop, tablet e celular.

**RNF-02 — Segurança:** o Okape deverá respeitar as permissões dos módulos e contextos de origem, sem conceder acesso adicional por meio da composição de painéis.

**RNF-03 — Isolamento:** dados pessoais e compartilhados deverão respeitar os limites de acesso de cada usuário.

**RNF-04 — Independência:** o Okape não deverá depender da instalação ou utilização de um módulo específico.

**RNF-05 — Compatibilidade:** componentes visuais deverão validar a compatibilidade com a estrutura dos dados fornecidos.

**RNF-06 — Resiliência:** falhas de módulos ou integrações não deverão provocar perda da composição dos painéis.

**RNF-07 — Extensibilidade arquitetural:** a estrutura do catálogo e os contratos de dados deverão permitir expansão futura sem exigir uma reformulação completa do Okape.

**RNF-08 — Segurança de execução:** no MVP, somente componentes visuais mantidos pela plataforma poderão ser utilizados. Não haverá execução de código de terceiros.

## 10. Regras de negócio

**RN-01:** cada painel pertence a um único contexto: pessoal, núcleo ou residência.

**RN-02:** painéis pessoais podem reunir dados de diferentes contextos aos quais o proprietário tenha acesso.

**RN-03:** painéis compartilhados de núcleo ou residência ficam restritos ao respectivo contexto.

**RN-04:** o compartilhamento de um painel pessoal será individual e limitado a usuários da mesma instância.

**RN-05:** usuários convidados para um painel pessoal terão somente permissão de visualização.

**RN-06:** cada painel terá um administrador responsável por sua composição, conforme as regras de seu contexto.

**RN-07:** cada usuário poderá definir um painel padrão por contexto.

**RN-08:** um painel padrão não poderá ser desativado ou excluído sem a definição prévia de outro painel padrão para o mesmo contexto.

**RN-09:** componentes deverão respeitar as permissões e regras de negócio da fonte de dados.

**RN-10:** cada instância de componente terá configuração independente.

**RN-11:** a cópia de um componente criará uma nova instância independente, preservando inicialmente as configurações originais.

**RN-12:** a remoção de um componente não removerá os dados de origem.

**RN-13:** indisponibilidade, perda de acesso ou incompatibilidade não provocarão remoção automática de componentes.

**RN-14:** a exclusão de painéis será lógica e não afetará os registros dos módulos de origem.

## 11. Critérios de aceitação

- [ ] Criar painéis vazios nos contextos pessoal, núcleo e residência.
- [ ] Compor painéis pessoais com dados de diferentes contextos autorizados.
- [ ] Restringir painéis compartilhados ao contexto correspondente.
- [ ] Compartilhar painéis pessoais com usuários da mesma instância.
- [ ] Revogar compartilhamentos pela tela de edição.
- [ ] Restringir convidados à visualização.
- [ ] Organizar painéis manualmente pela tela de configuração.
- [ ] Ativar e desativar painéis, preservando suas configurações.
- [ ] Ocultar painéis desativados do menu lateral.
- [ ] Definir um painel padrão por contexto.
- [ ] Exigir outro painel padrão antes de desativar ou excluir o atual.
- [ ] Consultar o catálogo agrupado por módulo ou integração.
- [ ] Visualizar nome, descrição e prévia dos componentes.
- [ ] Selecionar fontes de dados e componentes visuais compatíveis.
- [ ] Utilizar uma mesma fonte em múltiplos componentes.
- [ ] Configurar componentes individualmente.
- [ ] Copiar componentes mantendo configurações iniciais independentes.
- [ ] Reposicionar e redimensionar componentes.
- [ ] Atualizar componentes automaticamente e sob demanda.
- [ ] Apresentar erros e permitir nova tentativa de carregamento.
- [ ] Sinalizar perda de acesso e incompatibilidade sem remover componentes automaticamente.
- [ ] Preservar a composição quando a origem estiver indisponível.
- [ ] Excluir painéis logicamente sem afetar os dados de origem.

## 12. Fora do MVP

- Catálogo expansível por extensões da comunidade.
- Instalação de componentes de terceiros.
- Execução de código próprio de terceiros para renderização.
- Compartilhamento com pessoas externas à instância.
- Permissões granulares específicas do Okape.
- Modelos ou painéis pré-configurados.
- Compartilhamento de configurações entre instâncias de componentes.

A arquitetura deverá considerar a expansão futura do catálogo, com contratos padronizados, validação de dados, isolamento e mecanismos de segurança para extensões.