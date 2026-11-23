import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BarraRedesSociaisDiscreta } from "@/componentes/editorial/BarraRedesSociaisDiscreta";
import { RenderizadorComposicaoEditorial } from "@/componentes/editorial/RenderizadorComposicaoEditorial";
import type { TipoComposicaoEditorial } from "@/dominio/entidades/composicaoEditorial";
import {
  converterRascunhoParaConteudoPublicado,
  hidratarRascunhoConfiguracaoPagina,
} from "@/dominio/entidades/rascunhoConfiguracaoPagina";
import { obterIdBlocoExperiencia } from "@/dominio/editorial/ordemBlocosVitrine";
import { esquemaConteudoPaginaPublicada } from "@/validacoes/esquemaPaginaPublicada";
import { esquemaRascunhoConfiguracaoPagina } from "@/validacoes/esquemaRascunhoPagina";
import { CATALOGO_DEMONSTRACOES_EDITORIAIS } from "../../fixtures/dadosExemploVitrine";

vi.mock("@/ganchos/usarPreferenciaMovimentoReduzido", () => ({
  usePreferenciaMovimentoReduzido: () => true,
}));

function estaAntesNoDom(primeiro: Element, segundo: Element): boolean {
  return Boolean(primeiro.compareDocumentPosition(segundo) & Node.DOCUMENT_POSITION_FOLLOWING);
}

describe("Ordem unificada de blocos e tamanho das redes sociais na vitrine", () => {
  const base = CATALOGO_DEMONSTRACOES_EDITORIAIS["garage-88"]!;
  const composicoes: readonly TipoComposicaoEditorial[] = [
    "imersivo",
    "retrato_editorial",
    "galeria_editorial",
  ];

  it("aplica corretamente as 3 escalas de tamanho (pequeno, medio e grande)", () => {
    const redes = [{ id: "r1", rede: "instagram" as const, url: "https://instagram.com/teste" }];

    const { rerender, container } = render(
      <BarraRedesSociaisDiscreta redes={redes} tamanho="pequeno" />,
    );
    expect(screen.getByRole("list", { name: /Redes sociais/i })).toHaveAttribute(
      "data-tamanho-redes",
      "pequeno",
    );
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("h-4.5 w-4.5");

    rerender(<BarraRedesSociaisDiscreta redes={redes} tamanho="medio" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("h-6 w-6");

    rerender(<BarraRedesSociaisDiscreta redes={redes} tamanho="grande" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("h-8 w-8");
  });

  it.each(composicoes)(
    "respeita livremente a ordem unificada (redes -> marca -> avaliações -> experiências) em %s",
    (composicaoVisual) => {
      const idPrimeiraAcao = obterIdBlocoExperiencia(base.acoesPrincipais[0]!.id);
      render(
        <RenderizadorComposicaoEditorial
          pagina={{
            ...base,
            composicaoVisual,
            tamanhoRedesSociais: "grande",
            identidade: {
              ...base.identidade,
              posicaoCabecalho: "acima_experiencias",
            },
            avaliacoesGoogle: {
              habilitado: true,
              identificadorLocal: "ChIJ_teste",
              modoExibicao: "resumo",
            },
            ordemBlocosVitrine: [
              "bloco:redes_sociais",
              "bloco:marca",
              "bloco:avaliacoes_google",
              idPrimeiraAcao,
            ],
          }}
          complementoChamada={<p>Avaliações Google Unificadas</p>}
        />,
      );

      const listaRedes = screen.getByRole("list", { name: /Redes sociais/i });
      const blocoMarca = document.querySelector('[data-bloco-vitrine="bloco:marca"]')!;
      const avaliacoes = screen.getByText("Avaliações Google Unificadas");
      const primeiraAcao = document.querySelector(`[data-bloco-vitrine="${idPrimeiraAcao}"]`)!;

      expect(listaRedes).toHaveAttribute("data-tamanho-redes", "grande");
      expect(estaAntesNoDom(listaRedes, blocoMarca)).toBe(true);
      expect(estaAntesNoDom(blocoMarca, avaliacoes)).toBe(true);
      expect(estaAntesNoDom(avaliacoes, primeiraAcao)).toBe(true);
    },
  );

  it("permite ocultar blocos do sistema via blocosSistemaOcultos mantendo a marca fixa no topo quando configurada", () => {
    render(
      <RenderizadorComposicaoEditorial
        pagina={{
          ...base,
          composicaoVisual: "imersivo",
          identidade: {
            ...base.identidade,
            posicaoCabecalho: "topo",
          },
          blocosSistemaOcultos: ["bloco:redes_sociais"],
        }}
      />,
    );

    expect(document.querySelector('[data-variante-cabecalho="faixa_topo"]')).not.toBeNull();
    expect(screen.queryByRole("list", { name: /Redes sociais/i })).toBeNull();
  });

  it("hidrata, valida e projeta ordemBlocosVitrine, blocosSistemaOcultos e tamanhoRedesSociais", () => {
    const rascunho = hidratarRascunhoConfiguracaoPagina(
      {
        tamanhoRedesSociais: "medio",
        ordemBlocosVitrine: ["bloco:redes_sociais", "bloco:marca", "exp:fluxo-1"],
        blocosSistemaOcultos: ["bloco:redes_sociais"],
      },
      { organizacaoId: "org-1", nomeOrganizacao: "Clínica Serena" },
    );

    expect(rascunho.tamanhoRedesSociais).toBe("medio");
    expect(rascunho.ordemBlocosVitrine).toEqual([
      "bloco:redes_sociais",
      "bloco:marca",
      "exp:fluxo-1",
    ]);
    expect(rascunho.blocosSistemaOcultos).toEqual(["bloco:redes_sociais"]);
    expect(esquemaRascunhoConfiguracaoPagina.safeParse(rascunho).success).toBe(true);

    const publicada = converterRascunhoParaConteudoPublicado(rascunho, {
      identificadorPublico: "clinica-serena",
      versaoPublicada: 1,
    });
    expect(publicada.ordemBlocosVitrine).toEqual(rascunho.ordemBlocosVitrine);
    expect(publicada.blocosSistemaOcultos).toEqual(rascunho.blocosSistemaOcultos);
    expect(esquemaConteudoPaginaPublicada.safeParse(publicada).success).toBe(true);
  });
});
