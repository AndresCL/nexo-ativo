import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EstatisticasExperiencias } from "@/componentes/painel/desempenho/EstatisticasExperiencias";
import type {
  MetricaGranularMicrofluxo,
  MetricasDiariasOrganizacao,
} from "@/dominio/analytics/tiposMetricasAgregadas";

describe("EstatisticasExperiencias", () => {
  const experienciasMock = [
    { id: "exp-1", titulo: "Quiz de Estilo" },
    { id: "exp-2", titulo: "Catálogo Exclusivo" },
    { id: "exp-3", titulo: "Calculadora Solar" },
    { id: "exp-4", titulo: "Consultoria VIP" },
  ];

  const metricasMock: MetricaGranularMicrofluxo[] = [
    {
      id: "exp-1",
      titulo: "Quiz de Estilo",
      aberturas: 71,
      conclusoes: 18,
      aberturasPermalink: 20,
    },
    {
      id: "exp-2",
      titulo: "Catálogo Exclusivo",
      aberturas: 40,
      conclusoes: 10,
      aberturasPermalink: 5,
    },
    {
      id: "exp-3",
      titulo: "Calculadora Solar",
      aberturas: 15,
      conclusoes: 3,
      aberturasPermalink: 0,
    },
    {
      id: "exp-4",
      titulo: "Consultoria VIP",
      aberturas: 5,
      conclusoes: 1,
      aberturasPermalink: 0,
    },
  ];

  const historicoMock: MetricasDiariasOrganizacao[] = [
    {
      dataIso: "2026-11-01",
      visualizacoes: 100,
      cliquesAcoesHome: 50,
      aberturasFluxo: 20,
      conclusoesFluxo: 5,
      contatosWhatsapp: 2,
      porMicrofluxo: {
        "exp-1": { aberturas: 15, conclusoes: 4, aberturasPermalink: 5 },
        "exp-2": { aberturas: 5, conclusoes: 1, aberturasPermalink: 0 },
      },
    },
  ];

  it("renderiza cabeçalho limpo sem badge decorativo de percursos individuais", () => {
    render(
      <EstatisticasExperiencias
        experiencias={experienciasMock}
        metricas={metricasMock}
        historico={historicoMock}
      />,
    );

    expect(screen.getByText("Desempenho por experiência")).toBeInTheDocument();
    expect(
      screen.getByText("Compare a evolução temporal e analise o funil de cada percurso no mesmo gráfico."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Percursos individuais")).not.toBeInTheDocument();
  });

  it("renderiza os cards de resumo e a tabela detalhada", () => {
    render(
      <EstatisticasExperiencias
        experiencias={experienciasMock}
        metricas={metricasMock}
        historico={historicoMock}
      />,
    );

    // Cards de resumo
    expect(screen.getAllByText("Aberturas").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Conclusões").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Taxa de conclusão").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Via permalink").length).toBeGreaterThanOrEqual(1);

    // Tabela detalhada
    expect(screen.getByText("Tabela detalhada de experiências")).toBeInTheDocument();
    expect(screen.getAllByText("Quiz de Estilo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Catálogo Exclusivo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Calculadora Solar").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Consultoria VIP").length).toBeGreaterThanOrEqual(1);
  });

  it("permite alternar botões de filtro e métrica temporal", () => {
    render(
      <EstatisticasExperiencias
        experiencias={experienciasMock}
        metricas={metricasMock}
        historico={historicoMock}
      />,
    );

    // Filtros de seleção rápida
    const botaoTodas = screen.getByRole("button", { name: "Todas (4)" });
    const botaoTop3 = screen.getByRole("button", { name: "Top 3" });

    fireEvent.click(botaoTodas);
    expect(botaoTodas).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(botaoTop3);
    expect(botaoTop3).toHaveAttribute("aria-pressed", "true");

    // Alternar métrica
    const botaoConclusoes = screen.getByRole("button", { name: "Conclusões" });
    fireEvent.click(botaoConclusoes);
    expect(botaoConclusoes).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Comparação temporal: Conclusões")).toBeInTheDocument();
  });
});

