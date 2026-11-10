# Plataforma — Requisitos não funcionais

> **Alpha 1:** consulte o [contrato aprovado deste incremento](alpha-1.md), que resolve ou adia explicitamente os pontos aplicáveis. O texto geral abaixo descreve o MVP; capacidades adiadas não são critérios de conclusão desta versão.


Títulos e IDs preservados do levantamento. As condições abaixo explicitam o significado documental sem atribuir medições ou conformidade já comprovadas.

| ID | Requisito | Condição esperada |
| --- | --- | --- |
| RNF-001 | Responsividade | Funcionar em desktop, tablet e celular com adaptação da interface. |
| RNF-002 | PWA | Oferecer experiência PWA no MVP. |
| RNF-003 | Instalabilidade | Permitir instalação nos ambientes compatíveis, sem assumir suporte universal. |
| RNF-004 | Experiência multiplataforma | Manter experiência de uso nos diferentes dispositivos contemplados. |
| RNF-005 | Dependência de conexão | Exigir conexão com o servidor para operar no MVP; não prometer edição offline. |
| RNF-006 | Indicação de conectividade | Informar conectividade e indisponibilidade de maneira perceptível ao usuário. |
| RNF-007 | Acessibilidade | Usar WCAG 2.2 AA como referência de acessibilidade desde o MVP. |
| RNF-008 | Navegação por teclado | Permitir navegação e execução das ações por teclado. |
| RNF-009 | Compatibilidade assistiva | Possibilitar uso com tecnologias assistivas; matriz de validação ainda a definir. |
| RNF-010 | Contraste e legibilidade | Assegurar contraste e legibilidade conforme a referência de acessibilidade. |
| RNF-011 | Feedback acessível | Oferecer mensagens e feedback acessíveis para estados, erros e ações. |
| RNF-012 | Consistência entre módulos | Preservar padrões de interface, componentes e experiência entre módulos. |
| RNF-013 | Idioma inicial | Entregar inicialmente interface em pt-BR. |
| RNF-014 | Internacionalização | Preparar a estrutura para outros idiomas sem incluí-los como entregáveis iniciais. |
| RNF-015 | Localização | Localizar apresentação de datas, horas, valores e textos; critérios exatos a detalhar. |
| RNF-016 | Fuso do usuário | Permitir fuso horário por usuário. |
| RNF-017 | Fuso da residência | Permitir fuso horário por residência. |
| RNF-018 | Conversão de horários | Converter horários conforme contexto e origem; precedência precisa de especificação. |
| RNF-019 | Preservação do horário de origem | Preservar horário/fuso de origem para evitar interpretação incorreta. |
| RNF-020 | Regras de horário local e horário de verão | Considerar horário local e mudanças de horário de verão; regras de recorrência pertencem aos módulos. |
| RNF-021 | Armazenamento por instância | Centralizar armazenamento na própria instalação. |
| RNF-022 | Isolamento lógico | Manter isolamento lógico entre núcleos. |
| RNF-023 | Separação de identidade | Separar identidade pessoal dos dados dos núcleos. |
| RNF-024 | Backup | Permitir backups configuráveis pelo operador; solução operacional ainda pendente. |
| RNF-025 | Exportação de dados de núcleo | Permitir exportação de dados de núcleo em formatos abertos/documentados; ator, abrangência e formato exato pendentes. |

## Condições arquiteturais adicionais

As ADRs complementam os RNF sem renumerá-los: TypeScript estrito, contratos de API, testes, CI, PostgreSQL, arquivos locais, logs estruturados, Compose e imagens amd64/arm64. Essas decisões não provam disponibilidade, desempenho ou recuperação de uma instalação.

## Verificação proposta

- **Interface:** validar tamanhos de tela representativos, instalação PWA em ambientes compatíveis e feedback quando o servidor não está acessível.
- **Acessibilidade:** combinar verificações automatizadas e uso manual por teclado/tecnologia assistiva; um resultado automático isolado não comprova atendimento integral à referência.
- **Tempo e localização:** verificar alteração de fuso do usuário, residência com fuso diferente, conversão e preservação da origem; expectativas detalhadas dependem do refinamento temporal.
- **Isolamento:** testar consultas diretas e agregadas com contas de núcleos e residências distintos, incluindo exportações e históricos.
- **Recuperação operacional:** validar restauração conjunta de banco e arquivos quando o procedimento de backup estiver definido.

## Limites ainda não quantificados

Não há metas aprovadas de latência, usuários simultâneos, capacidade de armazenamento, SLA, disponibilidade, RPO/RTO, navegadores suportados, prazo de exportação ou limites de upload. Não inventar números para apresentar a especificação como operacionalmente concluída. Ver [pendências](open-questions.md).
