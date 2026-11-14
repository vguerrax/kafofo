# Kitute — Alinhamento arquitetural

Base consultada: Kafofo_Documentacao_Repositorio.zip, especialmente entidades e permissões de plataforma, permissões de Urukum/Kitanda e identidade da plataforma.

- Módulo independente dentro do monólito modular do Kafofo; não é extensão de Urukum nem novo serviço.
- Segue stack e ADRs existentes: Fastify/TypeScript, React/TypeScript, PostgreSQL, Drizzle e contratos TypeBox/OpenAPI.
- Reutiliza autenticação, autorização por contexto, auditoria e ciclo de dados da plataforma.
- Compartilhamento seletivo é concessão sobre um caderno, não quarto tipo de proprietário.
- Reaproveitamento de componentes de texto e tags não mistura os domínios de Urukum e Kitute.
- O papel de visualizador continua sem edição; núcleo e residência possuem autorizações independentes.
- O fato de um núcleo administrar a residência não concede automaticamente acesso ao seu conteúdo.
- Desativação do módulo preserva dados, conforme regra da plataforma.
- Portabilidade e exclusão de conta devem seguir a plataforma, sem exportação irrestrita de conteúdo de terceiros.
- Não criar schema público, endpoint ou migração antes de resolver refinamentos que afetem autorização.
- Uma revisão técnica para concorrência não equivale a histórico completo de versões.

## Integração documental
Adicionar referência a Kitute no catálogo de módulos e em docs/README.md durante integração ao repositório.
A identidade aprovada é “Kitute — Cadernos de receitas”. O pacote não altera arquivos existentes nem registra funcionalidades como implementadas.
