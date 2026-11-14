import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AcaoEquipeVitrine } from "@/componentes/editorial/AcaoEquipeVitrine";
import { AvatarProfissional } from "@/componentes/editorial/AvatarProfissional";
import { NavegacaoAcoesHome } from "@/componentes/editorial/NavegacaoAcoesHome";
import { criarPreviaEquipeVitrine } from "@/dominio/editorial/previaEquipeVitrine";
import { ACAO_EQUIPE_TESTE, criarEquipeTeste } from "../../fixtures/equipeVitrine";

describe("Convite da equipe", () => {
  it.each([
    { limite: undefined, exibidos: 5 },
    { limite: null, exibidos: 5 },
    { limite: 2, exibidos: 2 },
    { limite: 10, exibidos: 5 },
  ])("mostra $exibidos avatares com limite $limite", ({ limite, exibidos }) => {
    render(
      <AcaoEquipeVitrine
        acao={{ ...ACAO_EQUIPE_TESTE, limiteAvataresEquipe: limite }}
        previa={criarPreviaEquipeVitrine(criarEquipeTeste(5), "org-equipe")}
      />,
    );
    expect(screen.getAllByText("PS")).toHaveLength(exibidos);
    if (exibidos < 5) expect(screen.getByText(`+${5 - exibidos}`)).toBeInTheDocument();
    else expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument();
  });

  it("preserva título livre e subtítulo, conta os restantes e aciona uma única ação", () => {
    const aoAcionarItem = vi.fn();
    const acao = {
      ...ACAO_EQUIPE_TESTE,
      rotulo: "Entre em contato conosco",
      subtituloDiscreto: "Podemos ajudar você",
      limiteAvataresEquipe: 3,
    };
    render(
      <AcaoEquipeVitrine
        acao={acao}
        previa={criarPreviaEquipeVitrine(criarEquipeTeste(4), "org-equipe")}
        aoAcionarItem={aoAcionarItem}
      />,
    );
    const botao = screen.getByRole("button", { name: acao.rotulo });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(botao).toHaveAccessibleDescription(
      "Podemos ajudar você Ver os 4 integrantes da equipe.",
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("Podemos ajudar você")).toBeInTheDocument();
    fireEvent.click(screen.getByText("+1"));
    expect(aoAcionarItem).toHaveBeenCalledExactlyOnceWith(acao, botao);
  });

  it("oferece link por hash e não mostra contador para uma pessoa", () => {
    render(
      <AcaoEquipeVitrine
        acao={ACAO_EQUIPE_TESTE}
        previa={criarPreviaEquipeVitrine(criarEquipeTeste(1), "org-equipe")}
      />,
    );
    expect(screen.getByRole("link", { name: ACAO_EQUIPE_TESTE.rotulo })).toHaveAttribute(
      "href",
      "#equipe",
    );
    expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument();
    expect(screen.getByText("PS")).toBeInTheDocument();
  });

  it("usa iniciais quando a foto falha e tenta novamente quando a URL muda", () => {
    const { rerender } = render(
      <AvatarProfissional nome="Ana Silva" urlFoto="https://images.pexels.com/ana.jpg" />,
    );
    expect(screen.getByRole("img", { name: "Ana Silva" })).toHaveAttribute(
      "src",
      "https://images.pexels.com/ana.jpg",
    );
    expect(screen.getByRole("img", { name: "Ana Silva" })).not.toHaveAttribute("srcset");
    fireEvent.error(screen.getByRole("img", { name: "Ana Silva" }));
    expect(screen.getByText("AS")).toBeInTheDocument();
    rerender(<AvatarProfissional nome="Ana Silva" urlFoto="https://images.pexels.com/nova.jpg" />);
    expect(screen.getByRole("img", { name: "Ana Silva" })).toBeInTheDocument();
  });

  it("oculta equipe conhecida e vazia, mas mantém consumidores sem dados compatíveis", () => {
    const { rerender } = render(
      <NavegacaoAcoesHome
        acoes={[ACAO_EQUIPE_TESTE]}
        paletaId="noite_mineral"
        previaEquipe={{ total: 0, avatares: [] }}
      />,
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    rerender(<NavegacaoAcoesHome acoes={[ACAO_EQUIPE_TESTE]} paletaId="noite_mineral" />);
    expect(screen.getByRole("link", { name: ACAO_EQUIPE_TESTE.rotulo })).toBeInTheDocument();
  });
});
