import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VitrinePublicaInterativa } from "@/componentes/editorial/VitrinePublicaInterativa";
import { CartaoDigitalProfissionalPublico } from "@/componentes/editorial/CartaoDigitalProfissionalPublico";
import { resolverAcoesVitrineComMicrofluxos } from "@/dominio/entidades/paginaPublicada";
import { esquemaDefinicaoMicrofluxo } from "@/validacoes/esquemasMicrofluxo";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import {
  CATALOGO_ACERVOS_DEMONSTRACAO,
  CATALOGO_DEMONSTRACOES_EDITORIAIS,
} from "../../fixtures/dadosExemploVitrine";
import { criarMicrofluxoPadraoParaTestes } from "../../fixtures/geradoresMicrofluxoTeste";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => true,
}));

const pagina = {
  ...CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!,
  midiaFundo: {
    ...CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!.midiaFundo,
    tipo: "imagem" as const,
  },
  acoesPrincipais: [
    {
      id: "portfolio-a",
      rotulo: "Ver projetos",
      rotuloCartaoOpcional: "Ver projetos",
      tipoDestino: "secao_portfolio" as const,
      destino: "#portfolio",
      tituloSecao: "Nossos projetos",
    },
    {
      id: "portfolio-b",
      rotulo: "Ver realizações",
      rotuloCartaoOpcional: "Ver realizações",
      tipoDestino: "secao_portfolio" as const,
      destino: "#portfolio",
      tituloSecao: "Trabalhos realizados",
    },
    {
      id: "portfolio-c",
      rotulo: "Portfólio padrão",
      rotuloCartaoOpcional: "Portfólio padrão",
      tipoDestino: "secao_portfolio" as const,
      destino: "#portfolio",
    },
  ],
};
const acervo = { ...CATALOGO_ACERVOS_DEMONSTRACAO["garage-88"]!, microfluxos: [] };

describe("Títulos personalizados das seções", () => {
  it.each(["vitrine", "cartao"])(
    "usa o título da ação acionada em %s e restaura o padrão quando está vazio",
    (origem) => {
      if (origem === "vitrine")
        render(<VitrinePublicaInterativa pagina={pagina} acervo={acervo} />);
      else
        render(
          <CartaoDigitalProfissionalPublico
            paginaOrganizacao={pagina}
            profissional={acervo.profissionais[0]!}
            acervo={acervo}
            urlPublicaCartao="https://fluxo.app/garage-88/equipe/bruno-silva"
          />,
        );
      for (const [botao, titulo] of [
        ["Ver projetos", "Nossos projetos"],
        ["Ver realizações", "Trabalhos realizados"],
        ["Portfólio padrão", "Portfólio & Realizações"],
      ]) {
        fireEvent.click(screen.getByRole("button", { name: botao }));
        expect(
          within(screen.getByRole("dialog")).getByRole("heading", { name: titulo }),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Fechar painel" }));
      }
    },
  );

  it("preserva o título na validação e projeção pública e permite limpar um título já publicado", () => {
    const base = criarMicrofluxoPadraoParaTestes({
      organizacaoId: "org-1",
      nomeOrganizacao: "Garage 88",
      modelo: "catalogo",
    });
    const fluxo = esquemaDefinicaoMicrofluxo.parse({
      ...base,
      tipoAcao: "secao_portfolio",
      tituloSecao: "  Projetos especiais  ",
      rotuloBotaoHome: "Explorar",
    });
    const acoes = resolverAcoesVitrineComMicrofluxos([], [fluxo]);
    expect(acoes[0]).toMatchObject({ rotulo: "Explorar", tituloSecao: "Projetos especiais" });
    const validada = esquemaConteudoPaginaPublicada.parse({ ...pagina, acoesPrincipais: acoes });
    expect(validada.acoesPrincipais[0]?.tituloSecao).toBe("Projetos especiais");
    expect(
      resolverAcoesVitrineComMicrofluxos(acoes, [{ ...fluxo, tituloSecao: "" }])[0]?.tituloSecao,
    ).toBeUndefined();
  });
});
