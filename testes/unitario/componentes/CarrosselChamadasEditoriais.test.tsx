import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CarrosselChamadasEditoriais } from "@/componentes/editorial/CarrosselChamadasEditoriais";
import { CHAMADAS_EDITORIAIS_GARAGE88 } from "../../fixtures/chamadasEditoriaisGarage88";

function renderizarCarrossel() {
  return render(
    <CarrosselChamadasEditoriais
      conjunto={CHAMADAS_EDITORIAIS_GARAGE88}
      tipografiaId="contemporaneo_minimalista"
    />,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Carrossel de chamadas editoriais", () => {
  it("mantém apresentação simples quando há somente uma chamada", () => {
    render(
      <CarrosselChamadasEditoriais
        conjunto={{ chamadaEditorial: CHAMADAS_EDITORIAIS_GARAGE88.chamadaEditorial }}
        tipografiaId="classico_editorial"
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Taxas a partir de 1,19%");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("navega pelos três textos e retorna ao início com um único título acessível", () => {
    renderizarCarrossel();
    fireEvent.click(screen.getByRole("button", { name: /Exibir chamada 2/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mais de R$ 150 mil");
    expect(screen.getByText(/Taxas a partir de 1,31%/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Exibir chamada 3/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("cotar seu seguro conosco");
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Exibir chamada 1/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Taxas a partir de 1,19%");
    fireEvent.keyDown(screen.getByRole("region", { name: "Chamadas editoriais" }), {
      key: "ArrowLeft",
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("cotar seu seguro conosco");
  });

  it("exibe somente três pontos sem números ou controles extras", () => {
    renderizarCarrossel();
    const botoes = screen.getAllByRole("button");
    expect(botoes).toHaveLength(3);
    expect(botoes.every((botao) => botao.textContent === "")).toBe(true);
  });

  it("avança sozinho a cada oito segundos e retorna ao início sem depender das animações", () => {
    vi.useFakeTimers();
    renderizarCarrossel();
    act(() => vi.advanceTimersByTime(7_999));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Taxas a partir de 1,19%");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mais de R$ 150 mil");
    act(() => vi.advanceTimersByTime(8_000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("cotar seu seguro conosco");
    act(() => vi.advanceTimersByTime(8_000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Taxas a partir de 1,19%");
  });

  it("continua o autoplay com o cursor sobre o texto e foco nos pontos", () => {
    vi.useFakeTimers();
    renderizarCarrossel();
    fireEvent.mouseEnter(screen.getByRole("region", { name: "Chamadas editoriais" }));
    act(() => screen.getByRole("button", { name: /Exibir chamada 1/ }).focus());
    act(() => vi.advanceTimersByTime(8_000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mais de R$ 150 mil");
  });

  it("reinicia a contagem ao clicar num ponto e continua avançando automaticamente", () => {
    vi.useFakeTimers();
    renderizarCarrossel();
    act(() => vi.advanceTimersByTime(7_000));
    fireEvent.click(screen.getByRole("button", { name: /Exibir chamada 3/ }));
    act(() => vi.advanceTimersByTime(7_999));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("cotar seu seguro conosco");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Taxas a partir de 1,19%");
  });

  it("pausa com a aba oculta e reinicia o autoplay ao retornar", () => {
    vi.useFakeTimers();
    const consultarAbaOculta = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    renderizarCarrossel();
    act(() => vi.advanceTimersByTime(4_000));
    consultarAbaOculta.mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    act(() => vi.advanceTimersByTime(24_000));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Taxas a partir de 1,19%");
    consultarAbaOculta.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    act(() => vi.advanceTimersByTime(7_999));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Taxas a partir de 1,19%");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mais de R$ 150 mil");
  });
});
