import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Position } from "@xyflow/react";
import type * as ModuloFluxo from "@xyflow/react";
import { ConectorFluxoInterativo } from "@/componentes/painel/microfluxos/ConectorFluxoInterativo";

vi.mock("@xyflow/react", async (importOriginal) => {
  const mod = await importOriginal<typeof ModuloFluxo>();
  return {
    ...mod,
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="edge-label-renderer-container">{children}</div>
    ),
  };
});

describe("ConectorFluxoInterativo (Editor Visual de Microfluxos)", () => {
  it("deve renderizar o conector e disparar onExcluirConector ao clicar no botão de remoção", () => {
    const mockExcluir = vi.fn();

    render(
      <svg>
        <ConectorFluxoInterativo
          id="edge-1"
          source="etapa-1"
          target="etapa-2"
          sourceX={100}
          sourceY={100}
          targetX={200}
          targetY={200}
          sourcePosition={Position.Bottom}
          targetPosition={Position.Top}
          label="Opção A"
          data={{
            onExcluirConector: mockExcluir,
          }}
        />
      </svg>,
    );

    expect(screen.getByText("Opção A")).toBeInTheDocument();

    const botaoExcluir = screen.getByRole("button", { name: /Excluir conexão/i });
    expect(botaoExcluir).toBeInTheDocument();

    fireEvent.click(botaoExcluir);
    expect(mockExcluir).toHaveBeenCalledTimes(1);
  });
});
