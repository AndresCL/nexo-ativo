import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AlternadorPreviaDispositivo } from "@/componentes/editorial/AlternadorPreviaDispositivo";
import { CamadaMidiaImersiva } from "@/componentes/editorial/CamadaMidiaImersiva";
import { RenderizadorComposicaoEditorial } from "@/componentes/editorial/RenderizadorComposicaoEditorial";
import type { TipoComposicaoEditorial } from "@/dominio/entidades/composicaoEditorial";
import { CATALOGO_DEMONSTRACOES_EDITORIAIS } from "../../fixtures/dadosExemploVitrine";

let simularMovimentoReduzido = false;

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => simularMovimentoReduzido,
}));

describe("Composições Editoriais Públicas (Imersivo, Retrato Editorial e Galeria Editorial)", () => {
  beforeEach(() => {
    simularMovimentoReduzido = false;
  });

  it("deve renderizar os mesmos dados nas três composições sem perda de informações (LSP)", () => {
    const base = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const composicoes: readonly TipoComposicaoEditorial[] = [
      "imersivo",
      "retrato_editorial",
      "galeria_editorial",
    ];

    for (const composicao of composicoes) {
      const { unmount, container } = render(
        <RenderizadorComposicaoEditorial pagina={{ ...base, composicaoVisual: composicao }} />,
      );

      expect(container.querySelector(`[data-composicao="${composicao}"]`)).not.toBeNull();
      expect(screen.getByText("Garage 88")).toBeInTheDocument();
      expect(screen.getByAltText("Marca de Garage 88")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          name: /Taxas a partir de 1,19%/i,
        }),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Simular financiamento/i })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Exibir chamada 2: Black November/ }));
      expect(screen.getByRole("heading", { name: /Mais de R\$ 150 mil/ })).toBeInTheDocument();

      const navegacaoAcoes = screen.getByTestId("navegacao-acoes-home");
      expect(navegacaoAcoes.className).toContain("mx-auto");
      expect(navegacaoAcoes.className).toContain("items-center");
      expect(navegacaoAcoes.className).toContain("@5xl:ml-auto");

      unmount();
    }
  });

  it("deve permitir navegar entre obras numeradas na Galeria Editorial", () => {
    const paginaGaleria = CATALOGO_DEMONSTRACOES_EDITORIAIS["lumina-arquitetura-luz"]!;
    render(<RenderizadorComposicaoEditorial pagina={paginaGaleria} />);

    expect(screen.getByText(/01 \/ 03 — Living Integrado Casa Jardins/i)).toBeInTheDocument();

    const botaoSegundaObra = screen.getByRole("button", {
      name: /02 · Cozinha Gourmet Linear 2700K/i,
    });
    fireEvent.click(botaoSegundaObra);

    expect(botaoSegundaObra).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/02 \/ 03 — Cozinha Gourmet Linear 2700K/i)).toBeInTheDocument();
  });

  it("deve substituir vídeo de fundo por imagem estática quando prefers-reduced-motion estiver ativo", () => {
    const midiaVideo = {
      tipo: "video" as const,
      urlPrincipal: "https://storage.googleapis.com/demo/video.mp4",
      urlPosterVideo: "/midias-demonstracao/imersivo-arquitetura-luz.svg",
      textoAlternativo: "Cena arquitetônica ao entardecer",
      pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
      intensidadeVeloEscuro: "equilibrado" as const,
    };

    const { rerender } = render(
      <CamadaMidiaImersiva midia={midiaVideo} paletaId="noite_mineral" />,
    );
    expect(screen.getByTestId("video-fundo-editorial")).toBeInTheDocument();

    simularMovimentoReduzido = true;
    rerender(<CamadaMidiaImersiva midia={midiaVideo} paletaId="noite_mineral" />);

    expect(screen.queryByTestId("video-fundo-editorial")).toBeNull();
    expect(screen.getByAltText("Cena arquitetônica ao entardecer")).toBeInTheDocument();
  });

  it("deve alternar entre visualização Desktop e Mobile e trocar composição na prévia interativa", () => {
    const paginaRetrato = CATALOGO_DEMONSTRACOES_EDITORIAIS["vasconcelos-advocacia-empresarial"]!;
    render(<AlternadorPreviaDispositivo paginaBase={paginaRetrato} permitirTrocarComposicao />);

    const quadroPrevia = screen.getByTestId("quadro-previa-dispositivo");
    expect(quadroPrevia).toHaveAttribute("data-dispositivo", "desktop");

    fireEvent.click(screen.getByRole("button", { name: /Mobile/i }));
    expect(quadroPrevia).toHaveAttribute("data-dispositivo", "mobile");

    expect(screen.queryByRole("button", { name: "Galeria Editorial" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Imersivo" }));
    expect(quadroPrevia.querySelector('[data-composicao="imersivo"]')).not.toBeNull();
  });

  it("deve renderizar efeito visual de dots nas esquinas acima do vídeo quando ativado", () => {
    const midiaComDots = {
      tipo: "video" as const,
      urlPrincipal: "https://storage.googleapis.com/demo/video.mp4",
      urlPosterVideo: "/midias-demonstracao/imersivo-arquitetura-luz.svg",
      textoAlternativo: "Cena com textura nos cantos",
      pontoFocalDesktop: { xPercentual: 50, yPercentual: 50 },
      intensidadeVeloEscuro: "equilibrado" as const,
      efeitoCantos: "dots" as const,
    };

    const { rerender } = render(
      <CamadaMidiaImersiva midia={midiaComDots} paletaId="noite_mineral" />,
    );

    expect(screen.getByTestId("video-fundo-editorial")).toBeInTheDocument();
    expect(screen.getByTestId("efeito-cantos-dots")).toBeInTheDocument();

    rerender(
      <CamadaMidiaImersiva
        midia={{ ...midiaComDots, efeitoCantos: "nenhum" }}
        paletaId="noite_mineral"
      />,
    );
    expect(screen.queryByTestId("efeito-cantos-dots")).toBeNull();
  });

  it("deve renderizar botão CTA no Hero e disparar aoAcionarItem ao clicar", () => {
    const base = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
    const aoAcionarItem = vi.fn();
    const paginaComCta = {
      ...base,
      chamadaEditorial: {
        ...base.chamadaEditorial,
        rotuloCta: "Fazer Simulação",
        fluxoId: "fluxo-financiamento",
      },
    };

    render(
      <RenderizadorComposicaoEditorial
        pagina={paginaComCta}
        aoAcionarItem={aoAcionarItem}
      />,
    );

    const botaoCta = screen.getByTestId("hero-cta");
    expect(botaoCta).toBeInTheDocument();
    expect(botaoCta).toHaveTextContent("Fazer Simulação");

    fireEvent.click(botaoCta);
    expect(aoAcionarItem).toHaveBeenCalledWith(
      expect.objectContaining({
        rotulo: "Fazer Simulação",
        destino: "#fluxo-financiamento",
        tipoDestino: "microfluxo",
      }),
      expect.anything(),
    );
  });
});
