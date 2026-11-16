# Roadmap de Prioridades — Nexo Ativo

Este documento organiza as prioridades de evolução do produto para o mercado brasileiro (PMEs, negócios locais e profissionais autônomos, com foco em WhatsApp, Pix e tráfego pago).

---

## Diferenciais Atuais do Produto
- **Foco em Negócios Locais e Conversão:** Integração com Google / Avaliações (`funcoes/src/google`, `funcoes/src/avaliacoes`).
- **Microfluxos e Solicitações:** Qualificação do cliente antes do atendimento (`microfluxos`, `solicitacoes`), em vez de apenas uma lista de links.
- **Cobrança 100% Brasileira:** Assinaturas e pagamentos em Real (R$) via **Asaas** (Pix, Cartão e Boleto), sem barreira de cartão internacional + IOF.

---

## P0 — Agora (Alto impacto na conversão para planos pagos)
- [x] **Central de QR Codes da vitrine e rastreamento granular (`utm_source=qrcode`)**
  - *Motivo:* Uso imediato em balcão, cartão de visita, crachás e materiais impressos de negócios locais, com medição separada em *Desempenho por QR Code*.
- [ ] **Meta Pixel e Google Analytics (GA4) por vitrine**
  - *Motivo:* Exigência básica de quem roda tráfego pago no Instagram/Google Ads no Brasil (agências, gestores de tráfego e anunciantes).
- [ ] **Destaque visual / Animação no botão principal (CTA)**
  - *Motivo:* Aumenta a taxa de clique no botão principal (ex.: "Chamar no WhatsApp" ou "Agendar agora").

---

## P1 — Curto Prazo (Aumenta ticket médio e retenção)
- [ ] **Agendamento de links/blocos (data de início e fim)**
  - *Motivo:* Ideal para promoções relâmpago, feriados e campanhas sazonais sem edição manual.
- [ ] **Parâmetros UTM automáticos ou configuráveis**
  - *Motivo:* Permite ao cliente mensurar a origem exata dos cliques (Instagram vs. Google vs. QR Code).
- [ ] **Temas e templates prontos por nicho** (Clínica, Restaurante, Advogado, Prestador de Serviço, etc.)
  - *Motivo:* O usuário brasileiro prefere escolher um modelo bonito e pronto em 2 minutos do que configurar design do zero.

---

## P2 — Médio Prazo (Planos topo e empresas maiores)
- [ ] **Domínio próprio (`CNAME`)**
  - *Motivo:* Justifica um ticket mais alto para empresas estabelecidas (`links.suaempresa.com.br`).
- [ ] **Redirecionamento temporário (`Prioritize / Redirect`)**
  - *Motivo:* Útil para lançamentos, lives ou ofertas urgentes sem perder a estrutura da vitrine.
- [ ] **Exportação de relatórios / histórico estendido de analytics**
  - *Motivo:* Bom argumento de retenção para planos anuais e agências.

---

## Fora do Escopo (Não fazer)
- **Custom CSS livre:** Gera suporte caro e quebra o layout mobile.
- **Integrações com ferramentas de newsletter em dólar (Mailchimp, Klaviyo, Kit, beehiiv):** Baixa adesão entre PMEs brasileiras (o canal principal no BR é WhatsApp).
- **Checkout próprio de cursos/produtos digitais com taxa (9%–12%):** Mercado já dominado por plataformas locais e Pix direto.
- **Tip Jar (gorjetas):** Baixa aderência cultural no Brasil fora de lives.
- **Auto-Reply DM no Instagram:** Alto custo/risco de manutenção com a API da Meta e concorrência direta com ferramentas especializadas.

