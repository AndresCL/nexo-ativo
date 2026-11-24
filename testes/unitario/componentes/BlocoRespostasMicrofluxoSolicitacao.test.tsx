import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  BlocoRespostasMicrofluxoSolicitacao,
  dividirOpcoesResposta,
  formatarResumoRespostasParaCopia,
} from "@/componentes/painel/solicitacoes/BlocoRespostasMicrofluxoSolicitacao";

describe("BlocoRespostasMicrofluxoSolicitacao", () => {
  it("renderiza etapas numeradas, chips para múltiplas opções, observação complementar e copia o resumo", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const respostas = [
      {
        etapaId: "etapa-1",
        pergunta: "Com quem você planeja vir a Cabo Frio?",
        respostaTexto: "Viagem a dois / Casal",
      },
      {
        etapaId: "etapa-2",
        pergunta: "O que é mais importante na sua acomodação?",
        respostaTexto: "Piscina ao ar livre · Café da manhã caprichado",
      },
      {
        etapaId: "etapa-3",
        pergunta: "Como prefere receber o retorno?",
        respostaTexto: "Ligação",
      },
    ];

    render(
      <BlocoRespostasMicrofluxoSolicitacao
        respostas={respostas}
        mensagemAdicional="Chegamos sexta à noite."
      />,
    );

    expect(screen.getByText("3 etapas")).toBeInTheDocument();
    expect(screen.getByText("Viagem a dois / Casal")).toBeInTheDocument();
    expect(screen.getByText("Piscina ao ar livre")).toBeInTheDocument();
    expect(screen.getByText("Café da manhã caprichado")).toBeInTheDocument();
    expect(screen.getByText("Ligação")).toBeInTheDocument();
    expect(screen.getByText("Chegamos sexta à noite.")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Copiar resumo das respostas do visitante" }),
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        formatarResumoRespostasParaCopia(respostas, "Chegamos sexta à noite."),
      );
      expect(screen.getByText("Copiado")).toBeInTheDocument();
    });
  });

  it("divide múltiplas opções separadas por ponto médio preservando resposta única intacta", () => {
    expect(dividirOpcoesResposta("Piscina · Café da manhã")).toEqual([
      "Piscina",
      "Café da manhã",
    ]);
    expect(dividirOpcoesResposta("Viagem a dois / Casal")).toEqual(["Viagem a dois / Casal"]);
  });
});

