# ADR-0022: Licença de distribuição

- **Status:** Escolha aprovada, validação de distribuição pendente
- **Data de registro:** 2026-11-03
- **Data da decisão:** 2026-11-10
- **Projeto:** Kafofo

## Contexto

O Kafofo é um projeto de código aberto e auto-hospedado. O mantenedor quer que usuários de versões modificadas oferecidas pela rede tenham acesso ao código-fonte correspondente.

## Decisão

Adotar a GNU Affero General Public License versão 3 para o código do Kafofo. A licença permite uso comercial, incluindo hospedagem paga, e exige que operadores de versões modificadas ofereçam o código-fonte correspondente aos usuários que interagem com a versão pela rede, conforme a seção 13.

## Alternativas consideradas

Licenças permissivas, como Apache 2.0, permitem distribuir versões com alterações fechadas. A MPL 2.0 aplica copyleft por arquivo quando há distribuição. A GPL v3 aplica copyleft na distribuição. A AGPL v3 foi escolhida pela obrigação aplicável às versões modificadas usadas pela rede.

## Antes da primeira distribuição pública

- Inventariar dependências diretas e transitivas, imagens base e componentes incorporados aos artefatos distribuídos. Conferir compatibilidade e identificar textos e avisos de terceiros que devem acompanhar a distribuição.
- O texto da AGPL v3 está em [LICENSE](../../LICENSE). A [preparação da distribuição](../operations/distribution.md) registra a revisão preliminar, os avisos coletados e como oferecer o código-fonte correspondente.
- A Alpha 1 encerra como piloto privado, registrado nas issues #1 e #17. A primeira release pública fica para depois da Alpha 2, após validar a navegação da #41 e verificar a distribuição do candidato efetivo.

Referência: [texto oficial da GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.html).
