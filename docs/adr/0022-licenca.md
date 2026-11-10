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
- Após a verificação, adicionar o texto oficial da AGPL v3 em `LICENSE` e documentar como acessar o código-fonte correspondente à versão distribuída.
- Manter a release pública da Alpha 1 condicionada à conclusão dessas verificações. O piloto privado já homologado está registrado nas issues #1 e #17.

Referência: [texto oficial da GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.html).
