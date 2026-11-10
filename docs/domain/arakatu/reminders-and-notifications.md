# Arakatu — Lembretes e notificações

RF-136–138 aprovam lembretes de eventos, múltiplos por evento e antecedência configurável. RN-056 determina integração com o centro de notificações. Preferências individuais devem ser respeitadas.

## Comportamento conhecido

Evento pode possuir múltiplos lembretes. Usar canais disponíveis na plataforma conforme suas condições: interno, e-mail com SMTP e contato utilizável, push com compatibilidade/autorização. Um canal indisponível não bloqueia os demais segundo regras comuns.

Não foram definidas antecedências predefinidas como dez/trinta minutos, uma hora ou um dia; essas opções pertencem à especificação de Mutyrão e não são herdadas automaticamente. Também não foi definido se cada pessoa mantém lembretes independentes por evento ou se configurações são compartilhadas.

## Refinamentos necessários

Determinar destinatários, autor autorizado a configurar, lembretes em evento externo, relação com série/ocorrência, fuso de cálculo, disparo após indisponibilidade, limites de antecedência, deduplicação e tentativas.

Definir efeito de editar/excluir evento, alterar série, mudar fuso, retirar compartilhamento ou desativar integração/módulo. Evento removido e perda de acesso não podem ser tratados apenas como detalhe da interface.

**Orientação derivada:** conferir acesso antes de enfileirar/enviar e ao consultar conteúdo; coordenar persistência de evento e agendamento; evitar reenvio indiscriminado após reinício. ADR-0012 prevê processamento no Fastify com PostgreSQL, mas não fixa garantias de entrega.

Não há requisitos específicos de avisar todo o núcleo por criação/edição de evento, convite/aceite de participantes, confirmação de leitura ou mensagens privadas. Esses itens não são incluídos como novas capacidades.
