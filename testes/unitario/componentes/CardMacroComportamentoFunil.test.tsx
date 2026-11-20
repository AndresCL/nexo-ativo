import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardMacroComportamentoFunil } from "@/componentes/painel/desempenho/funil/CardMacroComportamentoFunil";

describe("CardMacroComportamentoFunil", () => {
  it("renderiza os 3 níveis do funil e as métricas tabulares com formatação brasileira", () => {
    render(
      <CardMacroComportamentoFunil
        visitas={196}
        caminhosIniciados={43}
        solicitacoesConcluidas={5}
      />,
    );

    // Rótulos padrão da imagem
    expect(screen.getByText("Visitas")).toBeInTheDocument();
    expect(screen.getByText("Caminhos iniciados")).toBeInTheDocument();
    expect(screen.getByText("Solicitações concluídas")).toBeInTheDocument();

    // Valores presentes tanto no funil gráfico quanto na lista tabular
    const valoresVisitas = screen.getAllByText("196");
    expect(valoresVisitas.length).toBeGreaterThanOrEqual(2);

    const valoresCaminhos = screen.getAllByText("43");
    expect(valoresCaminhos.length).toBeGreaterThanOrEqual(2);

    const valoresConclusoes = screen.getAllByText("5");
    expect(valoresConclusoes.length).toBeGreaterThanOrEqual(2);
  });

  it("formata milhares corretamente segundo padrão pt-BR", () => {
    render(
      <CardMacroComportamentoFunil
        visitas={12500}
        caminhosIniciados={3400}
        solicitacoesConcluidas={820}
      />,
    );

    const formatadoVisitas = screen.getAllByText("12.500");
    expect(formatadoVisitas.length).toBeGreaterThanOrEqual(2);

    const formatadoCaminhos = screen.getAllByText("3.400");
    expect(formatadoCaminhos.length).toBeGreaterThanOrEqual(2);
  });

  it("renderiza título, subtexto e ações superiores quando fornecidos", () => {
    render(
      <CardMacroComportamentoFunil
        visitas={100}
        caminhosIniciados={20}
        solicitacoesConcluidas={4}
        titulo="Comportamento do Percurso"
        subtexto="Conversão consolidada da vitrine"
        acaoSuperior={<button type="button">Filtrar</button>}
      />,
    );

    expect(screen.getByText("Comportamento do Percurso")).toBeInTheDocument();
    expect(screen.getByText("Conversão consolidada da vitrine")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtrar" })).toBeInTheDocument();
  });

  it("trata valores zerados ou nulos com segurança", () => {
    render(
      <CardMacroComportamentoFunil
        visitas={0}
        caminhosIniciados={0}
        solicitacoesConcluidas={0}
      />,
    );

    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });
});

