# Kitute — Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-KIT-01 | Interface responsiva, com consulta legível em celular e computador. |
| RNF-KIT-02 | Autorização no backend para cada recurso e ação, incluindo busca e acesso por identificador. |
| RNF-KIT-03 | Nenhum vazamento de nomes, tags, contagens ou conteúdo de contextos não autorizados. |
| RNF-KIT-04 | Exclusão lógica e recuperação compatíveis com a política da plataforma. |
| RNF-KIT-05 | Controle de concorrência que evite sobrescrita silenciosa e preserve o texto não salvo ao detectar conflito. |
| RNF-KIT-06 | Conteúdo renderizado com segurança; texto/formatação não pode executar código do usuário. |
| RNF-KIT-07 | Perda de autorização deve ser refletida nas operações protegidas; seletor de contexto e cache não provam acesso. |

A forma técnica de invalidar cache e de preservar texto durante conflito será refinada. Preservação após fechar navegador não foi aprovada.
Não foram definidos SLA, volumes máximos ou metas numéricas de desempenho. Offline está fora do MVP.
