import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlocoAvaliacoesGoogle } from "@/componentes/editorial/avaliacoes/BlocoAvaliacoesGoogle";
import { RenderizadorComposicaoEditorial } from "@/componentes/editorial/RenderizadorComposicaoEditorial";
import type { PortaAvaliacoesGoogleCliente } from "@/aplicacao/portas/portasAvaliacoesGoogle";
import type { ResumoAvaliacoesGoogle } from "@/dominio/entidades/avaliacoesGoogle";
import {
  criarPaginaAvaliacoesGoogleTeste,
  RESUMO_AVALIACOES_GOOGLE_TESTE,
} from "../../fixtures/dadosAvaliacoesGoogleTeste";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => true,
}));

describe("Bloco público de avaliações do Google", () => {
  const pagina = criarPaginaAvaliacoesGoogleTeste();
  const consultar = vi.fn<PortaAvaliacoesGoogleCliente["consultar"]>();
  const servico: PortaAvaliacoesGoogleCliente = { pesquisar: vi.fn(), consultar };
  beforeEach(() => {
    consultar.mockReset().mockResolvedValue(RESUMO_AVALIACOES_GOOGLE_TESTE);
  });

  it("não faz consulta quando o recurso está desativado", () => {
    const { container } = render(
      <BlocoAvaliacoesGoogle
        pagina={{ ...pagina, avaliacoesGoogle: undefined }}
        servico={servico}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(consultar).not.toHaveBeenCalled();
  });

  it("consulta imediatamente na montagem sem aguardar IntersectionObserver", async () => {
    const observar = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = observar;
        disconnect() {}
      },
    );
    try {
      render(<BlocoAvaliacoesGoogle pagina={pagina} servico={servico} />);
      expect(consultar).toHaveBeenCalledTimes(1);
      expect(observar).not.toHaveBeenCalled();
      await screen.findByRole("button", { name: /128 avaliações no Google/ });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("exibe a nota geral e reutiliza a consulta ao abrir a leitura completa", async () => {
    render(<BlocoAvaliacoesGoogle pagina={pagina} servico={servico} />);
    const abrir = await screen.findByRole("button", { name: /128 avaliações no Google/ });
    expect(screen.getByLabelText("4,9 de 5 estrelas")).toBeInTheDocument();
    fireEvent.click(abrir);
    const painel = screen.getByRole("dialog", { name: "Avaliações no Google" });
    expect(
      within(painel).getByText(RESUMO_AVALIACOES_GOOGLE_TESTE.avaliacoes[0]!.texto),
    ).toBeInTheDocument();
    expect(within(painel).getByRole("link", { name: "Ver todas no Google" })).toHaveAttribute(
      "href",
      RESUMO_AVALIACOES_GOOGLE_TESTE.urlGoogleMaps,
    );
    fireEvent.click(within(painel).getByRole("button", { name: "Fechar painel" }));
    await waitFor(() => expect(abrir).toHaveFocus());
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(consultar).toHaveBeenCalledWith({
      tipo: "publicada",
      identificadorPublico: "clinica-serena",
    });
  });

  it("navega pelo carrossel com botões e teclado respeitando movimento reduzido", async () => {
    render(<BlocoAvaliacoesGoogle pagina={pagina} servico={servico} />);
    const faixa = await screen.findByLabelText("Depoimentos; use as setas para navegar");
    Object.defineProperty(faixa, "clientWidth", { configurable: true, value: 300 });
    const rolar = vi.fn();
    Object.defineProperty(faixa, "scrollTo", { value: rolar });
    expect(screen.getByRole("button", { name: "Avaliação anterior" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Próxima avaliação" }));
    expect(rolar).toHaveBeenLastCalledWith({ left: 300, behavior: "instant" });
    expect(screen.getByRole("button", { name: "Próxima avaliação" })).toBeDisabled();
    fireEvent.keyDown(faixa, { key: "ArrowLeft" });
    expect(rolar).toHaveBeenLastCalledWith({ left: 0, behavior: "instant" });
    expect(screen.getByRole("button", { name: "Avaliação anterior" })).toBeDisabled();
  });

  it("mantém somente o acesso ao Google em falhas e oculta locais sem avaliações", async () => {
    consultar.mockRejectedValueOnce(new Error("Google indisponível"));
    const { unmount } = render(<BlocoAvaliacoesGoogle pagina={pagina} servico={servico} />);
    expect(await screen.findByRole("link", { name: "Ver avaliações no Google" })).toHaveAttribute(
      "href",
      expect.stringContaining("ChIJ_serena"),
    );
    expect(screen.queryByText("Google indisponível")).not.toBeInTheDocument();
    unmount();
    consultar.mockResolvedValueOnce({
      ...RESUMO_AVALIACOES_GOOGLE_TESTE,
      totalAvaliacoes: 0,
      notaMedia: undefined,
      avaliacoes: [],
    });
    const { container } = render(<BlocoAvaliacoesGoogle pagina={pagina} servico={servico} />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("descarta respostas antigas quando o estabelecimento da prévia muda", async () => {
    let resolverAntiga!: (dados: ResumoAvaliacoesGoogle) => void;
    consultar.mockImplementationOnce(
      () =>
        new Promise((resolver) => {
          resolverAntiga = resolver;
        }),
    );
    const { rerender } = render(<BlocoAvaliacoesGoogle pagina={pagina} previa servico={servico} />);
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(1));
    const novaPagina = {
      ...pagina,
      avaliacoesGoogle: { ...pagina.avaliacoesGoogle!, identificadorLocal: "ChIJ_novo" },
    };
    consultar.mockResolvedValueOnce({
      ...RESUMO_AVALIACOES_GOOGLE_TESTE,
      identificadorLocal: "ChIJ_novo",
      totalAvaliacoes: 7,
    });
    rerender(<BlocoAvaliacoesGoogle pagina={novaPagina} previa servico={servico} />);
    await screen.findByRole("button", { name: /7 avaliações no Google/ });
    await act(async () => resolverAntiga(RESUMO_AVALIACOES_GOOGLE_TESTE));
    expect(screen.queryByRole("button", { name: /128 avaliações/ })).not.toBeInTheDocument();
    expect(consultar).toHaveBeenLastCalledWith({
      tipo: "previa",
      organizacaoId: "org-serena",
      identificadorLocal: "ChIJ_novo",
    });
  });

  it("não consulta novamente ao mudar apenas aparência ou formato", async () => {
    const { rerender } = render(<BlocoAvaliacoesGoogle pagina={pagina} previa servico={servico} />);
    await screen.findByRole("button", { name: /128 avaliações/ });
    rerender(
      <BlocoAvaliacoesGoogle
        pagina={{
          ...pagina,
          paletaId: "marfim_editorial",
          avaliacoesGoogle: { ...pagina.avaliacoesGoogle!, modoExibicao: "resumo" },
        }}
        previa
        servico={servico}
      />,
    );
    expect(screen.queryByLabelText("Carrossel de avaliações do Google")).not.toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(1);
  });

  it.each(["imersivo", "retrato_editorial", "galeria_editorial"] as const)(
    "insere o mesmo bloco abaixo do título na composição %s",
    (composicaoVisual) => {
      render(
        <RenderizadorComposicaoEditorial
          pagina={{ ...pagina, composicaoVisual }}
          complementoChamada={<p>Resumo das avaliações</p>}
        />,
      );
      const titulo = screen.getByRole("heading", { name: pagina.chamadaEditorial.tituloPrincipal });
      expect(
        titulo.compareDocumentPosition(screen.getByText("Resumo das avaliações")) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    },
  );
});
