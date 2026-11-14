import { act } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { usePreferenciaMovimentoReduzido } from "@/ganchos/usarPreferenciaMovimentoReduzido";

function ExemploPreferencia() {
  const reduzido = usePreferenciaMovimentoReduzido();
  return <p>{reduzido ? "Movimento reduzido" : "Movimento padrão"}</p>;
}

describe("Preferência de movimento reduzido e renderização no servidor", () => {
  it("hidrata sem divergência e acompanha mudanças de preferência", async () => {
    let prefereReduzido = true;
    let aoAlterar: (() => void) | undefined;
    const removerObservador = vi.fn();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: prefereReduzido,
        addEventListener: (_evento: string, observador: () => void) => {
          aoAlterar = observador;
        },
        removeEventListener: removerObservador,
      })),
    );
    const recipiente = document.createElement("div");
    recipiente.innerHTML = renderToString(<ExemploPreferencia />);
    expect(recipiente).toHaveTextContent("Movimento padrão");
    document.body.appendChild(recipiente);
    const aoFalharHidratacao = vi.fn();
    let raiz: Root | undefined;
    try {
      await act(async () => {
        raiz = hydrateRoot(recipiente, <ExemploPreferencia />, {
          onRecoverableError: aoFalharHidratacao,
        });
      });
      expect(aoFalharHidratacao).not.toHaveBeenCalled();
      expect(recipiente).toHaveTextContent("Movimento reduzido");
      await act(async () => {
        prefereReduzido = false;
        aoAlterar?.();
      });
      expect(recipiente).toHaveTextContent("Movimento padrão");
    } finally {
      await act(async () => raiz?.unmount());
      recipiente.remove();
      vi.unstubAllGlobals();
    }
    expect(removerObservador).toHaveBeenCalled();
  });
});
