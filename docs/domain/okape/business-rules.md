# Okape — Regras de negócio

**Escopo:** `okape`. Os IDs locais e enunciados originais foram preservados; RN-01 deste módulo não é RN-001 da plataforma.

| ID original | Regra fornecida |
| --- | --- |
| RN-01 | cada painel pertence a um único contexto: pessoal, núcleo ou residência. |
| RN-02 | painéis pessoais podem reunir dados de diferentes contextos aos quais o proprietário tenha acesso. |
| RN-03 | painéis compartilhados de núcleo ou residência ficam restritos ao respectivo contexto. |
| RN-04 | o compartilhamento de um painel pessoal será individual e limitado a usuários da mesma instância. |
| RN-05 | usuários convidados para um painel pessoal terão somente permissão de visualização. |
| RN-06 | cada painel terá um administrador responsável por sua composição, conforme as regras de seu contexto. |
| RN-07 | cada usuário poderá definir um painel padrão por contexto. |
| RN-08 | um painel padrão não poderá ser desativado ou excluído sem a definição prévia de outro painel padrão para o mesmo contexto. |
| RN-09 | componentes deverão respeitar as permissões e regras de negócio da fonte de dados. |
| RN-10 | cada instância de componente terá configuração independente. |
| RN-11 | a cópia de um componente criará uma nova instância independente, preservando inicialmente as configurações originais. |
| RN-12 | a remoção de um componente não removerá os dados de origem. |
| RN-13 | indisponibilidade, perda de acesso ou incompatibilidade não provocarão remoção automática de componentes. |
| RN-14 | a exclusão de painéis será lógica e não afetará os registros dos módulos de origem. |

As definições textuais complementares sobre administração, compartilhamento, atualização e resiliência permanecem nos documentos especializados. Pendências não modificam silenciosamente essas regras.
