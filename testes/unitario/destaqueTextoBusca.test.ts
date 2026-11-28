import { describe, expect, it } from "vitest";
import {
  gerarSugestoesCatalogo,
  segmentarTextoComDestaque,
} from "@/dominio/editorial/destaqueTextoBusca";
import type { ItemCatalogoFiltravel } from "@/dominio/editorial/filtroCatalogoAcervo";

const ITENS_EXEMPLO: readonly ItemCatalogoFiltravel[] = [
  {
    id: "1",
    nome: "Açaí Artesanal 500ml",
    categoria: "Sobremesas",
    resumo: "Servido com granola e banana",
    especificacoes: ["Sem açúcar", "Vegano"],
    precoCentavos: 2490,
    ordemOriginal: 0,
  },
  {
    id: "2",
    nome: "Café Especial Coado",
    categoria: "Bebidas Quentes",
    resumo: "Grãos selecionados de torra média",
    precoCentavos: 1200,
    ordemOriginal: 1,
  },
  {
    id: "3",
    nome: "Depilação a Laser Facial",
    categoria: "Estética",
    resumo: "Sessão rápida e confortável",
    prazoOuDuracao: "30 min",
    precoCentavos: 15000,
    ordemOriginal: 2,
  },
];

describe("segmentarTextoComDestaque", () => {
  it("destaca trecho ignorando acentos e cedilha preservando o texto original", () => {
    const segmentos = segmentarTextoComDestaque("Açaí Artesanal 500ml", "acai");
    expect(segmentos).toEqual([
      { texto: "Açaí", destacado: true },
      { texto: " Artesanal 500ml", destacado: false },
    ]);
  });

  it("destaca múltiplas palavras em qualquer ordem", () => {
    const segmentos = segmentarTextoComDestaque("Café Especial Coado", "coado cafe");
    expect(segmentos).toEqual([
      { texto: "Café", destacado: true },
      { texto: " Especial ", destacado: false },
      { texto: "Coado", destacado: true },
    ]);
  });

  it("retorna texto íntegro sem destaque quando o termo está vazio ou não corresponde", () => {
    expect(segmentarTextoComDestaque("Café", "   ")).toEqual([
      { texto: "Café", destacado: false },
    ]);
    expect(segmentarTextoComDestaque("Café", "pizza")).toEqual([
      { texto: "Café", destacado: false },
    ]);
  });
});

describe("gerarSugestoesCatalogo", () => {
  it("encontra itens sem acento e prioriza correspondência no nome", () => {
    const sugestoes = gerarSugestoesCatalogo(ITENS_EXEMPLO, "depilacao");
    expect(sugestoes).toHaveLength(1);
    expect(sugestoes[0]?.item.id).toBe("3");
    expect(sugestoes[0]?.campoEncontrado).toBe("nome");
  });

  it("encontra por especificação e expõe trechoSecundario", () => {
    const sugestoes = gerarSugestoesCatalogo(ITENS_EXEMPLO, "acucar");
    expect(sugestoes).toHaveLength(1);
    expect(sugestoes[0]?.item.id).toBe("1");
    expect(sugestoes[0]?.campoEncontrado).toBe("especificacao");
    expect(sugestoes[0]?.trechoSecundario).toBe("Sem açúcar");
  });

  it("retorna lista vazia quando o termo está vazio", () => {
    expect(gerarSugestoesCatalogo(ITENS_EXEMPLO, "  ")).toEqual([]);
  });
});

