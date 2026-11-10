# Urukum — Requisitos não funcionais

**Escopo dos IDs:** `urukum`. 9 enunciados originais preservados, sem renumeração. IDs locais não equivalem aos de plataforma ou de Okape.

| ID original | Nome | Definição fornecida |
| --- | --- | --- |
| RNF-01 | Responsividade | a interface deverá funcionar adequadamente em desktop, tablet e celular. |
| RNF-02 | Consistência visual | o editor de texto deverá seguir o padrão já adotado pelo Mutyrão e Kitanda. |
| RNF-03 | Segurança | todas as operações deverão respeitar as permissões dos contextos do Kafofo. |
| RNF-04 | Isolamento | notas pessoais não poderão ser acessadas por outros usuários. |
| RNF-05 | Integridade histórica | alterações não deverão sobrescrever ou apagar versões anteriores durante o período de retenção. |
| RNF-06 | Persistência | a organização visual individual deverá ser salva e recuperada automaticamente. |
| RNF-07 | Recuperabilidade | exclusões lógicas deverão permitir restauração dentro do período de retenção. |
| RNF-08 | Consistência | operações de edição, exclusão, arquivamento e restauração deverão manter a integridade dos registros e do histórico. |
| RNF-09 | Usabilidade | a interface deverá priorizar rapidez na criação, consulta e organização das notas. |

## Herança da plataforma

Aplicam-se plataforma/RNF-001–025: responsividade/PWA online, referência WCAG 2.2 AA, teclado/tecnologias assistivas, localização e fusos, identidade separada, isolamento, backup e exportação autorizada.

## Orientações derivadas

Oferecer alternativa acessível ao arraste e não usar somente cor para distinguir condições. Proteger conteúdo formatado e links; verificar autorização também em versão/tag/lixeira. Preservar consistência entre gravação e snapshot. Tratar mudanças concorrentes e autosave sem sobrescrever versões existentes.

Sem metas aprovadas de latência, volume/tamanho de notas, quantidade de tags/versões, navegadores ou precisão do expurgo. Usabilidade prioriza rapidez, mas não fixa um número de milissegundos. Sem prometer edição offline ou simultânea em tempo real.

Cenários de aceitação não foram executados. Nenhuma biblioteca de editor ou grid foi selecionada nesta documentação.
