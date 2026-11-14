# Planos Comerciais e Estratégia de Cobrança

## Planos de Assinatura do SaaS (Cobrados via Asaas)

- **Pro — R$ 97/mês (`9700` centavos):** Página premium, três composições editoriais, redes sociais, portfólio, serviços, microfluxos, cálculos, solicitações, e-mails Resend dentro da franquia contratada, analytics e 1 perfil principal.
- **Equipe — R$ 197/mês (`19700` centavos):** Todos os recursos do Pro + até 5 profissionais ativos com cartões digitais próprios, QR Codes individuais, catálogo compartilhado, encaminhamento de solicitações e permissões administrativas.
- **Personalizado — Sob consulta:** Administrado manualmente pelo Painel Fundador.
- **Implantação Assistida Opcional (Cobrança Única):** Pro por **R$ 297** (`29700` centavos) e Equipe por **R$ 597** (`59700` centavos), realizada sobre o mesmo painel disponibilizado ao cliente.

## Regras Financeiras Asaas

1. Checkout/fatura hospedada oficial do Asaas (zero tráfego de cartões na aplicação).
2. Direitos ativados exclusivamente por confirmação confiável de webhook (`asaas-access-token` validado com segredo dedicado + idempotência por `eventoId`).
3. **Política de Carência:** Após `PAYMENT_OVERDUE`, 7 dias corridos em estado `em_carencia` mantendo a página pública ativa enquanto notifica o assinante. Persistindo a inadimplência, transição para `inadimplente` sem jamais excluir os dados do cliente.

## Pix Manual nos Microfluxos dos Assinantes

O Pix eventualmente configurado pelo assinante para seus próprios visitantes consiste apenas em cópia de chave estática, exibição de imagem de QR Code estático ou link externo. Não há integração Asaas nas vendas dos assinantes, nem confirmação automática de pagamento.
