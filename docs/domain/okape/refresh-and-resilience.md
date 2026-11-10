# Okape — Atualização e resiliência

## Atualização

Componentes têm atualização automática periódica e atualização manual. Intervalo é definido pela origem dos dados; Okape não impõe intervalo único para todos os componentes.

Não foi decidido se atualização manual atinge componente ou painel inteiro, se consultas simultâneas à mesma fonte são agregadas ou se cache é compartilhado. Também não foram definidos execução em aba oculta, painel desativado, limites de requisição ou estado de carregamento da atualização.

**Orientações derivadas:** evitar sobreposição sem controle, preservar escopo autorizado no cache e não substituir resposta recente por resposta antiga fora de ordem. Otimização de consulta nunca pode contornar permissões da origem.

## Condições de falha

| Condição | Comportamento definido | Recuperação disponível |
| --- | --- | --- |
| Falha/indisponibilidade | Manter componente e configurações; mensagem de erro/indisponibilidade | Tentar novamente |
| Perda de acesso | Manter componente e alerta; sem remoção automática | Remover por pessoa com edição, conforme conciliação da matriz |
| Estrutura incompatível | Manter componente e alerta de incompatibilidade | Ajustar configuração ou remover, conforme edição |

Preservar componente é preservar composição; não significa manter dados sensíveis visíveis após revogação. Limpeza de cache, retenção de último resultado e conteúdo de erro devem ser definidos com a autorização da origem.

Falha de uma origem não deve provocar perda da composição dos painéis. Fonte indisponível não exige excluir outros componentes nem recriar painel após recuperação.

## Mudanças de schema

A fonte exige validar compatibilidade e sinalizar mudança que torne componente incompatível. Versão de contrato, migração automática de configuração e fallback de visualização não foram aprovados. Não remover componente automaticamente para ocultar incompatibilidade.

## Retomada e acesso

Depois de restaurado acesso ou compatibilidade, a composição permanece disponível para recuperar funcionamento segundo fluxo a definir. Não prometer execução exatamente uma vez, atualização em tempo real ou latência garantida. Estratégia concreta de polling, SSE ou WebSocket ainda não foi escolhida; a exigência funcional é atualização periódica por origem.
