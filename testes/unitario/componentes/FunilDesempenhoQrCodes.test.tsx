import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FunilDesempenhoQrCodes } from "@/componentes/painel/desempenho/qrcodes/FunilDesempenhoQrCodes";
import type { MetricaQrCode } from "@/dominio/analytics/tiposMetricasAgregadas";

describe("FunilDesempenhoQrCodes", () => {
  const qrCodesMock: readonly MetricaQrCode[] = [
    {
      codigo: "vitrine",
      rotulo: "Vitrine Principal (Home)",
      visualizacoes: 58,
      aberturasFluxo: 14,
      conclusoesFluxo: 4,
      contatosWhatsapp: 0,
    },
    {
      codigo: "fluxo_seguro",
      rotulo: "Fluxo Seguro",
      visualizacoes: 20,
      aberturasFluxo: 20,
      conclusoesFluxo: 5,
      contatosWhatsapp: 2,
    },
  ];

  it("renderiza cabeçalho limpo sem badge decorativo de materiais impressos", () => {
    render(<FunilDesempenhoQrCodes qrCodes={qrCodesMock} />);

    expect(screen.getByText("Desempenho por QR Code")).toBeInTheDocument();
    expect(
      screen.getByText("Funil físico de conversão: da leitura no balcão até a geração de contato."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Materiais Impressos & Balcão")).not.toBeInTheDocument();
  });

  it("renderiza as etapas do funil com métricas responsivas e valores corretos", () => {
    render(<FunilDesempenhoQrCodes qrCodes={qrCodesMock} />);

    expect(screen.getAllByText("Volume").length).toBe(3);
    expect(screen.getAllByText("% Topo").length).toBe(3);
    expect(screen.getAllByText("vs. Anterior").length).toBe(3);

    expect(screen.getByText("1. Leituras Físicas do QR Code")).toBeInTheDocument();
    expect(screen.getByText("2. Engajamento em Microfluxos")).toBeInTheDocument();
    expect(screen.getByText("3. Conversões Comerciais")).toBeInTheDocument();
  });

  it("exibe 0% no topo quando não há leituras de QR Code", () => {
    render(<FunilDesempenhoQrCodes qrCodes={[]} />);

    expect(screen.queryByText("100%")).not.toBeInTheDocument();
  });

  it("permite filtrar por destino específico e atualizar a visualização", () => {
    render(<FunilDesempenhoQrCodes qrCodes={qrCodesMock} />);

    const seletor = screen.getByRole("combobox", { name: "Filtrar destino do QR Code" });
    fireEvent.change(seletor, { target: { value: "fluxo_seguro" } });

    expect(screen.getAllByText("Fluxo: seguro").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2. Propostas Concluídas no Fluxo")).toBeInTheDocument();
  });
});
