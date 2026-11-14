import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GavetaEditorialPublica } from "@/componentes/editorial/GavetaEditorialPublica";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => true,
}));

function montar(semServicos = false) {
  const aoSolicitarExperiencia = vi.fn();
  const acervo = {
    ...CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!,
    servicos: semServicos
      ? []
      : [
          {
            id: "srv-1",
            organizacaoId: "org-1",
            nome: "Serviço exclusivo",
            categoria: "Estética",
            resumo: "Cuidados com a pintura",
            precoBaseCentavos: 50000,
            prazoOuDuracao: "2 dias",
            urlImagemOpcional: "https://images.pexels.com/servico.webp",
            ordemExibicao: 1,
            ativo: true,
            atualizadoEmIso: "2026-11-13",
          },
        ],
    produtos: [
      {
        id: "prod-1",
        organizacaoId: "org-1",
        nome: "Produto do catálogo",
        categoria: "Veículos",
        resumo: "Item que deve ficar fora dos serviços",
        disponibilidade: "disponivel" as const,
        especificacoesCurtas: [],
        ordemExibicao: 1,
        ativo: true,
        atualizadoEmIso: "2026-11-13",
      },
    ],
  };
  render(
    <GavetaEditorialPublica
      aberto
      aoAlterarAbertura={vi.fn()}
      secaoAberta="servicos"
      pagina={CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!}
      acervo={acervo}
      aoSolicitarExperiencia={aoSolicitarExperiencia}
      consultorPadraoId="prof-1"
    />,
  );
  return aoSolicitarExperiencia;
}

describe("Gaveta de serviços", () => {
  it("mostra somente serviços mesmo com produtos no acervo e preserva a solicitação contextual", () => {
    montar();
    const painel = screen.getByRole("dialog");
    expect(within(painel).getByRole("heading", { name: "Serviços" })).toBeInTheDocument();
    expect(within(painel).getByText("Serviço exclusivo")).toBeInTheDocument();
    expect(within(painel).getByRole("img", { name: "Serviço exclusivo" })).toHaveAttribute(
      "src",
      "https://images.pexels.com/servico.webp",
    );
    expect(within(painel).queryByText("Produto do catálogo")).not.toBeInTheDocument();
    expect(
      within(painel).queryByRole("region", { name: "Catálogo de itens" }),
    ).not.toBeInTheDocument();
    expect(
      within(painel).queryByText("Buscando outro modelo, ano ou marca?"),
    ).not.toBeInTheDocument();
  });

  it("mostra o estado vazio de serviços mesmo quando há produtos cadastrados", () => {
    montar(true);
    expect(
      screen.getByText("As informações detalhadas de serviços estão em atualização."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Produto do catálogo")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Solicitar este item" })).not.toBeInTheDocument();
  });
});
