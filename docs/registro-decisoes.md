# Registro de Decisões Arquiteturais (ADR)

## ADR-001: Código de Domínio e Aplicação 100% em Português Brasileiro

- **Decisão:** Adotar `pt-BR` em todas as entidades, funções, componentes próprios, rotas internas, coleções Firestore e testes, restringindo o inglês às convenções obrigatórias das ferramentas e adaptadores de APIs externas (incluindo o prefixo técnico obrigatório `use` em Custom Hooks React — ex.: `useEstadoInterfacePainel` — exigido pela regra estática `react-hooks/rules-of-hooks` do React).
- **Motivação:** Alinhamento ubíquo com o domínio comercial brasileiro e compatibilidade estrita com a verificação estática oficial do React e Next.js.

## ADR-002: Separação Física entre Rascunho Privado e Projeção Publicada

- **Decisão:** Isolar a edição em `organizacoes/{orgId}` e projetar versões publicadas enxutas em `paginasPublicadas/{orgId}` + `identificadoresPublicos/{slug}`.
- **Motivação:** Evita vazamento de dados privados/rascunhos, garante unicidade transacional de URL pública, impede documentos gigantes (> 1 MiB) e reduz o custo da Home pública a uma única leitura cacheável.

## ADR-003: Empacotamento de Cloud Functions v2 com `tsup`

- **Decisão:** Compilar `funcoes/src/index.ts` com `tsup` gerando `funcoes/dist/index.js` autocontido.
- **Motivação:** Permite compartilhar diretamente `src/dominio` e `src/validacoes` entre Next.js e Cloud Functions sem falhar no upload isolado do `firebase deploy --only functions`.

## ADR-004: Fontes Variáveis Auto-Hospedadas (`@fontsource-variable`)

- **Decisão:** Carregar `Cormorant Variable` e `Plus Jakarta Sans Variable` localmente via pacote estático em vez de CDN externa em tempo de execução.
- **Motivação:** Garante conformidade LGPD (sem envio de IP de visitantes a servidores externos de fontes) e compilação `next build` determinística mesmo em ambientes sem acesso externo à internet.

## ADR-005: Separação Estrita entre Cobrança SaaS (Asaas) e Pix Manual de Assinantes

- **Decisão:** Restringir o Asaas às assinaturas e implantações da própria plataforma, mantendo o Pix exibido aos visitantes dos assinantes como instrução estática manual.
- **Motivação:** Elimina riscos regulatórios/financeiros de intermediação (_split_/_marketplace_) e reduz drasticamente a complexidade operacional do MVP.

## ADR-006: Perfis de Publicidade Profissional Regulada (OAB, CFM, CFO) Definidos pelo Fundador

- **Decisão:** Criar políticas de publicidade segregadas por órgão de classe (`PoliticaPublicidade`), desacopladas por abstração (LSP/ISP/DIP), onde cada categoria (`advocacia_oab`, `medicina_cfm`, `odontologia_cfo`) possui regras isoladas sobre exibição de avaliações, ocultação de preços, bloqueio de Pix e cálculo comercial em microfluxos. A definição do perfil é atribuída exclusivamente pelo fundador via Cloud Function auditada, e protegida contra escrita do cliente no Firestore Rules.
- **Motivação:** Proteger a plataforma e os assinantes de infrações perante conselhos de classe de profissões reguladas sem engessar o código com lógica condicional acoplada e mantendo cada perfil autônomo para futuras alterações regulatórias.
