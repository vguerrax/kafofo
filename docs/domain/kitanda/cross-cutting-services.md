# Kitanda — Serviços transversais

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


## Contextos e ativação

Usa identidade e autorização comuns. Cada lista possui um único contexto e não amplia acesso por compartilhar. Disponibilidade/habilitação seguem a plataforma; regras do espaço pessoal e módulos desativados ainda contêm pendências na base comum.

## Histórico

RN-248 exige usuário e data/hora; RN-249 enumera criação/exclusão da lista, inclusão/edição/remoção de itens, quantidade/unidade, marcação/desmarcação, limpeza de comprados e esvaziamento. Histórico da lista/itens é preservado após exclusão.

Restauração, compartilhamento, mudanças de permissão e reordenação não aparecem expressamente na enumeração de RN-249, embora RF-309 e RN-248 tenham redação ampla. Detalhamento desses eventos deve ser explicitado sem apresentar uma lista técnica inventada como aprovada.

Pino não substitui o histórico de domínio. A ADR-0010 adia auditoria específica; o Kitanda exige histórico no MVP. Preservar o requisito funcional e registrar a divergência para revisão, como já feito na plataforma.

## Notificações

Não enviar para operações comuns, como inclusão, edição, remoção ou marcação. Atualização compartilhada funciona sem depender de notificação. Reservar notificações para compartilhamento e mudanças de permissões; destinatários, categorias e precedência de preferências ainda a detalhar conforme serviços comuns.

## Portabilidade e retenção

Exportação individual da plataforma inclui registros pessoais dos módulos nativos; Kitanda deve contribuir nesse escopo autorizado. Não foi aprovado recurso autônomo de exportar listas para PDF/CSV nem exportação indiscriminada de dados compartilhados. Formato e inclusão de histórico/excluídos precisam de especificação comum.

Exclusão lógica e recuperação seguem a política da instância, com padrão de trinta dias configuráveis. Prazos de históricos e tratamento de itens removidos antes de uma lista ser excluída não se deduzem automaticamente desse valor.

## Fronteira com outros módulos

Kitanda funciona independentemente dos demais módulos domésticos. Não requer Jaci, Kapanga, estoque ou catálogo. Não há obrigação funcional de publicar indicador no Okape nesta especificação: eventual fonte de dados deve ser delimitada em etapa própria.

A fonte de Urukum solicita consistência de editor com Kitanda e Mutyrão; o Kitanda não define nesta especificação campos de texto rico ou opções concretas de formatação. Essa referência cruzada deve ser refinada, sem expandir a funcionalidade de listas por inferência.
