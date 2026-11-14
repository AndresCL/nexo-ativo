import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS,
  DURACAO_TROCA_EQUIPE_MS,
  INTERVALO_MOVIMENTO_EQUIPE_MS,
  useMovimentoEquipe,
} from "@/ganchos/usarMovimentoEquipe";
import { ContextoApresentacaoEquipe } from "@/ganchos/contextoApresentacaoEquipe";

let movimentoReduzido = false;
let paginaOculta = false;
let observadores: ObservadorTeste[] = [];

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => movimentoReduzido,
}));

class ObservadorTeste implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0.1];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];

  constructor(private readonly aoObservar: IntersectionObserverCallback) {
    observadores.push(this);
  }

  informarVisibilidade(visivel: boolean) {
    this.aoObservar([{ isIntersecting: visivel } as IntersectionObserverEntry], this);
  }
}

function Sonda({ quantidade = 20 }: { readonly quantidade?: number }) {
  const movimento = useMovimentoEquipe(quantidade);
  return (
    <span
      ref={movimento.referenciaGrupo}
      data-testid="movimento"
      data-ativo={movimento.movimentoAtivo}
      data-entrada={movimento.entradaIniciada}
      data-indice={movimento.indiceEmMovimento ?? ""}
    />
  );
}

function mostrarGrupo() {
  act(() => observadores[0]!.informarVisibilidade(true));
}

describe("Movimento decorativo da equipe", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    movimentoReduzido = false;
    paginaOculta = false;
    observadores = [];
    vi.spyOn(document, "hidden", "get").mockImplementation(() => paginaOculta);
    vi.stubGlobal("IntersectionObserver", ObservadorTeste);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("troca diretamente para o próximo avatar quando começa a descida, sem intervalo vazio", () => {
    render(<Sonda quantidade={4} />);
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-entrada", "false");
    mostrarGrupo();
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-entrada", "true");
    act(() => vi.advanceTimersByTime(ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS - 1));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "0");

    for (const seguinte of [1, 2, 3, 0]) {
      const atual = screen.getByTestId("movimento").getAttribute("data-indice");
      act(() => vi.advanceTimersByTime(INTERVALO_MOVIMENTO_EQUIPE_MS - 1));
      expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", atual);
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", `${seguinte}`);
    }
  });

  it("reinicia a sequência quando há somente um avatar", () => {
    render(<Sonda quantidade={1} />);
    mostrarGrupo();
    act(() => vi.advanceTimersByTime(ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "0");
    act(() => vi.advanceTimersByTime(INTERVALO_MOVIMENTO_EQUIPE_MS));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "");
    act(() => vi.advanceTimersByTime(DURACAO_TROCA_EQUIPE_MS));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "0");
  });

  it("espera a tela de carregamento sair antes de iniciar entrada e temporizadores", () => {
    const { rerender } = render(
      <ContextoApresentacaoEquipe.Provider value={false}>
        <Sonda />
      </ContextoApresentacaoEquipe.Provider>,
    );
    mostrarGrupo();
    act(() => vi.advanceTimersByTime(4_000));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-entrada", "false");
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "");
    expect(vi.getTimerCount()).toBe(0);
    rerender(
      <ContextoApresentacaoEquipe.Provider value={true}>
        <Sonda />
      </ContextoApresentacaoEquipe.Provider>,
    );
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-entrada", "true");
    act(() => vi.advanceTimersByTime(ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "0");
  });

  it("cancela o movimento e os temporizadores com a aba oculta e espera ao retornar", () => {
    render(<Sonda quantidade={1} />);
    mostrarGrupo();
    act(() => vi.advanceTimersByTime(ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "0");
    act(() => {
      paginaOculta = true;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-ativo", "false");
    act(() => {
      paginaOculta = false;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "");
    act(() => vi.advanceTimersByTime(ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "0");
  });

  it("pausa fora da tela e limpa o observador e os temporizadores ao desmontar", () => {
    const { unmount } = render(<Sonda />);
    mostrarGrupo();
    act(() => vi.advanceTimersByTime(ATRASO_PRIMEIRO_MOVIMENTO_EQUIPE_MS));
    act(() => observadores[0]!.informarVisibilidade(false));
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-indice", "");
    expect(vi.getTimerCount()).toBe(0);
    mostrarGrupo();
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-entrada", "true");
    unmount();
    expect(observadores[0]!.disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("respeita movimento reduzido e sua alteração durante a visita", () => {
    movimentoReduzido = true;
    const { rerender } = render(<Sonda />);
    mostrarGrupo();
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-ativo", "false");
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-entrada", "false");
    expect(vi.getTimerCount()).toBe(0);
    movimentoReduzido = false;
    rerender(<Sonda />);
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-ativo", "true");
    expect(vi.getTimerCount()).toBe(1);
    movimentoReduzido = true;
    rerender(<Sonda />);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("mantém o grupo utilizável sem agendar animação quando não há observador", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Sonda />);
    expect(screen.getByTestId("movimento")).toHaveAttribute("data-ativo", "false");
    expect(vi.getTimerCount()).toBe(0);
  });
});
