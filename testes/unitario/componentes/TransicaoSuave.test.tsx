import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransicaoEditorial } from "@/componentes/interface/TransicaoEditorial";
import { TransicaoAlternancia } from "@/componentes/interface/TransicaoAlternancia";
import { TransicaoColapsavel } from "@/componentes/interface/TransicaoColapsavel";
import { TransicaoPaginaPainel } from "@/componentes/interface/TransicaoPaginaPainel";
import {
  CURVA_EDITORIAL,
  CURVA_SUAVE,
  DURACOES_SEGUNDOS,
  DURACOES_MS,
} from "@/componentes/interface/constantesAnimacao";

let simularMovimentoReduzido = false;

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => simularMovimentoReduzido,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/painel/solicitacoes",
}));

describe("Constantes e Primitivas de Transição Suave (SOLID)", () => {
  it("deve fornecer constantes de animação e curvas editoriais consistentes", () => {
    expect(CURVA_EDITORIAL).toEqual([0.22, 1, 0.36, 1]);
    expect(CURVA_SUAVE).toEqual([0.25, 0.1, 0.25, 1]);
    expect(DURACOES_SEGUNDOS.transicaoEtapa).toBe(0.32);
    expect(DURACOES_MS.transicaoEtapa).toBe(320);
    expect(DURACOES_SEGUNDOS.colapsavel).toBe(0.3);
  });

  it("TransicaoEditorial deve renderizar os filhos corretamente", () => {
    render(
      <TransicaoEditorial className="teste-classe">
        <h1>Título Editorial Suave</h1>
      </TransicaoEditorial>,
    );

    expect(screen.getByRole("heading", { name: "Título Editorial Suave" })).toBeInTheDocument();
  });

  it("TransicaoAlternancia deve renderizar o conteúdo referenciado pela chaveId", () => {
    const { rerender } = render(
      <TransicaoAlternancia chaveId="passo-1">
        <div>Conteúdo Passo 1</div>
      </TransicaoAlternancia>,
    );

    expect(screen.getByText("Conteúdo Passo 1")).toBeInTheDocument();

    rerender(
      <TransicaoAlternancia chaveId="passo-2">
        <div>Conteúdo Passo 2</div>
      </TransicaoAlternancia>,
    );

    expect(screen.getByText("Conteúdo Passo 2")).toBeInTheDocument();
  });

  it("TransicaoColapsavel deve renderizar filhos apenas quando aberto for verdadeiro", () => {
    simularMovimentoReduzido = true;

    const { rerender } = render(
      <TransicaoColapsavel aberto={true}>
        <div data-testid="conteudo-colapsavel">Configuração Aberta</div>
      </TransicaoColapsavel>,
    );

    expect(screen.getByTestId("conteudo-colapsavel")).toBeInTheDocument();

    rerender(
      <TransicaoColapsavel aberto={false}>
        <div data-testid="conteudo-colapsavel">Configuração Aberta</div>
      </TransicaoColapsavel>,
    );

    expect(screen.queryByTestId("conteudo-colapsavel")).not.toBeInTheDocument();
  });

  it("TransicaoPaginaPainel deve renderizar o conteúdo da rota atual", () => {
    render(
      <TransicaoPaginaPainel className="p-4">
        <main>Visão Geral do Painel</main>
      </TransicaoPaginaPainel>,
    );

    expect(screen.getByText("Visão Geral do Painel")).toBeInTheDocument();
  });
});
