import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SeletorEstabelecimentoGoogle } from "@/componentes/painel/editor/SeletorEstabelecimentoGoogle";
import { RESUMO_AVALIACOES_GOOGLE_TESTE } from "../../fixtures/dadosAvaliacoesGoogleTeste";
import type { PortaAvaliacoesGoogleCliente } from "@/aplicacao/portas/portasAvaliacoesGoogle";
import type { EstabelecimentoGoogle } from "@/dominio/entidades/avaliacoesGoogle";

describe("Busca de estabelecimento para avaliações", () => {
  it("busca por ação explícita e permite confirmar o endereço antes de selecionar", async () => {
    const pesquisar = vi.fn().mockResolvedValue([RESUMO_AVALIACOES_GOOGLE_TESTE]);
    const selecionar = vi.fn();
    render(
      <SeletorEstabelecimentoGoogle
        organizacaoId="org-serena"
        somenteLeitura={false}
        aoSelecionar={selecionar}
        servico={{ pesquisar, consultar: vi.fn() }}
      />,
    );
    fireEvent.change(screen.getByLabelText("Nome da empresa e cidade"), {
      target: { value: "Clínica Serena, São Paulo" },
    });
    expect(pesquisar).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Buscar empresa" }));
    await screen.findByText(RESUMO_AVALIACOES_GOOGLE_TESTE.endereco);
    expect(pesquisar).toHaveBeenCalledExactlyOnceWith("org-serena", "Clínica Serena, São Paulo");
    fireEvent.click(screen.getByRole("button", { name: "Selecionar Clínica Serena" }));
    expect(selecionar).toHaveBeenCalledWith(RESUMO_AVALIACOES_GOOGLE_TESTE);
  });

  it("ignora uma resposta antiga quando o texto da busca muda", async () => {
    let resolver!: (locais: readonly EstabelecimentoGoogle[]) => void;
    const pesquisar = vi.fn<PortaAvaliacoesGoogleCliente["pesquisar"]>().mockImplementation(
      () =>
        new Promise((retornar) => {
          resolver = retornar;
        }),
    );
    render(
      <SeletorEstabelecimentoGoogle
        organizacaoId="org-serena"
        somenteLeitura={false}
        aoSelecionar={vi.fn()}
        servico={{ pesquisar, consultar: vi.fn() }}
      />,
    );
    const campo = screen.getByLabelText("Nome da empresa e cidade");
    fireEvent.change(campo, { target: { value: "Clínica Serena" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar empresa" }));
    await waitFor(() => expect(pesquisar).toHaveBeenCalledTimes(1));
    fireEvent.change(campo, { target: { value: "Outra empresa" } });
    await act(async () => resolver([RESUMO_AVALIACOES_GOOGLE_TESTE]));
    expect(
      screen.queryByRole("button", { name: "Selecionar Clínica Serena" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buscar empresa" })).toBeEnabled();
  });

  it("respeita o modo somente leitura", () => {
    const pesquisar = vi.fn();
    render(
      <SeletorEstabelecimentoGoogle
        organizacaoId="org-serena"
        somenteLeitura
        aoSelecionar={vi.fn()}
        servico={{ pesquisar, consultar: vi.fn() }}
      />,
    );
    expect(screen.getByLabelText("Nome da empresa e cidade")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buscar empresa" })).toBeDisabled();
    expect(pesquisar).not.toHaveBeenCalled();
  });
});
