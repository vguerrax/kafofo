# Arakatu — Fluxos de uso

Os fluxos organizam capacidades aprovadas. Campos, permissões e comportamentos não especificados são dependências abertas; não representam decisões preenchidas pela documentação.

## FL-A01 — Criar e administrar evento nativo

**Base:** RF-124–127; RN-054.

Pessoa autorizada acessa contexto pessoal, de núcleo ou residência e cria/administra evento no Kafofo. Evento permanece identificado como originado no Kafofo. Definir campos, validações, permissões e multiplicidade de agendas antes de implementar formulário final.

## FL-A02 — Consultar agenda consolidada

**Base:** RF-125, RF-128, RF-130.

Pessoa consulta eventos nativos e de outras origens autorizadas em visão integrada. Origem permanece identificável; consolidação não amplia acesso. Apresentação, filtros e formas de navegação temporal precisam de definição.

## FL-A03 — Importar ou exportar iCalendar

**Base:** RF-129; RN-053–054.

Usuário autorizado solicita operação de entrada ou saída dentro da abrangência aprovada. Preservar origem e regras de acesso. Arquivo versus URL, identidade de evento, duplicatas e tratamento de recorrências ainda dependem de contrato.

Exportação iCalendar de agenda não substitui exportação pessoal de dados nem backup da instância.

## FL-A04 — Configurar integração unidirecional

**Base:** RF-128, RF-131; RN-053–055.

Definir direção e origem do fluxo de assinatura iCalendar prioritário e permitir consumo/publicação conforme contrato a especificar. Alterações externas não modificam original nativo do Kafofo. Não ativar sincronização bidirecional ou conector Google/Microsoft autenticado como requisito do MVP.

## FL-A05 — Configurar recorrência

**Base:** RF-132–133.

Usuário autorizado escolhe frequência diária, semanal, mensal ou anual. Arakatu representa série e ocorrências de forma que possa lidar com exceções. Regra de término, datas inexistentes, fusos e formato persistido ainda precisam de refinamento.

## FL-A06 — Editar ou excluir recorrência

**Base:** RF-134–135.

Usuário escolhe uma ocorrência específica ou toda a série. Na ocorrência específica, preservar demais ocorrências. Na série, aplicar política de passado/exceções e reagendamento ainda a definir. Exclusão segue padrão lógico da plataforma; recuperação específica não foi detalhada.

## FL-A07 — Configurar lembretes

**Base:** RF-136–138; RN-056.

Configurar múltiplos lembretes e respectivas antecedências para evento autorizado. Entrega utiliza centro de notificações e preferências individuais. Definir quem configura/recebe e efeito de recorrência/edição antes de ativar agendamento completo.

## FL-A08 — Lidar com falha externa

**Base:** plataforma/RF-003–004; RN-052.

Integração falha; funcionalidades nativas independentes continuam operando e informações já sincronizadas permanecem consultáveis conforme acesso e política. Mostrar condição de falha/atualização conforme interface a refinar, sem presumir edição offline.
