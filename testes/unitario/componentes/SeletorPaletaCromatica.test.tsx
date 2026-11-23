import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import { SeletorPaletaCromatica } from "@/componentes/painel/editor/secoes/SeletorPaletaCromatica";
import {
  criarRascunhoConfiguracaoPaginaPadrao,
  type RascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import type { EstadoEditorAparencia } from "@/estados/estadoEditorAparencia";

function HarnessSeletorPaleta() {
  const [rascunho, definirRascunho] = useState<RascunhoConfiguracaoPagina>(() =>
    criarRascunhoConfiguracaoPaginaPadrao({
      organizacaoId: "org-teste",
      nomeOrganizacao: "Marca Teste",
    }),
  );

  const alterarEstiloVisual: EstadoEditorAparencia["alterarEstiloVisual"] = (parcial) => {
    definirRascunho((atual) => {
      let proximosTokens = atual.customizacaoTokens;
      if (parcial.customizacaoTokens !== undefined) {
        if (parcial.customizacaoTokens === null) {
          proximosTokens = undefined;
        } else {
          const combinado = { ...(atual.customizacaoTokens ?? {}), ...parcial.customizacaoTokens };
          const limpo = Object.fromEntries(
            Object.entries(combinado).filter(
              ([, valor]) => typeof valor === "string" && valor.length > 0,
            ),
          );
          proximosTokens = Object.keys(limpo).length > 0 ? limpo : undefined;
        }
      }

      return {
        ...atual,
        ...(parcial.paletaId ? { paletaId: parcial.paletaId } : {}),
        customizacaoTokens: proximosTokens,
      };
    });
  };

  return (
    <div>
      <SeletorPaletaCromatica rascunho={rascunho} alterarEstiloVisual={alterarEstiloVisual} />
      <pre data-testid="tokens-json">{JSON.stringify(rascunho.customizacaoTokens ?? null)}</pre>
    </div>
  );
}

describe("SeletorPaletaCromatica (agrupado por tipo)", () => {
  it("exibe os 5 grupos de cores, altera logo/equipe/bottom sheet e restaura grupo e padrão", () => {
    render(<HarnessSeletorPaleta />);

    fireEvent.click(screen.getByText("Personalizar cores dos elementos"));

    expect(screen.getByRole("region", { name: "Identidade & Logo" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Base & Textos da Vitrine" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Botões & Ações" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Equipe" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Bottom Sheets (Gavetas e Modais)" }),
    ).toBeInTheDocument();

    // Logo separado
    fireEvent.change(screen.getByLabelText("Código da cor: Título da Logo"), {
      target: { value: "#112233" },
    });
    fireEvent.change(screen.getByLabelText("Código da cor: Subtítulo da Logo"), {
      target: { value: "#445566" },
    });

    // Equipe fundo fixo + texto
    const grupoEquipe = screen.getByRole("region", { name: "Equipe" });
    fireEvent.click(within(grupoEquipe).getByRole("button", { name: "Fundo fixo" }));
    fireEvent.change(screen.getByLabelText("Código da cor: Título da Equipe"), {
      target: { value: "#0f172a" },
    });

    // Bottom sheet independente
    fireEvent.change(screen.getByLabelText("Código da cor: Fundo do Bottom Sheet"), {
      target: { value: "#ffffff" },
    });
    fireEvent.change(screen.getByLabelText("Código da cor: Textos Principais do Bottom Sheet"), {
      target: { value: "#111111" },
    });

    expect(JSON.parse(screen.getByTestId("tokens-json").textContent ?? "null")).toEqual({
      corLogoTitulo: "#112233",
      corLogoSubtitulo: "#445566",
      modoFundoEquipe: "fixo",
      corEquipeTextoPrincipal: "#0f172a",
      corBottomSheetFundo: "#ffffff",
      corBottomSheetTextoPrincipal: "#111111",
    });

    // Restaurar apenas o grupo Equipe
    fireEvent.click(within(grupoEquipe).getByRole("button", { name: "Restaurar grupo" }));
    expect(JSON.parse(screen.getByTestId("tokens-json").textContent ?? "null")).toEqual({
      corLogoTitulo: "#112233",
      corLogoSubtitulo: "#445566",
      corBottomSheetFundo: "#ffffff",
      corBottomSheetTextoPrincipal: "#111111",
    });

    // Restaurar tudo
    fireEvent.click(screen.getByRole("button", { name: "Restaurar padrão" }));
    expect(JSON.parse(screen.getByTestId("tokens-json").textContent ?? "null")).toBeNull();
  });
});

