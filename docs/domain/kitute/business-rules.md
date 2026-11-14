# Kitute — Regras de negócio

| ID | Regra |
| --- | --- |
| RN-KIT-01 | Todo caderno pertence a exatamente um contexto: pessoal, residência ou núcleo. |
| RN-KIT-02 | O contexto é imutável no MVP; vários cadernos podem existir no mesmo contexto. |
| RN-KIT-03 | Toda receita pertence a exatamente um caderno e herda seu acesso. |
| RN-KIT-04 | A autoria não concede exclusividade de edição em cadernos compartilhados. |
| RN-KIT-05 | O acesso contextual respeita a permissão vigente: visualizador apenas consulta. |
| RN-KIT-06 | Compartilhamento adicional concede somente leitura no MVP, é revogável e limitado à mesma instância. |
| RN-KIT-07 | Compartilhar um caderno não concede acesso a outros dados do contexto de origem. |
| RN-KIT-08 | Edição de receitas permite também sua exclusão lógica e restauração, com autoria da ação registrada. |
| RN-KIT-09 | Administração do caderno é do proprietário pessoal, responsável da residência ou administrador do núcleo, conforme contexto. |
| RN-KIT-10 | Excluir caderno retira do uso ativo o caderno e suas receitas, preservando-os para recuperação. |
| RN-KIT-11 | Restaurar caderno recupera somente as receitas ativas no momento de sua exclusão; receitas excluídas antes continuam na lixeira. |
| RN-KIT-12 | Compartilhamentos adicionais não são reativados pela restauração do caderno; precisam de nova concessão. |
| RN-KIT-13 | Recuperação respeita a política de retenção da plataforma; não há prazo próprio aprovado para Kitute. |
| RN-KIT-14 | Saída de membro revoga acesso contextual; receitas do contexto permanecem. |
| RN-KIT-15 | Conflitos de edição não podem causar sobrescrita silenciosa nem perda do texto ainda não salvo. |
| RN-KIT-16 | Tags são do contexto do caderno, não um catálogo global. |
| RN-KIT-17 | Administração da instância ou de outro contexto não concede leitura automática de cadernos pessoais. |
| RN-KIT-18 | Não é permitido restaurar isoladamente uma receita para uso ativo enquanto o caderno está excluído. Regra derivada de RN-KIT-10. |
