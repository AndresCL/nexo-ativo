import { describe, expect, it } from "vitest";
import type { ItemAcaoHome } from "@/dominio/entidades/paginaPublicada";
import {
  agruparBlocosEmLinhasVitrine,
  podeUsarLarguraMetade,
  resolverLarguraCardVitrine,
} from "@/dominio/editorial/agrupamentoGridVitrine";

function criarAcao(parcial?: Partial<ItemAcaoHome>): ItemAcaoHome {
  return {
    id: "acao-1",
    rotulo: "Ação teste",
    tipoDestino: "microfluxo",
    destino: "#fluxo-1",
    ...parcial,
  };
}

describe("agrupamentoGridVitrine", () => {
  it("usa 'inteiro' por padrão quando larguraCard não está definida", () => {
    expect(resolverLarguraCardVitrine(undefined)).toBe("inteiro");
    expect(resolverLarguraCardVitrine(null)).toBe("inteiro");
    expect(podeUsarLarguraMetade(criarAcao(), false)).toBe(false);
  });

  it("impede largura 'metade' para destaque primário e seções inline", () => {
    const acaoMetade = criarAcao({ larguraCard: "metade" });
    expect(podeUsarLarguraMetade(acaoMetade, true)).toBe(false);
    expect(podeUsarLarguraMetade(acaoMetade, false)).toBe(true);

    expect(
      podeUsarLarguraMetade(
        criarAcao({ tipoDestino: "secao_videos", larguraCard: "metade" }),
        false,
      ),
    ).toBe(false);

    expect(
      podeUsarLarguraMetade(
        criarAcao({ tipoDestino: "secao_equipe", larguraCard: "metade" }),
        false,
      ),
    ).toBe(false);

    expect(
      podeUsarLarguraMetade(
        criarAcao({
          tipoDestino: "secao_produtos",
          modoExibicaoColecao: "carrossel",
          larguraCard: "metade",
        }),
        false,
      ),
    ).toBe(false);
  });

  it("agrupa pares consecutivos em 2×1 e promove órfãos para linha inteira", () => {
    const metade = new Set(["exp:a", "exp:b", "exp:c", "exp:d"]);
    const linhas = agruparBlocosEmLinhasVitrine(
      ["bloco:marca", "exp:hero", "exp:a", "exp:b", "exp:c", "exp:whats", "exp:d"],
      (id) => metade.has(id),
    );

    expect(linhas).toEqual([
      { tipo: "inteira", idBloco: "bloco:marca" },
      { tipo: "inteira", idBloco: "exp:hero" },
      { tipo: "par", idsBlocos: ["exp:a", "exp:b"] },
      { tipo: "inteira", idBloco: "exp:c" },
      { tipo: "inteira", idBloco: "exp:whats" },
      { tipo: "inteira", idBloco: "exp:d" },
    ]);
  });
});

