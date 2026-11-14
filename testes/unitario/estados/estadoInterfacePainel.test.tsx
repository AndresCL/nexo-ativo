import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ProvedorEstadoInterfacePainel,
  useEstadoInterfacePainel,
} from "@/estados/estadoInterfacePainel";

function ConsumidorModoPrevia({ sufixo }: { readonly sufixo: string }) {
  const modo = useEstadoInterfacePainel((estado) => estado.modoDispositivoPrevia);
  const alterarModo = useEstadoInterfacePainel((estado) => estado.alterarModoDispositivoPrevia);

  return (
    <div>
      <span data-testid={`modo-${sufixo}`}>{modo}</span>
      <button type="button" onClick={() => alterarModo("mobile")}>
        Alternar {sufixo}
      </button>
    </div>
  );
}

describe("ProvedorEstadoInterfacePainel (Isolamento SSR Zustand)", () => {
  it("deve manter instâncias de estado completamente isoladas entre árvores independentes", () => {
    render(
      <>
        <ProvedorEstadoInterfacePainel>
          <ConsumidorModoPrevia sufixo="arvore-a" />
        </ProvedorEstadoInterfacePainel>

        <ProvedorEstadoInterfacePainel>
          <ConsumidorModoPrevia sufixo="arvore-b" />
        </ProvedorEstadoInterfacePainel>
      </>,
    );

    expect(screen.getByTestId("modo-arvore-a")).toHaveTextContent("desktop");
    expect(screen.getByTestId("modo-arvore-b")).toHaveTextContent("desktop");

    fireEvent.click(screen.getByRole("button", { name: "Alternar arvore-a" }));

    expect(screen.getByTestId("modo-arvore-a")).toHaveTextContent("mobile");
    expect(screen.getByTestId("modo-arvore-b")).toHaveTextContent("desktop");
  });
});
