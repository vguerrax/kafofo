# ADR-0010: Exclusão lógica, retenção e exportação individual

- **Status:** Parcialmente substituída para a Alpha 1 pela [ADR-0023](0023-auditoria-retencao-alpha-1.md)
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Alcance da substituição

A ADR-0023 antecipa o histórico do Kitanda e delimita retenção por categoria e ausência de configuração pela interface na Alpha 1. Exclusão lógica e exportação individual continuam válidas; o texto abaixo preserva a decisão original.

## Contexto

Dados pessoais e compartilhados precisam de regras distintas de acesso, recuperação e exportação.

## Decisão

Adotar exclusão lógica. A retenção padrão dos registros excluídos é de 30 dias, configurável pelo administrador da instância. Incluir exportação individual no MVP: perfil, preferências, espaço pessoal, histórico de segurança, vínculos com núcleos e residências e registros pessoais dos módulos, sem incluir registros compartilhados alheios ao usuário. Auditoria específica por módulo fica para evolução.

## Consequências e riscos

Exclusão lógica facilita recuperação, mas exige filtros consistentes. Exportação sem delimitação pode expor dados de terceiros; retenção exige um mecanismo posterior de expurgo.

## Alternativas de referência

Exclusão física imediata; exportação integral de todo o núcleo.

## Validação e pontos em aberto

Formato da exportação, prazo de processamento, expurgo e tratamento dos dados em backups ainda precisam de especificação. A política de retenção não equivale a uma garantia sobre cópias de segurança.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

