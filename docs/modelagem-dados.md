# Modelagem de Dados (Cloud Firestore)

## Diretrizes Centrais

1. **Organização Universal:** Todo assinante — mesmo profissional individual — opera sob uma entidade `Organizacao`.
2. **Separação Rascunho vs. Publicado:** A edição ocorre em subcoleções privadas de `organizacoes/{orgId}`. A vitrine pública consome exclusivamente `identificadoresPublicos/{slug}` e `paginasPublicadas/{orgId}` (com subcoleções pagináveis `*Publicados` para evitar documentos próximos ao limite de 1 MiB).
3. **Valores Monetários:** Sempre persistidos como inteiros seguros em centavos (`ValorMonetarioCentavos`).
4. **Preservação Histórica:** Serviços, produtos e profissionais utilizam desativação lógica (`ativo: false`), preservando referências em solicitações anteriores. Microfluxos publicados geram versões imutáveis (`versoes/{numero}`), e cada `Solicitacao` armazena o instantâneo exato das respostas e da memória de cálculo apresentada ao visitante.

## Principais Coleções

- `usuarios/{usuarioId}` + `vinculosOrganizacao/{orgId}`
- `identificadoresPublicos/{slug}`
- `organizacoes/{orgId}`
  - `membros/{usuarioId}` (`proprietario` | `administrador` | `membro`)
  - `configuracaoPagina/rascunho`
  - `profissionais/{profissionalId}`
  - `servicos/{servicoId}`
  - `produtos/{produtoId}`
  - `projetosPortfolio/{projetoId}`
  - `microfluxos/{microfluxoId}` + `versoes/{numeroVersao}`
  - `solicitacoes/{solicitacaoId}`
  - `configuracoes/email`
  - `metricasDiarias/{anoMesDia}`
- `paginasPublicadas/{orgId}` + `profissionaisPublicados`, `servicosPublicados`, `produtosPublicados`, `projetosPublicados`, `microfluxosPublicados`
- `planosAssinatura/{planoId}`
- `assinaturas/{assinaturaId}`, `cobrancas/{cobrancaId}`, `eventosWebhookAsaas/{eventoId}`, `enviosEmail/{envioId}`, `registrosAuditoria/{registroId}` (acesso restrito ao backend e ao Painel Fundador)
