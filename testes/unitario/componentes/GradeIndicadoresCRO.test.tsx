import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GradeIndicadoresCRO } from "@/componentes/painel/desempenho/indicadores/GradeIndicadoresCRO";
import type { ResumoMetricasPeriodo } from "@/dominio/analytics/tiposMetricasAgregadas";
import { CalculadorMetricasCRO } from "@/dominio/analytics/calculadorMetricasCRO";

describe("GradeIndicadoresCRO", () => {
  const metricasCRO = CalculadorMetricasCRO.consolidarResumo({
    visitantesOuSessoes: 1000,
    cliquesAcaoTotais: 150,
    contatosUnicos: 100,
    leadsQualificados: 40,
    vendasConcluidas: 8,
  });

  const resumoMetricasMock: ResumoMetricasPeriodo = {
    diasConsiderados: 30,
    totalVisualizacoes: 1000,
    totalVisualizacoesCartoes: 200,
    totalCliquesAcoesHome: 150,
    totalAberturasMicrofluxo: 19,
    totalConclusoesMicrofluxo: 11,
    totalCliquesWhatsapp: 5,
    totalCliquesLigacao: 0,
    taxaConversaoMicrofluxoPercentual: 57.9,
    taxaConversaoContatoPercentual: 10,
    metricasPorCanal: [],
    metricasPorMicrofluxo: [],
    metricasPorQrCode: [],
    metricasPorCartao: [],
    metricasPorProfissional: [],
    historicoDiario: [],
    metricasCRO,
  };

  it("renderiza os 4 cards principais com tipografia sóbria e valores corretos", () => {
    render(
      <GradeIndicadoresCRO
        resumoMetricas={resumoMetricasMock}
        historicoCronologico={[]}
        diaSelecionado={null}
        mesSelecionado="todos"
      />,
    );

    // Títulos dos cards
    expect(screen.getByText("Audiência & Exposições")).toBeInTheDocument();
    expect(screen.getByText("Interação · CTR")).toBeInTheDocument();
    expect(screen.getByText("Captação · CVR")).toBeInTheDocument();
    expect(screen.getByText("Fechamento Comercial")).toBeInTheDocument();

    // Valores
    expect(screen.getByText("1.000")).toBeInTheDocument();
    expect(screen.getByText("15%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("8%")).toBeInTheDocument();
  });
});

