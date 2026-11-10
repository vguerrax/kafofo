# ADR-0023: Histórico de domínio e retenção por categoria na Alpha 1

- **Status:** Aceita para a Alpha 1
- **Data:** 2026-11-06
- **Substitui parcialmente:** [ADR-0010](0010-ciclo-dados-exportacao.md), no adiamento geral da auditoria de módulo e na aplicação de retenção/configurabilidade ao recorte Alpha 1
- **Decisões de origem:** [#1](https://github.com/vguerrax/kafofo/issues/1) e [#3](https://github.com/vguerrax/kafofo/issues/3)

## Contexto

A ADR-0010 adiava auditoria específica de módulos, mas o Kitanda exige histórico desde sua primeira entrega. A aprovação da Alpha 1 distingue histórico de domínio, auditoria de segurança, logs e backup. Aplicar um prazo único perderia histórico obrigatório ou preservaria conteúdo além do prazo aprovado.

## Decisão

Implementar histórico do Kitanda no incremento, junto das operações que o produzem. Tratar histórico de domínio, auditoria administrativa/de segurança, logs técnicos e backups como categorias distintas. Os prazos e efeitos funcionais aprovados são definidos no [contrato da plataforma](../domain/platform/alpha-1.md#retenção-por-categoria), evitando segunda tabela normativa nesta ADR.

Preservar exclusão lógica e exportação individual da ADR-0010. Na Alpha 1, adotar os padrões aprovados sem configuração de retenção pela interface; a configurabilidade do MVP não é removida. Exportação é JSON individual com autorização atual, sem converter compartilhamento em propriedade pessoal de todos os dados.

## Consequências

- Histórico não pode ser adiado até depois da publicação das operações rastreadas.
- Alteração de domínio e seu evento exigem consistência; expurgo deve remover ou redigir conteúdo já vencido também nas representações históricas pertinentes.
- Backup usa política própria. Recuperar cópia antiga exige tratamento dos expurgos vencidos e das revogações antes de reabrir o serviço.
- Outros módulos conservam seus requisitos; esta ADR não resolve suas políticas específicas nem generaliza exceções do Kitanda.

## Validação

Testar datas de retenção, eventos sem conteúdo expurgado, remoção do histórico no expurgo da lista, consistência após reinício e restauração de backup. Este registro aprova direção e escopo; não comprova implementação ou teste executado.
