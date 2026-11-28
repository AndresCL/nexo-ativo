import { describe, expect, it } from "vitest";
import {
  garantirSlugCardapioUnico,
  gerarSlugCardapio,
  ordenarCardapiosAtivos,
  resolverCardapioInicial,
  TAMANHO_MAXIMO_PDF_CARDAPIO_BYTES,
  validarArquivoPdfCardapio,
  validarLimiteCardapiosOrganizacao,
  type CardapioOrganizacao,
} from "@/dominio/entidades/cardapioDigital";
import { esquemaCardapioOrganizacao } from "@/validacoes/esquemasCardapioDigital";

function criarCardapioMock(parcial?: Partial<CardapioOrganizacao>): CardapioOrganizacao {
  return {
    id: "card-1",
    organizacaoId: "org-1",
    slug: "almoco",
    titulo: "Almoço",
    paginas: [{ url: "https://cdn.exemplo.com/p1.webp", largura: 1200, altura: 1600, ordem: 0 }],
    ordemExibicao: 0,
    ativo: true,
    atualizadoEmIso: "2026-11-27T08:00:00.000Z",
    ...parcial,
  };
}

describe("cardapioDigital", () => {
  it("gera slug URL-safe removendo acentos e símbolos", () => {
    expect(gerarSlugCardapio("Carta de Vinhos & Drinks!")).toBe("carta-de-vinhos-drinks");
    expect(gerarSlugCardapio("   ")).toBe("cardapio");
  });

  it("garante slug único incrementando sufixo quando já existe", () => {
    const existentes = [
      { id: "1", slug: "bebidas" },
      { id: "2", slug: "bebidas-2" },
    ];
    expect(garantirSlugCardapioUnico("bebidas", existentes)).toBe("bebidas-3");
    expect(garantirSlugCardapioUnico("bebidas", existentes, "1")).toBe("bebidas");
  });

  it("ordena apenas cardápios ativos com páginas e resolve o cardápio inicial por slug", () => {
    const lista = ordenarCardapiosAtivos([
      criarCardapioMock({ id: "2", slug: "bebidas", ordemExibicao: 2 }),
      criarCardapioMock({ id: "3", slug: "inativo", ativo: false, ordemExibicao: 0 }),
      criarCardapioMock({ id: "1", slug: "almoco", ordemExibicao: 1 }),
    ]);

    expect(lista.map((c) => c.slug)).toEqual(["almoco", "bebidas"]);
    expect(resolverCardapioInicial(lista, "bebidas")?.slug).toBe("bebidas");
    expect(resolverCardapioInicial(lista, "inexistente")?.slug).toBe("almoco");
  });

  it("valida limites de quantidade de cardápios e tamanho/tipo de PDF", () => {
    const oito = Array.from({ length: 8 }, (_, idx) => ({ id: `c-${idx}` }));
    expect(() => validarLimiteCardapiosOrganizacao(oito)).toThrow(/máximo 8/);
    expect(() => validarLimiteCardapiosOrganizacao(oito, "c-0")).not.toThrow();

    expect(() =>
      validarArquivoPdfCardapio({ type: "image/png", size: 1000, name: "foto.png" }),
    ).toThrow(/PDF válido/);
    expect(() =>
      validarArquivoPdfCardapio({
        type: "application/pdf",
        size: TAMANHO_MAXIMO_PDF_CARDAPIO_BYTES + 1,
        name: "grande.pdf",
      }),
    ).toThrow(/15 MB/);
  });

  it("valida o schema Zod de CardapioOrganizacao", () => {
    const valido = criarCardapioMock();
    expect(esquemaCardapioOrganizacao.parse(valido)).toEqual(valido);
    expect(() => esquemaCardapioOrganizacao.parse({ ...valido, paginas: [] })).toThrow();
  });
});
