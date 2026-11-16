# Plano: Ciclo de Vida de Assinatura, Suspensão e Cancelamento (Asaas)

## Contexto e Regras de Negócio

Com base na documentação oficial da API v3 do Asaas (`docs.asaas.com`):

- **Inativar / Suspender (`PUT /v3/subscriptions/{id}` com `status: "INACTIVE"`)** → dispara `SUBSCRIPTION_INACTIVATED`:
  - Interrompe a geração de novas cobranças futuras.
  - **Mantém cobranças pendentes/vencidas ativas** para que o cliente possa regularizar.
- **Cancelar / Remover (`DELETE /v3/subscriptions/{id}`)** → dispara `SUBSCRIPTION_DELETED`:
  - Encerra definitivamente a assinatura.
  - **Remove automaticamente** cobranças pendentes ou vencidas vinculadas (mantendo apenas as pagas).

## Matriz de Estados e Permissões

| Situação (`situacaoAssinatura`) | Dias após `inadimplenteDesde` | Painel (Edição) | Vitrine / Permalinks | Comportamento |
| :--- | :--- | :--- | :--- | :--- |
| `pendente_contratacao` | — | Bloqueado (só Assinatura) | Inativa | Aguardando 1º pagamento confirmado |
| `ativa` | — | Liberado | Ativa | Uso normal |
| `em_carencia` | 1 a 5 dias | Liberado (com aviso) | Ativa | Cobre compensação de boleto / retentativa de cartão |
| `inadimplente` | 6 a 15 dias | Bloqueado (banner + Assinatura) | Ativa | Permite regularizar fatura em aberto |
| `suspensa` ou `inadimplente` > 15d | > 15 dias | Bloqueado (só Assinatura) | Inativa (página neutra) | Dados preservados no banco para reativação |
| `cancelada` | — | Bloqueado (só Assinatura) | Inativa (página neutra) | Assinatura encerrada; exige nova contratação |

## Etapas de Implementação

1. **Domínio (`src/dominio/entidades/autenticacaoEOrganizacao.ts`, `src/dominio/assinaturas/`)**
   - Incluir `"suspensa"` em `SituacaoResumoAssinatura` e `inadimplenteDesde?: string` em `ResumoDireitosPlano`.
   - Incluir `"SUBSCRIPTION_INACTIVATED"` em `EventoWebhookAsaas`.
   - Criar `politicaAcessoAssinatura.ts` com a função pura `avaliarPermissaoAcesso(resumo, agora)`.
2. **Webhook (`funcoes/src/casos-de-uso/processarWebhookAsaasTransacional.ts`)**
   - Tratar `SUBSCRIPTION_INACTIVATED` → `"suspensa"`.
   - Gravar `inadimplenteDesde` em `PAYMENT_OVERDUE` (se ainda não definido) e limpar em `PAYMENT_CONFIRMED` / `PAYMENT_RECEIVED`.
3. **Cancelamento pelo Usuário (`funcoes/` + `GerenciadorAssinaturaPainel.tsx`)**
   - Adicionar `cancelarAssinatura(assinaturaAsaasId)` em `PortaProvedorAsaas` e `AdaptadorAsaasHttp` (`DELETE /v3/subscriptions/{id}`).
   - Criar caso de uso `cancelarAssinaturaOrganizacaoAsaas` e Cloud Function `cancelarAssinaturaAsaas` (`onCall`).
   - Adicionar botão **"Cancelar assinatura"** com confirmação em `GerenciadorAssinaturaPainel.tsx`.

