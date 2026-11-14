# Segurança, Autenticação e Multi-Tenancy

## Autenticação e Sessão

- **Provedores ativos:** Google OAuth e E-mail/Senha (cadastro, login, recuperação de senha e verificação de e-mail).
- **Tratamento de múltiplos provedores:** Captura explícita de `auth/account-exists-with-different-credential` orientando autenticação prévia pelo provedor original antes de vincular credenciais adicionais.
- **Sessão no Servidor (`HttpOnly`):** O endpoint `/api/autenticacao/sessao` valida o `idToken` via `firebase-admin` e grava o Session Cookie `fluxo_sessao` (`HttpOnly`, `SameSite=Lax`, `Secure` em produção), permitindo que os layouts `/painel` e `/fundador` bloqueiem acessos não autorizados diretamente no servidor.
- **Política de Verificação de E-mail:** O usuário pode configurar rascunhos imediatamente, mas `publicar_pagina` e `gerenciar_assinatura` exigem `emailVerificado === true`.

## Privilégio Global (Firebase Custom Claims) e Provisionamento do Fundador

- As Custom Claims contêm exclusivamente `{ papelPlataforma: "fundador" }` para o proprietário da plataforma.
- Nenhum navegador pode definir ou alterar essa Claim.
- **Procedimento documentado de provisionamento inicial do Fundador:**
  1. Cadastre a conta principal do fundador na plataforma.
  2. Em terminal administrativo autenticado com credenciais do projeto Firebase (ou apontando para o Auth/Firestore Emulator local), execute a rotina `funcoes/src/scripts/provisionarFundadorCli.ts <email-do-fundador>`.
  3. A operação define `{ papelPlataforma: "fundador" }`, registra um evento imutável `ATRIBUIR_PRIVILEGIO_FUNDADOR` em `registrosAuditoria` e requer renovação da sessão para emissão de novo token.

## Isolamento Multi-Tenant em Camadas

1. **Firestore & Storage Security Rules (`firestore.rules` e `storage.rules`):**
   - Negação por padrão (`allow read, write: if false`).
   - Acesso aos dados privados de `organizacoes/{organizacaoId}/**` exige vínculo `ativo` em `organizacoes/{organizacaoId}/membros/{request.auth.uid}` e papel compatível (`proprietario`, `administrador` ou `membro`).
   - Clientes não podem criar organizações diretamente, injetar membros nem adulterar `resumoDireitosPlano`, `identificadorPublico` ou `paginasPublicadas`.
   - Coleções financeiras e administrativas (`assinaturas`, `cobrancas`, `eventosWebhookAsaas`, `enviosEmail`, `registrosAuditoria`) são restritas à leitura exclusiva por `ehFundador()` e escrita exclusiva pelo Admin SDK.
2. **Autorização Explícita no Backend (`funcoes/src/seguranca/autorizadorAdminFirestore.ts`):**
   - Como o Admin SDK ignora Security Rules, toda Cloud Function recarrega `Organizacao` e `MembroOrganizacao` no banco e executa `exigirPermissaoOrganizacao` antes de qualquer operação.
3. **Verificação Automatizada:**
   - Suíte `npm run testar:regras` executa tentativas reais de invasão cruzada entre organizações contra o Firestore Emulator (`testes/regras-firestore/isolamentoMultiTenant.test.ts`).
