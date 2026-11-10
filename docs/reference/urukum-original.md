# Kafofo — Especificação Funcional
## Urukum - Notas

**Produto:** Kafofo  
**Módulo:** Urukum  
**Finalidade:** permitir a criação, organização, edição e compartilhamento de notas digitais no estilo post-it.

## 1. Visão geral

O Urukum é um bloco de notas digital integrado ao Kafofo, com apresentação visual baseada em cartões semelhantes a post-its.

O módulo permitirá registrar informações rápidas, organizar anotações por cores e tags, fixar notas importantes e compartilhar registros entre membros de núcleos e residências.

O Urukum será exclusivamente destinado a registros e anotações. Não deverá assumir funcionalidades de gerenciamento de tarefas, compromissos ou lembretes.

## 2. Contextos e compartilhamento

O módulo oferecerá três contextos de utilização:

### 2.1. Pessoal

- Notas privadas do usuário.
- Somente o proprietário poderá visualizar e administrar suas notas.
- Tags pessoais serão privadas e reutilizáveis entre as notas pessoais do usuário.

### 2.2. Núcleo

- Notas compartilhadas entre membros autorizados do núcleo.
- Qualquer membro autorizado poderá criar, visualizar, editar, excluir, restaurar, arquivar e desarquivar notas.
- Tags serão compartilhadas entre os membros daquele núcleo.

### 2.3. Residência

- Notas compartilhadas entre membros autorizados da residência.
- Qualquer membro autorizado poderá criar, visualizar, editar, excluir, restaurar, arquivar e desarquivar notas.
- Tags serão compartilhadas entre os membros daquela residência.

### 2.4. Regras de compartilhamento

- As notas estarão vinculadas a um único contexto.
- Não haverá compartilhamento direto de notas entre contextos diferentes no MVP.
- O acesso às notas deverá respeitar as permissões definidas pelo Kafofo.
- A perda de acesso ao contexto implicará perda de acesso às respectivas notas.

## 3. Estrutura das notas

Cada nota deverá possuir:

- **Título:** opcional.
- **Conteúdo:** obrigatório.
- **Cor de fundo:** selecionada de uma paleta predefinida pelo Kafofo.
- **Data de criação:** preenchida automaticamente.
- **Data da última edição:** atualizada automaticamente.
- **Tags:** uma ou mais tags associadas à nota.
- **Estado:** ativa, arquivada ou excluída.
- **Fixação:** indicação de nota fixada ou não fixada.

### 3.1. Formatação de texto

O editor deverá reutilizar as mesmas opções de edição e formatação de texto disponíveis nos módulos Mutyrão (Tarefas) e Kitanda (Listas de Compras).

O objetivo é manter consistência de experiência entre os módulos do Kafofo.

### 3.2. Limitações do MVP

As notas serão exclusivamente textuais.

Não haverá suporte inicial para:

- Imagens.
- Anexos.
- Arquivos incorporados.
- Áudio ou vídeo.

## 4. Organização visual

### 4.1. Grade de post-its

- As notas serão apresentadas em uma grade de cartões.
- Cada cartão utilizará a cor selecionada pelo usuário.
- O layout deverá ser responsivo.
- O usuário poderá reorganizar os cartões por arrastar e soltar.

### 4.2. Modo expandido

O usuário poderá abrir uma nota em modo expandido, ocupando uma área maior da interface.

Esse modo deverá facilitar a leitura e edição de conteúdos mais extensos.

### 4.3. Ordenação individual

Cada usuário poderá manter sua própria organização visual.

- A disposição será salva automaticamente.
- A ordenação será independente por contexto.
- Alterar a posição de uma nota não modificará a disposição dos demais membros.
- A organização manual será preservada ao navegar entre contextos.

### 4.4. Notas fixadas

O usuário poderá fixar notas importantes.

- Notas fixadas permanecerão no início da grade.
- A fixação terá prioridade sobre a ordenação selecionada.
- Os filtros continuarão sendo respeitados.
- A fixação será independente para cada usuário, sem alterar a visualização dos demais membros.

## 5. Tags

### 5.1. Criação e utilização

O Urukum permitirá criar tags livremente.

- Uma tag poderá ser associada a várias notas.
- Uma nota poderá possuir várias tags.
- Tags poderão ser reutilizadas.
- O usuário poderá filtrar notas por tags.

### 5.2. Escopo das tags

As tags respeitarão o contexto em que foram criadas:

- Tags pessoais: privadas do usuário.
- Tags de núcleo: compartilhadas entre membros do mesmo núcleo.
- Tags de residência: compartilhadas entre membros da mesma residência.

Não haverá compartilhamento automático de tags entre contextos diferentes.

## 6. Pesquisa, filtros e ordenação

### 6.1. Pesquisa textual

O módulo disponibilizará pesquisa textual por:

- Título.
- Conteúdo.

### 6.2. Filtros

O usuário poderá filtrar as notas por:

- Tags.
- Cor.
- Estado da nota, conforme a área consultada.

### 6.3. Ordenação

O usuário poderá organizar as notas por:

- Data de criação.
- Data da última edição.
- Título.
- Cor.
- Tags.
- Ordem manual.

Notas fixadas permanecerão no início da grade, respeitando os filtros aplicados.

## 7. Duplicação de notas

O usuário poderá duplicar uma nota existente.

A cópia deverá preservar:

- Título.
- Conteúdo.
- Formatação.
- Cor.
- Tags.

A duplicação deverá gerar uma nova nota independente, com:

- Novo identificador.
- Nova data de criação.
- Histórico próprio.
- Estado inicial ativo.
- Fixação independente.

A nota original não será alterada.

## 8. Arquivamento

O Urukum permitirá arquivar notas que precisem ser preservadas, mas não devam permanecer na grade principal.

- Notas arquivadas deixarão de aparecer na grade principal.
- Permanecerão acessíveis em uma área específica de arquivadas.
- Poderão ser desarquivadas.
- O conteúdo e o histórico serão preservados.
- Qualquer membro autorizado poderá arquivar ou desarquivar notas compartilhadas.

Arquivamento não equivale a exclusão.

## 9. Histórico de alterações

### 9.1. Registro

Cada edição deverá gerar uma nova versão completa da nota.

O histórico deverá registrar:

- Identificação do autor da alteração.
- Data e horário da alteração.
- Conteúdo completo da versão.
- Título e demais informações relevantes daquela versão.

O objetivo é permitir a consulta de versões anteriores e manter rastreabilidade das alterações.

### 9.2. Consulta

- O usuário poderá consultar o histórico de alterações.
- Será possível identificar quem realizou cada alteração e quando.
- O conteúdo anterior deverá permanecer disponível para leitura.
- O histórico será somente para consulta no MVP.

Não haverá restauração de versões anteriores no MVP.

A estrutura de armazenamento deverá permitir implementar essa funcionalidade futuramente sem descartar o histórico existente.

## 10. Exclusão e lixeira

### 10.1. Exclusão

- A exclusão seguirá o padrão de exclusão lógica do Kafofo.
- Qualquer membro autorizado poderá excluir notas compartilhadas.
- Notas excluídas deixarão de aparecer nas áreas de notas ativas e arquivadas.
- O histórico será preservado durante o período de retenção.

### 10.2. Lixeira própria

O Urukum possuirá uma lixeira própria.

- Notas excluídas poderão ser consultadas na lixeira.
- Qualquer membro autorizado poderá restaurar notas compartilhadas.
- A restauração recuperará o conteúdo, as tags e o histórico.
- A nota restaurada retornará ao estado ativo.
- A posição e a fixação deverão respeitar as preferências individuais de cada usuário.

### 10.3. Retenção

- O prazo padrão de retenção será de 30 dias.
- O administrador da instância poderá configurar esse prazo.
- Após o término do período, as notas poderão ser removidas definitivamente conforme a política global do Kafofo.

## 11. Notificações

O Urukum não terá sistema próprio de lembretes ou notificações.

Não haverá:

- Datas de vencimento.
- Lembretes programados.
- Alertas de compromissos.
- Notificações de alterações comuns nas notas.

Essas responsabilidades permanecerão com os módulos apropriados, especialmente Mutyrão e Arakatu.

## 12. Requisitos funcionais

**RF-01 — Criar notas:** permitir criar notas nos contextos pessoal, núcleo e residência.

**RF-02 — Editar notas:** permitir editar título e conteúdo de notas conforme as permissões do contexto.

**RF-03 — Formatar texto:** oferecer as mesmas opções de edição e formatação utilizadas pelo Mutyrão e Kitanda.

**RF-04 — Personalizar cores:** permitir selecionar uma cor de fundo de uma paleta predefinida.

**RF-05 — Visualizar em grade:** apresentar notas em cartões no estilo post-it.

**RF-06 — Visualizar em modo expandido:** permitir abrir uma nota em uma área maior para leitura e edição.

**RF-07 — Organizar manualmente:** permitir arrastar e soltar notas na grade.

**RF-08 — Salvar organização individual:** preservar a disposição definida por cada usuário, separadamente por contexto.

**RF-09 — Fixar notas:** permitir fixar notas no início da grade.

**RF-10 — Gerenciar tags:** permitir criar, reutilizar e associar tags às notas.

**RF-11 — Respeitar contexto das tags:** manter tags pessoais, de núcleo e de residência em seus respectivos contextos.

**RF-12 — Pesquisar notas:** permitir pesquisa por título e conteúdo.

**RF-13 — Filtrar notas:** permitir filtrar por tags e cores, além do estado da nota.

**RF-14 — Ordenar notas:** oferecer ordenação por criação, edição, título, cor, tags e organização manual.

**RF-15 — Duplicar notas:** permitir criar cópias independentes de notas existentes.

**RF-16 — Arquivar notas:** permitir arquivar notas sem excluí-las.

**RF-17 — Consultar arquivadas:** disponibilizar uma área específica para consultar notas arquivadas.

**RF-18 — Desarquivar notas:** permitir devolver notas arquivadas à área principal.

**RF-19 — Consultar histórico:** disponibilizar histórico completo das versões anteriores.

**RF-20 — Registrar alterações:** identificar autor e data de cada versão.

**RF-21 — Excluir notas:** permitir exclusão lógica de notas.

**RF-22 — Consultar lixeira:** disponibilizar lixeira própria do Urukum.

**RF-23 — Restaurar notas:** permitir restaurar notas excluídas por usuários autorizados.

**RF-24 — Controlar retenção:** aplicar prazo padrão de 30 dias, configurável pelo administrador da instância.

**RF-25 — Compartilhar notas:** permitir colaboração nos contextos de núcleo e residência, respeitando as permissões.

**RF-26 — Colaboração:** permitir que qualquer membro autorizado edite, exclua, restaure, arquive e desarquive notas compartilhadas.

## 13. Requisitos não funcionais

**RNF-01 — Responsividade:** a interface deverá funcionar adequadamente em desktop, tablet e celular.

**RNF-02 — Consistência visual:** o editor de texto deverá seguir o padrão já adotado pelo Mutyrão e Kitanda.

**RNF-03 — Segurança:** todas as operações deverão respeitar as permissões dos contextos do Kafofo.

**RNF-04 — Isolamento:** notas pessoais não poderão ser acessadas por outros usuários.

**RNF-05 — Integridade histórica:** alterações não deverão sobrescrever ou apagar versões anteriores durante o período de retenção.

**RNF-06 — Persistência:** a organização visual individual deverá ser salva e recuperada automaticamente.

**RNF-07 — Recuperabilidade:** exclusões lógicas deverão permitir restauração dentro do período de retenção.

**RNF-08 — Consistência:** operações de edição, exclusão, arquivamento e restauração deverão manter a integridade dos registros e do histórico.

**RNF-09 — Usabilidade:** a interface deverá priorizar rapidez na criação, consulta e organização das notas.

## 14. Regras de negócio

**RN-01:** toda nota deverá pertencer a um único contexto.

**RN-02:** o título será opcional e o conteúdo será obrigatório.

**RN-03:** somente usuários autorizados poderão acessar notas de núcleo ou residência.

**RN-04:** qualquer membro autorizado poderá editar notas compartilhadas.

**RN-05:** cada edição deverá gerar uma versão completa e independente no histórico.

**RN-06:** o histórico será somente para consulta no MVP.

**RN-07:** tags serão compartilhadas somente dentro do contexto em que foram criadas.

**RN-08:** cada usuário terá sua própria organização visual das notas compartilhadas.

**RN-09:** notas fixadas permanecerão no início da grade, respeitando os filtros.

**RN-10:** a duplicação criará uma nota independente, com histórico próprio.

**RN-11:** arquivamento não equivale a exclusão.

**RN-12:** qualquer membro autorizado poderá arquivar e desarquivar notas compartilhadas.

**RN-13:** qualquer membro autorizado poderá excluir notas compartilhadas.

**RN-14:** notas excluídas serão mantidas na lixeira própria do Urukum.

**RN-15:** qualquer membro autorizado poderá restaurar notas compartilhadas.

**RN-16:** o prazo padrão de retenção será de 30 dias, configurável pelo administrador da instância.

**RN-17:** o Urukum não terá lembretes, vencimentos ou notificações próprias.

**RN-18:** imagens e anexos não serão suportados no MVP.

## 15. Critérios de aceitação

- [ ] Criar notas pessoais.
- [ ] Criar notas compartilhadas em núcleos e residências.
- [ ] Respeitar permissões de acesso aos contextos.
- [ ] Criar notas com título opcional e conteúdo obrigatório.
- [ ] Utilizar as opções de formatação de texto do Mutyrão e Kitanda.
- [ ] Selecionar cores de uma paleta predefinida.
- [ ] Visualizar notas em grade de post-its.
- [ ] Abrir notas em modo expandido.
- [ ] Reorganizar notas por arrastar e soltar.
- [ ] Preservar a disposição individual de cada usuário.
- [ ] Fixar notas no início da grade.
- [ ] Criar e reutilizar tags.
- [ ] Restringir tags aos respectivos contextos.
- [ ] Pesquisar por título e conteúdo.
- [ ] Filtrar por tags e cores.
- [ ] Ordenar por criação, edição, título, cor e tags.
- [ ] Duplicar notas mantendo conteúdo, formatação, cor e tags.
- [ ] Arquivar e desarquivar notas.
- [ ] Consultar histórico completo de alterações.
- [ ] Identificar autor e data de cada versão.
- [ ] Manter histórico somente para consulta.
- [ ] Excluir notas logicamente.
- [ ] Consultar lixeira própria.
- [ ] Restaurar notas excluídas.
- [ ] Respeitar retenção padrão de 30 dias.
- [ ] Permitir ao administrador configurar o prazo de retenção.
- [ ] Permitir colaboração nas notas compartilhadas.
- [ ] Preservar conteúdo e histórico durante exclusões lógicas.

## 16. Fora do MVP e evoluções futuras

As seguintes funcionalidades ficam fora do MVP:

- Anexar imagens e arquivos.
- Incorporar áudio ou vídeo.
- Restaurar versões anteriores do histórico.
- Lembretes e notificações.
- Datas de vencimento.
- Compartilhamento direto entre contextos.
- Integração de notas com tarefas ou eventos.
- Personalização livre de cores.
- Recursos avançados de base de conhecimento.

A estrutura do histórico deverá ser preparada para permitir restauração de versões em uma evolução futura.