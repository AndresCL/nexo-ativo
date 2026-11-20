import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GraficoTemporalInterativo } from "@/componentes/painel/desempenho/GraficoTemporalInterativo";
import type { MetricasDiariasOrganizacao } from "@/dominio/analytics/tiposMetricasAgregadas";

describe("GraficoTemporalInterativo", () => {
  const dadosMock: MetricasDiariasOrganizacao[] = [
    {
      dataIso: "2026-11-01",
      visualizacoesVitrine: 120,
      aberturasMicrofluxo: 30,
      conclusoesMicrofluxo: 10,
      cliquesWhatsapp: 8,
      atualizadoEmIso: "2026-11-01T23:59:59Z",
    },
    {
      dataIso: "2026-11-02",
      visualizacoesVitrine: 150,
      aberturasMicrofluxo: 45,
      conclusoesMicrofluxo: 15,
      cliquesWhatsapp: 12,
      atualizadoEmIso: "2026-11-02T23:59:59Z",
    },
  ];

  it("renderiza o cabeçalho, legenda sóbria e botões de filtro por dia", () => {
    render(
      <GraficoTemporalInterativo
        historicoDiario={dadosMock}
        diaSelecionado={null}
        aoSelecionarDia={vi.fn()}
      />,
    );

    expect(screen.getByText("Histórico Diário & Interatividade por Dia")).toBeInTheDocument();
    expect(screen.getByText("Visitas")).toBeInTheDocument();
    expect(screen.getByText("Fluxos Iniciados")).toBeInTheDocument();
    expect(screen.getByText("Cliques no WhatsApp")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "2026-11-01" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2026-11-02" })).toBeInTheDocument();
  });

  it("chama aoSelecionarDia ao clicar em um chip de data", () => {
    const aoSelecionarDia = vi.fn();
    render(
      <GraficoTemporalInterativo
        historicoDiario={dadosMock}
        diaSelecionado={null}
        aoSelecionarDia={aoSelecionarDia}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2026-11-02" }));
    expect(aoSelecionarDia).toHaveBeenCalledWith("2026-11-02");
  });

  it("exibe o banner com CTA preto ao ter um dia selecionado e permite desmarcar", () => {
    const aoSelecionarDia = vi.fn();
    render(
      <GraficoTemporalInterativo
        historicoDiario={dadosMock}
        diaSelecionado="2026-11-02"
        aoSelecionarDia={aoSelecionarDia}
      />,
    );

    expect(screen.getByText(/Filtrando métricas do dia:/i)).toBeInTheDocument();
    expect(screen.getByText(/150 visitas · 45 fluxos · 12 cliques no WhatsApp/i)).toBeInTheDocument();

    const botaoLimpar = screen.getByRole("button", { name: /Ver período completo/i });
    expect(botaoLimpar).toBeInTheDocument();
    fireEvent.click(botaoLimpar);
    expect(aoSelecionarDia).toHaveBeenCalledWith(null);
  });

  it("apresenta mensagem amigável quando o histórico está vazio", () => {
    render(
      <GraficoTemporalInterativo
        historicoDiario={[]}
        diaSelecionado={null}
        aoSelecionarDia={vi.fn()}
      />,
    );

    expect(screen.getByText("Nenhuma métrica registrada no período selecionado.")).toBeInTheDocument();
  });
});

