import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GraficoCanaisOrigem } from "@/componentes/painel/desempenho/GraficoCanaisOrigem";
import type { MetricaCanalOrigem } from "@/dominio/analytics/tiposMetricasAgregadas";

describe("GraficoCanaisOrigem", () => {
  const canaisMock: readonly MetricaCanalOrigem[] = [
    {
      canal: "cartao_equipe",
      rotulo: "Cartões VIP da Equipe",
      visualizacoes: 54,
      cliquesAcoesHome: 20,
      aberturasFluxo: 17,
      contatosWhatsapp: 7,
      taxaConversao: 13,
    },
    {
      canal: "qrcode",
      rotulo: "QR Code (Balcão & Impressos)",
      visualizacoes: 58,
      cliquesAcoesHome: 15,
      aberturasFluxo: 14,
      contatosWhatsapp: 0,
      taxaConversao: 0,
    },
    {
      canal: "instagram",
      rotulo: "Instagram (Bio & Campanhas)",
      visualizacoes: 0,
      cliquesAcoesHome: 0,
      aberturasFluxo: 0,
      contatosWhatsapp: 0,
      taxaConversao: 0,
    },
  ];

  it("renderiza o cabeçalho flat sem badge decorativo e com total de contatos", () => {
    render(<GraficoCanaisOrigem canais={canaisMock} identificadorOrganizacao="minha-loja" />);

    expect(screen.getByText("Canais de Origem")).toBeInTheDocument();
    expect(
      screen.getByText("Acompanhe as visitas, os fluxos iniciados e os cliques no WhatsApp por canal."),
    ).toBeInTheDocument();

    // Total de contatos (7)
    expect(screen.getAllByText("7").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("cliques no WhatsApp")).toBeInTheDocument();
  });

  it("renderiza a tabela de canais com colunas tabulares e valores corretos", () => {
    render(<GraficoCanaisOrigem canais={canaisMock} identificadorOrganizacao="minha-loja" />);

    // Cabeçalho da tabela
    expect(screen.getByText("Canal de Origem")).toBeInTheDocument();
    expect(screen.getByText("Visitas")).toBeInTheDocument();
    expect(screen.getByText("Fluxos")).toBeInTheDocument();
    expect(screen.getAllByText("WhatsApp").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("% Share")).toBeInTheDocument();

    // Rótulos dos canais
    expect(screen.getByText("Cartões VIP da Equipe")).toBeInTheDocument();
    expect(screen.getByText("QR Code (Balcão & Impressos)")).toBeInTheDocument();
    expect(screen.getByText("Instagram (Bio & Campanhas)")).toBeInTheDocument();

    // Botões de cópia de link rastreado
    expect(
      screen.getByRole("button", { name: "Copiar link rastreado para Cartões VIP da Equipe" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copiar link rastreado para QR Code (Balcão & Impressos)" }),
    ).toBeInTheDocument();
  });
});
