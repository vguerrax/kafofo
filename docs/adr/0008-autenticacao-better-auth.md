# ADR-0008: Autenticação sem e-mail pessoal e avaliação do Better Auth

- **Status:** Aceita para a Alpha 1
- **Data de aceitação:** 2026-11-06
- **Data de registro:** 2026-11-03
- **Projeto:** Kafofo

## Contexto

O Kafofo deve permitir autenticação sem exigir e-mail pessoal e recuperação de acesso que não dependa de uma caixa postal.

## Decisão

Adotar Better Auth e adaptador Drizzle **1.7.18**, com o plugin Username e a camada de adaptação demonstrada na POC #5, para implementar autenticação da Alpha 1. Preservar login por nome de usuário e senha, usando identificador sintético interno sob `.invalid`, sem envio ou verificação de e-mail. A aceitação inclui as adaptações descritas abaixo; os defaults da biblioteca não atendem ao contrato.

## Consequências e riscos

Evita exigir endereço pessoal. O identificador sintético é dado técnico interno e não pode ser tratado como canal de contato. A compatibilidade com o recorte testado foi demonstrada na POC; autorização contextual e implantação continuam dependentes de implementação e validação próprias.

## Alternativas de referência

Autenticação própria; solução que exige endereço de e-mail real.

## Validação e pontos em aberto

A condição original exigia demonstrar cadastro, login e recuperação sem e-mail pessoal, unicidade e normalização do username, integração PostgreSQL/Drizzle e invalidação de sessões. A POC atendeu a esse recorte com evidências registradas no [PR #22](https://github.com/vguerrax/kafofo/pull/22). A revisão técnica e a aceitação do mantenedor em 2026-11-06 autorizam esta decisão; não comprovam funcionalidade de produção.

## Resultado técnico da POC #5

O [laboratório isolado](../../pocs/auth/README.md), refinado na [issue #5](https://github.com/vguerrax/kafofo/issues/5), fixa Better Auth e adaptador Drizzle em **1.7.18**, sem alterar as rotas normais do produto. A especificação dos experimentos, comandos e relação entre contratos e testes está no README do laboratório; evidências de execução e revisão ficam na issue/PR.

**Resultado aceito:** viabilidade de Better Auth/adaptador 1.7.18 com o plugin Username e as adaptações demonstradas, após revisão do código e dos testes e aprovação do mantenedor. O código avaliado está no commit `98f7b423246f993ca48dc8e2ab4d911b0f6aa34e`; a aceitação documental sucede esse experimento. Não adotar os defaults como implementação da Alpha 1.

A biblioteca cuida de hash/verificação, autenticação por username, cookies e operações de sessão/reset. O identificador de e-mail exigido internamente é UUID sob `.invalid`, gerado pelo servidor, sem SMTP ou função de contato. Username global tem 3–30 caracteres ASCII, letras/números/ponto/hífen/sublinhado, com unicidade SQL sobre minúsculas; nome de exibição é separado. São as regras aprovadas no refinamento da #5.

As políticas de senha, sessão absoluta sem renovação, limites de tentativas, autorização do emissor, reemissão e falhas de recuperação exigem configuração/adaptação local. Transações externas sobre uma única conexão Drizzle e locks por conta preservam atomicidade de senha, consumo e revogação. O laboratório também preserva o prazo original quando a troca autenticada rotaciona a sessão e recusa o instante exato do vencimento, que o comparador nativo aceita. A exclusão das verificações anteriores acopla a adaptação ao schema da versão fixada e precisa de regressão em upgrades.

Não montar indiscriminadamente o handler nativo: caminhos alternativos poderiam contornar essas políticas. Nas #7/#10, expor apenas operações autorizadas, manter validação no backend e configurar proxy/TLS para o ambiente real. As fixtures administrativas não comprovam autorização contextual. A recuperação local expõe o link somente na saída explícita do operador; o titular define a senha, sem passagem de senha por argumentos do processo. POC não é funcionalidade entregue, publicação ou homologação da Alpha 1.

## Obrigações da implementação e de atualizações

- Encapsular a integração e as operações compostas em serviços próprios. Preservar a conexão/transação externa única e os locks por conta; não copiar `transaction: false` para operações sem essa composição.
- Manter as regressões de recuperação, concorrência, rollback, sessão e superfícies alternativas em qualquer atualização da biblioteca/adaptador. Revalidar o acoplamento ao schema e ao identificador `reset-password:` antes de atualizar.
- Nas #7/#10, definir e testar proteção contra tentativas de senha atual na troca autenticada; o laboratório não demonstra limitação nessa operação. Os parâmetros precisam de refinamento, sem inferir números desta ADR.
- Na implementação, definir limpeza dos contadores/verificações expirados e avaliar contenção, limites de espera e ocupação de conexões pelos locks.
- Validar autorização contextual nas tarefas correspondentes e a cadeia confiável de proxy, origem e cookies no ambiente Caddy/TLS real antes da entrega aos usuários.

## Adaptação de recuperação no produto

Na [#10](https://github.com/vguerrax/kafofo/issues/10), o serviço de recuperação persiste somente digest e controla validade/consumo na própria tabela. A camada de adaptação usa o contexto do Better Auth (`password.hash` e `internalAdapter.updatePassword`) para atualizar a credencial na conexão externa. Sessões são revogadas explicitamente na mesma transação. Nenhum token de verificação nativo adicional ou handler de reset é criado. Esses pontos internos da versão fixada exigem regressão em upgrades: senha anterior recusada, novo login, revogação integral, consumo concorrente e rollback completo.

## Origem e limites do registro

Consolidação das definições do projeto recuperadas para este conjunto. A data acima é a data de documentação, não necessariamente a de aprovação. Justificativas, alternativas e orientações derivadas explicitam a análise desta consolidação e não afirmam que todas foram discutidas ou aprovadas anteriormente. Consulte o [índice](README.md) para os critérios de status.

